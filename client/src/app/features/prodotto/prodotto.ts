import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin';

@Component({
  selector: 'prodotto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto.html',
  styleUrl: './prodotto.css',
})
export class Prodotto implements OnInit {
  datiUtente: any = {}; // Conterrà tutti i dettagli dell'annuncio/prodotto
  lstProdottiCasuali: any[] = [];
  lstCategorie: any[] = [];

  gradientClass = 'grad-rose';
  categoryIcon  = 'bi-bag';

  private nomiConditions: Record<number, string> = {
    1: 'Nuovo', 2: 'Ottimo', 3: 'Buono', 4: 'Discreto'
  };

  constructor(
    private router: Router,
    private http: Httpcalls,
    private cdr: ChangeDetectorRef,
    private loginService: Controllologin
  ) {
    // Intercettiamo i dati fin dal costruttore (approccio ottimale di Angular)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.gestisciStatoNavigazione(navigation.extras.state);
    }
  }

  get loggato(): boolean {
    return this.loginService.currentData() ? true : false;
  }

  get utenteLoggato(): any {
    const data = this.loginService.currentData();
    return data?.utenteLoggato || data || {};
  }

  // Genera le iniziali in modo sicuro prevenendo crash se il nome non è ancora arrivato dal DB
  get inizialiVenditore(): string {
    const nome = this.datiUtente?.venditoreNome || this.datiUtente?.nome_venditore || '';
    const cognome = this.datiUtente?.venditoreCognome || this.datiUtente?.cognome_venditore || '';
    if (!nome && !cognome) return '?';
    return (nome.charAt(0) + cognome.charAt(0)).toUpperCase();
  }

  ngOnInit(): void {
    this.caricaCategorie();

    // Fallback di sicurezza se history.state è presente ma non era stato letto nel constructor
    if (!this.datiUtente || Object.keys(this.datiUtente).length === 0) {
      this.gestisciStatoNavigazione(history.state);
    }
  }

  /**
   * Estrae i dati passati dalla Home e avvia il recupero dei dati completi dal database
   */
  private gestisciStatoNavigazione(state: any): void {
    if (!state) return;

    // Supporta sia lo state 'datiProdotto' della Home, sia 'utente', sia l'ID diretto
    const prodottoSorgente = state.datiProdotto || state.utente || (state.id_prodotto ? state : null);

    if (prodottoSorgente) {
      // Popoliamo subito la pagina con i dati parziali che già abbiamo per un caricamento istantaneo
      this.datiUtente = { ...prodottoSorgente };
      this.arricchisciDatiProdotto();

      // Se dalla home arriva 'immagine_url' come stringa, la inseriamo provvisoriamente nell'array 'immagini'
      if (this.datiUtente.immagine_url && (!this.datiUtente.immagini || this.datiUtente.immagini.length === 0)) {
        const cleanPath = this.datiUtente.immagine_url.replace('https://api.vallauristore.it', '');
        this.datiUtente.immagini = [cleanPath];
      }

      const idProdotto = this.datiUtente.id_prodotto || state.id_prodotto;
      if (idProdotto) {
        this.caricaDatiProdotto(idProdotto);
      }
    }
  }

  caricaCategorie() {
    this.http.Get('/private/getallCategorie').subscribe({
      next: (response: any) => {
        this.lstCategorie = response.categorie || [];
        this.arricchisciDatiProdotto();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  public getGradient(categoria: any): string {
    const map: Record<string | number, string> = {
      1: 'grad-rose', 2: 'grad-green', 3: 'grad-blue', 4: 'grad-violet', 5: 'grad-amber', 6: 'grad-orange'
    };
    return map[categoria] ?? 'grad-green';
  }

  public getIcon(categoria: any): string {
    const map: Record<string | number, string> = {
      1: 'bi-bag', 2: 'bi-book', 3: 'bi-journal-text', 4: 'bi-pencil', 5: 'bi-headphones', 6: 'bi-dribbble'
    };
    return map[categoria] ?? 'bi-box';
  }

  clickProdotto(item: any) {
    const idTarget = item.id_prodotto || item.id;
    const nuovoStato = { ...history.state, id_prodotto: idTarget };
    history.replaceState(nuovoStato, '');
    this.caricaDatiProdotto(idTarget);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  caricaDatiProdotto(idProdotto: number) {
    this.http.Get(`/public/getProdottoCompleto/${idProdotto}`).subscribe({
      next: (prodottoCompleto: any) => {
        // Uniamo i dati ricevuti per non perdere eventuali proprietà impostate precedentemente
        this.datiUtente = { ...this.datiUtente, ...prodottoCompleto };
        this.arricchisciDatiProdotto();

        if (this.datiUtente?.id_categoria) {
          this.gradientClass = this.getGradient(this.datiUtente.id_categoria);
          this.categoryIcon  = this.getIcon(this.datiUtente.id_categoria);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });

    this.http.Get('/public/get4ProdottiCasuali').subscribe({
      next: (response: any) => {
        this.lstProdottiCasuali = response.prodotti || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  private arricchisciDatiProdotto(): void {
    if (!this.datiUtente) return;
    if (!this.datiUtente.categoria && this.datiUtente.id_categoria && this.lstCategorie.length > 0) {
      const catTrovata = this.lstCategorie.find(c => c.id_categoria === this.datiUtente.id_categoria);
      if (catTrovata) this.datiUtente.categoria = catTrovata.nomeCategoria;
    }
    if (!this.datiUtente.condizione && this.datiUtente.id_condizione) {
      this.datiUtente.condizione = this.nomiConditions[this.datiUtente.id_condizione] || 'Discreta';
    }
  }

  apriChat() {
    console.log("Apertura chat. Dati prodotto correnti:", this.datiUtente);

    if (!this.loggato) {
      this.router.navigate(['/login'], {
        state: {
          dati: {
            id_venditore: this.datiUtente.id_venditore,
            id_prodotto: this.datiUtente.id_prodotto,
            info: "A LOGIN EFFETTUATO RICORDARE DI PASSARE I DATI DI NUOVO E REDIRECT A CHAT"
          }
        }
      });
    } else {
      this.router.navigate(['/chat'], {
        state: {
          dati: {
            id_venditore: this.datiUtente.id_venditore,
            id_prodotto: this.datiUtente.id_prodotto,
            venditoreNome: this.datiUtente.venditoreNome || this.datiUtente.nome_venditore || 'Venditore',
            venditoreCognome: this.datiUtente.venditoreCognome || this.datiUtente.cognome_venditore || '',
            nomeProdotto: this.datiUtente.nome || this.datiUtente.nome_prodotto || 'Annuncio',
            prezzo: this.datiUtente.prezzo || '0.00'
          },
          loggato: this.loggato
        }
      });
    }
  }
}
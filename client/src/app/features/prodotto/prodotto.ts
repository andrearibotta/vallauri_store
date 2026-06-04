import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin'; // 1. Importa il servizio

@Component({
  selector: 'prodotto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto.html',
  styleUrl: './prodotto.css',
})
export class Prodotto implements OnInit {
  datiUtente: any = {};
  lstProdottiCasuali: any[] = [];
  lstCategorie: any[] = [];

  gradientClass = 'grad-rose';
  categoryIcon  = 'bi-bag';

  private nomiConditions: Record<number, string> = {
    1: 'Nuovo', 2: 'Ottimo', 3: 'Buono', 4: 'Discreto'
  };

  // 2. Inietta il servizio nel costruttore
  constructor(
    private router: Router,
    private http: Httpcalls,
    private cdr: ChangeDetectorRef,
    private loginService: Controllologin
  ) {}

  // 3. Creiamo delle proprietà "getter" dinamiche che leggono direttamente dal Signal
  get loggato(): boolean {
    return this.loginService.currentData() ? true : false;
  }

  get utenteLoggato(): any {
    const data = this.loginService.currentData();
    return data?.utenteLoggato || data || {};
  }

  ngOnInit(): void {
    const navState = history.state;
    this.caricaCategorie();

    const idProdotto = navState?.id_prodotto || navState?.utente?.id_prodotto;

    if (idProdotto) {
      this.caricaDatiProdotto(idProdotto);
    } else {
      if (navState?.utente) {
        this.datiUtente = navState.utente;
        this.arricchisciDatiProdotto();
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
        this.datiUtente = prodottoCompleto;
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

            // Mappatura robusta con fallback per evitare i valori vuoti nella chat virtuale
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

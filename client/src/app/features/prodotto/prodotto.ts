import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';

@Component({
  selector: 'prodotto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto.html',
  styleUrl: './prodotto.css',
})
export class Prodotto implements OnInit {
  datiUtente: any = {};
  utenteLoggato: any = {};
  loggato: boolean = false;
  lstProdottiCasuali: any[] = [];

  // Valori di default per la card principale (vengono sovrascritti al caricamento dei dati)
  gradientClass = 'grad-rose';
  categoryIcon  = 'bi-bag';

  constructor(
    private router: Router,
    private http: Httpcalls,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const navState = history.state;
    this.loggato = navState?.loggato || false;
    this.utenteLoggato = navState?.utenteLoggato || {};

    const idProdotto = navState?.id_prodotto || navState?.utente?.id_prodotto;

    if (idProdotto) {
      // Avvio iniziale dei dati
      this.caricaDatiProdotto(idProdotto);
    } else {
      console.error("Nessun ID prodotto trovato negli stati di navigazione!");
      if (navState?.utente) {
        this.datiUtente = navState.utente;
      }
    }
  }

  /**
   * Mappa l'id_categoria (o la stringa del nome) al rispettivo gradiente CSS.
   * Modificato in public per consentirne l'utilizzo all'interno del ciclo @for nell'HTML.
   */
  public getGradient(categoria: any): string {
    const map: Record<string | number, string> = {
      1: 'grad-rose',    // Abbigliamento Uomo / Donna
      2: 'grad-green',   // Libri
      3: 'grad-blue',    // Appunti
      4: 'grad-violet',  // Cancelleria
      5: 'grad-amber',   // Elettronica
      6: 'grad-orange',  // Sport
      // Fallback testuale se usi ancora le stringhe come categorie nel backend:
      'Abbigliamento Uomo':  'grad-rose',
      'Abbigliamento Donna': 'grad-rose',
      'Libri':               'grad-green',
      'Appunti':             'grad-blue',
      'Cancelleria':         'grad-violet',
      'Elettronica':         'grad-amber',
      'Sport':               'grad-orange',
    };
    return map[categoria] ?? 'grad-green';
  }

  /**
   * Mappa l'id_categoria (o la stringa del nome) alla rispettiva icona Bootstrap.
   * Modificato in public per consentirne l'utilizzo all'interno del ciclo @for nell'HTML.
   */
  public getIcon(categoria: any): string {
    const map: Record<string | number, string> = {
      1: 'bi-bag',
      2: 'bi-book',
      3: 'bi-journal-text',
      4: 'bi-pencil',
      5: 'bi-headphones',
      6: 'bi-dribbble',
      // Fallback testuale:
      'Abbigliamento Uomo':  'bi-bag',
      'Abbigliamento Donna': 'bi-bag',
      'Libri':               'bi-book',
      'Appunti':             'bi-journal-text',
      'Cancelleria':         'bi-pencil',
      'Elettronica':         'bi-headphones',
      'Sport':               'bi-dribbble',
    };
    return map[categoria] ?? 'bi-box';
  }

  clickProdotto(item: any) {
    const idTarget = item.id_prodotto || item.id;
    console.log("Navigo al prodotto correlato ID:", idTarget);

    // 1. Aggiorniamo manualmente lo stato della history del browser con il nuovo ID
    const nuovoStato = {
      ...history.state,
      id_prodotto: idTarget
    };

    // Sostituiamo lo stato corrente senza ricaricare la pagina
    history.replaceState(nuovoStato, '');

    // 2. Richiamiamo la logica di caricamento (che leggerà il nuovo ID appena impostato)
    this.caricaDatiProdotto(idTarget);

    // 3. Facciamo scorrere la pagina verso l'alto (così l'utente vede il nuovo prodotto)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

// Spostiamo la logica di caricamento in una funzione separata per poterla riutilizzare
  caricaDatiProdotto(idProdotto: number) {
    console.log("Ricarico i dati per il prodotto ID:", idProdotto);

    // CHIAMATA 1: Dettagli del nuovo prodotto
    this.http.Get(`/public/getProdottoCompleto/${idProdotto}`).subscribe({
      next: (prodottoCompleto: any) => {
        this.datiUtente = prodottoCompleto;

        if (this.datiUtente?.id_categoria) {
          this.gradientClass = this.getGradient(this.datiUtente.id_categoria);
          this.categoryIcon  = this.getIcon(this.datiUtente.id_categoria);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nel recupero del prodotto completo:", err);
      }
    });

    // CHIAMATA 2: Nuovi 4 prodotti casuali (così cambiano anche i consigliati!)
    this.http.Get('/public/get4ProdottiCasuali').subscribe({
      next: (response: any) => {
        this.lstProdottiCasuali = response.prodotti || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore prodotti casuali:", err);
      }
    });
  }

  apriChat() {
    console.log("apertura chat");
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
            id_acquirente: this.utenteLoggato.id_utente,
            id_prodotto: this.datiUtente.id_prodotto
          },
          loggato: this.loggato
        }
      });
    }
  }
}

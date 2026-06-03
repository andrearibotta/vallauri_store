import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';

@Component({
  selector: 'prodotto',
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto.html',
  styleUrl: './prodotto.css',
})
export class Prodotto implements OnInit {
  datiUtente: any = {}
  utenteLoggato: any = {}
  loggato: boolean = false;
  lstProdottiCasuali: any;

  // Classe gradiente e icona calcolate dalla categoria
  gradientClass = 'grad-rose';
  categoryIcon  = 'bi-bag';

  // ── Correlati fittizi — sostituisci con chiamata al server ──
  correlati = [
    { nome: 'Jeans slim fit Zara', prezzo: '12,00', venditore: 'Luca',  icon: 'bi-bag',        gradientClass: 'grad-blue'   },
    { nome: 'Felpa hoodie Nike M', prezzo: '18,00', venditore: 'Sara',  icon: 'bi-bag',        gradientClass: 'grad-green'  },
    { nome: 'Cintura in pelle',    prezzo: '4,00',  venditore: 'Giada', icon: 'bi-bag',        gradientClass: 'grad-amber'  },
    { nome: 'Cappellino estivo',   prezzo: '3,00',  venditore: 'Paolo', icon: 'bi-bag',        gradientClass: 'grad-violet' },
  ];

  constructor(private router: Router,private http:Httpcalls, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.datiUtente = history.state.utente;
    this.loggato = history.state.loggato;
    console.log(this.datiUtente);
    console.log("login prodotto: ", history.state);
    console.log("ciaooo")
    this.http.Get('/public/get4ProdottiCasuali').subscribe({
      next: (response) =>{
        console.log(response)
        this.lstProdottiCasuali = response
        this.cdr.detectChanges();
      },
      error: (err) =>{
        console.log(err)
      }
    })
    //richiedere 4 prodotti casuali al server da mettere sotto per visualizzare
  }

  private getGradient(categoria: string): string {
    const map: Record<string, string> = {
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

  private getIcon(categoria: string): string {
    const map: Record<string, string> = {
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

  apriChat() {
    console.log("apertura chat");
    if(!this.loggato)
    {
      this.router.navigate(['/login'], {
        state: { dati: { id_venditore: this.datiUtente.id_venditore, id_prodotto: this.datiUtente.id_prodotto, info: "A LOGIN EFFETTUATO RICORDARE DI PASSARE I DATI DI NUOVO E REDIRECT A CHAT" } }
      });
    }
    else {
      this.router.navigate(['/chat'], {
        state: { dati: { id_venditore: this.datiUtente.id_venditore, id_acquirente: this.utenteLoggato.id_utente, id_prodotto: this.datiUtente.id_prodotto }, loggato: this.loggato }
      });
    }

  }

}

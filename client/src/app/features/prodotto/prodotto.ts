import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'prodotto',
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto.html',
  styleUrl: './prodotto.css',
})
export class Prodotto implements OnInit {

  // ── Dati prodotto — qui arriveranno dal tuo server ──
  prodotto = {
    id_prodotto: 1,
    nome:        'T-shirt Bianca Basic H&M',
    descrizione: 'T-shirt in cotone organico 100%, vestibilità slim fit. È stata lavata solo un paio di volte, non presenta macchie né buchi. Ideale come sotto-giacca o per un look casual estivo.',
    prezzo:      '5.00',
    categoria:   'Abbigliamento Uomo',
    condizione:  'Ottimo',
    venditore:   'Mario',
  };

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Qui recupererai il prodotto passato dalla card, es. tramite:
    //   - navigation state:  const nav = this.router.getCurrentNavigation();
    //                        this.prodotto = nav?.extras?.state?.['item'];
    //   - oppure query param: /prodotto?id=1  e chiamata HTTP

    this.gradientClass = this.getGradient(this.prodotto.categoria);
    this.categoryIcon  = this.getIcon(this.prodotto.categoria);
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
}

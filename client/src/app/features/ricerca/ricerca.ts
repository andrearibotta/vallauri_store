import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import {Httpcalls} from '../../services/httpcalls';

export interface SearchResult {
  id: number;
  title: string;
  price: string;
  category: string;
  condition: string;
  conditionClass: string;
  seller: string;
  icon: string;
  gradientClass: string;
}

@Component({
  selector: 'ricerca',
  imports: [CommonModule, RouterLink],
  templateUrl: './ricerca.html',
  styleUrl: './ricerca.css',
})
export class Ricerca implements OnInit {
  constructor(private http: Httpcalls, private route: ActivatedRoute) {
  }
  searchQuery = '';
  isLoading   = false;

  categories = [
    { label: 'Libri',          count: 34 },
    { label: 'Appunti',        count: 18 },
    { label: 'Abbigliamento',  count: 12 },
    { label: 'Cancelleria',    count: 7  },
    { label: 'Elettronica',    count: 11 },
    { label: 'Sport',          count: 5  },
  ];

  // ─── Dati fittizi — sostituisci con la risposta del tuo server ───
  results: SearchResult[] = [
    {
      id: 1,
      title: 'Matematica Bergamini vol. 2',
      price: '8,00',
      category: 'Libri',
      condition: 'Buono',
      conditionClass: 'cond-good',
      seller: 'Marco R.',
      icon: 'bi-book',
      gradientClass: 'grad-green',
    },
    {
      id: 2,
      title: 'Matematica per il biennio',
      price: '5,00',
      category: 'Libri',
      condition: 'Discreto',
      conditionClass: 'cond-ok',
      seller: 'Giada T.',
      icon: 'bi-book',
      gradientClass: 'grad-green',
    },
    {
      id: 3,
      title: 'Appunti Matematica 5ª anno',
      price: '3,00',
      category: 'Appunti',
      condition: 'Ottimo',
      conditionClass: 'cond-great',
      seller: 'Luca M.',
      icon: 'bi-journal-text',
      gradientClass: 'grad-blue',
    },
    {
      id: 4,
      title: 'Calcolatrice scientifica Casio',
      price: '15,00',
      category: 'Elettronica',
      condition: 'Ottimo',
      conditionClass: 'cond-great',
      seller: 'Sara B.',
      icon: 'bi-calculator',
      gradientClass: 'grad-amber',
    },
    {
      id: 5,
      title: 'Matematica verde vol. 1',
      price: '6,00',
      category: 'Libri',
      condition: 'Buono',
      conditionClass: 'cond-good',
      seller: 'Paolo F.',
      icon: 'bi-book',
      gradientClass: 'grad-green',
    },
    {
      id: 6,
      title: 'Esercizi svolti - Analisi',
      price: '4,00',
      category: 'Appunti',
      condition: 'Nuovo',
      conditionClass: 'cond-new',
      seller: 'Alice V.',
      icon: 'bi-file-text',
      gradientClass: 'grad-violet',
    },
  ];
  // ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Legge il parametro "q" dall'URL → /ricerca?q=matematica
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        console.log(this.searchQuery)
        this.isLoading = true;
        // Fai la chiamata qui! Così se l'utente ricarica la pagina, i dati riappaiono
        this.http.Post('/ai/chat', {message: this.searchQuery}).subscribe({
          next: data => {
            this.results = data.products;
            console.log(this.results)
            this.isLoading = false;
          },
          error: err => {
            console.error(err)
          }
        });
      }
    });
  }
}

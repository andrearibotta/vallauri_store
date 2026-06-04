import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin'; // Servizio per il login

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
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ricerca.html',
  styleUrl: './ricerca.css',
})
export class Ricerca implements OnInit {
  risultatiRicerca: any = [];
  lstCategorie: any[] = []; // Array per le categorie dinamiche del DB
  searchQuery = '';
  isLoading   = false;

  // Ripristinato l'array originale del tuo file
  categories = [
    { label: 'Libri',          count: 34 },
    { label: 'Appunti',        count: 18 },
    { label: 'Abbigliamento',  count: 12 },
    { label: 'Cancelleria',    count: 7  },
    { label: 'Elettronica',    count: 11 },
    { label: 'Sport',          count: 5  },
  ];

  prodotti: any = [];

  constructor(
    private http: Httpcalls,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private loginService: Controllologin
  ) {}

  ngOnInit(): void {
    // Carichiamo le categorie dal database all'avvio
    this.caricaCategorie();

    // Gestione della query di ricerca nell'URL
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';

      if (this.searchQuery) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.http.Post('/ai/chat', { message: this.searchQuery }).subscribe({
          next: data => {
            this.risultatiRicerca = data.products;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: err => {
            console.error("Errore nella ricerca IA:", err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.risultatiRicerca = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  caricaCategorie() {
    this.http.Get('/private/getallCategorie').subscribe({
      next: (response: any) => {
        this.lstCategorie = response.categorie || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore categorie in ricerca:", err)
    });
  }

  clickProdotto(item: any) {
    const idSelezionato = item.id_prodotto || item.id;
    const statoLogin = this.loginService.currentData();

    const isLoggato = statoLogin ? true : false;
    const infoUtente = statoLogin?.utenteLoggato || statoLogin || {};

    this.router.navigate(['/prodotto'], {
      state: {
        id_prodotto: idSelezionato,
        loggato: isLoggato,
        utenteLoggato: infoUtente
      }
    });
  }
}

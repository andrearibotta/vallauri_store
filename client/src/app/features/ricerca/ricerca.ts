import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';

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
  risultatiRicerca: any = []; // Inizializzalo come array vuoto invece di oggetto se cicli con @for

  // 2. Inietta cdr nel costruttore
  constructor(
    private http: Httpcalls,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

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

  prodotti: any = [
    // ... i tuoi dati fittizi rimangono identici
  ];

  loggato: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log("History State attuale:", history.state);

      // SICUREZZA: Protezione anti-crash se l'utente rinfresca la pagina (F5)
      if (history.state && history.state.q) {
        this.searchQuery = history.state.q.q;
        this.loggato = history.state.loggato || false;
      } else {
        // Fallback se ricarichi la pagina o entri direttamente dall'URL
        this.searchQuery = '';
        this.loggato = false;
      }

      if (this.searchQuery) {
        console.log("Avvio ricerca IA per:", this.searchQuery);
        this.isLoading = true;

        // Forza un controllo iniziale per mostrare lo spinner di caricamento
        this.cdr.detectChanges();

        this.http.Post('/ai/chat', { message: this.searchQuery }).subscribe({
          next: data => {
            this.risultatiRicerca = data.products;
            console.log("RisultatiRicerca ricevuti dal server: ", this.risultatiRicerca);
            this.isLoading = false;

            // 3. FONDAMENTALE: Forza Angular a renderizzare i dati nelle card ora che sono arrivati
            this.cdr.detectChanges();
          },
          error: err => {
            console.error("Errore nella ricerca IA:", err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  clickProdotto(item: any) {
    console.log("Navigo verso il prodotto ID:", item.id_prodotto || item.id);

    this.router.navigate(['/prodotto'], {
      state: {
        id_prodotto: item.id_prodotto || item.id, // Passiamo l'ID al posto di tutto l'oggetto pesante
        loggato: this.loggato
      }
    });
  }
}

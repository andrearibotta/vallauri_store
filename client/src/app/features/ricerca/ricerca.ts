import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  risultatiRicerca: any = {}
  constructor(private http: Httpcalls, private route: ActivatedRoute, private router: Router) {
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

  //dati fittizi
  prodotti: any = [
    {
      id_prodotto: 1,
      nome: "Matematica Bergamini vol. 2",
      prezzo: "8.00",
      categoria: "Libri",
      descrizione: "Condizione: Buono.",
      venditore: "Marco R."
    },
    {
      id_prodotto: 2,
      nome: "Matematica per il biennio",
      prezzo: "5.00",
      categoria: "Libri",
      descrizione: "Condizione: Discreto.",
      venditore: "Giada T."
    },
    {
      id_prodotto: 3,
      nome: "Appunti Matematica 5ª anno",
      prezzo: "3.00",
      categoria: "Appunti",
      descrizione: "Condizione: Ottimo.",
      venditore: "Luca M."
    },
    {
      id_prodotto: 4,
      nome: "Calcolatrice scientifica Casio",
      prezzo: "15.00",
      categoria: "Elettronica",
      descrizione: "Condizione: Ottimo.",
      venditore: "Sara B."
    },
    {
      id_prodotto: 5,
      nome: "Matematica verde vol. 1",
      prezzo: "6.00",
      categoria: "Libri",
      descrizione: "Condizione: Buono.",
      venditore: "Paolo F."
    },
    {
      id_prodotto: 6,
      nome: "Esercizi svolti - Analisi",
      prezzo: "4.00",
      categoria: "Appunti",
      descrizione: "Condizione: Nuovo.",
      venditore: "Alice V."
    }
  ];

  loggato: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = history.state.q.q;
      this.loggato = history.state.q.loggato;
      console.log(this.searchQuery)
      if (this.searchQuery) {
        console.log(this.searchQuery)
        this.isLoading = true;
        this.http.Post('/ai/chat', {message: this.searchQuery}).subscribe({
          next: data => {
            this.risultatiRicerca = data.products;
            console.log("RisultatiRicerca: ", this.risultatiRicerca)
            this.isLoading = false;
          },
          error: err => {
            console.error(err)
          }
        });
      }
    });
  }

  clickProdotto(item: any) {
    console.log("item cliccato: ", item);
    this.router.navigate(['/prodotto'], {
      state: { utente: item , loggato: this.loggato }
    });  }
}

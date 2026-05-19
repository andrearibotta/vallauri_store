import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'profilo',
  imports: [CommonModule, RouterLink],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo {
  recensioni = [
    { iniziale: 'L', nome: 'Luca M.',  stelle: 5, testo: 'Prodotto esattamente come descritto, consegna velocissima!', data: '2 giorni fa' },
    { iniziale: 'S', nome: 'Sara B.',  stelle: 5, testo: 'Venditore gentilissimo, molto disponibile.', data: '1 settimana fa' },
    { iniziale: 'G', nome: 'Giada T.', stelle: 4, testo: 'Tutto ok, libro in buone condizioni.', data: '2 settimane fa' },
  ];

  annunci = [
    { nome: 'Matematica Bergamini vol.2', prezzo: '8,00', condizione: 'Buono',   condClass: 'cond-good',  icon: 'bi-book',         gradientClass: 'grad-green', visite: 24 },
    { nome: 'Cuffie JBL wireless',        prezzo: '20,00', condizione: 'Ottimo',  condClass: 'cond-great', icon: 'bi-headphones',   gradientClass: 'grad-blue',  visite: 41 },
    { nome: 'Felpa scuola taglia M',      prezzo: '12,00', condizione: 'Nuovo',   condClass: 'cond-new',   icon: 'bi-bag',          gradientClass: 'grad-rose',  visite: 18 },
    { nome: 'Appunti Fisica 5ª anno',     prezzo: '5,00',  condizione: 'Ottimo',  condClass: 'cond-great', icon: 'bi-journal-text', gradientClass: 'grad-amber', visite: 33 },
    { nome: 'Calcolatrice Casio fx-570',  prezzo: '15,00', condizione: 'Buono',   condClass: 'cond-good',  icon: 'bi-calculator',   gradientClass: 'grad-violet',visite: 29 },
    { nome: 'Zaino scuola Invicta',       prezzo: '25,00', condizione: 'Discreto',condClass: 'cond-ok',    icon: 'bi-backpack',     gradientClass: 'grad-orange',visite: 15 },
  ];
}

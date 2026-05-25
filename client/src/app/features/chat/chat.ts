import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';

interface Messaggio {
  mittente: 'io' | 'altro';
  testo: string;
  ora: string;
  separatore?: string;
}

interface Conversazione {
  id: number;
  venditore: string;
  iniziale: string;
  colore: string;
  nomeProdotto: string;
  prezzo: string;
  ultimoMessaggio: string;
  ora: string;
  nonLetti: number;
  messaggi: Messaggio[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})

export class Chat implements OnInit {
  constructor(private http: Httpcalls) { }

  nuovoMessaggio = '';
  chatAperta     = false;
  conversazioneAttiva: Conversazione | null = null;

  conversazioni: Conversazione[] = [
    {
      id: 1,
      venditore: 'Mario Rossi',
      iniziale: 'M',
      colore: 'linear-gradient(135deg,#00b398,#00d4b0)',
      nomeProdotto: 'T-shirt Bianca H&M',
      prezzo: '5,00',
      ultimoMessaggio: 'Ok perfetto, ci vediamo domani!',
      ora: 'adesso',
      nonLetti: 2,
      messaggi: [
        { mittente: 'altro', testo: 'Ciao! È ancora disponibile la t-shirt?', ora: '10:05', separatore: 'Oggi' },
        { mittente: 'io',    testo: 'Sì certo, ancora disponibile!', ora: '10:08' },
        { mittente: 'altro', testo: 'Perfetto, la pagheresti 4€ invece di 5?', ora: '10:10' },
        { mittente: 'io',    testo: 'Dai va bene, 4€ ok. Quando ti va bene per il ritiro?', ora: '10:13' },
        { mittente: 'altro', testo: 'Ok perfetto, ci vediamo domani!', ora: '10:15' },
      ]
    },
    {
      id: 2,
      venditore: 'Sara Bianchi',
      iniziale: 'S',
      colore: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
      nomeProdotto: 'Matematica Bergamini vol.2',
      prezzo: '8,00',
      ultimoMessaggio: 'È in buone condizioni, qualche sottolineatura a matita.',
      ora: 'ieri',
      nonLetti: 0,
      messaggi: [
        { mittente: 'io',    testo: 'Ciao Sara, il libro ha scritte o sottolineature?', ora: 'ieri 14:30', separatore: 'Ieri' },
        { mittente: 'altro', testo: 'È in buone condizioni, qualche sottolineatura a matita.', ora: 'ieri 15:00' },
      ]
    },
    {
      id: 3,
      venditore: 'Luca Mancini',
      iniziale: 'L',
      colore: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      nomeProdotto: 'Cuffie JBL wireless',
      prezzo: '20,00',
      ultimoMessaggio: 'Le cuffie funzionano perfettamente!',
      ora: 'lun',
      nonLetti: 0,
      messaggi: [
        { mittente: 'altro', testo: 'Le cuffie funzionano perfettamente!', ora: 'lun 09:00', separatore: 'Lunedì' },
        { mittente: 'io',    testo: 'Ottimo, te le prendo! Sei a scuola domani?', ora: 'lun 09:15' },
      ]
    },
  ];

  ngOnInit() {
    //caricamento delle persone con cui ho chattato (per anteprima)
    this.http.Get("api/chat/getAllContatti").subscribe({
      next: data => {
        console.log("contatti: ", data)
      },
      error: err => {

      }
    })
  }

  apriChat(c: Conversazione): void {
    this.conversazioneAttiva = c;
    c.nonLetti = 0;
    this.chatAperta = true;
  }

  chiudiChat(): void {
    this.chatAperta = false;
    this.conversazioneAttiva = null;
  }

  inviaMessaggio(): void {
    const testo = this.nuovoMessaggio.trim();
    if (!testo || !this.conversazioneAttiva) return;

    const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    this.conversazioneAttiva.messaggi.push({ mittente: 'io', testo, ora });
    this.conversazioneAttiva.ultimoMessaggio = testo;
    this.nuovoMessaggio = '';
  }
}

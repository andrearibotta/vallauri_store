import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private socket: any;
  contattiContattati: any = [];
  nuovoMessaggio = '';
  chatAperta = false;
  conversazioneAttiva: any = null;
  utenteLoggato: any = {};

  // Chiave univoca per ogni conversazione: "id_utente_id_prodotto"
  nonLetti: Set<string> = new Set();

  constructor(private http: Httpcalls, private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // 1. Inizializza utente loggato forzando l'ID a essere un Numero
    this.utenteLoggato = history.state.utenteLoggato || { id: 53 };
    this.utenteLoggato.id = Number(this.utenteLoggato.id);

    this.caricaContatti();

    // 2. Connessione Socket
    this.socket = io('https://api.vallauristore.it', {
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connesso con ID:', this.socket.id);
    });

    this.socket.on('receive_message', (messaggio: any) => {
      this.ngZone.run(() => {
        this.riceviMessaggioInTempoReale(messaggio, 'altro');
      });
    });

    this.socket.on('message_sent', (messaggio: any) => {
      this.ngZone.run(() => {
        this.riceviMessaggioInTempoReale(messaggio, 'io');
      });
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) { }
    }, 0);
  }

  caricaContatti() {
    this.http.Post("/chat/getAllContatti", {}).subscribe({
      next: (data: any) => {
        this.contattiContattati = data.result || [];

        // Controlla se l'utente proviene dalla pagina Prodotto ("Contatta il venditore")
        const datiNavigazione = history.state.dati;
        if (datiNavigazione && datiNavigazione.id_venditore && datiNavigazione.id_prodotto) {
          this.gestisciNuovoContattoDaProdotto(datiNavigazione);
        }

        this.cdr.detectChanges();
      },
      error: err => console.error("Errore caricamento contatti:", err)
    });
  }

  /**
   * Verifica se esiste già una chat attiva per questo prodotto con questo venditore.
   * Se non esiste, crea un contatto fittizio a runtime in cima alla lista.
   */
  gestisciNuovoContattoDaProdotto(dati: any) {
    const idVenditore = Number(dati.id_venditore);
    const idProdotto = Number(dati.id_prodotto);

    // Cerca se esiste già nei contatti caricati dal DB
    const chatEsistente = this.contattiContattati.find((c: any) =>
      Number(c.id_utente) === idVenditore && Number(c.id_prodotto) === idProdotto
    );

    if (chatEsistente) {
      // Se esiste già, apri semplicemente la chat esistente
      this.apriChat(chatEsistente);
    } else {
      // Se non esiste, andiamo a comporre un oggetto "contatto virtuale" temporaneo
      const contattoVirtuale = {
        id_utente: idVenditore,
        id_prodotto: idProdotto,
        nome: dati.venditoreNome || 'Venditore',
        cognome: dati.venditoreCognome || '',
        nomeProdotto: dati.nomeProdotto || 'Annuncio',
        prezzo: dati.prezzo || '0.00',
        testo: 'Inizia la conversazione...',
        ora: new Date().toISOString(),
        isVirtuale: true // Flag per riconoscerlo a runtime
      };

      // Inserimento in cima alla lista laterale sinistra
      this.contattiContattati.unshift(contattoVirtuale);

      // Apertura automatica immediata della conversazione
      this.apriChat(contattoVirtuale);
    }
  }

  apriChat(contatto: any): void {
    this.conversazioneAttiva = contatto;
    this.chatAperta = true;
    this.conversazioneAttiva.messaggi = [];

    // Generiamo iniziali e proprietà grafiche di fallback utili per il contatto virtuale o dati incompleti
    this.conversazioneAttiva.iniziale = contatto.nome ? contatto.nome.charAt(0).toUpperCase() : 'V';
    this.conversazioneAttiva.colore = contatto.colore || 'linear-gradient(135deg, #3b82f6, #60a5fa)';
    this.conversazioneAttiva.venditore = `${contatto.nome} ${contatto.cognome}`.trim();

    const chiave = `${contatto.id_utente}_${contatto.id_prodotto}`;
    this.nonLetti.delete(chiave);

    // Se è un contatto virtuale temporaneo senza storicità, evitiamo la chiamata GET a vuoto
    if (contatto.isVirtuale) {
      this.cdr.detectChanges();
      this.scrollToBottom();
      return;
    }

    this.http.Get(`/chat/${contatto.id_utente}/${contatto.id_prodotto}`).subscribe({
      next: (data: any) => {
        const messaggi = Array.isArray(data) ? data : (data.result ?? []);

        this.conversazioneAttiva.messaggi = messaggi.map((m: any) => {
          const idMittenteDB = Number(m.id_mittente);
          const isMe = idMittenteDB === this.utenteLoggato.id;

          return {
            mittente: isMe ? 'io' : 'altro',
            testo: m.testo_messaggio,
            ora: new Date(m.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
          };
        });

        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: err => console.error("Errore caricamento messaggi:", err)
    });
  }

  chiudiChat(): void {
    this.chatAperta = false;
    this.conversazioneAttiva = null;
  }

  inviaMessaggio(): void {
    const testo = this.nuovoMessaggio.trim();
    if (!testo || !this.conversazioneAttiva) return;

    const payload = {
      id_destinatario: this.conversazioneAttiva.id_utente,
      id_prodotto: this.conversazioneAttiva.id_prodotto,
      testo_messaggio: testo
    };

    this.nuovoMessaggio = '';

    console.log("INVIANDO AL SERVER QUESTO PAYLOAD:", payload);
    this.socket.emit("send_message", payload);
  }

  hasNonLetti(contatto: any): boolean {
    return this.nonLetti.has(`${contatto.id_utente}_${contatto.id_prodotto}`);
  }

  riceviMessaggioInTempoReale(msg: any, provenienza: 'io' | 'altro') {
    console.log(`SOCKET HA RICEVUTO UN MESSAGGIO (provenienza: ${provenienza}):`, msg);

    const contatto = this.contattiContattati.find((c: any) =>
      c.id_prodotto == msg.id_prodotto &&
      (c.id_utente == msg.id_mittente || c.id_utente == msg.id_destinatario)
    );

    if (contatto) {
      contatto.testo = msg.testo_messaggio;
      contatto.ora = msg.timestamp;

      // Se era un contatto virtuale e l'invio è andato a buon fine, rimuoviamo il flag temporaneo
      if (contatto.isVirtuale) {
        delete contatto.isVirtuale;
      }
    }

    if (this.conversazioneAttiva && this.conversazioneAttiva.id_prodotto == msg.id_prodotto) {
      const oraFormattata = new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

      this.conversazioneAttiva.messaggi.push({
        mittente: provenienza,
        testo: msg.testo_messaggio,
        ora: oraFormattata
      });

      this.scrollToBottom();
    }

    this.cdr.detectChanges();
  }
}

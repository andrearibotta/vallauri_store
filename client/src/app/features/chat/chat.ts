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
export class Chat implements OnInit, AfterViewChecked {
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
    this.socket = io('http://localhost:3000', {
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connesso con ID:', this.socket.id);
    });

    // 3. Ascolto messaggi in arrivo (avvolto in NgZone)
    this.socket.on('receive_message', (messaggio: any) => {
      this.ngZone.run(() => {
        this.riceviMessaggioInTempoReale(messaggio, 'altro');
      });
    });

    // 4. Ascolto conferma dei messaggi inviati (avvolto in NgZone)
    this.socket.on('message_sent', (messaggio: any) => {
      this.ngZone.run(() => {
        this.riceviMessaggioInTempoReale(messaggio, 'io');
      });
    });
  }

  ngAfterViewChecked() {
    // ✅ NON scrolliamo più qui: evita scroll continuo ad ogni change detection
  }

  scrollToBottom(): void {
    // ✅ Usiamo setTimeout per aspettare che il DOM sia aggiornato prima di scrollare
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
        this.contattiContattati = data.result;
        this.cdr.detectChanges();
      },
      error: err => console.error("❌ Errore caricamento contatti:", err)
    });
  }

  apriChat(contatto: any): void {
    this.conversazioneAttiva = contatto;
    this.chatAperta = true;
    this.conversazioneAttiva.messaggi = [];

    // ✅ Segna la conversazione come letta quando viene aperta
    const chiave = `${contatto.id_utente}_${contatto.id_prodotto}`;
    this.nonLetti.delete(chiave);

    // ✅ FIX: usa l'endpoint GET corretto per caricare la cronologia messaggi
    // Il backend si aspetta: GET /api/chat/:id_destinatario/:id_prodotto
    this.http.Get(`/chat/${contatto.id_utente}/${contatto.id_prodotto}`).subscribe({
      next: (data: any) => {
        // Il backend restituisce direttamente un array (res.json(messaggi ?? []))
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
        // ✅ Scrolla in fondo dopo che Angular ha renderizzato i messaggi
        this.scrollToBottom();
      },
      error: err => console.error("❌ Errore caricamento messaggi:", err)
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

    // Svuoto subito l'input per evitare l'errore NG0100 di Angular
    this.nuovoMessaggio = '';

    console.log("🚀 INVIANDO AL SERVER QUESTO PAYLOAD:", payload);
    this.socket.emit("send_message", payload);
  }

  hasNonLetti(contatto: any): boolean {
    return this.nonLetti.has(`${contatto.id_utente}_${contatto.id_prodotto}`);
  }

  riceviMessaggioInTempoReale(msg: any, provenienza: 'io' | 'altro') {
    console.log(`🔥 SOCKET HA RICEVUTO UN MESSAGGIO (provenienza: ${provenienza}):`, msg);

    // 1. Aggiorno l'anteprima laterale con l'ultimo messaggio
    const contatto = this.contattiContattati.find((c: any) =>
      c.id_prodotto == msg.id_prodotto &&
      (c.id_utente == msg.id_mittente || c.id_utente == msg.id_destinatario)
    );

    if (contatto) {
      contatto.testo = msg.testo_messaggio;
      contatto.ora = msg.timestamp;

      // ✅ Segna come non letto solo se il messaggio è dell'altro
      // e la conversazione NON è quella attualmente aperta
      const chiave = `${contatto.id_utente}_${contatto.id_prodotto}`;
      const chatAttiva = this.conversazioneAttiva;
      const isConversazioneAperta =
        chatAttiva &&
        chatAttiva.id_utente == contatto.id_utente &&
        chatAttiva.id_prodotto == contatto.id_prodotto;

      if (provenienza === 'altro' && !isConversazioneAperta) {
        this.nonLetti.add(chiave);
      }
    }

    // 2. Aggiorno la chat aperta
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
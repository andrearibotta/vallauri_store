import {ChangeDetectorRef, Component, effect, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin'; // 1. Importa il tuo servizio

@Component({
  selector: 'profilo',
  standalone: true, // Aggiungilo se usi componenti standalone
  imports: [CommonModule, RouterLink],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo implements OnInit {
  loggato: boolean = false;
  utenteLoggato: any = {};
  datiTotali: any = null; // Inizializza a null come l'altra volta per l' @if dell'HTML
  statoSelezionato: 'attivo' | 'venduto' = 'attivo'; // Serve per i tab degli annunci nell'HTML

  // 2. Inietta il servizio cl nel costruttore
  constructor(private http: Httpcalls, private cdr: ChangeDetectorRef, private cl: Controllologin, private router: Router) {
    effect(() => {
      const datiUtenteDalservizio = this.cl.currentData();

      if (datiUtenteDalservizio && datiUtenteDalservizio.id) {
        this.utenteLoggato = datiUtenteDalservizio;
        this.loggato = true;

        console.log("Profilo: Rilevato utente reale dal Signal. ID:", this.utenteLoggato.id);
        this.caricaProfiloReale(this.utenteLoggato.id);
      }
    });
  }

  caricaProfiloReale(idUtente: number) {
    this.http.Get('/private/getProfilo/' + idUtente).subscribe({
      next: (data) => {
        this.datiTotali = data;
        console.log("Dati del profilo reale ricevuti con successo: ", this.datiTotali);

        // Comunica ad Angular di aggiornare l'HTML con i dati appena arrivati
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nella richiesta HTTP del profilo:", err);
      }
    });
  }

  ngOnInit() {
    // 3. Recupera i dati dell'utente direttamente dal Signal del servizio invece che da history.state
    const datiUtenteDalservizio = this.cl.currentData();

    if (datiUtenteDalservizio && datiUtenteDalservizio.id) {
      this.utenteLoggato = datiUtenteDalservizio;
    } else {
      console.warn("Profilo: id utente non trovato nel servizio Controllologin. Uso l'ID di test 1.");
      // Fallback di sicurezza per i test locali o se ricarichi la pagina con F5
      this.utenteLoggato = { id: 1 };
    }

    console.log("Eseguo la richiesta per l'ID utente:", this.utenteLoggato.id);

    // Ora l'id non sarà mai più undefined
    this.http.Get('/private/getProfilo/' + this.utenteLoggato.id).subscribe({
      next: (data) => {
        this.datiTotali = data;
        console.log("dati ricevuti per private/getprofilo/: ", this.datiTotali);

        // Forza l'aggiornamento della pagina appena i dati del server arrivano
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nella richiesta del profilo:", err);
      }
    });
  }

  inviaDatiImpostazioni() {
    this.router.navigate(['/impostazioni'], {
      state: { utenteLoggato: this.utenteLoggato }
    });
  }
}

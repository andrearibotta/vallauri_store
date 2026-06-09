import { ChangeDetectorRef, Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // IMPORTANTE: Aggiunto per far funzionare i form (ngModel)
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin'; 

@Component({
  selector: 'profilo',
  standalone: true, 
  imports: [CommonModule, RouterLink, FormsModule], // IMPORTANTE: Aggiunto FormsModule
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo implements OnInit {
  loggato: boolean = false;
  utenteLoggato: any = {};
  datiTotali: any = null; 
  statoSelezionato: 'attivo' | 'venduto' = 'attivo'; 
  annuncioSelezionato: any = null;
  annuncioDaModificare: any = {}; // Variabile per contenere i dati provvisori del popup

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nella richiesta HTTP del profilo:", err);
      }
    });
  }

  ngOnInit() {
    const datiUtenteDalservizio = this.cl.currentData();

    if (datiUtenteDalservizio && datiUtenteDalservizio.id) {
      this.utenteLoggato = datiUtenteDalservizio;
    } else {
      console.warn("Profilo: id utente non trovato nel servizio Controllologin. Uso l'ID di test 1.");
      this.utenteLoggato = { id: 1 };
    }

    this.http.Get('/private/getProfilo/' + this.utenteLoggato.id).subscribe({
      next: (data) => {
        this.datiTotali = data;
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

  confermaEliminazioneAccount() {
    this.http.Post('/private/eliminaAccount' ,{id:this.utenteLoggato.id}).subscribe({
      next: (res) => {
        this.http.Post('/auth/logout', {}).subscribe({
          next:data =>{
            this.cl.clearData();
            this.router.navigate(['/home']);
          }
        });
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione dell'account:", err);
        alert("Si è verificato un errore durante l'eliminazione dell'account. Riprova più tardi.");
      }
    });
  }

  // ── MODIFICA ANNUNCIO (APRE IL POPUP CON I DATI CARICATI) ──
  modificaAnnuncio(annuncio: any) {
    // Facciamo una copia dell'annuncio per non modificare la pagina in tempo reale finché non clicchiamo "Salva"
    this.annuncioDaModificare = { ...annuncio };
  }

  // ── SALVA LE MODIFICHE DELL'ANNUNCIO AL DATABASE ──
  salvaModificheAnnuncio() {
    if (!this.annuncioDaModificare) return;

    console.log(this.annuncioDaModificare)
    // Assicurati che l'URL '/private/modificaProdotto' corrisponda alla tua API per aggiornare i prodotti
    this.http.Post('/private/modificaProdotto', this.annuncioDaModificare).subscribe({
      next: (res) => {
        console.log("Annuncio modificato con successo:", res);
        
        // Trova l'annuncio vecchio nell'array della pagina e sostituiscilo con i nuovi dati per aggiornare la grafica
        const idAnnuncio = this.annuncioDaModificare.id_prodotto || this.annuncioDaModificare.id;
        const index = this.datiTotali.annunci.findIndex((a: any) => (a.id_prodotto || a.id) === idAnnuncio);
        
        if (index !== -1) {
          this.datiTotali.annunci[index] = { ...this.annuncioDaModificare };
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore durante la modifica dell'annuncio:", err);
        alert("Si è verificato un errore durante la modifica. Riprova più tardi.");
      }
    });
  }

  // ── ELIMINA ANNUNCIO ──
  impostaAnnuncioDaEliminare(annuncio: any) {
    this.annuncioSelezionato = annuncio;
  }

  confermaEliminazioneAnnuncio() {
    if (!this.annuncioSelezionato) return;

    const idAnnuncio = this.annuncioSelezionato.id_prodotto || this.annuncioSelezionato.id;
    console.log(idAnnuncio)

    this.http.Post('/private/eliminaProdotto', { id: idAnnuncio }).subscribe({
      next: (res) => {
        this.datiTotali.annunci = this.datiTotali.annunci.filter((a: any) => 
          (a.id_prodotto || a.id) !== idAnnuncio
        );

        if (this.datiTotali.stats && this.datiTotali.stats.annunci_pubblicati > 0) {
          this.datiTotali.stats.annunci_pubblicati--;
        }

        this.annuncioSelezionato = null; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione dell'annuncio:", err);
        alert("Si è verificato un errore durante l'eliminazione dell'annuncio.");
      }
    });
  }
}
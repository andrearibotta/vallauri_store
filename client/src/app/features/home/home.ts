import { Component, OnInit } from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Controllologin } from '../../services/controllologin';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  loggato: boolean = false;
  classi: any[] = [];
  prodottiCasuali: any[] = []; // Array per salvare i 4 prodotti del DB

  constructor(private http: Httpcalls, private cl: Controllologin, private router: Router,private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // 1. Carichiamo i 4 prodotti casuali dal backend
    this.caricaProdottiCasuali();

    // 2. Controllo sessione utente e invio mail di benvenuto
    this.http.Get('/auth/me').subscribe({
      next: (data: any) => {
        console.log("Utente autenticato via cookie:", data);
        this.cl.updateData(data.user);

        // Controllo e invio mail di benvenuto (Evita duplicati al refresh)
        const storageKey = 'welcome_email_sent_' + data.user.email;

        if (data.user.state == "register" && !sessionStorage.getItem(storageKey)) {
          this.http.Post('/email/contact', {
            name: data.user.nome,
            email: data.user.email,
            subject: "Benvenuto in Vallauristore",
            htmlMessage: `<h2>Benvenuto in Vallauristore</h2> Grazie per esserti unito alla comunity di vallauristore ${data.user.nome}`
          }).subscribe({
            next: (response) => {
              console.log("Email di benvenuto inviata con successo:", response);
              sessionStorage.setItem(storageKey, 'true');
            },
            error: (err) => {
              console.log("Errore nell'invio della mail:", err);
            }
          });
        }
      },
      error: (err) => {
        console.log("Utente non loggato o sessione scaduta:", err);
        this.cl.clearData();
      }
    });
  }

  /**
   * Recupera i 4 prodotti randomici dal backend
   */
  caricaProdottiCasuali() {
    this.http.Get('/public/get4ProdottiCasuali').subscribe({
      next: (response: any) => {
        if (response && response.ok) {
          // Gestione sicura per l'estrazione dati di mysql2 [rows, fields]
          this.prodottiCasuali = Array.isArray(response.prodotti) 
            ? response.prodotti 
            : (response.prodotti[0] || []);
          
          console.log("Prodotti caricati nel frontend:", this.prodottiCasuali);
          this.cdr.detectChanges()
        }
      },
      error: (err) => {
        console.error("Errore nel recupero dei prodotti casuali:", err);
      }
    });
  }

  /**
   * Reindirizza alla pagina del prodotto passando l'intero oggetto nello 'state'
   */
  apriDettaglioProdotto(prodotto: any) {
    this.router.navigate(['/prodotto'], { 
      state: { datiProdotto: prodotto } 
    });
  }

  verificaEIniziaVendita() {
    // Controlliamo se ci sono i dati dell'utente nel Signal o nel servizio
    if (this.cl.currentData()) {
      // Se è loggato, va direttamente alla pagina di vendita
      this.router.navigate(['/carica']);
    } else {
      // Se NON è loggato, agganciamo il Modal di Bootstrap e lo mostriamo
      const modalElement = document.getElementById('authWarningModal');
      if (modalElement) {
        const modalBootstrap = new bootstrap.Modal(modalElement);
        modalBootstrap.show();
      }
    }
  }

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }

}
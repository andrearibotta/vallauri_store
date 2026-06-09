import {Component, effect, ChangeDetectorRef, AfterViewInit, OnInit} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Controllologin } from '../../services/controllologin';
import { Httpcalls } from '../../services/httpcalls';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements AfterViewInit, OnInit {
  prodotticercati: any = {};
  loggato: boolean = false;
  utenteLoggato: any = {};

  constructor(    private cl: Controllologin, private router: Router, private http: Httpcalls, private cdr: ChangeDetectorRef) {
    effect(() => {
      const dati = this.cl.currentData();

      if (dati) {
        //console.log('Dati ricevuti nel TS:', dati);
        this.utenteLoggato = dati;
        this.loggato = true;
      } else {
        this.utenteLoggato = {};
        this.loggato = false;
      }

      this.cdr.detectChanges();
    });
  }

  closeNav(toggler: HTMLButtonElement) {
  // Verifica se la navbar è visibile (aria-expanded è true su mobile quando è aperta)
  const isExpanded = toggler.getAttribute('aria-expanded') === 'true';
  
  // Se la navbar è visibile, simula il click sul pulsante per richiuderla
  if (isExpanded) {
    toggler.click();
  }
}

  ngOnInit() {
    console.log("Navbar: Controllo l'identità dell'utente al boot dell'app...");

    this.http.Get('/auth/me').subscribe({
      next: (data) => {
        console.log("Utente autenticato via cookie:", data);
        this.cl.updateData(data.user);
      },
      error: (err) => {
        console.log("Utente non loggato o sessione scaduta:", err);
        this.cl.clearData();
      }
    });
  }

  ngAfterViewInit(): void {
    // ── Gestione Ricerca ──
    const input = document.getElementById('navSearchInput') as HTMLInputElement;
    const btnSrch = document.getElementById('navSearchBtn');

    const doSearch = () => {
      if (!input) return;
      const q = input.value.trim();
      if (q) {
        this.router.navigate(['/ricerca'], {
          queryParams: { q: q }
        });
      }
    };
    if (btnSrch) btnSrch.addEventListener('click', doSearch);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
      });
    }
  }

  visualizzaProfilo() {
    console.log("dati che passoooooooooo: ", this.utenteLoggato);
    this.router.navigate(['/profilo'], {
      state: { utenteLoggato: this.utenteLoggato }
    });
  }

  apriChat() {
    this.router.navigate(['/chat'], {
      state: { utenteLoggato: this.utenteLoggato }
    });

  }

  logout() {
    this.http.Post('/auth/logout', {}).subscribe({
      next:data =>{
        console.log("logout: ", data)
        this.cl.clearData();
        this.router.navigate(['/home']);
      }
    })
  }
}

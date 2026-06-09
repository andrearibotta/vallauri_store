import { inject } from '@angular/core'; // IMPORTANTE: Serve per iniettare i servizi dentro la funzione
import { Router, Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Home } from './features/home/home';
import { Profilo } from './features/profilo/profilo';
import { Ricerca } from './features/ricerca/ricerca';
import { Prodotto } from './features/prodotto/prodotto';
import { Chat } from './features/chat/chat';
import { Impostazioni } from './features/impostazioni/impostazioni';
import { Carica } from './features/carica/carica';
import { Controllologin } from './services/controllologin'; // IMPORTANTE: Cambia il percorso se il tuo servizio si trova altrove!

// ── 1. CREIAMO LA FUNZIONE DI PROTEZIONE (GUARD) ──
const authGuard = () => {
  const loginService = inject(Controllologin);
  const router = inject(Router);

  // Se l'utente è loggato (il Signal ha dei dati), dai il via libera
  if (loginService.currentData()) {
    return true;
  } else {
    // Se NON è loggato, avvisa e rimbalza l'utente al login
    alert("Devi accedere al tuo account per poter vendere un oggetto!");
    router.navigate(['/login']);
    return false;
  }
};

// ── 2. CONFIGURAZIONE DELLE ROTTE ──
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: "ricerca", component: Ricerca },
  { path: "prodotto", component: Prodotto },
  { path: "profilo", component: Profilo },
  { path: "chat", component: Chat },
  { path: "impostazioni", component: Impostazioni },
  
  // Aggiunto canActivate qui: ora la rotta "carica" è blindata!
  { path: "carica", component: Carica, canActivate: [authGuard] }, 
  
  { path: '**', redirectTo: '' }
];
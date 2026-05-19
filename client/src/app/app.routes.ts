import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Home } from './features/home/home';
import {Profilo} from './features/profilo/profilo';
import {Ricerca} from './features/ricerca/ricerca';
import { Prodotto } from './features/prodotto/prodotto';
import {Chat} from './features/chat/chat';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: "ricerca", component: Ricerca},
  { path: "prodotto", component: Prodotto},
  { path: "profilo", component: Profilo },
  { path: "chat", component: Chat },
  { path: '**', redirectTo: '' }
];

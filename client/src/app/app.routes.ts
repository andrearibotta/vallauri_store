import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Home } from './features/home/home';
import {Profilo} from './features/profilo/profilo';
import {Ricerca} from './features/ricerca/ricerca';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: "ricerca", component: Ricerca},
  { path: '**', redirectTo: '' },
  { path: "profilo", component: Profilo }
];

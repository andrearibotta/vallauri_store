import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '' }
];

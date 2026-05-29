import {Component, OnInit} from '@angular/core';
import {Httpcalls} from '../../services/httpcalls';
import {Controllologin} from '../../services/controllologin';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  loggato: boolean = false;
  classi: any[] = [];

  constructor(private http: Httpcalls, private cl: Controllologin, private router: Router) { }

  ngOnInit() {
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
}

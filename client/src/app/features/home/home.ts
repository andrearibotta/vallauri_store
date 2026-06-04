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
        console.log(data.user.nome)
        console.log(data.user.state)
        this.cl.updateData(data.user);
        if(data.user.state == "register"){
          this.http.Post('/email/contact',{name:data.user.nome,email:data.user.email,subject:"Benvenuto in Vallauristore",htmlMessage:`<h2>Benvenuto in Vallauristore</h2> Grazie per esserti unito alla comunity di vallauristore ${data.user.nome}`}).subscribe({
          next: (response) =>{
            console.log(response)
          },
          error: (err) =>{
            console.log(err)
          }
        })
        }
      },
      error: (err) => {
        console.log("Utente non loggato o sessione scaduta:", err);
        this.cl.clearData();
      }
    });


  }
}

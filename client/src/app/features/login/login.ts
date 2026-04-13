import { Component } from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = "";
  password: string = "";

  constructor(private http: Httpcalls, private route: Router) {
  }

  googleLogin() {
    console.log("dentro")
    this.http.Get("/auth/google").subscribe(
      {
        next: data => {
          console.log("LOGIN FUNZIONANTE: ", data)
        },
        error: err => {
          console.log("errore: ", err);
        }
      }
    )
  }

  /*login() {
    this.http.Post('/session/login',{nome:this.nome, cognome:this.cognome}).subscribe({
      next:data =>{
        this.route.navigate(['/home']);
      }
    })
  }*/
}

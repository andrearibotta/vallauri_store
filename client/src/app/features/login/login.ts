import {Component, NgModule} from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = "";
  password: string = "";

  constructor(private http: Httpcalls, private route: Router) {
  }

  googleLogin() {
    /*this.http.Get("/auth/google").subscribe(
      {
        next: data => {
          console.log("LOGIN FUNZIONANTE: ", data)
        },
        error: err => {
          console.log("errore: ", err);
        }
      }
    )*/
    try {
      window.location.href = 'http://localhost:3000/api/auth/google';
    } catch (err) {
      console.log("Errore indirizzamento google")
      console.error(err)
    }
  }

  login() {
    console.log("password ", this.password)
    console.log("email ", this.email)
    this.http.Post('/auth/login',{ email: this.email, password: this.password }).subscribe({
      next:data =>{
        this.route.navigate(['/home']);
      }
    })
  }
}

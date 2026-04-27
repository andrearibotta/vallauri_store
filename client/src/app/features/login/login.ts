import { AfterViewInit } from '@angular/core';
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
export class Login implements AfterViewInit {
  email: string = "";
  password: string = "";
  //registrati: boolean = false;

  rpwd: string = "";
  remail: string = "";
  rnome: string = "";
  rcognome: string = "";

  ngAfterViewInit(): void {
    document.getElementById('tabLogin')?.addEventListener('click', () => this.showLogin());
    document.getElementById('tabRegister')?.addEventListener('click', () => this.showRegister());
  }

  showLogin(): void {
    document.getElementById('formLogin')!.style.display = 'block';
    document.getElementById('formRegister')!.style.display = 'none';
    document.getElementById('tabLogin')!.classList.add('active');
    document.getElementById('tabRegister')!.classList.remove('active');
    document.getElementById('cardTitle')!.textContent = 'Bentornato!';
    document.getElementById('cardSubtitle')!.textContent = 'Accedi a vallauristore con la tua email scolastica';
  }

  showRegister(): void {
    document.getElementById('formLogin')!.style.display = 'none';
    document.getElementById('formRegister')!.style.display = 'block';
    document.getElementById('tabLogin')!.classList.remove('active');
    document.getElementById('tabRegister')!.classList.add('active');
    document.getElementById('cardTitle')!.textContent = 'Crea account';
    document.getElementById('cardSubtitle')!.textContent = 'Unisciti a vallauristore gratuitamente';
  }

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

  registrati() {
    let data: any = {}
    data.nome = this.rnome;
    data.cognome = this.rcognome;
    data.email = this.remail;
    data.password = this.rpwd;

    console.log(data)
    this.http.Post('/auth/register',{ data }).subscribe({
      next:data =>{
        this.route.navigate(['/home']);
        console.log("REGISTRATO CON SUCCESSO")
      },
      error: err => {
        console.error(err)
      }
    })
  }
}

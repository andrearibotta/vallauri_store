import { AfterViewInit, Component } from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  email: string = "";
  password: string = "";
  registrati: boolean = false;

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
    document.getElementById('cardSubtitle')!.textContent = 'Accedi a ScambiAmo con la tua email scolastica';
  }

  showRegister(): void {
    document.getElementById('formLogin')!.style.display = 'none';
    document.getElementById('formRegister')!.style.display = 'block';
    document.getElementById('tabLogin')!.classList.remove('active');
    document.getElementById('tabRegister')!.classList.add('active');
    document.getElementById('cardTitle')!.textContent = 'Crea account';
    document.getElementById('cardSubtitle')!.textContent = 'Unisciti a ScambiAmo gratuitamente';
  }

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

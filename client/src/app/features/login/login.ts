import { AfterViewInit, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Router, RouterLink } from '@angular/router'; // Aggiunto RouterLink agli import se serve
import { FormsModule } from '@angular/forms';
import { Controllologin } from '../../services/controllologin';

@Component({
  selector: 'login',
  standalone: true, // Se è un componente standalone
  imports: [FormsModule, RouterLink], // Aggiunto RouterLink per supportare il "Torna alla home"
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit, OnInit {
  email: string = "";
  password: string = "";

  rpwd: string = "";
  remail: string = "";
  rnome: string = "";
  rcognome: string = "";

  classi: any[] = [];
  indirizzi: string[] = [];

  indselezionato: boolean = false;
  strind: string = "";
  classiperind: any[] = [];

  classesel: string = "";
  prelogin: any = {}; 

  ngOnInit() {
    this.prelogin = history.state.dati;
    console.log(this.prelogin);
  }

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

  constructor(private http: Httpcalls, private router: Router, private navbarService: Controllologin) {
  }

  googleLogin() {
    try {
      window.location.href = 'https://api.vallauristore.it/api/auth/google';
    } catch (err) {
      console.log("Errore indirizzamento google")
      console.error(err)
    }
  }

  login() {
    this.http.Post('/auth/login', { email: this.email, password: this.password }).subscribe({
      next: data => {
        console.log("dati login: ", data)
        this.navbarService.updateData(data);
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error("Errore login:", err);
        // ── APRE IL POPUP DI ERRORE SE LE CREDENZIALI SONO ERRATE ──
        const modalElement = document.getElementById('loginErrorModal');
        if (modalElement) {
          const modalBootstrap = new (window as any).bootstrap.Modal(modalElement);
          modalBootstrap.show();
        }
      }
    })
  }

  registrati() {
    let data: any = {}
    data.nome = this.rnome;
    data.cognome = this.rcognome;
    data.email = this.remail;
    data.password = this.rpwd;
    data.idClasse = this.classesel;

    this.http.Post('/auth/register', { data }).subscribe({
      next: data => {
        console.log(data)
        this.http.Post('/email/contact', {
          name: this.rnome,
          email: this.remail,
          subject: "Benvenuto in ScambiAmo",
          htmlMessage: `<h2>Benvenuto in ScambiAmo</h2> Grazie per esserti unito alla comunity di ScambiAmo ${this.rnome}`
        }).subscribe({
          next: (response) => { console.log(response) },
          error: (err) => { console.log(err) }
        })
        console.log("REGISTRATO CON SUCCESSO")
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error(err)
      }
    })
  }

  invialoginallanavbar() {
    this.navbarService.updateData({ titolo: 'Profilo Utente', notifiche: 5 });
    this.router.navigate(['/profilo']);
  }

  selind() {
    this.indselezionato = true;
    this.classiperind = this.classi.filter(item => item.indirizzo === this.strind);
  }
}
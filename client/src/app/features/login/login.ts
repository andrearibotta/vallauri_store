import {AfterViewInit, OnInit} from '@angular/core';
import {Component, NgModule} from '@angular/core';
import { Httpcalls } from '../../services/httpcalls';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {Controllologin} from '../../services/controllologin';

@Component({
  selector: 'login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit, OnInit {
  email: string = "";
  password: string = "";
  //registrati: boolean = false;

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

  prelogin: any = {}; //dati ricevuti quando arrivo al login cliccando "contatta un venditore"

  ngOnInit() {
    /*this.http.Get('/public/getAllClassi').subscribe({
      next:data =>{
        this.classi = data.classe;

        this.indirizzi = this.classi
          .map(item => item.indirizzo)
          .filter((indirizzo, indice, array) => array.indexOf(indirizzo) === indice);

        console.log("classi:", data)

        console.log("indirizzi:", this.indirizzi)
      }
    })*/

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

  constructor(private http: Httpcalls, private router: Router, private navbarService: Controllologin) {
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
    this.http.Post('/auth/login',{ email: this.email, password: this.password }).subscribe({
      next:data =>{
        console.log("dati login: ", data)
        this.navbarService.updateData(data);
        this.router.navigate(['/home']);
      }
    })
  }

  registrati() {
    //console.log(this.classesel)
    let data: any = {}
    data.nome = this.rnome;
    data.cognome = this.rcognome;
    data.email = this.remail;
    data.password = this.rpwd;
    data.idClasse = this.classesel;

    this.http.Post('/auth/register',{ data }).subscribe({
      next:data =>{
        console.log(data)
        console.log(this.rnome)
        this.http.Post('/email/conntact',{name:this.rnome,email:this.remail,subject:"Benvenuto in Vallauristore",htmlMessage:`<h2>Benvenuto in Vallauristore</h2> Grazie per esserti unito alla comunity di vallauristore ${this.rnome}`}).subscribe({
          next: (response) =>{
            console.log(response)
          },
          error: (err) =>{
            console.log(err)
          }
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

  selind(){
    this.indselezionato = true;
    console.log(this.strind)

    this.classiperind = this.classi.filter(item => item.indirizzo === this.strind);

    console.log("classiperind: ", this.classiperind)
  }
}

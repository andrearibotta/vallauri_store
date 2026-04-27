import {Component, OnInit} from '@angular/core';
import {Httpcalls} from '../../services/httpcalls';
import {Controllologin} from '../../services/controllologin';

@Component({
  selector: 'home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  loggato: boolean = false;
  classi: any[] = [];

  constructor(private http: Httpcalls, private cl: Controllologin) { }

  ngOnInit() {
    console.log("pagina inizializzata")
    this.http.Get('/auth/me').subscribe({
      next:data =>{
        this.loggato = true;
        console.log(data)
        this.cl.changeMessage(true);
      }
    })
  }
}

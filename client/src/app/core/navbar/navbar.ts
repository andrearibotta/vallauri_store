import {Component, OnInit} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {Controllologin} from '../../services/controllologin';

@Component({
  selector: 'navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit{
  loggato: boolean = false;
  constructor(private cl: Controllologin) {
  }
  ngOnInit() {
    this.cl.currentMessage.subscribe(msg => this.loggato = msg)
    console.log("loggato dalla navbar")
    console.log("cm: ", this.loggato)
  }
}

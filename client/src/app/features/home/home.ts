import {Component, OnInit} from '@angular/core';
import {Httpcalls} from '../../services/httpcalls';

@Component({
  selector: 'home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  constructor(private http: Httpcalls) { }

  ngOnInit() {
    this.http.Get('/auth/me').subscribe({
      next:data =>{
        console.log(data)
      }
    })
  }
}

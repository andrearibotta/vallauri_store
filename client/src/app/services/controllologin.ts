import {Injectable, signal} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Controllologin {
  private navbarData = signal<any>(null);

  currentData = this.navbarData.asReadonly();

  updateData(data: any) {
    this.navbarData.set(data);
  }
}

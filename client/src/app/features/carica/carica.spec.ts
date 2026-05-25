import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carica } from './carica';

describe('Carica', () => {
  let component: Carica;
  let fixture: ComponentFixture<Carica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carica],
    }).compileComponents();

    fixture = TestBed.createComponent(Carica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

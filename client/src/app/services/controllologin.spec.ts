import { TestBed } from '@angular/core/testing';

import { Controllologin } from './controllologin';

describe('Controllologin', () => {
  let service: Controllologin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Controllologin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

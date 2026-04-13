import { TestBed } from '@angular/core/testing';

import { Httpcalls } from './httpcalls';

describe('Httpcalls', () => {
  let service: Httpcalls;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Httpcalls);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

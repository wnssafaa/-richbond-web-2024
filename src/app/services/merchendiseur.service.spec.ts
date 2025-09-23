import { TestBed } from '@angular/core/testing';

import { MerchendiseurService } from './merchendiseur.service';

describe('MerchendiseurService', () => {
  let service: MerchendiseurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchendiseurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

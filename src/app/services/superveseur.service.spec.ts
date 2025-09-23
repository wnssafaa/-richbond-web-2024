import { TestBed } from '@angular/core/testing';

import { SuperveseurService } from './superveseur.service';

describe('SuperveseurService', () => {
  let service: SuperveseurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperveseurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

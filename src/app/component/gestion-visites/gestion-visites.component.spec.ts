import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionVisitesComponent } from './gestion-visites.component';

describe('GestionVisitesComponent', () => {
  let component: GestionVisitesComponent;
  let fixture: ComponentFixture<GestionVisitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionVisitesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionVisitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

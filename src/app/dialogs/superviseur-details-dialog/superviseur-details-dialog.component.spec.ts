import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperviseurDetailsDialogComponent } from './superviseur-details-dialog.component';

describe('SuperviseurDetailsDialogComponent', () => {
  let component: SuperviseurDetailsDialogComponent;
  let fixture: ComponentFixture<SuperviseurDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperviseurDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperviseurDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

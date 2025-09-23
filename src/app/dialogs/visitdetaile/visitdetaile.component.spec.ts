import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitdetaileComponent } from './visitdetaile.component';

describe('VisitdetaileComponent', () => {
  let component: VisitdetaileComponent;
  let fixture: ComponentFixture<VisitdetaileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitdetaileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisitdetaileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

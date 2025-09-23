import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HELPComponent } from './help.component';

describe('HELPComponent', () => {
  let component: HELPComponent;
  let fixture: ComponentFixture<HELPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HELPComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HELPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

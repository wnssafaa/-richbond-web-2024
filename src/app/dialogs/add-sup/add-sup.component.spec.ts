import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSUpComponent } from './add-sup.component';

describe('AddSUpComponent', () => {
  let component: AddSUpComponent;
  let fixture: ComponentFixture<AddSUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

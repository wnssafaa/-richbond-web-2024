import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagasinDetailComponent } from './magasin-detail.component';

describe('MagasinDetailComponent', () => {
  let component: MagasinDetailComponent;
  let fixture: ComponentFixture<MagasinDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagasinDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MagasinDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

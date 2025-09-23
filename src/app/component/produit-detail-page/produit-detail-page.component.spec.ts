import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitDetailPageComponent } from './produit-detail-page.component';

describe('ProduitDetailPageComponent', () => {
  let component: ProduitDetailPageComponent;
  let fixture: ComponentFixture<ProduitDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

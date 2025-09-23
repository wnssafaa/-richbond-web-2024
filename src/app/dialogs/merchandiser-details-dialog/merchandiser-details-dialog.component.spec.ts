import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchandiserDetailsDialogComponent } from './merchandiser-details-dialog.component';

describe('MerchandiserDetailsDialogComponent', () => {
  let component: MerchandiserDetailsDialogComponent;
  let fixture: ComponentFixture<MerchandiserDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchandiserDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MerchandiserDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

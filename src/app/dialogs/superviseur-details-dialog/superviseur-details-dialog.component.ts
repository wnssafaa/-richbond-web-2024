import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Merchendiseur } from '../../services/merchendiseur.service';

@Component({
  selector: 'app-superviseur-details-dialog',
  standalone: true,
  templateUrl: './superviseur-details-dialog.component.html',
  styleUrls: ['./superviseur-details-dialog.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule,MatDialogModule ],
})
export class SuperviseurDetailsDialogComponent {
 getMerchandiseurNames(merchendiseurs: Merchendiseur[]): string {
    if (!merchendiseurs || merchendiseurs.length === 0) return '';
    return merchendiseurs.map(m => m.nom).join(', ');
  }
  currentDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<SuperviseurDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // private datePipe: DatePipe
  ) {}

  printFile(): void {
 window.print();
}
imageLoaded = true; 
}
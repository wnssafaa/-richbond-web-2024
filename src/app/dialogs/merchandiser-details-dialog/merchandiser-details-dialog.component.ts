import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-merchandiser-details-dialog',
  standalone: true,
  templateUrl: './merchandiser-details-dialog.component.html',
  styleUrls: ['./merchandiser-details-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIcon,MatIcon
  ]
})
export class MerchandiserDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  printFile(): void {
 window.print();

}
imageLoaded = true; // Par défaut on suppose que l'image existe
}
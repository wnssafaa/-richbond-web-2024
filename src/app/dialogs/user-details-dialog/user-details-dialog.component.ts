import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class UserDetailsDialogComponent {
  currentDate = new Date();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
   printFile(): void {
 window.print();
}
imageLoaded = true; 
}
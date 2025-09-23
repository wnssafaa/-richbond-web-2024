import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-magasin-detail',
  standalone: true,
  imports: [   CommonModule,
      MatDialogModule,
      MatButtonModule,
      MatIcon,MatIcon],
  templateUrl: './magasin-detail.component.html',
  styleUrl: './magasin-detail.component.css'
})
export class MagasinDetailComponent {
currentDate = new Date();
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
    printFile(): void {
   window.print();
  }

}

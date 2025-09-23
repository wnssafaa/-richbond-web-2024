import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-logout',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule],
  templateUrl: './confirm-logout.component.html',
  styleUrl: './confirm-logout.component.css'
})
export class ConfirmLogoutComponent {

   constructor(public dialogRef: MatDialogRef<ConfirmLogoutComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Confirme la déconnexion
  }

  onCancel(): void {
    this.dialogRef.close(false); // Annule la déconnexion
  }
}

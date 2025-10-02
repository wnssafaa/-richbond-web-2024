import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailService, VisitReportEmailData } from '../../services/email.service';
import { VisitDTO } from '../../services/visit.service';

export interface ShareVisitEmailData {
  visit: VisitDTO;
}

@Component({
  selector: 'app-share-visit-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './share-visit-email.component.html',
  styleUrl: './share-visit-email.component.css'
})
export class ShareVisitEmailComponent implements OnInit {
  emailForm: FormGroup;
  isLoading = false;
  visit: VisitDTO;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ShareVisitEmailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareVisitEmailData,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.visit = data.visit;
    this.emailForm = this.fb.group({
      recipientEmail: ['', [Validators.required, Validators.email]],
      customMessage: [''],
      includeImages: [true]
    });
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  /**
   * Envoie le rapport de visite par email
   */
  sendEmail(): void {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.emailForm.value;
    
    if (!this.emailService.validateEmail(formValue.recipientEmail)) {
      this.snackBar.open('Adresse email invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    const emailData: VisitReportEmailData = {
      visit: this.visit,
      recipientEmail: formValue.recipientEmail,
      customMessage: formValue.customMessage,
      includeImages: formValue.includeImages
    };

    this.emailService.sendVisitReport(emailData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Rapport envoyé avec succès !', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        this.snackBar.open(
          error.message || 'Erreur lors de l\'envoi de l\'email',
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  /**
   * Ferme le dialog
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Marque tous les champs du formulaire comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.emailForm.controls).forEach(key => {
      const control = this.emailForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtient le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const control = this.emailForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('email')) {
      return 'Adresse email invalide';
    }
    return '';
  }

  /**
   * Vérifie si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const control = this.emailForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtient le nom du magasin
   */
  getMagasinName(): string {
    return this.visit.planning?.magasin?.nom || 'Magasin';
  }

  /**
   * Obtient le nom du merchandiseur
   */
  getMerchandiserName(): string {
    const merch = this.visit.planning?.merchandiser;
    if (merch) {
      return `${merch.nom || ''} ${merch.prenom || ''}`.trim();
    }
    return 'Merchandiseur';
  }

  /**
   * Obtient la date de visite formatée
   */
  getVisitDate(): string {
    if (this.visit.planning?.dateVisite) {
      return new Date(this.visit.planning.dateVisite).toLocaleDateString('fr-FR');
    }
    return 'N/A';
  }

  /**
   * Obtient le nombre d'images disponibles
   */
  getImageCount(): number {
    return this.visit.images?.length || 0;
  }
}


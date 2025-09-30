import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisitDTO } from '../../services/visit.service';
import { EmailService } from '../../services/email.service';

export interface ShareVisitReportData {
  visit: VisitDTO;
}

@Component({
  selector: 'app-share-visit-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './share-visit-report.component.html',
  styleUrl: './share-visit-report.component.css'
})
export class ShareVisitReportComponent implements OnInit {
  shareForm: FormGroup;
  isLoading = false;
  emailList: string[] = [];
  invalidEmails: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ShareVisitReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareVisitReportData,
    private emailService: EmailService,
    private snackBar: MatSnackBar
  ) {
    this.shareForm = this.fb.group({
      recipients: ['', [Validators.required]],
      subject: [this.generateDefaultSubject(), [Validators.required]],
      message: [this.generateDefaultMessage()]
    });
  }

  ngOnInit(): void {
    // Écouter les changements dans le champ recipients pour valider les emails
    this.shareForm.get('recipients')?.valueChanges.subscribe(value => {
      this.parseEmailList(value);
    });
  }

  /**
   * Génère un sujet par défaut pour l'email
   */
  private generateDefaultSubject(): string {
    const visit = this.data.visit;
    const magasin = visit.planning?.magasin?.nom || 'Magasin';
    return `Rapport de visite #${visit.id} - ${magasin}`;
  }

  /**
   * Génère un message par défaut pour l'email
   */
  private generateDefaultMessage(): string {
    const visit = this.data.visit;
    const merchandiser = visit.planning?.merchandiser;
    const magasin = visit.planning?.magasin;
    
    return `Bonjour,

Veuillez trouver ci-joint le rapport de visite #${visit.id} effectuée le ${this.formatDate(visit.heureArrivee)}.

Détails de la visite :
- Magasin : ${magasin?.nom || 'N/A'}
- Merchandiser : ${merchandiser ? `${merchandiser.nom} ${merchandiser.prenom}` : 'N/A'}
- Heure d'arrivée : ${this.formatDateTime(visit.heureArrivee)}
- Heure de départ : ${this.formatDateTime(visit.heureDepart)}

Cordialement,
L'équipe Richbond`;
  }

  /**
   * Parse la liste des emails depuis le champ de saisie
   */
  private parseEmailList(value: string): void {
    if (!value) {
      this.emailList = [];
      this.invalidEmails = [];
      return;
    }

    const emails = value.split(/[,\n;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const validation = this.emailService.validateEmailList(emails);
    this.emailList = validation.valid;
    this.invalidEmails = validation.invalid;
  }

  /**
   * Ajoute un email à la liste
   */
  addEmail(email: string): void {
    if (email && this.emailService.isValidEmail(email)) {
      if (!this.emailList.includes(email)) {
        this.emailList.push(email);
        this.updateRecipientsField();
      }
    }
  }

  /**
   * Supprime un email de la liste
   */
  removeEmail(email: string): void {
    this.emailList = this.emailList.filter(e => e !== email);
    this.updateRecipientsField();
  }

  /**
   * Met à jour le champ recipients avec la liste actuelle
   */
  private updateRecipientsField(): void {
    this.shareForm.patchValue({
      recipients: this.emailList.join(', ')
    });
  }

  /**
   * Envoie le rapport par email
   */
  sendReport(): void {
    if (this.shareForm.invalid || this.emailList.length === 0) {
      this.snackBar.open('Veuillez saisir au moins un destinataire valide', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.shareForm.value;

    this.emailService.sendVisitReport(
      this.data.visit,
      this.emailList,
      formValue.subject,
      formValue.message
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Rapport envoyé avec succès !', 'Fermer', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi:', error);
        this.snackBar.open('Erreur lors de l\'envoi du rapport', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Ferme le dialogue
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Formate une date et heure pour l'affichage
   */
  private formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Vérifie si le formulaire est valide
   */
  get isFormValid(): boolean {
    return this.shareForm.valid && this.emailList.length > 0 && this.invalidEmails.length === 0;
  }
}

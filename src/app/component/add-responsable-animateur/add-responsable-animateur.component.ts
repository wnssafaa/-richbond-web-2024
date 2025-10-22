import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Region } from '../../enum/Region';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { ResponsableAnimateurService, ResponsableAnimateur } from '../../services/responsable-animateur.service';
import { SuperveseurService } from '../../services/superveseur.service';

@Component({
  selector: 'app-add-responsable-animateur',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './add-responsable-animateur.component.html',
  styleUrls: ['./add-responsable-animateur.component.css']
})
export class AddResponsableAnimateurComponent implements OnInit {
  responsableForm: FormGroup;
  isEditMode = false;
  regions: string[] = Object.values(Region);
  marques: string[] = Object.values(MarqueProduit);
  superviseurs: any[] = [];
  enseignes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddResponsableAnimateurComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResponsableAnimateur | null,
    private responsableService: ResponsableAnimateurService,
    private superviseurService: SuperveseurService,
    private snackBar: MatSnackBar
  ) {
    this.responsableForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSuperviseurs();
    this.loadEnseignes();
    
    if (this.data) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      region: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      marqueCouverte: ['', [Validators.required]],
      localisation: [''],
      type: ['RESPONSABLE_ANIMATEUR'],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      status: ['ACTIVE'],
      superviseurId: [null],
      marques: [[]],
      enseignes: [[]]
    });
  }

  populateForm(): void {
    if (this.data) {
      this.responsableForm.patchValue({
        username: this.data.username,
        email: this.data.email,
        nom: this.data.nom,
        prenom: this.data.prenom,
        region: this.data.region,
        ville: this.data.ville,
        marqueCouverte: this.data.marqueCouverte,
        localisation: this.data.localisation,
        type: this.data.type,
        telephone: this.data.telephone,
        status: this.data.status,
        superviseurId: this.data.superviseurId,
        marques: this.data.marques || [],
        enseignes: this.data.enseignes || []
      });
    }
  }

  loadSuperviseurs(): void {
    this.superviseurService.getAll().subscribe({
      next: (superviseurs: any[]) => {
        this.superviseurs = superviseurs.map((s: any) => ({
          id: s.id,
          nom: `${s.nom} ${s.prenom}`
        }));
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des superviseurs:', error);
      }
    });
  }

  loadEnseignes(): void {
    // Charger les enseignes depuis les données existantes
    this.responsableService.getAllResponsableAnimateurs().subscribe({
      next: (responsables) => {
        const enseigneSet = new Set(
          responsables.flatMap(r => r.enseignes || []).filter(enseigne => enseigne)
        );
        this.enseignes = Array.from(enseigneSet).sort();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignes:', error);
      }
    });
  }

  onMarquesChange(marques: string[]): void {
    this.responsableForm.patchValue({ marques });
  }

  onEnseignesChange(enseignes: string[]): void {
    this.responsableForm.patchValue({ enseignes });
  }

  onSubmit(): void {
    if (this.responsableForm.valid) {
      const formData = this.responsableForm.value;
      
      if (this.isEditMode && this.data?.id) {
        this.updateResponsable(formData);
      } else {
        this.createResponsable(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  createResponsable(data: any): void {
    this.responsableService.createResponsableAnimateur(data).subscribe({
      next: (response) => {
        this.snackBar.open('Responsable animateur créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.snackBar.open('Erreur lors de la création du responsable animateur', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updateResponsable(data: any): void {
    if (this.data?.id) {
      this.responsableService.updateResponsableAnimateur(this.data.id, data).subscribe({
        next: (response) => {
          this.snackBar.open('Responsable animateur modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.snackBar.open('Erreur lors de la modification du responsable animateur', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.responsableForm.controls).forEach(key => {
      const control = this.responsableForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.responsableForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.responsableForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

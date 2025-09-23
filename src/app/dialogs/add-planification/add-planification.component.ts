import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { Planification, PlanificationService, StatutVisite } from '../../services/planification.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-planification',
  standalone: true,
  templateUrl: './add-planification.component.html',
  styleUrl: './add-planification.component.css',
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'YYYY-MM-DD' },
        display: {
          dateInput: 'YYYY-MM-DD',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      }
    }
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatAutocompleteModule
  ]
})
export class AddPlanificationComponent implements OnInit {
  planifForm!: FormGroup;
  isEditMode = false;
  editId!: number;
  statutOptions = Object.values(StatutVisite);
  merchendiseurs: Merchendiseur[] = [];
  magasins: Magasin[] = [];
  heuresDisponibles: string[] = [];
  showDateFin = false;

  get dateControls() {
    return this.planifForm.get('dates') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private planifService: PlanificationService,
    private merchService: MerchendiseurService,
    private magasinService: MagasinService,
    private dialogRef: MatDialogRef<AddPlanificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.heuresDisponibles = this.generateHeuresDisponibles();

    this.loadMerchendiseurs();
    this.loadMagasins();
  }

  initForm(): void {
    this.planifForm = this.fb.group({
      dates: this.fb.array([this.fb.control('', Validators.required)]),
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      statut: [StatutVisite.PLANIFIEE, Validators.required],
      merchendiseurCtrl: ['', Validators.required],
      magasinId: ['', Validators.required],
      recurrence: ['none'],
      dateFin: ['']
    });
  }

  loadMerchendiseurs(): void {
    this.merchService.getAllMerchendiseurs().subscribe({
      next: (merchs) => {
        this.merchendiseurs = merchs;
        this.tryPatchFormFromData();
      },
      error: (err) => console.error('Erreur chargement merchandiseurs', err)
    });
  }

  loadMagasins(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (mags) => {
        this.magasins = mags;
        this.tryPatchFormFromData();
      },
      error: (err) => console.error('Erreur chargement magasins', err)
    });
  }

  onSubmit(): void {
    if (this.planifForm.invalid) {
      this.markFormGroupTouched(this.planifForm);
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    const formValue = this.planifForm.value;
    // Merchandiseur sélectionné directement
    const merch = formValue.merchendiseurCtrl;
    if (!merch) {
      this.snackBar.open('Veuillez sélectionner un merchandiser valide', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    // Vérification que l'heure de fin est après l'heure de début
    if (formValue.heureFin <= formValue.heureDebut) {
      this.snackBar.open("L'heure de fin doit être après l'heure de début", 'Fermer', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    // Générer toutes les dates à planifier
    let allDates: string[] = this.dateControls.value;
    // Si récurrence, générer les occurrences jusqu'à la date de fin
    if (formValue.recurrence !== 'none' && formValue.dateFin) {
      const startDates = allDates.map(d => new Date(d));
      const endDate = new Date(formValue.dateFin);
      let recDates: string[] = [];
      for (let d of startDates) {
        let current = new Date(d);
        while (current <= endDate) {
          recDates.push(this.formatDateToISO(current));
          if (formValue.recurrence === 'weekly') {
            current.setDate(current.getDate() + 7);
          } else if (formValue.recurrence === 'monthly') {
            current.setMonth(current.getMonth() + 1);
          }
        }
      }
      allDates = Array.from(new Set(recDates)); // éviter doublons
    }
    // Pour chaque date, créer une planification
    const planifications: Planification[] = allDates.map(dateStr => {
      const dateDebutISO = this.formatDateForBackend(dateStr, formValue.heureDebut);
      const duree = this.calculerDuree(formValue.heureDebut, formValue.heureFin);
      const magasinObj = this.magasins.find(m => m.id === formValue.magasinId);
      const merchObj = this.merchendiseurs.find(m => m.id === formValue.merchendiseurCtrl.id);

      // ✅ Debug: Afficher les informations de debug
      console.log('🔍 Debug Planification:', {
        dateOriginale: dateStr,
        heureDebut: formValue.heureDebut,
        heureFin: formValue.heureFin,
        dateVisiteISO: dateDebutISO,
        duree: duree
      });

      return {
        dateVisite: dateDebutISO,
        statut: formValue.statut,
        commentaire: '',
        dureeVisite: duree,
        valide: true,
        magasin: magasinObj as Magasin,
        merchandiser: merchObj ? { id: merchObj.id } : undefined
      } as unknown as Planification;
    });
    // Vérification de disponibilité pour chaque planification (optionnel : à adapter si besoin)
    let created = 0;
    planifications.forEach(planif => {
      this.planifService.addPlanification(planif).subscribe({
        next: (response) => {
          created++;
          if (created === planifications.length) {
            this.snackBar.open('Planification(s) créée(s) avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la création de la planification', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    });
    if (this.isEditMode) {
      this.updatePlanification(planifications[0]);
      return;
    }
  }

  private addPlanification(planif: Planification): void {
    this.planifService.addPlanification(planif).subscribe({
      next: (response) => {
        this.snackBar.open('Planification créée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(response);
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private updatePlanification(planif: Planification): void {
    this.planifService.updatePlanification(this.editId, planif).subscribe({
      next: (response) => {
        // S'assurer que la réponse contient toutes les données nécessaires
        const completeResponse = {
          ...response,
          magasin: this.magasins.find(m => m.id === planif.magasin?.id),
          merchandiser: this.merchendiseurs.find(m => m.id === planif.merchandiser?.id)
        };
        
        this.snackBar.open('Planification modifiée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(completeResponse); // Envoyer la réponse complète
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        this.snackBar.open(`Erreur lors de la modification: ${err.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  } 

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private calculerDuree(heureDebut: string, heureFin: string): number {
    const [hDebut, mDebut] = heureDebut.split(':').map(Number);
    const [hFin, mFin] = heureFin.split(':').map(Number);

    const debut = hDebut * 60 + mDebut;
    const fin = hFin * 60 + mFin;

    const minutes = Math.max(fin - debut, 0);
    return minutes / 60; 
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  private formatTimeForInput(timeString: string): string {
    if (!timeString) return '';
    
    // Si c'est déjà au format HH:mm, on le retourne directement
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Si c'est une date ISO avec T, on extrait l'heure
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '';
      
      // ✅ Utiliser getUTCHours() et getUTCMinutes() pour éviter le décalage
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    // Sinon, on prend les 5 premiers caractères (HH:mm)
    return timeString.slice(0, 5);
  }

  private formatDateForBackend(dateString: string, timeString: string = '00:00'): string {
    if (!dateString || !timeString || !/^\d{2}:\d{2}$/.test(timeString)) {
      throw new Error('Date ou heure invalide (format attendu : YYYY-MM-DD et HH:mm)');
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);

    // ✅ Construction directe de la chaîne ISO sans utiliser new Date()
    // Cela évite les problèmes de décalage horaire
    const yyyy = year;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const min = String(minute).padStart(2, '0');
    const ss = '00';

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>, index: number) {
    if (event.value) {
      const formattedDate = this.formatDateToISO(event.value);
      this.dateControls.at(index).setValue(formattedDate);
    }
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 car les mois commencent à 0
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  dateFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    return date >= new Date();
  };

  generateHeuresDisponibles(): string[] {
    const heures: string[] = [];
    for (let h = 7; h <= 18; h++) { // de 07:00 à 18:00
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        heures.push(`${hour}:${minute}`);
      }
    }
    return heures;
  }

  addDate() {
    this.dateControls.push(this.fb.control('', Validators.required));
  }

  removeDate(index: number) {
    if (this.dateControls.length > 1) {
      this.dateControls.removeAt(index);
    }
  }

  onRecurrenceChange(value: string) {
    this.showDateFin = value !== 'none';
    if (!this.showDateFin) {
      this.planifForm.get('dateFin')?.setValue('');
    }
  }

  displayMerch(merch?: Merchendiseur): string {
    return merch ? merch.prenom + ' ' + merch.nom : '';
  }

  private _filterMerchs(name: string): Merchendiseur[] {
    const filterValue = name.toLowerCase();
    return this.merchendiseurs.filter(m => (m.prenom + ' ' + m.nom).toLowerCase().includes(filterValue));
  }

  private _filterMagasins(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.magasins.filter(magasin =>
      magasin.nom.toLowerCase().includes(filterValue) ||
      (magasin.ville && magasin.ville.toLowerCase().includes(filterValue))
    );
  }

  displayMagasin(magasin: any): string {
    return magasin && magasin.nom ? magasin.nom + (magasin.ville ? ' (' + magasin.ville + ')' : '') : '';
  }

  asFormControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }

  private tryPatchFormFromData() {
    if (
      this.data?.planification &&
      this.merchendiseurs.length > 0 &&
      this.magasins.length > 0
    ) {
      this.isEditMode = true;
      this.editId = this.data.planification.id;

      // Patch dates (FormArray)
      const datesArray = this.planifForm.get('dates') as FormArray;
      datesArray.clear();
      const planifDates = Array.isArray(this.data.planification.dates)
        ? this.data.planification.dates
        : [this.data.planification.date || this.data.planification.dateVisite];
      planifDates.forEach((d: string) => {
        datesArray.push(this.fb.control(this.formatDateForInput(d), Validators.required));
      });

      // Patch les autres champs
      this.planifForm.patchValue({
        heureDebut: this.formatTimeForInput(this.data.planification.heureDebut || ''),
        heureFin: this.formatTimeForInput(this.data.planification.heureFin || ''),
        statut: this.data.planification.statut,
        merchendiseurCtrl: this.merchendiseurs.find(m => m.id === this.data.planification.merchandiser?.id) || '',
        magasinId: this.data.planification.magasin?.id || '',
        recurrence: this.data.planification.recurrence || 'none',
        dateFin: this.data.planification.dateFin ? this.formatDateForInput(this.data.planification.dateFin) : ''
      });
    }
  }
}
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { SubmissionStateService } from '../../services/submission-state.service';
import { Region } from '../../enum/Region';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-add-sup',
  standalone: true,
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
    MatButtonModule, MatDatepickerModule,MatProgressSpinnerModule,
        MatNativeDateModule,
  ],
  templateUrl: './add-sup.component.html',
  styleUrls: ['./add-sup.component.css']
})
export class AddSupComponent implements OnInit {
  editId!: number;
  superviseurForm!: FormGroup;
  merchandiseurs: Merchendiseur[] = [];
 // Initialisation correcte des régions
regions = Object.values(Region).filter(value => typeof value === 'string') as Region[];
  villesDisponibles: string[] = [];
  isEditMode = false;
   @ViewChild('integrationPicker') integrationPicker!: MatDatepicker<Date>;
  @ViewChild('sortiePicker') sortiePicker!: MatDatepicker<Date>;
  
regionVillesMap: { [key in Region]: string[] } = {
  [Region.SUD]: ['Assa', 'Zag', 'Tata', 'Akka', 'Foum Zguid'],
  [Region.NORD]: ['Al Hoceïma', 'Chefchaouen', 'Ouezzane', 'Fahs-Anjra', 'M\'diq-Fnideq'],
  [Region.ORIENT]: [], // À supprimer (doublon avec ORIENTAL)
  [Region.CENTRE]: ['Khouribga', 'Beni Mellal', 'Fquih Ben Salah', 'Azilal', 'Oulad Ayad'],
  
  [Region.TANGER_TETOUAN_AL_HOCEIMA]: [
    'Tanger', 
    'Tétouan', 
    'Al Hoceïma', 
    'Larache', 
    'Chefchaouen',
    'Ouezzane',
    'M\'diq-Fnideq',
    'Fahs-Anjra'
  ],
  
  [Region.ORIENTAL]: [
    'Oujda',
    'Nador',
    'Berkane',
    'Taourirt',
    'Jerada',
    'Figuig',
    'Driouch',
    'Guercif'
  ],
  
  [Region.FES_MEKNES]: [
    'Fès',
    'Meknès',
    'Ifrane',
    'El Hajeb',
    'Sefrou',
    'Boulemane',
    'Taza',
    'Taounate'
  ],
  
  [Region.RABAT_SALE_KENITRA]: [
    'Rabat',
    'Salé',
    'Kénitra',
    'Skhirat',
    'Témara',
    'Sidi Kacem',
    'Sidi Slimane',
    'Khémisset'
  ],
  
  [Region.BENI_MELLAL_KHENIFRA]: [
    'Béni Mellal',
    'Khénifra',
    'Khouribga',
    'Fquih Ben Salah',
    'Azilal'
  ],
  
  [Region.CASABLANCA_SETTAT]: [
    'Casablanca',
    'Mohammedia',
    'Settat',
    'El Jadida',
    'Berrechid',
    'Mediouna',
    'Nouaceur',
    'Benslimane',
    'Sidi Bennour'
  ],
  
  [Region.MARRAKECH_SAFI]: [
    'Marrakech',
    'Safi',
    'Essaouira',
    'El Kelaâ des Sraghna',
    'Youssoufia',
    'Chichaoua',
    'Al Haouz',
    'Rhamna'
  ],
  
  [Region.DRAA_TAFILALET]: [
    'Errachidia',
    'Ouarzazate',
    'Midelt',
    'Tinghir',
    'Zagora'
  ],
  
  [Region.SOUSS_MASSA]: [
    'Agadir',
    'Inezgane',
    'Taroudant',
    'Tiznit',
    'Chtouka-Aït Baha'
  ],
  
  [Region.GUELMIM_OUED_NOUN]: [
    'Guelmim',
    'Tan-Tan',
    'Assa',
    'Zag',
    'Sidi Ifni'
  ],
  
  [Region.LAAYOUNE_SAKIA_EL_HAMRA]: [
    'Laâyoune',
    'Smara',
    'Tarfaya',
    'Boujdour'
  ],
  
  [Region.DAKHLA_OUED_ED_DAHAB]: [
    'Dakhla',
    'Aousserd'
  ]
};

  constructor(
    private fb: FormBuilder,
    private superviseurService: SuperveseurService,
    private merchendiseurService: MerchendiseurService,
    private submissionStateService: SubmissionStateService,
    @Inject(MAT_DIALOG_DATA) public data: { superviseur: Superviseur },
    private dialogRef: MatDialogRef<AddSupComponent>,
    private snackBar: MatSnackBar
  ) {}
  isSubmitting = false;
  private lastSubmitTime = 0;
  submitInProgress = false;
  submissionCompleted = false;
  ngOnInit(): void {
    this.initializeForm();
    this.loadMerchandiseurs();

    if (this.data?.superviseur) {
      this.setEditMode(this.data.superviseur);
    }
  }

private initializeForm(): void {
  this.superviseurForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: [''],
    ville: [''],
    // status: ['Active', Validators.required],
    telephone: ['', [
      Validators.required,
      Validators.pattern(/^[5-7]\d{8}$/)
    ]],
    email: ['', [Validators.required, Validators.email]],
    region: [''],
    magasin: [''],
    marquesCouvertes: [''],
    merchendiseurIds: [[]] ,
    status:['Active'], 
    dateDebutIntegration: [''], // Nouveau champ
    dateSortie: ['']  ,
       username: [],
      password: [],      // Nouveau champ

  });

  this.superviseurForm.get('region')?.valueChanges.subscribe(region => {
    this.updateVillesDisponibles(region);
  });
}

private setEditMode(superviseur: Superviseur): void {
  this.isEditMode = true;
  this.editId = superviseur.id!;
  
  this.superviseurForm.patchValue({
    ...superviseur,
  });

 
}
 filteredMerchandiseurs: Merchendiseur[] = [];
  filterMerchandiseurs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredMerchandiseurs = [...this.merchandiseurs];
      return;
    }
    
    this.filteredMerchandiseurs = this.merchandiseurs.filter(m => 
      m.nom.toLowerCase().includes(searchTerm) || 
      m.prenom.toLowerCase().includes(searchTerm)
    );
  }

  isSelected(merchandiseurId: number | undefined): boolean {
  if (!merchandiseurId) return false;
  return this.superviseurForm.value.merchendiseurIds.includes(merchandiseurId);
}toggleMerchandiseurSelection(merchandiseurId: number | undefined): void {
  if (!merchandiseurId) return;
  
  const currentSelection = [...this.superviseurForm.value.merchendiseurIds];
  const index = currentSelection.indexOf(merchandiseurId);

  if (index === -1) {
    currentSelection.push(merchandiseurId);
  } else {
    currentSelection.splice(index, 1);
  }

  this.superviseurForm.patchValue({
    merchendiseurIds: currentSelection
  });
}

  private updateVillesDisponibles(region: Region): void {
    this.villesDisponibles = this.regionVillesMap[region] || [];
    const currentVille = this.superviseurForm.get('ville')?.value;
    
    if (currentVille && !this.villesDisponibles.includes(currentVille)) {
      this.superviseurForm.get('ville')?.setValue('');
    }
  }

   loadMerchandiseurs(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (data) => {
        this.merchandiseurs = data;
        this.filteredMerchandiseurs = [...data];
      },
      error: (err) => console.error('Erreur lors du chargement des merchandiseurs', err)
    });
  }

  onSubmit(event?: Event): void {
    // Empêcher le comportement par défaut du formulaire
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Vérification si la soumission est déjà terminée
    if (this.submissionCompleted) {
      console.log('🚫 Soumission déjà terminée, ignorée');
      return;
    }

    // Vérification globale de l'état de soumission
    if (!this.submissionStateService.canSubmit()) {
      console.log('🚫 Soumission bloquée par le service global');
      return;
    }

  if (this.superviseurForm.invalid) {
    this.markAllAsTouched();
    return;
  }

  // Démarrer la soumission avec un ID unique
  let submissionId: string;
  try {
    submissionId = this.submissionStateService.startSubmission();
  } catch (error) {
    console.log('🚫 Impossible de démarrer la soumission:', error);
    return;
  }

  console.log('🔄 Début de la soumission du superviseur:', submissionId);
  this.isSubmitting = true; // ← Activer le statut de soumission
  this.submitInProgress = true; // ← Activer le flag de soumission

  const formValue = this.superviseurForm.value;

  // Formatage des dates pour le backend Spring Boot (YYYY-MM-DD)
  const formatDate = (date: any) => {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const superviseurData: Superviseur = {
    ...formValue,
    dateDebutIntegration: formatDate(formValue.dateDebutIntegration),
    dateSortie: formatDate(formValue.dateSortie)
  };

  console.log('📤 Données à envoyer:', superviseurData);

  const operation = this.isEditMode 
    ? this.superviseurService.update(this.editId, superviseurData)
    : this.superviseurService.create(superviseurData);

    operation.subscribe({
      next: (response) => {
        console.log('✅ Superviseur créé/modifié avec succès:', response);
        this.submissionCompleted = true; // ← Marquer comme terminé
        this.isSubmitting = false; // ← Désactiver le statut
        this.submitInProgress = false; // ← Désactiver le flag
        this.submissionStateService.endSubmission(submissionId); // ← Libérer l'état global
        this.showSuccessMessage();
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création/modification:', err);
        this.submissionCompleted = true; // ← Marquer comme terminé même en cas d'erreur
        this.isSubmitting = false; // ← Désactiver même en cas d'erreur
        this.submitInProgress = false; // ← Désactiver le flag même en cas d'erreur
        this.submissionStateService.endSubmission(submissionId); // ← Libérer l'état global même en cas d'erreur
        this.showErrorMessage(err);
      }
  });
}

  private markAllAsTouched(): void {
    Object.values(this.superviseurForm.controls).forEach(control => {
      control.markAsTouched();
    });
    this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
  }

  private showSuccessMessage(): void {
    const message = this.isEditMode 
      ? 'Superviseur mis à jour avec succès' 
      : 'Superviseur ajouté avec succès';
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  private showErrorMessage(err: any): void {
    console.error('Erreur:', err);
    const message = this.isEditMode 
      ? 'Erreur lors de la mise à jour du superviseur' 
      : 'Erreur lors de l\'ajout du superviseur';
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
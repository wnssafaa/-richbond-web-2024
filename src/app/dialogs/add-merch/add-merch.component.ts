import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, FormsModule, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MerchendiseurService, Merchendiseur, InviteStatus, INVITE_STATUS_OPTIONS } from '../../services/merchendiseur.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../enum/Role';
import { Validators } from '@angular/forms';
import { Region } from '../../enum/Region';
import { MagasinService } from '../../services/magasin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import{SuperveseurService, Superviseur} from '../../services/superveseur.service'
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
@Component({
  selector: 'app-add-merch',
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
    CommonModule, MatSortModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,
    MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule, MatDatepickerModule,
    MatNativeDateModule, MatSlideToggleModule, MatMenuModule, MatListModule, ReactiveFormsModule,
  ],
  templateUrl: './add-merch.component.html',
  styleUrls: ['./add-merch.component.css']
})
export class AddMerchComponent implements OnInit {
   @ViewChild('integrationPicker') integrationPicker!: MatDatepicker<Date>;
  @ViewChild('sortiePicker') sortiePicker!: MatDatepicker<Date>;
  
  merchForm!: FormGroup;
  merchendiseurs: Merchendiseur[] = [];
  isEditMode = false;
  editId!: number;
  Region = Object.values(Region);
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
  asFormControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }
  villesDisponibles: string[] = [];
  Role = [
    { label: 'MERCHANDISEUR_MONO', value: Role.MERCHANDISEUR_MONO },
    { label: 'MERCHANDISEUR_MULTI', value: Role.MERCHANDISEUR_MULTI }
  ];

  // ✅ Nouvelles propriétés pour l'invitation
  inviteStatusOptions = INVITE_STATUS_OPTIONS;
  selectedInviteStatus: InviteStatus | null = null;
  dateInvitation: string | null = null;

  marques = ['Richbond', 'Simmons', 'Révey', 'Atlas', 'Total Rayons'];
  enseignes = ['Carrefour',
    'Marjane',
    'Aswak Assalam',
    'Acima',
    'Label\'Vie',
    'BIM',
    'Atacadao',
    'Carrefour Market',
    'Metro',
    'Super U',
    'Uniprix',
    'Hanouty',
    'Miniprix',
    'Decathlon',
    'IKEA',
    'Electroplanet',
    'Virgin Megastore',
    'LC Waikiki'];

  magasins: any[] = [];

  constructor(
    private fb: FormBuilder,
    private merchService: MerchendiseurService,
    private masaginservice: MagasinService,
    private dialogRef: MatDialogRef<AddMerchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
     private snackBar: MatSnackBar,
    private superviseurService: SuperveseurService,
     
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAll();
    this.loadmagasins();
     this.loadSuperviseurs();
if (this.data && this.data.Merchendiseur) {
  this.isEditMode = true;
    this.merchForm.patchValue(this.data.Merchendiseur);
     this.isEditMode = true;
      this.editId = this.data.Merchendiseur.id;
      const region = this.data.Merchendiseur.region;
      this.villesDisponibles = this.regionVillesMap[region as Region] || [];
      const magasinIds = this.data.Merchendiseur.magasinIds 
        ? this.data.Merchendiseur.magasinIds.map((id: any) => Number(id)) 
        : [];

     
  }
    if (this.data && this.data.merchandiseur) {
      this.isEditMode = true;
      this.editId = this.data.merchandiseur.id;
      const region = this.data.merchandiseur.region;
      this.villesDisponibles = this.regionVillesMap[region as Region] || [];
      const magasinIds = this.data.merchandiseur.magasinIds 
        ? this.data.merchandiseur.magasinIds.map((id: any) => Number(id)) 
        : [];

      this.merchForm.patchValue({
        ...this.data.merchandiseur,
        magasinIds: magasinIds,
        marques: this.data.merchandiseur.marques || [],
        enseignes: this.data.merchandiseur.enseignes || []
      });
    }
  }

  onRegionChange(): void {
    const selectedRegion = this.merchForm.get('region')?.value;
    this.villesDisponibles = this.regionVillesMap[selectedRegion as Region] || [];

    const currentVille = this.merchForm.get('ville')?.value;
    if (!this.villesDisponibles.includes(currentVille)) {
      this.merchForm.get('ville')?.setValue('');
    }
  }

  initForm(): void {
    this.merchForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      region: ['', Validators.required],
      ville: ['', Validators.required],
      telephone: [''],
      email: ['', [Validators.required, Validators.email]],
      marques: [[], Validators.required],
      magasinIds: [[]],
      enseignes: [[], Validators.required],
      role: ['', Validators.required],
      status: ['Active'],
       superviseurId: [null, Validators.required],
       username: [],
      password: [],
       dateDebutIntegration: [''], // Nouveau champ
    dateSortie: ['']       // Nouveau champ

    });

    this.merchForm.get('region')?.valueChanges.subscribe(() => {
      this.onRegionChange();
    });
  }

  getAll(): void {
    this.merchService.getAllMerchendiseurs().subscribe(res => {
      this.merchendiseurs = res;
    });
  }

  onSubmit(): void {
    if (this.merchForm.valid) {
      this.villesDisponibles = this.regionVillesMap[this.merchForm.value.region as Region] || [];
      
    
      const merch: Merchendiseur = {
        ...this.merchForm.value,
        status: this.merchForm.value.status,
        magasinIds: this.merchForm.value.magasinIds.map((id: any) => Number(id)),
        superviseur: this.merchForm.value.superviseurId ? { id: this.merchForm.value.superviseurId } : null,
        
        // ✅ Ajouter les champs d'invitation
        inviteStatus: this.selectedInviteStatus,
        dateInvitation: this.dateInvitation
      };

      if (this.isEditMode) {
        this.merchService.updateMerchendiseur(this.editId, merch).subscribe({
          next: (response) => {
            // Ajoutez le SnackBar pour la modification
            this.snackBar.open('Merchandiseur modifié avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // this.dialogRef.close(true);
            this.dialogRef.close(response); 
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du merchandiseur', error);
            // SnackBar d'erreur pour la modification
            this.snackBar.open('Erreur lors de la modification du merchandiseur', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        this.merchService.addMerchendiseur(merch).subscribe({
          next: (response) => {
            // Ajoutez le SnackBar pour l'ajout
            this.snackBar.open('Merchandiseur ajouté avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
           this.dialogRef.close(response); 
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout du merchandiseur', error);
            // SnackBar d'erreur pour l'ajout
            this.snackBar.open('Erreur lors de l\'ajout du merchandiseur', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    } else {
      console.warn('Formulaire invalide');
      this.markFormGroupTouched(this.merchForm);
      // SnackBar pour formulaire invalide
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  deleteMerch(id: number): void {
    this.merchService.deleteMerchendiseur(id).subscribe(() => {
      this.getAll();
    });
  }

  editMerch(merch: Merchendiseur): void {
    this.merchForm.patchValue({
      ...merch,
      magasinIds: merch.magasinIds || []
    });
    
    // ✅ Charger les valeurs d'invitation
    this.selectedInviteStatus = merch.inviteStatus || null;
    this.dateInvitation = merch.dateInvitation || null;
    
    this.editId = merch.id!;
    this.isEditMode = true;
  }

  resetForm(): void {
    this.merchForm.reset();
    this.isEditMode = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadmagasins(): void {
    this.masaginservice.getAllMagasins().subscribe({
      next: (data) => {
        this.magasins = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des magasins', error);
      }
    });
  }

  toggleMagasinSelection(magasinId: number): void {
    const currentIds: number[] = [...this.merchForm.value.magasinIds];
    const index = currentIds.indexOf(magasinId);
    
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(magasinId);
    }
    
    this.merchForm.patchValue({ magasinIds: currentIds });
  }

  isMagasinSelected(magasinId: number): boolean {
    return this.merchForm.value.magasinIds.includes(magasinId);
  }
   superviseurs: Superviseur[] = [];
  loadSuperviseurs(): void {
    this.superviseurService.getAll().subscribe({
      next: (data) => { this.superviseurs = data; },
      error: (err) => { console.error('Erreur chargement superviseurs', err); }
    });
  }

  // ✅ Méthodes pour gérer l'invitation
  onInviteStatusChange(): void {
    if (this.selectedInviteStatus === 'EN_ATTENTE') {
      // Si on passe en "en attente", définir la date d'invitation
      this.dateInvitation = new Date().toISOString().split('T')[0];
    } else if (this.selectedInviteStatus === null) {
      // Si on revient à null, effacer la date
      this.dateInvitation = null;
    }
  }

  // ✅ Obtenir l'icône selon le statut
  getStatusIcon(status: string | null): string {
    switch (status) {
      case 'EN_ATTENTE': return 'schedule';
      case 'ACCEPTE': return 'check_circle';
      case 'REFUSE': return 'cancel';
      case 'EXPIRE': return 'schedule';
      default: return 'person';
    }
  }

  // ✅ Obtenir la classe CSS selon le statut
  getStatusClass(status: string | null): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'ACCEPTE': return 'status-accepted';
      case 'REFUSE': return 'status-refused';
      case 'EXPIRE': return 'status-expired';
      default: return 'status-normal';
    }
  }

  // ✅ Obtenir le texte du statut
  getStatusText(status: string | null): string {
    const option = this.inviteStatusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Aucune invitation';
  }

 
}
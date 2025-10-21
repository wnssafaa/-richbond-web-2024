import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { Role } from '../../enum/Role';
import { CommonModule } from '@angular/common';
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { Region } from '../../enum/Region';

@Component({
  selector: 'app-adduser',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './adduser.component.html',
  styleUrl: './adduser.component.css'
})
export class AdduserComponent implements OnInit {
  userForm!: FormGroup;
  merchendiseurs: Merchendiseur[] = [];
  Type = [
    { label: 'MERCHANDISEUR_MONO', value: Role.MERCHANDISEUR_MONO },
    { label: 'MERCHANDISEUR_MULTI', value: Role.MERCHANDISEUR_MULTI }
  ];
  Role = [
    // { label: 'Admin', value: Role.ADMIN },
    { label: 'SUPERVISEUR', value: Role.SUPERVISEUR },
    { label: 'MERCHANDISEUR_MONO', value: Role.MERCHANDISEUR_MONO },
    { label: 'MERCHANDISEUR_MULTI', value: Role.MERCHANDISEUR_MULTI }
  ];
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
  regions = Object.values(Region);
  marques = ['Richbond', 'Simmons', 'Révey', 'Atlas', 'Total Rayons'];
   villesDisponibles: string[] = [];
  isEditMode: boolean = false;
  Region = Object.values(Region);
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private superviseurService: SuperveseurService,
    private merchendiseurService: MerchendiseurService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AdduserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMerchandiseurs();
    this.checkEditMode();
    
    
      
  }
onRegionChange(): void {
    const selectedRegion = this.userForm.get('region')?.value;
    this.villesDisponibles = this.regionVillesMap[selectedRegion as Region] || [];

    const currentVille = this.userForm.get('ville')?.value;
    if (!this.villesDisponibles.includes(currentVille)) {
      this.userForm.get('ville')?.setValue('');
    }
  }
  initializeForm(): void {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [
        Validators.required,
        Validators.pattern(/^[5-7]\d{8}$/)
      ]],
      role: ['', Validators.required],
      status: ['Active'],
      region: ['', Validators.required],
      ville: ['', Validators.required],
      marques: [[]],
      type: [''],
      sousMarque: [''],
      merchandiseurs: [[]]
      
    });
    this.userForm.get('region')?.valueChanges.subscribe(() => {
      this.onRegionChange();
    });
  }

  loadMerchandiseurs(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (data) => this.merchendiseurs = data,
      error: (err) => console.error('Erreur de chargement des merchandiseurs:', err)
    });
  }

  checkEditMode(): void {
    if (this.data?.user) {
      this.isEditMode = true;
      this.userForm.patchValue(this.data.user);
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (this.isEditMode) {
      this.handleEdit(formValue);
    } else {
      this.handleCreate(formValue);
    }
  }

  private handleEdit(formValue: any): void {
    // Implémentez la logique d'édition ici
    this.snackBar.open('Fonctionnalité d\'édition non implémentée', 'Fermer', { duration: 3000 });
  }

  private handleCreate(formValue: any): void {
    switch(formValue.role) {
      case Role.SUPERVISEUR:
        this.createSuperviseur(formValue);
        break;
      case Role.MERCHANDISEUR_MONO:
      case Role.MERCHANDISEUR_MULTI:
        this.createMerchandiseur(formValue);
        break;
      default:
        this.snackBar.open('Rôle non pris en charge', 'Fermer', { duration: 3000 });
    }
  }

  private createSuperviseur(formValue: any): void {
    const payload = {
      ...formValue,
      merchandiseurs: formValue.merchandiseurs.map((m: Merchendiseur) => m.id)
    };

    this.superviseurService.create(payload).subscribe({
      next: (response) => this.handleSuccess('Superviseur', response),
      error: (err) => this.handleError('superviseur', err)
    });
  }

  private createMerchandiseur(formValue: any): void {
    const payload: Merchendiseur = {
      ...formValue,
      // type: formValue.role === Role.MERCHANDISEUR_MONO ? 'MERCHANDISEUR_MONO' : 'MERCHANDISEUR_MULTI',
      // localisation: '',
      // magasin: '',
      // superviseurId: null,
      // enseignes: []
    
    };

    this.merchendiseurService.addMerchendiseur(payload).subscribe({
      next: (response) => this.handleSuccess('Merchandiseur', response),
      error: (err) => this.handleError('merchandiseur', err)
    });
  }

  private handleSuccess(role: string, response?: any): void {
    this.snackBar.open(`${role} ajouté avec succès`, 'Fermer', { duration: 3000 });
    this.dialogRef.close(response);
  }

  private handleError(role: string, error: any): void {
    console.error(`Erreur ${role}:`, error);
    this.snackBar.open(`Erreur lors de l'ajout du ${role}`, 'Fermer', { duration: 5000 });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isMerchandiseur(): boolean {
    const role = this.userForm.get('role')?.value;
    return role === Role.MERCHANDISEUR_MONO || role === Role.MERCHANDISEUR_MULTI;
  }

  isSuperviseur(): boolean {
    return this.userForm.get('role')?.value === Role.SUPERVISEUR;
  }
  
}

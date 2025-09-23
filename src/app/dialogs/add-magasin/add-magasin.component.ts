import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Region } from '../../enum/Region';
import { Merchendiseur, MerchendiseurService } from '../../services/merchendiseur.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MapLocationDialogComponent } from './map-location-dialog.component';
import { GoogleMapDialogComponent } from './google-map-dialog.component';
import { OpenStreetMapDialogComponent } from './openstreetmap-dialog.component';

import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-add-magasin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './add-magasin.component.html',
  styleUrls: ['./add-magasin.component.css']
})
export class AddMagasinComponent implements OnInit {
  magasinForm!: FormGroup;
  isEditMode = false;
  editId!: number;

  types: string[] = ['Hyper', 'Super', 'Boutique'];
  enseignes = [
    'Carrefour', 'Marjane', 'Aswak Assalam', 'Acima', 'Label\'Vie', 'BIM', 'Atacadao',
    'Carrefour Market', 'Metro', 'Super U', 'Uniprix', 'Hanouty', 'Miniprix',
    'Decathlon', 'IKEA', 'Electroplanet', 'Virgin Megastore', 'LC Waikiki'
  ];
  regions = Object.values(Region);
  villes: string[] = [];
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

  merchandiseurs: Merchendiseur[] = [];

  constructor(
    private fb: FormBuilder,
    private magasinService: MagasinService,
    private merchendiseurService: MerchendiseurService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddMagasinComponent>,
    private route: Router,
    @Inject(MAT_DIALOG_DATA) public data: { magasin: Magasin },
    private dialog: MatDialog,
    private geocodingService: GeocodingService
  ) {}
ngOnInit(): void {
  this.initializeForm();
  
  // Charger d'abord les merchandiseurs de manière synchrone
  this.merchendiseurService.getAllMerchendiseurs().subscribe({
    next: (merchandiseurs) => {
      this.merchandiseurs = merchandiseurs;
      
      // Après le chargement des merchandiseurs, initialiser les autres valeurs
      this.setupRegionListener();
      
      if (this.data?.magasin) {
        this.handleEditMode(this.data.magasin);
      }
    },
    error: (err) => {
      console.error('Erreur lors du chargement des merchandiseurs', err);
      this.setupRegionListener();
    }
  });
}

private setupRegionListener(): void {
  this.magasinForm.get('region')?.valueChanges.subscribe(region => {
    this.villes = this.regionVillesMap[region as Region] || [];
    this.magasinForm.get('ville')?.setValue('');
  });
}

private handleEditMode(magasin: Magasin): void {
  this.isEditMode = true;
  this.editId = magasin.id!;
  
  // Mettre à jour les villes en fonction de la région du magasin
  if (magasin.region) {
    this.villes = this.regionVillesMap[magasin.region as Region] || [];
  }
  
  // Trouver l'objet merchandiseur complet correspondant
  const merchId = magasin.merchandiseur?.id;
  const selectedMerch = merchId 
    ? this.merchandiseurs.find(m => m.id === merchId)
    : null;

  // Patcher les valeurs du formulaire
  this.magasinForm.patchValue({
    nom: magasin.nom,  // Notez la majuscule - important!
    localisation: magasin.localisation,
    latitude: magasin.latitude,
    longitude: magasin.longitude,
    region: magasin.region,
    ville: magasin.ville,
    type: magasin.type,
    enseigne: magasin.enseigne,
    merchandiseur: selectedMerch ? selectedMerch.id : null
  });
  
  console.log('Formulaire patché:', this.magasinForm.value);
}
loadMerchandiseurs(callback?: () => void): void {
  this.merchendiseurService.getAllMerchendiseurs().subscribe({
    next: (data) => {
      this.merchandiseurs = data;
      if (callback) callback();
    },
    error: (err) => console.error(err)
  });
}

  private initializeForm(): void {
    this.magasinForm = this.fb.group({
      nom: ['', Validators.required],
      localisation: ['', Validators.required], // adresse affichée
      latitude: [''],
      longitude: [''],
      region: ['', Validators.required],
      ville: ['', Validators.required],
      type: ['', Validators.required],
      enseigne: ['', Validators.required],
     merchandiseur: [null, Validators.required]
 // Tableau d'IDs des merchandiseurs sélectionnés
    });
  }
 onSubmit() {
    if (this.magasinForm.invalid) {
      return;
    }

    const formValue = this.magasinForm.value;
    const selectedMerch = this.merchandiseurs.find(m => m.id === formValue.merchandiseur);

    const magasin: Magasin = {
      nom: formValue.nom,
      localisation: formValue.localisation,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      region: formValue.region,
      ville: formValue.ville,
      type: formValue.type,
      enseigne: formValue.enseigne,
      produits: [],
      merchandiseur: selectedMerch && selectedMerch.id !== undefined
        ? { id: selectedMerch.id, nom: selectedMerch.nom, prenom: selectedMerch.prenom }
        : undefined
    };


    if (this.isEditMode) {
      this.magasinService.updateMagasin(this.editId, magasin).subscribe({
        next: (response) => {
          this.snackBar.open('magsin modifié avec succès', 'Fermer', { duration: 3000 });
         this.dialogRef.close(response); 
        },
        error: (error) => {
          console.error('Erreur lors de la modification du magsin', error);
        }
      });
    } else {
     this.magasinService.addMagasin(magasin).subscribe({
  next: (response) => {
    this.snackBar.open('magasin ajouté avec succès', 'Fermer', { duration: 3000 });
    this.dialogRef.close(response); // on retourne le produit
  },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du magasin', error);
        }
      });
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  openMapDialog(): void {
    // Ouvrir un dialogue de choix entre Google Maps et OpenStreetMap
    const dialogRef = this.dialog.open(OpenStreetMapDialogComponent, {
      width: '900px',
      height: '700px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.lat && result.lng) {
        // Utiliser l'adresse retournée par la carte
        this.magasinForm.get('localisation')?.setValue(result.address);
        this.magasinForm.get('latitude')?.setValue(result.lat);
        this.magasinForm.get('longitude')?.setValue(result.lng);
        
        this.snackBar.open('Localisation sélectionnée avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openGoogleMapDialog(): void {
    const dialogRef = this.dialog.open(GoogleMapDialogComponent, {
      width: '900px',
      height: '700px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.lat && result.lng) {
        // Utiliser l'adresse retournée par Google Maps
        this.magasinForm.get('localisation')?.setValue(result.address);
        this.magasinForm.get('latitude')?.setValue(result.lat);
        this.magasinForm.get('longitude')?.setValue(result.lng);
        
        this.snackBar.open('Localisation sélectionnée avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }





  // Méthode pour géocoder une adresse saisie manuellement
  geocodeAddress(): void {
    const address = this.magasinForm.get('localisation')?.value;
    
    if (!address || address.trim() === '') {
      this.snackBar.open('Veuillez saisir une adresse à géocoder.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.snackBar.open('Géocodage de l\'adresse en cours...', 'Fermer', {
      duration: 2000
    });

    // Utiliser le service de géocodage pour obtenir les coordonnées
    this.geocodingService.geocode(address).subscribe({
      next: (result: {lat: number, lng: number} | null) => {
        if (result && result.lat && result.lng) {
          this.magasinForm.get('latitude')?.setValue(result.lat);
          this.magasinForm.get('longitude')?.setValue(result.lng);
          
          this.snackBar.open('Adresse géocodée avec succès !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Aucune coordonnée trouvée pour cette adresse.', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du géocodage:', error);
        this.snackBar.open('Erreur lors du géocodage de l\'adresse.', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Méthode pour récupérer la position GPS actuelle
  getCurrentLocation(): void {
    this.snackBar.open('Récupération de votre position GPS...', 'Fermer', {
      duration: 2000
    });

    if (!navigator.geolocation) {
      this.snackBar.open('La géolocalisation n\'est pas supportée par votre navigateur.', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('Position GPS récupérée:', { lat, lng });
        
        // Utiliser le service de géocodage pour obtenir l'adresse
        this.geocodingService.reverseGeocode(lat, lng).subscribe({
          next: (address) => {
            this.magasinForm.get('localisation')?.setValue(address);
            this.magasinForm.get('latitude')?.setValue(lat);
            this.magasinForm.get('longitude')?.setValue(lng);
            
            this.snackBar.open('Position GPS récupérée avec succès !', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.warn('Erreur lors du géocodage:', error);
            // En cas d'erreur, utiliser les coordonnées comme adresse
            const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            this.magasinForm.get('localisation')?.setValue(address);
            this.magasinForm.get('latitude')?.setValue(lat);
            this.magasinForm.get('longitude')?.setValue(lng);
            
            this.snackBar.open('Position GPS récupérée. Vous pouvez modifier l\'adresse manuellement.', 'Fermer', {
              duration: 3000,
              panelClass: ['warning-snackbar']
            });
          }
        });
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        let errorMessage = 'Erreur lors de la récupération de votre position.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission refusée. Veuillez autoriser l\'accès à votre position.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible. Veuillez vérifier votre connexion GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
            break;
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Méthode alternative sans géocodage automatique
  openMapDialogSimple(): void {
    const dialogRef = this.dialog.open(MapLocationDialogComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.lat && result.lng) {
        // Utiliser directement les coordonnées sans géocodage
        const address = `${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`;
        this.magasinForm.get('localisation')?.setValue(address);
        this.magasinForm.get('latitude')?.setValue(result.lat);
        this.magasinForm.get('longitude')?.setValue(result.lng);
        
        this.snackBar.open('Coordonnées ajoutées avec succès. Vous pouvez modifier l\'adresse manuellement si nécessaire.', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}

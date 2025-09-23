import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { GoogleMapsService } from '../../services/google-maps.service';
import { GOOGLE_MAPS_CONFIG } from '../../config/google-maps.config';

declare var google: any;

@Component({
  selector: 'app-google-map-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCardModule
  ],
  template: `
    <div class="dialog-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sélectionner une localisation</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Barre de recherche -->
          <div class="search-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rechercher une adresse</mat-label>
              <input matInput 
                     [(ngModel)]="searchAddress" 
                     (keyup.enter)="searchLocation()"
                     placeholder="Ex: Casablanca, Maroc">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <div class="search-buttons">
              <button mat-raised-button 
                      color="primary" 
                      (click)="searchLocation()"
                      [disabled]="!searchAddress">
                <mat-icon>search</mat-icon>
                Rechercher
              </button>
              
              <button mat-raised-button 
                      color="accent" 
                      (click)="getCurrentLocation()">
                <mat-icon>my_location</mat-icon>
                Ma position
              </button>
            </div>
          </div>

          <!-- Carte Google Maps -->
          <div class="map-container">
            <div #mapContainer id="google-map" class="map"></div>
          </div>

          <!-- Informations de localisation -->
          <div class="location-info" *ngIf="selectedLocation">
            <mat-card>
              <mat-card-content>
                <h4>📍 Localisation sélectionnée</h4>
                <p><strong>Adresse :</strong> {{ selectedLocation.address }}</p>
                <p><strong>Latitude :</strong> {{ selectedLocation.lat | number:'1.6-6' }}</p>
                <p><strong>Longitude :</strong> {{ selectedLocation.lng | number:'1.6-6' }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="onCancel()">Annuler</button>
          <button mat-raised-button 
                  color="primary" 
                  (click)="confirmLocation()"
                  [disabled]="!selectedLocation">
            Confirmer
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 800px;
      width: 100%;
    }
    
    .search-container {
      margin-bottom: 20px;
    }
    
    .search-buttons {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .map-container {
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .map {
      width: 100%;
      height: 100%;
    }
    
    .location-info {
      margin-bottom: 20px;
    }
    
    .location-info mat-card {
      background: #f8f9fa;
    }
    
    .location-info h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }
    
    .location-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .full-width {
      width: 100%;
    }
  `]
})
export class GoogleMapDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private map: any;
  private marker: any;
  private geocoder: any;
  private autocomplete: any;
  
  searchAddress: string = '';
  selectedLocation: { lat: number; lng: number; address: string } | null = null;

  constructor(
    public dialogRef: MatDialogRef<GoogleMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private googleMapsService: GoogleMapsService
  ) {}

  ngOnInit(): void {
    // Charger l'API Google Maps avec la clé API configurée
    this.googleMapsService.loadGoogleMapsAPI(GOOGLE_MAPS_CONFIG.API_KEY).subscribe({
      next: (loaded) => {
        if (loaded) {
          setTimeout(() => {
            this.initMap();
          }, 500);
        } else {
          this.snackBar.open(
            'Google Maps non disponible. Utilisez OpenStreetMap ou configurez une clé API valide.', 
            'Fermer', 
            { duration: 5000 }
          );
          // Fermer automatiquement le dialogue après 5 secondes
          setTimeout(() => {
            this.dialogRef.close();
          }, 5000);
        }
      },
      error: (error) => {
        console.error('Erreur Google Maps:', error);
        this.snackBar.open(
          'Erreur lors du chargement de Google Maps. Utilisez OpenStreetMap.', 
          'Fermer', 
          { duration: 5000 }
        );
        // Fermer automatiquement le dialogue après 5 secondes
        setTimeout(() => {
          this.dialogRef.close();
        }, 5000);
      }
    });
  }

  ngAfterViewInit(): void {
    // L'initialisation se fait dans ngOnInit après le chargement de l'API
  }

  private initMap(): void {
    if (!this.mapContainer) return;

    // Initialiser la carte avec la configuration
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
      zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: GOOGLE_MAPS_CONFIG.MAP_OPTIONS.mapTypeControl,
      streetViewControl: GOOGLE_MAPS_CONFIG.MAP_OPTIONS.streetViewControl,
      fullscreenControl: GOOGLE_MAPS_CONFIG.MAP_OPTIONS.fullscreenControl,
      zoomControl: GOOGLE_MAPS_CONFIG.MAP_OPTIONS.zoomControl
    });

    // Initialiser le géocoder
    this.geocoder = new google.maps.Geocoder();

    // Gestionnaire de clic sur la carte
    this.map.addListener('click', (event: any) => {
      this.setMarker(event.latLng);
      this.reverseGeocode(event.latLng);
    });

    // Essayer de récupérer la position actuelle
    this.getCurrentLocation();
  }

  private setMarker(latLng: any): void {
    // Supprimer le marqueur existant
    if (this.marker) {
      this.marker.setMap(null);
    }

    // Utiliser AdvancedMarkerElement si disponible, sinon Marker classique
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      // Créer un nouveau marqueur avancé
      this.marker = new google.maps.marker.AdvancedMarkerElement({
        position: latLng,
        map: this.map,
        title: GOOGLE_MAPS_CONFIG.MARKER_OPTIONS.title
      });

      // Gestionnaire de glisser-déposer pour AdvancedMarkerElement
      this.marker.addListener('dragend', (event: any) => {
        this.reverseGeocode(event.latLng);
      });
    } else {
      // Fallback vers Marker classique
      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        draggable: GOOGLE_MAPS_CONFIG.MARKER_OPTIONS.draggable,
        title: GOOGLE_MAPS_CONFIG.MARKER_OPTIONS.title
      });

      // Gestionnaire de glisser-déposer pour Marker classique
      this.marker.addListener('dragend', (event: any) => {
        this.reverseGeocode(event.latLng);
      });
    }

    // Centrer la carte sur le marqueur
    this.map.setCenter(latLng);
    this.map.setZoom(15);
  }

  private reverseGeocode(latLng: any): void {
    this.geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        this.selectedLocation = {
          lat: latLng.lat(),
          lng: latLng.lng(),
          address: address
        };
      } else {
        // En cas d'échec, utiliser les coordonnées
        this.selectedLocation = {
          lat: latLng.lat(),
          lng: latLng.lng(),
          address: `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`
        };
      }
    });
  }

  searchLocation(): void {
    if (!this.searchAddress.trim()) {
      this.snackBar.open('Veuillez saisir une adresse', 'Fermer', { duration: 3000 });
      return;
    }

    this.googleMapsService.geocodeAddress(this.searchAddress).subscribe({
      next: (result) => {
        if (result) {
          const location = { lat: result.lat, lng: result.lng };
          this.setMarker(location);
          this.reverseGeocode(location);
          this.snackBar.open('Adresse trouvée !', 'Fermer', { duration: 2000 });
        } else {
          this.snackBar.open('Adresse non trouvée. Veuillez essayer une autre adresse.', 'Fermer', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Erreur de géocodage:', error);
        this.snackBar.open('Erreur lors de la recherche de l\'adresse.', 'Fermer', { duration: 3000 });
      }
    });
  }

  getCurrentLocation(): void {
    this.snackBar.open('Récupération de votre position avec haute précision...', 'Fermer', { duration: 3000 });

    this.googleMapsService.getCurrentPosition().subscribe({
      next: (position) => {
        if (position) {
          const latLng = { lat: position.lat, lng: position.lng };
          
                     // Afficher la précision obtenue
           let precisionMessage = 'Position GPS récupérée !';
           if (position && 'accuracy' in position && position.accuracy !== undefined && position.accuracy !== null) {
             const accuracy = position.accuracy;
             if (accuracy <= 5) {
               precisionMessage += ' Précision excellente (±' + accuracy.toFixed(1) + 'm)';
             } else if (accuracy <= 20) {
               precisionMessage += ' Précision bonne (±' + accuracy.toFixed(1) + 'm)';
             } else if (accuracy <= 100) {
               precisionMessage += ' Précision moyenne (±' + accuracy.toFixed(1) + 'm)';
             } else {
               precisionMessage += ' Précision faible (±' + accuracy.toFixed(1) + 'm) - Utilisez le GPS';
             }
           }
          
          this.setMarker(latLng);
          this.reverseGeocode(latLng);
          this.snackBar.open(precisionMessage, 'Fermer', { duration: 4000 });
          
          // Zoom plus proche pour une meilleure précision
          this.map.setCenter(latLng);
          this.map.setZoom(18);
        }
      },
      error: (error) => {
        console.error('Erreur de géolocalisation:', error);
        let errorMessage = 'Erreur lors de la récupération de votre position.';
        
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission refusée. Veuillez autoriser l\'accès à votre position GPS.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position indisponible. Vérifiez votre GPS et votre connexion.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai d\'attente dépassé. Le GPS prend plus de temps pour une précision maximale.';
              break;
          }
        }
        
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
      }
    });
  }

  confirmLocation(): void {
    if (this.selectedLocation) {
      this.dialogRef.close({
        lat: this.selectedLocation.lat,
        lng: this.selectedLocation.lng,
        address: this.selectedLocation.address
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

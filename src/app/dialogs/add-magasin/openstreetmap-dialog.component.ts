import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import * as L from 'leaflet';

@Component({
  selector: 'app-openstreetmap-dialog',
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
      <mat-card class="modern-card">
        <mat-card-header class="modern-header">
          <mat-card-title class="modern-title">
            <mat-icon class="title-icon">🗺️</mat-icon>
            Sélectionner une localisation
          </mat-card-title>
          <mat-card-subtitle class="modern-subtitle">
            Carte simple OpenStreetMap
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="modern-content">
          <!-- Barre de recherche simple -->
          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Adresse</mat-label>
              <input matInput 
                     [(ngModel)]="searchAddress" 
                     (keyup.enter)="searchLocation()"
                     placeholder="Ex: Casablanca, Maroc">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <div class="search-buttons">
              <button mat-raised-button 
                      class="search-btn primary-btn"
                      (click)="searchLocation()">
                <mat-icon>search</mat-icon>
                Rechercher
              </button>
              
              <button mat-raised-button 
                      class="search-btn accent-btn"
                      (click)="getCurrentLocation()">
                <mat-icon>my_location</mat-icon>
                Ma position
              </button>
            </div>
          </div>

          <!-- Carte OpenStreetMap simple -->
          <div class="map-container">
            <div #mapContainer id="map" class="map"></div>
            <!-- Marqueur personnalisé -->
            <div *ngIf="selectedLocation" class="custom-marker" 
                 [style.left]="markerPosition.x + 'px'" 
                 [style.top]="markerPosition.y + 'px'">
              📍
            </div>
          </div>

          <!-- Informations de localisation -->
          <div class="location-info" *ngIf="selectedLocation">
            <h4>📍 Localisation sélectionnée :</h4>
            <p><strong>Adresse :</strong> {{ selectedLocation.address }}</p>
            <p><strong>Latitude :</strong> {{ selectedLocation.lat | number:'1.6-6' }}</p>
            <p><strong>Longitude :</strong> {{ selectedLocation.lng | number:'1.6-6' }}</p>
          </div>
        </mat-card-content>
        
        <mat-card-actions class="modern-actions">
          <button mat-raised-button 
                  color="primary" 
                  (click)="confirmLocation()"
                  [disabled]="!selectedLocation">
            <mat-icon>check</mat-icon>
            Confirmer la localisation
          </button>
          
          <button mat-button 
                  (click)="closeDialog()">
            <mat-icon>close</mat-icon>
            Annuler
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./openstreetmap-dialog.component.css']
})
export class OpenStreetMapDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private map: L.Map | null = null;
  
  searchAddress: string = '';
  selectedLocation: { lat: number; lng: number; address: string } | null = null;
  markerPosition = { x: 0, y: 0 };

  constructor(
    public dialogRef: MatDialogRef<OpenStreetMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialisation simple
  }

  ngAfterViewInit(): void {
    // Attendre que le DOM soit complètement rendu
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy(): void {
    // Nettoyer la carte lors de la destruction du composant
    if (this.map) {
      try {
        this.map.remove();
      } catch (error) {
        console.warn('Erreur lors du nettoyage de la carte:', error);
      }
      this.map = null;
    }
  }

  private initMap(): void {
    try {
      // Vérifier que l'élément DOM existe
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Élément map non trouvé');
        return;
      }

      // Nettoyer l'élément map
      mapElement.innerHTML = '';

      // Créer la carte avec des options minimales
      this.map = L.map('map', {
        center: [31.7917, -7.0926], // Centre du Maroc
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false
      });

      // Ajouter les tuiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Écouter les clics sur la carte
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.onMapClick(e);
      });

      // Forcer le rafraîchissement de la carte
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      this.snackBar.open('Erreur lors de l\'initialisation de la carte', 'Fermer', { duration: 3000 });
    }
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    if (!this.map) return;

    try {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Calculer la position du marqueur sur l'écran
      const point = this.map.latLngToContainerPoint(e.latlng);
      this.markerPosition = { x: point.x - 10, y: point.y - 20 };
      
      // Créer une adresse simple
      const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      this.selectedLocation = {
        lat: lat,
        lng: lng,
        address: address
      };
      
      this.snackBar.open('Localisation sélectionnée !', 'Fermer', { duration: 2000 });
    } catch (error) {
      console.error('Erreur lors du clic sur la carte:', error);
    }
  }

  searchLocation(): void {
    if (!this.searchAddress.trim()) {
      this.snackBar.open('Veuillez saisir une adresse à rechercher.', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.map) {
      this.snackBar.open('Carte non initialisée', 'Fermer', { duration: 3000 });
      return;
    }

    // Géocodage simple avec Nominatim
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchAddress)}&limit=1`;
    
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          // Centrer la carte sur le résultat
          this.map?.setView([lat, lng], 15);
          
          // Calculer la position du marqueur
          const latlng = L.latLng(lat, lng);
          const point = this.map?.latLngToContainerPoint(latlng);
          if (point) {
            this.markerPosition = { x: point.x - 10, y: point.y - 20 };
          }
          
          this.selectedLocation = {
            lat: lat,
            lng: lng,
            address: result.display_name || this.searchAddress
          };
          
          this.snackBar.open('Adresse trouvée !', 'Fermer', { duration: 2000 });
        } else {
          this.snackBar.open('Aucune adresse trouvée.', 'Fermer', { duration: 3000 });
        }
      })
      .catch(error => {
        console.error('Erreur de recherche:', error);
        this.snackBar.open('Erreur lors de la recherche.', 'Fermer', { duration: 3000 });
      });
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('La géolocalisation n\'est pas supportée.', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.map) {
      this.snackBar.open('Carte non initialisée', 'Fermer', { duration: 3000 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Centrer la carte sur la position
          this.map?.setView([lat, lng], 15);
          
          // Calculer la position du marqueur
          const latlng = L.latLng(lat, lng);
          const point = this.map?.latLngToContainerPoint(latlng);
          if (point) {
            this.markerPosition = { x: point.x - 10, y: point.y - 20 };
          }
          
          this.selectedLocation = {
            lat: lat,
            lng: lng,
            address: `Position GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          };
          
          this.snackBar.open('Position GPS récupérée !', 'Fermer', { duration: 2000 });
        } catch (error) {
          console.error('Erreur lors de la récupération de la position:', error);
          this.snackBar.open('Erreur lors de la récupération de la position', 'Fermer', { duration: 3000 });
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        this.snackBar.open('Erreur lors de la récupération de votre position.', 'Fermer', { duration: 3000 });
      }
    );
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

  closeDialog(): void {
    this.dialogRef.close();
  }
}

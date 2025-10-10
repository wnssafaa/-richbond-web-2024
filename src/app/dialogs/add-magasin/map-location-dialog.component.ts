import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

@Component({
  selector: 'app-map-location-dialog',
  standalone: true,
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Choisir une localisation</h2>
      <div class="map-container">
        <div id="map-location-select" class="map"></div>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">Annuler</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dialog-title {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .map-container {
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .map {
      width: 100%;
      height: 100%;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
    }
    /* Styles améliorés pour le geocoder */
    .leaflet-control-geocoder {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      background: white;
      overflow: visible;
      margin-top: 12px;
      margin-left: 12px;
      transition: all 0.3s ease;
      max-width: 300px;
      width: 100%;
      z-index: 1001;
      position: relative;
    }
    .leaflet-control-geocoder:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    .leaflet-control-geocoder-form {
      display: flex;
      align-items: center;
      padding: 4px;
    }
    .leaflet-control-geocoder-form input {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
      background: #f8f9fa;
      width: 100%;
      box-sizing: border-box;
      color: #333;
      min-width: 220px;
      max-width: 260px;
    }
    .leaflet-control-geocoder-form input:focus {
      border-color: #4285f4;
      box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
      background: white;
    }
    .leaflet-control-geocoder-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4285f4;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .leaflet-control-geocoder-icon:hover {
      color: #3367d6;
      transform: scale(1.05);
    }
    .leaflet-control-geocoder-alternatives {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-top: 8px;
      padding: 0;
      max-height: 220px;
      overflow-y: auto;
      min-width: 220px;
      max-width: 260px;
      width: 100%;
      z-index: 2000;
      position: absolute;
      left: 0;
      right: 0;
      /* Ajoute ceci pour enlever les puces et le padding du ul */
      list-style: none;
    }

    .leaflet-control-geocoder-alternatives li {
      padding: 10px 16px;
      cursor: pointer;
      font-size: 15px;
      color: #222;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      /* Ajoute ceci pour enlever les puces */
      list-style: none;
      background: #fff;
      font-weight: 400;
    }

    .leaflet-control-geocoder-alternatives li:last-child {
      border-bottom: none;
    }

    .leaflet-control-geocoder-alternatives li:hover,
    .leaflet-control-geocoder-alternatives .leaflet-control-geocoder-selected {
      background: #e3f0fc;
      color: #1976d2;
      font-weight: 500;
    }
    /* Style pour le marker */
    .leaflet-marker-icon {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    /* Supprimer les puces des listes */
.leaflet-control-geocoder-alternatives,
.leaflet-control-geocoder-alternatives ul,
.leaflet-control-geocoder-alternatives li {
  list-style: none !important;
  margin: 0;
  padding: 0;
}

/* Corriger l'affichage de la liste des résultats */
.leaflet-control-geocoder-alternatives {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 8px;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
  min-width: 220px;
  max-width: 260px;
  width: 100%;
  z-index: 2000;
  position: absolute;
  left: 0;
}

/* Chaque item de suggestion */
.leaflet-control-geocoder-alternatives li {
  padding: 10px 16px;
  font-size: 15px;
  color: #222;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Highlight on hover */
.leaflet-control-geocoder-alternatives li:hover {
  background: #e6f0ff;
  color: #1976d2;
  font-weight: 500;
}

  `]
})
export class MapLocationDialogComponent implements AfterViewInit {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(
    public dialogRef: MatDialogRef<MapLocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  private initMap(): void {
    this.map = L.map('map-location-select', {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: false
    });

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '© OpenStreetMap contributors'
    // }).addTo(this.map);

    // Ajout du contrôle de zoom personnalisé
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Configuration du geocoder
    this.initGeocoder();
    
    // Gestion du clic sur la carte
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarker(e.latlng);
      this.dialogRef.close({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
  }

  private initGeocoder(): void {
    // @ts-ignore
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Rechercher une adresse...',
      errorMessage: 'Adresse non trouvée',
      suggestMinLength: 3,
      suggestTimeout: 250,
      focus: true
    })
    .on('markgeocode', (e: any) => {
      const center = e.geocode.center;
      this.setMarker(center);
      this.map?.setView(center, 15);
    })
    .addTo(this.map!);

    // Style supplémentaire pour le geocoder
    const geocoderContainer = document.querySelector('.leaflet-control-geocoder');
    if (geocoderContainer) {
      const input = geocoderContainer.querySelector('input');
      if (input) {
        input.setAttribute('aria-label', 'Rechercher une adresse');
      }
    }
  }

  private setMarker(latlng: L.LatLng): void {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }
    
    this.marker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4285F4" stroke="white" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      })
    }).addTo(this.map!);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
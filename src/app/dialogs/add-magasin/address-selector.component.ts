import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="address-selector" *ngIf="showSelector">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sélectionner une adresse</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-icon>hourglass_empty</mat-icon>
            <p>Récupération des adresses...</p>
          </div>
          
          <div *ngIf="!loading && addresses.length > 0">
            <mat-list>
              <mat-list-item 
                *ngFor="let address of addresses; let i = index"
                (click)="selectAddress(address)"
                class="address-item"
                [class.selected]="selectedIndex === i">
                <mat-icon matListItemIcon>location_on</mat-icon>
                <div matListItemTitle>{{ address }}</div>
                <div matListItemLine>Option {{ i + 1 }}</div>
              </mat-list-item>
            </mat-list>
          </div>
          
          <div *ngIf="!loading && addresses.length === 0" class="no-addresses">
            <mat-icon>location_off</mat-icon>
            <p>Aucune adresse trouvée pour cette localisation</p>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="closeSelector()">Annuler</button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="useCoordinates()"
            *ngIf="addresses.length === 0">
            Utiliser les coordonnées
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .address-selector {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90%;
    }
    
    .loading, .no-addresses {
      text-align: center;
      padding: 20px;
    }
    
    .loading mat-icon, .no-addresses mat-icon {
      font-size: 48px;
      color: #ccc;
    }
    
    .address-item {
      cursor: pointer;
      border-radius: 4px;
      margin: 4px 0;
    }
    
    .address-item:hover {
      background-color: #f5f5f5;
    }
    
    .address-item.selected {
      background-color: #e3f2fd;
    }
    
    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class AddressSelectorComponent {
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  @Output() addressSelected = new EventEmitter<{address: string, lat: number, lng: number}>();
  @Output() closed = new EventEmitter<void>();

  showSelector = false;
  loading = false;
  addresses: string[] = [];
  selectedIndex = -1;

  constructor(private geocodingService: GeocodingService) {}

  openSelector(lat: number, lng: number): void {
    this.lat = lat;
    this.lng = lng;
    this.showSelector = true;
    this.loading = true;
    this.addresses = [];
    this.selectedIndex = -1;

    // Générer plusieurs options d'adresses
    this.generateAddressOptions(lat, lng);
  }

  private generateAddressOptions(lat: number, lng: number): void {
    // Option 1: Géocodage local
    this.geocodingService.reverseGeocodeLocal(lat, lng).subscribe({
      next: (address) => {
        this.addresses.push(address);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Option 2: Coordonnées formatées
    setTimeout(() => {
      this.addresses.push(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }, 1000);

    // Option 3: Adresse simplifiée
    setTimeout(() => {
      this.addresses.push(`Point GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }, 2000);
  }

  selectAddress(address: string): void {
    this.selectedIndex = this.addresses.indexOf(address);
    this.addressSelected.emit({
      address: address,
      lat: this.lat,
      lng: this.lng
    });
    this.closeSelector();
  }

  useCoordinates(): void {
    const address = `${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}`;
    this.addressSelected.emit({
      address: address,
      lat: this.lat,
      lng: this.lng
    });
    this.closeSelector();
  }

  closeSelector(): void {
    this.showSelector = false;
    this.closed.emit();
  }
}

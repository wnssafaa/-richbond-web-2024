import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-column-customization-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="customization-panel" [class.open]="isOpen">
      <div class="panel-header">
        <h3>
          <mat-icon>view_column</mat-icon>
          Personnaliser les colonnes
        </h3>
        <button mat-icon-button class="close-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="panel-content">
        <mat-list>
          <mat-list-item *ngFor="let column of columnConfig; let i = index">
            <mat-checkbox 
              [(ngModel)]="column.visible"
              (change)="onColumnToggle(i)"
            >
              {{ column.label }}
            </mat-checkbox>
          </mat-list-item>
        </mat-list>
      </div>
      
      <div class="panel-actions">
        <button mat-stroked-button (click)="selectAll()">Tout sélectionner</button>
        <button mat-stroked-button (click)="deselectAll()">Tout désélectionner</button>
        <button mat-raised-button color="primary" (click)="onSave()">Enregistrer</button>
      </div>
    </div>
  `,
  styles: [`
    .customization-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease-in-out;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      border-left: 1px solid #e0e0e0;
    }

    .customization-panel.open {
      right: 0;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .panel-header h3 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .panel-header mat-icon {
      color: #0a2681;
      font-size: 20px;
    }

    .close-btn {
      color: #666;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #333;
      background-color: rgba(0, 0, 0, 0.04);
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;
    }

    .panel-content mat-list {
      padding: 0;
    }

    .panel-content mat-list-item {
      height: auto;
      padding: 8px 24px;
      border-bottom: 1px solid #f0f0f0;
    }

    .panel-content mat-list-item:last-child {
      border-bottom: none;
    }

    .panel-content mat-checkbox {
      width: 100%;
    }

    .panel-content mat-checkbox ::ng-deep .mat-checkbox-label {
      font-size: 14px;
      color: #333;
    }

    .panel-actions {
      padding: 20px 24px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .panel-actions button {
      width: 100%;
      height: 44px;
      font-weight: 500;
      border-radius: 8px;
      text-transform: none;
    }

    .panel-actions button[mat-raised-button] {
      background-color: #0a2681;
      color: white;
    }

    .panel-actions button[mat-raised-button]:hover {
      background-color: #1a4ba3;
    }

    .panel-actions button[mat-stroked-button] {
      border-color: #ddd;
      color: #666;
    }

    .panel-actions button[mat-stroked-button]:hover {
      background-color: #f5f5f5;
      border-color: #bbb;
    }

    /* Overlay pour fermer le panneau en cliquant à l'extérieur */
    .panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .panel-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .customization-panel {
        width: 100%;
        right: -100%;
      }
    }

    @media (max-width: 480px) {
      .panel-header {
        padding: 16px 20px;
      }

      .panel-header h3 {
        font-size: 16px;
      }

      .panel-content mat-list-item {
        padding: 8px 20px;
      }

      .panel-actions {
        padding: 16px 20px;
      }
    }
  `]
})
export class ColumnCustomizationPanelComponent {
  @Input() isOpen: boolean = false;
  @Input() columnConfig: ColumnConfig[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<ColumnConfig[]>();

  onColumnToggle(index: number): void {
    // La logique est déjà gérée par ngModel
  }

  selectAll(): void {
    this.columnConfig.forEach(column => column.visible = true);
  }

  deselectAll(): void {
    this.columnConfig.forEach(column => column.visible = false);
  }

  onSave(): void {
    this.save.emit(this.columnConfig);
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
}

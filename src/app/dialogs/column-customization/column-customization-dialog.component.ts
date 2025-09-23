import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
  selector: 'app-column-customization-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>view_column</mat-icon>
      Personnaliser les colonnes
    </h2>
    
    <mat-dialog-content>
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
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-button (click)="selectAll()">Tout sélectionner</button>
      <button mat-button (click)="deselectAll()">Tout désélectionner</button>
      <button mat-raised-button color="primary" (click)="onSave()">Enregistrer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-list-item {
      height: auto;
      padding: 8px 0;
    }
    
    mat-checkbox {
      width: 100%;
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class ColumnCustomizationDialogComponent {
  columnConfig: ColumnConfig[];

  constructor(
    public dialogRef: MatDialogRef<ColumnCustomizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { columnConfig: ColumnConfig[] }
  ) {
    // Créer une copie profonde pour éviter de modifier l'original
    this.columnConfig = JSON.parse(JSON.stringify(data.columnConfig));
  }

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
    this.dialogRef.close(this.columnConfig);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

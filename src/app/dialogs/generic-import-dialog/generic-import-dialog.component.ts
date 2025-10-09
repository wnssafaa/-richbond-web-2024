import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';

export interface ImportConfig {
  entityName: string; // Nom de l'entité (ex: "Superviseur")
  entityNamePlural: string; // Nom au pluriel (ex: "Superviseurs")
  columns: ImportColumn[]; // Configuration des colonnes
  validationRules: ValidationRule[]; // Règles de validation
  templateData: any; // Données d'exemple pour le template
  importService: any; // Service pour l'importation
  importMethod: string; // Nom de la méthode d'importation (ex: "addSuperviseur")
}

export interface ImportColumn {
  key: string; // Clé dans l'objet
  label: string; // Label dans Excel
  required: boolean; // Obligatoire ou non
  type: 'text' | 'number' | 'email' | 'phone' | 'enum' | 'date' | 'list';
  enumValues?: string[]; // Valeurs possibles pour les enums
  parser?: (value: any) => any; // Fonction de parsing personnalisée
}

export interface ValidationRule {
  field: string;
  validator: (value: any, row: any) => string | null; // Retourne un message d'erreur ou null
}

@Component({
  selector: 'app-generic-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './generic-import-dialog.component.html',
  styleUrls: ['./generic-import-dialog.component.css']
})
export class GenericImportDialogComponent implements OnInit {
  importedData: any[] = [];
  displayedColumns: string[] = [];
  isLoading = false;
  fileName = '';
  validCount = 0;
  invalidCount = 0;
  config: ImportConfig;

  constructor(
    public dialogRef: MatDialogRef<GenericImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { config: ImportConfig },
    private snackBar: MatSnackBar
  ) {
    this.config = data.config;
  }

  ngOnInit(): void {
    // Configurer les colonnes affichées
    this.displayedColumns = [
      ...this.config.columns.filter(c => c.required).map(c => c.key).slice(0, 5),
      'status',
      'errors'
    ];
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.readFile(file);
    }
  }

  readFile(file: File): void {
    this.isLoading = true;
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        this.processData(jsonData);
        this.isLoading = false;
      } catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier:', error);
        this.snackBar.open('Erreur lors de la lecture du fichier', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    };

    reader.readAsArrayBuffer(file);
  }

  processData(jsonData: any[]): void {
    this.importedData = jsonData.map((row: any) => {
      const parsedRow: any = {};

      // Parser chaque colonne selon sa configuration
      this.config.columns.forEach(column => {
        const value = row[column.label] || row[column.key] || '';
        
        if (column.parser) {
          parsedRow[column.key] = column.parser(value);
        } else {
          parsedRow[column.key] = this.parseValue(value, column.type, column.enumValues);
        }
      });

      // Validation
      const errors = this.validateRow(parsedRow);
      parsedRow.errors = errors;
      parsedRow.valid = errors.length === 0;

      return parsedRow;
    });

    this.validCount = this.importedData.filter(r => r.valid).length;
    this.invalidCount = this.importedData.filter(r => !r.valid).length;

    this.snackBar.open(
      `${this.validCount} ${this.config.entityNamePlural.toLowerCase()} valides, ${this.invalidCount} invalides`,
      'Fermer',
      { duration: 3000 }
    );
  }

  parseValue(value: any, type: string, enumValues?: string[]): any {
    if (!value || value === '') return type === 'list' ? [] : '';

    switch (type) {
      case 'number':
        return Number(value);
      case 'list':
        return value.toString().split(',').map((v: string) => v.trim()).filter((v: string) => v);
      case 'enum':
        if (enumValues) {
          const upperValue = value.toString().toUpperCase();
          return enumValues.find(e => e.toUpperCase() === upperValue) || value;
        }
        return value;
      case 'date':
        return value;
      default:
        return value;
    }
  }

  validateRow(row: any): string[] {
    const errors: string[] = [];

    // Validation des champs obligatoires
    this.config.columns.forEach(column => {
      if (column.required && (!row[column.key] || row[column.key] === '')) {
        errors.push(`${column.label} manquant`);
      }
    });

    // Validation selon les règles personnalisées
    this.config.validationRules.forEach(rule => {
      const error = rule.validator(row[rule.field], row);
      if (error) {
        errors.push(error);
      }
    });

    return errors;
  }

  onImport(): void {
    const validRows = this.importedData.filter(r => r.valid);

    if (validRows.length === 0) {
      this.snackBar.open(`Aucun ${this.config.entityName.toLowerCase()} valide à importer`, 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    // Nettoyer les données (retirer valid et errors)
    const cleanRows = validRows.map(row => {
      const { valid, errors, ...cleanRow } = row;
      return cleanRow;
    });

    let successCount = 0;
    let errorCount = 0;

    const importPromises = cleanRows.map(item => {
      return this.config.importService[this.config.importMethod](item).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error: any) => {
          console.error(`Erreur lors de l'ajout du ${this.config.entityName.toLowerCase()}:`, error);
          errorCount++;
        });
    });

    Promise.all(importPromises).then(() => {
      this.isLoading = false;
      this.snackBar.open(
        `${successCount} ${this.config.entityNamePlural.toLowerCase()} importés avec succès, ${errorCount} erreurs`,
        'Fermer',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.dialogRef.close({ success: true, count: successCount });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  downloadTemplate(): void {
    const worksheet = XLSX.utils.json_to_sheet([this.config.templateData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Ajuster la largeur des colonnes
    const maxWidth: any = {};
    Object.keys(this.config.templateData).forEach(key => {
      const length = this.config.templateData[key] ? this.config.templateData[key].toString().length : 10;
      maxWidth[key] = Math.max(15, length + 2);
    });

    worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ wch: maxWidth[key] }));

    XLSX.writeFile(workbook, `template_${this.config.entityNamePlural.toLowerCase()}.xlsx`);

    this.snackBar.open('Template téléchargé avec succès', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  getColumnLabel(key: string): string {
    const column = this.config.columns.find(c => c.key === key);
    return column ? column.label : key;
  }
}


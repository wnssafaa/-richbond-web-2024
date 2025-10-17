import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
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

    reader.onload = async (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        
        // Essayer d'abord avec ExcelJS pour les images
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data.buffer);
          
          const worksheet = workbook.worksheets[0];
          console.log('📊 Feuille Excel chargée avec ExcelJS:', worksheet.name);
          console.log('📊 Nombre de lignes:', worksheet.rowCount);
          console.log('📊 Nombre de colonnes:', worksheet.columnCount);
          
          const jsonData = await this.extractDataWithImages(worksheet);
          console.log('📊 Données extraites avec ExcelJS:', jsonData);

          this.processData(jsonData);
        } catch (exceljsError) {
          console.warn('⚠️ ExcelJS a échoué, utilisation de xlsx en fallback:', exceljsError);
          
          // Fallback vers xlsx (méthode originale)
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
          
          console.log('📊 Feuille xlsx chargée:', firstSheetName);
          console.log('📊 Plage de données:', worksheet['!ref']);
          
          // Essayer différentes options de parsing
          let jsonData: any[] = [];
          try {
            // Essayer avec header: 1 (première ligne comme en-têtes)
            const dataWithHeader = XLSX.utils.sheet_to_json(worksheet, { 
              raw: false, 
              header: 1,
              defval: ''
            }) as any[];
            console.log('📊 Données extraites avec xlsx (header: 1):', dataWithHeader);
            
            // Si les données sont vides ou mal formatées, essayer sans header
            if (!dataWithHeader || dataWithHeader.length === 0 || (dataWithHeader.length === 1 && Array.isArray(dataWithHeader[0]) && dataWithHeader[0].length === 0)) {
              console.log('⚠️ Données vides avec header: 1, essai sans header...');
              jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                raw: false,
                defval: ''
              }) as any[];
              console.log('📊 Données extraites avec xlsx (sans header):', jsonData);
            } else {
              jsonData = dataWithHeader;
            }
          } catch (xlsxError) {
            console.error('❌ Erreur avec xlsx:', xlsxError);
            jsonData = [];
          }

        this.processData(jsonData);
        }
        
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

  /**
   * Extraire les données et images depuis une feuille Excel
   */
  async extractDataWithImages(worksheet: ExcelJS.Worksheet): Promise<any[]> {
    const data: any[] = [];
    const images = worksheet.getImages();
    
    console.log('🔍 Début de l\'extraction des données Excel...');
    console.log('📊 Nombre de lignes dans la feuille:', worksheet.rowCount);
    console.log('📊 Nombre de colonnes dans la feuille:', worksheet.columnCount);
    
    // Obtenir les en-têtes de colonnes - essayer plusieurs lignes si nécessaire
    let headerRow = 1;
    let headers: string[] = [];
    let maxCol = worksheet.columnCount;
    
    // Essayer de trouver les en-têtes dans les premières lignes
    for (let tryRow = 1; tryRow <= Math.min(5, worksheet.rowCount); tryRow++) {
      const tempHeaders: string[] = [];
      let hasValidHeaders = false;
      
      console.log(`🔍 Essai de détection des en-têtes à la ligne ${tryRow}...`);
      
      for (let col = 1; col <= maxCol; col++) {
        const cell = worksheet.getCell(tryRow, col);
        console.log(`🔍 Cellule [${tryRow}, ${col}]:`, cell.value);
        
        if (cell.value) {
          const cellValue = cell.value.toString().trim();
          tempHeaders[col - 1] = cellValue;
          
          // Vérifier si cette ligne contient des en-têtes valides
          // (rechercher des mots-clés connus des colonnes)
          const expectedHeaders = ['Photo', 'Marque', 'Famille', 'Sous marques', 'CODE EAN', 'Désignation article', 'PVC TTC'];
          if (expectedHeaders.some(expected => 
            cellValue.toLowerCase().includes(expected.toLowerCase()) ||
            expected.toLowerCase().includes(cellValue.toLowerCase()) ||
            cellValue.toLowerCase().includes('ean') ||
            cellValue.toLowerCase().includes('designation') ||
            cellValue.toLowerCase().includes('article') ||
            cellValue.toLowerCase().includes('ttc') ||
            cellValue.toLowerCase().includes('prix')
          )) {
            hasValidHeaders = true;
          }
        }
      }
      
      console.log(`📋 En-têtes temporaires détectés à la ligne ${tryRow}:`, tempHeaders);
      
      if (hasValidHeaders && tempHeaders.filter(h => h && h.trim() !== '').length > 0) {
        headers = tempHeaders;
        headerRow = tryRow;
        console.log(`✅ En-têtes valides trouvés à la ligne ${headerRow}:`, headers);
        break;
      }
    }
    
    // Si aucun en-tête valide n'est trouvé, essayer une approche différente
    if (headers.length === 0 || headers.filter(h => h && h.trim() !== '').length === 0) {
      console.log('⚠️ Aucun en-tête valide trouvé, utilisation de l\'approche de fallback...');
      
      // Fallback: utiliser les colonnes par position avec des noms par défaut
      const defaultHeaders = ['Photo', 'Marque', 'Famille', 'Sous marques', 'CODE EAN', 'Désignation article', 'PVC TTC'];
      headers = [];
      for (let col = 1; col <= Math.min(maxCol, defaultHeaders.length); col++) {
        headers[col - 1] = defaultHeaders[col - 1];
      }
      headerRow = 1;
      console.log('📋 En-têtes par défaut utilisés:', headers);
    }
    
    console.log('🖼️ Images trouvées:', images.length);
    
    // Parcourir les lignes de données (commencer après la ligne d'en-tête)
    const startDataRow = headerRow + 1;
    console.log(`📊 Début de l'extraction des données à partir de la ligne ${startDataRow}...`);
    
    for (let row = startDataRow; row <= worksheet.rowCount; row++) {
      const rowData: any = {};
      let hasData = false;
      
      // Extraire les données de chaque cellule
      for (let col = 1; col <= headers.length; col++) {
        const cell = worksheet.getCell(row, col);
        const header = headers[col - 1];
        
        if (header && cell.value !== null && cell.value !== undefined) {
          const cellValue = cell.value.toString().trim();
          if (cellValue !== '') {
            rowData[header] = cellValue;
            hasData = true;
          }
        }
      }
      
      // Chercher des images dans cette ligne
      const rowImages = images.filter(img => 
        img.range.tl.row + 1 === row // +1 car ExcelJS utilise l'indexation 0
      );
      
      if (rowImages.length > 0) {
        // Prendre la première image de la ligne
        const image = rowImages[0];
        console.log(`🖼️ Image trouvée pour la ligne ${row}:`, image);
        
        // Pour l'instant, marquer qu'une image est présente
        // L'extraction complète nécessiterait plus de travail avec ExcelJS
        rowData.extractedImage = {
          dataUrl: '', // Sera rempli plus tard
          mimeType: 'image/jpeg',
          buffer: null,
          extension: 'jpg',
          position: `row ${row}, col ${image.range.tl.col + 1}`,
          imageId: image.imageId
        };
        
        console.log(`🖼️ Image marquée pour la ligne ${row}`);
      }
      
      if (hasData) {
        data.push(rowData);
        console.log(`📝 Ligne ${row} ajoutée aux données:`, rowData);
      }
    }
    
    console.log(`✅ Données extraites: ${data.length} lignes avec ${images.length} images`);
    console.log('📊 Aperçu des données extraites:', data.slice(0, 3));
    return data;
  }
  
  /**
   * Déterminer le type MIME à partir du buffer d'image
   */
  private getMimeTypeFromBuffer(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }
    
    // JPEG
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      return 'image/jpeg';
    }
    
    // GIF
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }
    
    // WebP
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'image/webp';
    }
    
    // Par défaut, JPEG
    return 'image/jpeg';
  }
  
  /**
   * Obtenir l'extension de fichier à partir du type MIME
   */
  private getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'image/png': return 'png';
      case 'image/jpeg': return 'jpg';
      case 'image/gif': return 'gif';
      case 'image/webp': return 'webp';
      default: return 'jpg';
    }
  }

  processData(jsonData: any[]): void {
    console.log('🔄 Début du traitement des données:', jsonData.length, 'lignes');
    console.log('🔄 Type de données reçues:', typeof jsonData);
    console.log('🔄 Premier élément (si disponible):', jsonData[0]);
    console.log('🔄 Configuration des colonnes:', this.config.columns);
    
    // Traitement intelligent des données avec héritage des valeurs
    this.importedData = [];
    let lastValues: any = {}; // Stocker les dernières valeurs non vides

    // Vérifier si les données sont vides ou invalides
    if (!jsonData || jsonData.length === 0) {
      console.error('❌ Aucune donnée à traiter');
      this.snackBar.open('Aucune donnée trouvée dans le fichier Excel', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Si les données viennent de xlsx avec header: 1, elles peuvent être des tableaux
    // Convertir en objets avec les bonnes clés
    if (Array.isArray(jsonData[0]) && typeof jsonData[0] !== 'object') {
      console.log('🔄 Conversion des données tableau vers objets...');
      const headers = jsonData[0] as string[];
      console.log('🔄 En-têtes détectés dans les données:', headers);
      
      const convertedData = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          if (header && header.trim() !== '') {
            obj[header] = row[index] || '';
          }
        });
        return obj;
      });
      
      console.log('🔄 Données converties:', convertedData);
      jsonData = convertedData;
    }

    jsonData.forEach((row: any, index: number) => {
      console.log(`🔄 Traitement de la ligne ${index + 1}:`, row);
      const parsedRow: any = {};

      // Parser chaque colonne selon sa configuration
      this.config.columns.forEach(column => {
        // Essayer plusieurs clés possibles pour trouver la valeur
        let value = '';
        
        // Essayer avec le label exact
        if (row[column.label]) {
          value = row[column.label];
        }
        // Essayer avec la clé
        else if (row[column.key]) {
          value = row[column.key];
        }
        // Essayer des variations de casse
        else {
          const possibleKeys = Object.keys(row).filter(key => 
            key.toLowerCase() === column.label.toLowerCase() ||
            key.toLowerCase() === column.key.toLowerCase()
          );
          if (possibleKeys.length > 0) {
            value = row[possibleKeys[0]];
          }
        }
        
        console.log(`🔄 Colonne ${column.key}/${column.label}: valeur trouvée = "${value}"`);
        
        // Si la valeur est vide, hériter de la dernière valeur non vide
        if (!value || value.toString().trim() === '') {
          value = lastValues[column.key] || '';
          if (value) {
            console.log(`🔄 Héritage de la valeur "${value}" pour ${column.key}`);
          }
        } else {
          // Stocker cette valeur comme dernière valeur non vide
          lastValues[column.key] = value;
          console.log(`🔄 Stockage de la valeur "${value}" pour ${column.key}`);
        }
        
        if (column.parser) {
          parsedRow[column.key] = column.parser(value);
        } else {
          parsedRow[column.key] = this.parseValue(value, column.type, column.enumValues);
        }
      });

      // Ajouter l'image extraite si elle existe
      if (row.extractedImage) {
        parsedRow.extractedImage = row.extractedImage;
        console.log(`🖼️ Image ajoutée aux données de la ligne ${index + 1}`);
      }

      // Validation
      const errors = this.validateRow(parsedRow);
      parsedRow.errors = errors;
      parsedRow.valid = errors.length === 0;

      console.log(`✅ Ligne ${index + 1} traitée:`, {
        valide: parsedRow.valid,
        erreurs: errors.length,
        données: parsedRow
      });

      this.importedData.push(parsedRow);
    });

    this.validCount = this.importedData.filter(r => r.valid).length;
    this.invalidCount = this.importedData.filter(r => !r.valid).length;

    console.log(`📊 Résultat final: ${this.validCount} valides, ${this.invalidCount} invalides`);
    console.log('📊 Données finales:', this.importedData.slice(0, 3));

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
        // Gérer différents formats de nombres (avec espaces, virgules, etc.)
        let numValue = value.toString().replace(/[\s,]/g, '');
        numValue = numValue.replace(',', '.'); // Remplacer virgule par point pour les décimales
        return Number(numValue) || 0;
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
        return value.toString().trim();
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

    // Vérifier l'authentification avant l'import
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Vous devez être connecté pour importer des données', 'Fermer', {
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
      // Utiliser la méthode de mapping si elle existe, sinon utiliser les données directement
      let dataToImport = item;
      if (this.config.importService.mapImportDataToProduit) {
        dataToImport = this.config.importService.mapImportDataToProduit(item);
      }
      
      return this.config.importService[this.config.importMethod](dataToImport).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error: any) => {
          console.error(`Erreur lors de l'ajout du ${this.config.entityName.toLowerCase()}:`, error);
          
          // Gestion spécifique des erreurs
          if (error.status === 403) {
            console.error('Erreur 403: Accès refusé. Vérifiez vos permissions ou reconnectez-vous.');
          } else if (error.status === 401) {
            console.error('Erreur 401: Non autorisé. Token expiré ou invalide.');
          } else if (error.status === 400) {
            console.error('Erreur 400: Données invalides envoyées au serveur.');
          }
          
          errorCount++;
        });
    });

    Promise.all(importPromises).then(() => {
      this.isLoading = false;
      
      let message = `${successCount} ${this.config.entityNamePlural.toLowerCase()} importés avec succès`;
      let panelClass = ['success-snackbar'];
      
      if (errorCount > 0) {
        message += `, ${errorCount} erreurs`;
        if (errorCount === validRows.length) {
          message = `Erreur lors de l'import: ${errorCount} échecs. Vérifiez votre connexion et vos permissions.`;
          panelClass = ['error-snackbar'];
        } else {
          panelClass = ['warning-snackbar'];
        }
      }
      
      this.snackBar.open(message, 'Fermer', {
        duration: 5000,
        panelClass: panelClass
      });
      
      if (successCount > 0) {
      this.dialogRef.close({ success: true, count: successCount });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  downloadTemplate(): void {
    // Gérer les templates avec une seule ligne ou plusieurs lignes
    const templateData = Array.isArray(this.config.templateData) 
      ? this.config.templateData 
      : [this.config.templateData];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Ajuster la largeur des colonnes
    const maxWidth: any = {};
    if (templateData.length > 0) {
      Object.keys(templateData[0]).forEach(key => {
        let maxLength = 15;
        templateData.forEach(row => {
          const length = row[key] ? row[key].toString().length : 10;
          maxLength = Math.max(maxLength, length + 2);
        });
        maxWidth[key] = maxLength;
      });
    }

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


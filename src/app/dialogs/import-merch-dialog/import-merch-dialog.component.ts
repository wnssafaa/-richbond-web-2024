import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { Region } from '../../enum/Region';
import { Role } from '../../enum/Role';

export interface ImportedMerchandiseur {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  region: Region;
  ville: string;
  marqueCouverte: string;
  localisation: string;
  status: string;
  type: string;
  password: string;
  role: Role;
  superviseurId?: number;
  magasinIds?: number[];
  marques?: string[];
  enseignes?: string[];
  valid?: boolean;
  errors?: string[];
}

@Component({
  selector: 'app-import-merch-dialog',
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
  templateUrl: './import-merch-dialog.component.html',
  styleUrls: ['./import-merch-dialog.component.css']
})
export class ImportMerchDialogComponent {
  importedData: ImportedMerchandiseur[] = [];
  displayedColumns: string[] = ['prenom', 'nom', 'email', 'telephone', 'region', 'ville', 'status', 'errors'];
  isLoading = false;
  fileName = '';
  validCount = 0;
  invalidCount = 0;

  constructor(
    public dialogRef: MatDialogRef<ImportMerchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private merchService: MerchendiseurService,
    private snackBar: MatSnackBar
  ) {}

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
      const merch: ImportedMerchandiseur = {
        prenom: row['Prénom'] || row['prenom'] || '',
        nom: row['Nom'] || row['nom'] || '',
        email: row['Email'] || row['email'] || '',
        telephone: row['Téléphone'] || row['telephone'] || '',
        region: this.parseRegion(row['Région'] || row['region'] || ''),
        ville: row['Ville'] || row['ville'] || '',
        marqueCouverte: row['Marque Couverte'] || row['marqueCouverte'] || '',
        localisation: row['Localisation'] || row['localisation'] || '',
        status: row['Statut'] || row['status'] || 'ACTIF',
        type: row['Type'] || row['type'] || 'Mono',
        password: row['Mot de passe'] || row['password'] || 'Password123',
        role: this.parseRole(row['Rôle'] || row['role'] || 'MERCHANDISEUR_MONO'),
        superviseurId: row['Superviseur ID'] || row['superviseurId'] || undefined,
        magasinIds: this.parseArray(row['Magasin IDs'] || row['magasinIds'] || ''),
        marques: this.parseArray(row['Marques'] || row['marques'] || ''),
        enseignes: this.parseArray(row['Enseignes'] || row['enseignes'] || ''),
        valid: true,
        errors: []
      };

      // Validation
      const errors = this.validateMerchandiseur(merch);
      merch.errors = errors;
      merch.valid = errors.length === 0;

      return merch;
    });

    this.validCount = this.importedData.filter(m => m.valid).length;
    this.invalidCount = this.importedData.filter(m => !m.valid).length;

    this.snackBar.open(
      `${this.validCount} merchandiseurs valides, ${this.invalidCount} invalides`,
      'Fermer',
      { duration: 3000 }
    );
  }

  parseRegion(value: string): Region {
    const regionMap: { [key: string]: Region } = {
      'TANGER_TETOUAN_AL_HOCEIMA': Region.TANGER_TETOUAN_AL_HOCEIMA,
      'ORIENTAL': Region.ORIENTAL,
      'FES_MEKNES': Region.FES_MEKNES,
      'RABAT_SALE_KENITRA': Region.RABAT_SALE_KENITRA,
      'BENI_MELLAL_KHENIFRA': Region.BENI_MELLAL_KHENIFRA,
      'CASABLANCA_SETTAT': Region.CASABLANCA_SETTAT,
      'MARRAKECH_SAFI': Region.MARRAKECH_SAFI,
      'DRAA_TAFILALET': Region.DRAA_TAFILALET,
      'SOUSS_MASSA': Region.SOUSS_MASSA,
      'GUELMIM_OUED_NOUN': Region.GUELMIM_OUED_NOUN,
      'LAAYOUNE_SAKIA_EL_HAMRA': Region.LAAYOUNE_SAKIA_EL_HAMRA,
      'DAKHLA_OUED_ED_DAHAB': Region.DAKHLA_OUED_ED_DAHAB
    };

    return regionMap[value.toUpperCase()] || Region.CASABLANCA_SETTAT;
  }

  parseRole(value: string): Role {
    const roleMap: { [key: string]: Role } = {
      'MERCHANDISEUR_MONO': Role.MERCHANDISEUR_MONO,
      'MERCHANDISEUR_MULTI': Role.MERCHANDISEUR_MULTI
    };

    return roleMap[value.toUpperCase()] || Role.MERCHANDISEUR_MONO;
  }

  parseArray(value: string): any[] {
    if (!value) return [];
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }
    return [];
  }

  validateMerchandiseur(merch: ImportedMerchandiseur): string[] {
    const errors: string[] = [];

    if (!merch.prenom) errors.push('Prénom manquant');
    if (!merch.nom) errors.push('Nom manquant');
    if (!merch.email) errors.push('Email manquant');
    if (!merch.telephone) errors.push('Téléphone manquant');
    if (!merch.region) errors.push('Région invalide');
    if (!merch.ville) errors.push('Ville manquante');

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (merch.email && !emailRegex.test(merch.email)) {
      errors.push('Email invalide');
    }

    // Validation du téléphone
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (merch.telephone && !phoneRegex.test(merch.telephone)) {
      errors.push('Téléphone invalide');
    }

    return errors;
  }

  onImport(): void {
    const validMerchandiseurs = this.importedData.filter(m => m.valid);

    if (validMerchandiseurs.length === 0) {
      this.snackBar.open('Aucun merchandiseur valide à importer', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    // Convertir les données importées en format Merchandiseur
    const merchandiseurs: Merchendiseur[] = validMerchandiseurs.map(m => ({
      prenom: m.prenom,
      nom: m.nom,
      email: m.email,
      telephone: m.telephone,
      region: m.region,
      ville: m.ville,
      marqueCouverte: m.marqueCouverte,
      localisation: m.localisation,
      status: m.status,
      type: m.type,
      password: m.password,
      role: m.role,
      superviseurId: m.superviseurId,
      magasinIds: m.magasinIds || [],
      marques: m.marques || [],
      enseignes: m.enseignes || []
    }));

    // Importer les merchandiseurs un par un
    let successCount = 0;
    let errorCount = 0;

    const importPromises = merchandiseurs.map(merch => {
      return this.merchService.addMerchendiseur(merch).toPromise()
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          console.error('Erreur lors de l\'ajout du merchandiseur:', error);
          errorCount++;
        });
    });

    Promise.all(importPromises).then(() => {
      this.isLoading = false;
      this.snackBar.open(
        `${successCount} merchandiseurs importés avec succès, ${errorCount} erreurs`,
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
    const template = [
      {
        'Prénom': 'Ahmed',
        'Nom': 'Alami',
        'Email': 'ahmed.alami@example.com',
        'Téléphone': '0612345678',
        'Région': 'CASABLANCA_SETTAT',
        'Ville': 'Casablanca',
        'Marque Couverte': 'Richbond',
        'Localisation': 'Casablanca Centre',
        'Statut': 'ACTIF',
        'Type': 'Mono',
        'Mot de passe': 'Password123',
        'Rôle': 'MERCHANDISEUR_MONO',
        'Superviseur ID': '',
        'Magasin IDs': '1,2,3',
        'Marques': 'Richbond,Simmons',
        'Enseignes': 'Carrefour,Marjane'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Ajuster la largeur des colonnes
    const maxWidth = template.reduce((w: any, r: any) => {
      return Object.keys(r).reduce((acc, key) => {
        const length = r[key] ? r[key].toString().length : 10;
        acc[key] = Math.max(acc[key] || 10, length);
        return acc;
      }, w);
    }, {});

    worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ wch: maxWidth[key] + 2 }));

    XLSX.writeFile(workbook, 'template_merchandiseurs.xlsx');

    this.snackBar.open('Template téléchargé avec succès', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}


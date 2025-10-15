import { Injectable } from '@angular/core';
import { ImportConfig, ImportColumn, ValidationRule } from '../dialogs/generic-import-dialog/generic-import-dialog.component';
import { MerchendiseurService } from './merchendiseur.service';
import { SuperveseurService } from './superveseur.service';
import { MagasinService } from './magasin.service';
import { ProduitService } from './produit.service';
import { Region } from '../enum/Region';
import { Role } from '../enum/Role';

@Injectable({
  providedIn: 'root'
})
export class ImportConfigService {

  constructor(
    private merchService: MerchendiseurService,
    private superviseurService: SuperveseurService,
    private magasinService: MagasinService,
    private produitService: ProduitService
  ) {}

  // ✅ Fonction utilitaire pour transformer les régions
  private getRegionParser() {
    return (value: string) => {
      // Transformer les anciennes valeurs en nouvelles
      const regionMap: { [key: string]: string } = {
        'CASABLANCA_SETTAT': 'Casablanca-Settat',
        'RABAT_SALE_KENITRA': 'Rabat-Salé-Kénitra',
        'TANGER_TETOUAN_AL_HOCEIMA': 'Tanger-Tétouan-Al Hoceïma',
        'ORIENTAL': 'L\'Oriental',
        'FES_MEKNES': 'Fès-Meknès',
        'BENI_MELLAL_KHENIFRA': 'Béni Mellal-Khénifra',
        'MARRAKECH_SAFI': 'Marrakech-Safi',
        'DRAA_TAFILALET': 'Drâa-Tafilalet',
        'SOUSS_MASSA': 'Souss-Massa',
        'GUELMIM_OUED_NOUN': 'Guelmim-Oued Noun',
        'LAAYOUNE_SAKIA_EL_HAMRA': 'Laâyoune-Sakia El Hamra',
        'DAKHLA_OUED_ED_DAHAB': 'Dakhla-Oued Ed Dahab'
      };
      return regionMap[value] || value;
    };
  }

  // ✅ Configuration pour Superviseurs
  getSuperviseurImportConfig(): ImportConfig {
    const columns: ImportColumn[] = [
      { key: 'prenom', label: 'Prénom', required: true, type: 'text' },
      { key: 'nom', label: 'Nom', required: true, type: 'text' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'telephone', label: 'Téléphone', required: true, type: 'phone' },
      { 
        key: 'region', 
        label: 'Région', 
        required: true, 
        type: 'text',
        parser: this.getRegionParser()
      },
      { key: 'ville', label: 'Ville', required: true, type: 'text' },
      { key: 'password', label: 'Mot de passe', required: false, type: 'text' },
      { key: 'status', label: 'Statut', required: false, type: 'text' },
      { key: 'dateDebutIntegration', label: 'Date Intégration', required: false, type: 'date' },
      { key: 'magasinIds', label: 'Magasin IDs', required: false, type: 'list' }
    ];

    const validationRules: ValidationRule[] = [
      {
        field: 'email',
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return value && !emailRegex.test(value) ? 'Email invalide' : null;
        }
      },
      {
        field: 'telephone',
        validator: (value: string) => {
          const phoneRegex = /^0[5-7][0-9]{8}$/;
          return value && !phoneRegex.test(value) ? 'Téléphone invalide' : null;
        }
      }
    ];

    const templateData = {
      'Prénom': 'Mohammed',
      'Nom': 'Alaoui',
      'Email': 'mohammed.alaoui@richbond.ma',
      'Téléphone': '0612345678',
      'Région': 'Casablanca-Settat',
      'Ville': 'Casablanca',
      'Mot de passe': 'Password123',
      'Statut': 'ACTIF',
      'Date Intégration': '2024-01-15',
      'Magasin IDs': '1,2,3'
    };

    return {
      entityName: 'Superviseur',
      entityNamePlural: 'Superviseurs',
      columns,
      validationRules,
      templateData,
      importService: this.superviseurService,
      importMethod: 'create'
    };
  }

  // ✅ Configuration pour Magasins
getMagasinImportConfig(): ImportConfig {
  const columns: ImportColumn[] = [
    { key: 'nom', label: 'Nom', required: true, type: 'text' },
    { key: 'ville', label: 'Ville', required: true, type: 'text' },
    { 
      key: 'region', 
      label: 'Région', 
      required: true, 
      type: 'text',
      parser: this.getRegionParser()
    },
    { key: 'adresse', label: 'Adresse', required: true, type: 'text' },
    { key: 'enseigne', label: 'Enseigne', required: true, type: 'text' },
    { key: 'type', label: 'Type', required: false, type: 'text' },
    { key: 'telephone', label: 'Téléphone', required: false, type: 'phone' },
    { key: 'email', label: 'Email', required: false, type: 'email' },
    { key: 'surface', label: 'Surface', required: false, type: 'number' },
    { key: 'horaire', label: 'Horaires', required: false, type: 'text' },
    { key: 'latitude', label: 'Latitude', required: false, type: 'number' },
    { key: 'longitude', label: 'Longitude', required: false, type: 'number' },
    { key: 'localisation', label: 'Localisation (adresse complète)', required: false, type: 'text' }
  ];

  const validationRules: ValidationRule[] = [
    {
      field: 'email',
      validator: (value: string) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Email invalide' : null;
      }
    },
    {
      field: 'telephone',
      validator: (value: string) => {
        if (!value) return null;
        const phoneRegex = /^0[5-7][0-9]{8}$/;
        return !phoneRegex.test(value) ? 'Téléphone invalide' : null;
      }
    },
    {
      field: 'latitude',
      validator: (value: number) => {
        if (!value) return null;
        return (value < -90 || value > 90) ? 'Latitude doit être entre -90 et 90' : null;
      }
    },
    {
      field: 'longitude',
      validator: (value: number) => {
        if (!value) return null;
        return (value < -180 || value > 180) ? 'Longitude doit être entre -180 et 180' : null;
      }
    }
  ];

  const templateData = {
    'Nom': 'Marjane Californie',
    'Ville': 'Casablanca',
    'Région': 'Casablanca-Settat',
    'Adresse': 'Boulevard de la Corniche',
    'Enseigne': 'Marjane',
    'Type': 'Hypermarché',
    'Téléphone': '0522123456',
    'Email': 'marjane.californie@marjane.ma',
    'Surface': '5000',
    'Horaires': '9h-22h',
    'Latitude': '33.5589',
    'Longitude': '-7.6635',
    'Localisation (adresse complète)': 'Boulevard de la Corniche, Casablanca, Maroc'
  };

  return {
    entityName: 'Magasin',
    entityNamePlural: 'Magasins',
    columns,
    validationRules,
    templateData,
    importService: this.magasinService,
    importMethod: 'addMagasin'
  };
}


  // ✅ Configuration pour Produits
  getProduitImportConfig(): ImportConfig {
    const columns: ImportColumn[] = [
      { key: 'nom', label: 'Nom', required: true, type: 'text' },
      { key: 'description', label: 'Description', required: true, type: 'text' },
      { key: 'prix', label: 'Prix', required: true, type: 'number' },
      { key: 'marque', label: 'Marque', required: true, type: 'text' },
      { key: 'categorie', label: 'Catégorie', required: true, type: 'text' },
      { key: 'reference', label: 'Référence', required: false, type: 'text' },
      { key: 'stock', label: 'Stock', required: false, type: 'number' },
      { key: 'prixPromo', label: 'Prix Promo', required: false, type: 'number' },
      { key: 'enPromotion', label: 'En Promotion', required: false, type: 'text' },
      { key: 'dateDebut', label: 'Date Début Promo', required: false, type: 'date' },
      { key: 'dateFin', label: 'Date Fin Promo', required: false, type: 'date' }
    ];

    const validationRules: ValidationRule[] = [
      {
        field: 'prix',
        validator: (value: number) => {
          return value && value <= 0 ? 'Prix doit être supérieur à 0' : null;
        }
      }
    ];

    const templateData = {
      'Nom': 'Matelas Richbond Excellence',
      'Description': 'Matelas haute qualité 160x200',
      'Prix': '4500',
      'Marque': 'Richbond',
      'Catégorie': 'Matelas',
      'Référence': 'RB-EXC-160',
      'Stock': '25',
      'Prix Promo': '3900',
      'En Promotion': 'true',
      'Date Début Promo': '2024-01-01',
      'Date Fin Promo': '2024-03-31'
    };

    return {
      entityName: 'Produit',
      entityNamePlural: 'Produits',
      columns,
      validationRules,
      templateData,
      importService: this.produitService,
      importMethod: 'createProduit'
    };
  }

  // ✅ Configuration pour Users (générique)
  getUserImportConfig(): ImportConfig {
    const columns: ImportColumn[] = [
      { key: 'username', label: 'Username', required: true, type: 'text' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'password', label: 'Mot de passe', required: true, type: 'text' },
      { key: 'nom', label: 'Nom', required: false, type: 'text' },
      { key: 'prenom', label: 'Prénom', required: false, type: 'text' },
      { key: 'telephone', label: 'Téléphone', required: false, type: 'phone' },
      { key: 'role', label: 'Rôle', required: true, type: 'enum', enumValues: Object.values(Role) },
      { key: 'status', label: 'Statut', required: false, type: 'text' }
    ];

    const validationRules: ValidationRule[] = [
      {
        field: 'email',
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return value && !emailRegex.test(value) ? 'Email invalide' : null;
        }
      }
    ];

    const templateData = {
      'Username': 'admin.user',
      'Email': 'admin@richbond.ma',
      'Mot de passe': 'Password123',
      'Nom': 'Admin',
      'Prénom': 'User',
      'Téléphone': '0612345678',
      'Rôle': 'ADMIN',
      'Statut': 'ACTIF'
    };

    return {
      entityName: 'Utilisateur',
      entityNamePlural: 'Utilisateurs',
      columns,
      validationRules,
      templateData,
      importService: null, // À définir selon votre service users
      importMethod: 'addUser'
    };
  }
}


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


  // ✅ Configuration pour Produits (Structure Excel selon l'image)
  getProduitImportConfig(): ImportConfig {
    const columns: ImportColumn[] = [
      { key: 'photo', label: 'Photo', required: false, type: 'text' },
      { key: 'marque', label: 'Marque', required: false, type: 'text' }, // Pas obligatoire car hérité
      { key: 'famille', label: 'Famille', required: false, type: 'text' }, // Pas obligatoire car hérité
      { key: 'sousMarques', label: 'Sous marques', required: false, type: 'text' }, // Pas obligatoire car hérité
      { key: 'codeEAN', label: 'CODE EAN', required: true, type: 'text' },
      { key: 'designationArticle', label: 'Désignation article', required: true, type: 'text' },
      { key: 'prix', label: 'PVC TTC', required: true, type: 'number' }
    ];

    const validationRules: ValidationRule[] = [
      {
        field: 'prix',
        validator: (value: number, row: any) => {
          // Vérifier si le prix est valide
          if (!value || value <= 0) {
            return 'Prix doit être supérieur à 0';
          }
          return null;
        }
      },
      {
        field: 'codeEAN',
        validator: (value: string, row: any) => {
          if (!value || value.trim() === '') {
            return 'Code EAN requis';
          }
          // Validation du format EAN supprimée selon la demande utilisateur
          return null;
        }
      },
      {
        field: 'famille',
        validator: (value: string, row: any) => {
          // Vérifier après héritage - si toujours vide, c'est une erreur
          if (!value || value.trim() === '') {
            return 'Famille requise (vérifiez l\'héritage des valeurs)';
          }
          return null;
        }
      },
      {
        field: 'sousMarques',
        validator: (value: string, row: any) => {
          // Vérifier après héritage - si toujours vide, c'est une erreur
          if (!value || value.trim() === '') {
            return 'Sous marque requise (vérifiez l\'héritage des valeurs)';
          }
          
          // Accepter différentes variations de casse pour les sous-marques
          // Inclure toutes les sous-marques possibles
          const validSousMarques = [
            // Sous-marques principales
            'R VITAL', 'R ULTIMA', 'R HELLO', 'R PROTECT', 'R DORSAL', 'R CONFORETECH', 'R MEDICAL',
            'R Ultima', 'R Hello', 'R Protect', 'R Dorsal', 'R Confortech', 'R Medical',
            'R ULTIMA', 'R HELLO', 'R PROTECT', 'R DORSAL', 'R CONFORETECH', 'R MEDICAL',
            
            // CONFORT DORSAL et variantes
            'CONFORT DORSAL', 'Confort Dorsal', 'Confort Dorsal Premium', 'confort dorsal',
            
            // COTONELLE et variantes
            'COTONELLE', 'COTONELLE ECLATE', 'COTONELLE IMPRIMEE', 'COTONELLE RAYEE',
            'COTONELLE BEIGE CLAIR', 'COTONELLE BLANC', 'COTONELLE GRIS COOL', 'COTONELLE NAVY BLEU',
            'COTONELLE NOIR', 'COTONELLE ROSE DE BOIS', 'COTONELLE VERT CANARD', 'COTONELLE VIOLET',
            'COTONELLE ECLATE BEIGE CLAIR', 'COTONELLE ECLATE BLANC', 'COTONELLE ECLATE GRIS COOL',
            'COTONELLE ECLATE NAVY BLEU', 'COTONELLE ECLATE NOIR', 'COTONELLE ECLATE ROSE DE BOIS',
            'COTONELLE ECLATE VERT CANARD', 'COTONELLE ECLATE VIOLET',
            'COTONELLE IMPRIMEE ETHNIQUE CANARD', 'COTONELLE IMPRIMEE ETHNIQUE GRIS',
            'COTONELLE IMPRIMEE ETHNIQUE ROSE', 'COTONELLE RAYEE SATINEE BLANCHE',
            'COTONELLE RAYEE SATINEE NOIR', 'COTONELLE RAYEE SATINEE TAUPE',
            
            // COTON CARDE et variantes
            'COTON CARDE', 'COTON CARDE BLANC', 'COTON CARDE BLEU BEBE', 'COTON CARDE GREIGE',
            'COTON CARDE LAVANDE', 'COTON CARDE NATURE', 'COTON CARDE VERT EAU',
            'COTON CARDE ECLATE BLANC', 'COTON CARDE ECLATE BLEU BEBE', 'COTON CARDE ECLATE GREIGE',
            'COTON CARDE ECLATE LAVANDE', 'COTON CARDE ECLATE NATURE', 'COTON CARDE ECLATE VERT EAU',
            
            // DRAP HOUSSE et variantes
            'DRAP HOUSSE', 'DRAP HOUSSE COTON CARDE BLANC', 'DRAP HOUSSE COTON CARDE BLEU BEBE',
            'DRAP HOUSSE COTON CARDE GREIGE', 'DRAP HOUSSE COTON CARDE LAVANDE',
            'DRAP HOUSSE COTON CARDE NATURE', 'DRAP HOUSSE COTON CARDE VERT EAU',
            'DRAP HOUSSE COTONELLE BEIGE CLAIR', 'DRAP HOUSSE COTONELLE BLANC',
            'DRAP HOUSSE COTONELLE GRIS COOL', 'DRAP HOUSSE COTONELLE NAVY BLEU',
            'DRAP HOUSSE COTONELLE NOIR', 'DRAP HOUSSE COTONELLE ROSE DE BOIS',
            'DRAP HOUSSE COTONELLE VERT CANARD', 'DRAP HOUSSE COTONELLE VIOLET',
            
            // DRAP PLAT et variantes
            'DRAP PLAT', 'DRAP PLAT COTON CARDE BLANC', 'DRAP PLAT COTON CARDE BLEU BEBE',
            'DRAP PLAT COTON CARDE GREIGE', 'DRAP PLAT COTON CARDE LAVANDE',
            'DRAP PLAT COTON CARDE NATURE', 'DRAP PLAT COTON CARDE VERT EAU',
            'DRAP PLAT COTONELLE BEIGE CLAIR', 'DRAP PLAT COTONELLE BLANC',
            'DRAP PLAT COTONELLE GRIS COOL', 'DRAP PLAT COTONELLE NAVY BLEU',
            'DRAP PLAT COTONELLE NOIR', 'DRAP PLAT COTONELLE ROSE DE BOIS',
            'DRAP PLAT COTONELLE VERT CANARD', 'DRAP PLAT COTONELLE VIOLET',
            
            // R BICOLORE et variantes
            'R BICOLORE', 'R BICOLORE MOUTARDE/GRIS CARBON', 'R BICOLORE NAVY BLUE/GRIS COOL',
            'R BICOLORE ROSE DE BOIS/GRIS COOL', 'R BICOLORE VERT CANARD/VERT EAU',
            'R BICOLORE VERT EAU/GRIS CARBON', 'R BICOLORE VERT EAU/NUDE ROSE',
            'R BICOLORE VIOLET/NUDE ROSE',
            
            // R BLANCHE et variantes
            'R BLANCHE', 'R BLANCHE 4 SAISON', 'R BLANCHE CHAUDE', 'R BLANCHE TEMPEREE',
            
            // R MONOCHROME et variantes
            'R MONOCHROME', 'R MONOCHROME BEIGE FONCE', 'R MONOCHROME GRIS CLAIR',
            'R MONOCHROME ROSE DE BOIS', 'R MONOCHROME TAUPE', 'R MONOCHROME TERACOTTA',
            'R MONOCHROME VERT CANARD', 'R MONOCHROME VERT EAU', 'R MONOCHROME VIOLET',
            
            // R PROTECT et variantes
            'R PROTECT ENFANT', 'R PROTECT FERME', 'R PROTECT MI-FERME', 'R PROTECT MOELLEUX',
            
            // R RAYEE et variantes
            'R RAYEE', 'R RAYEE SATINEE BLANCHE', 'R RAYEE SATINEE BLEU MARINE',
            'R RAYEE SATINEE CREME', 'R RAYEE SATINEE GRIS', 'R RAYEE SATINEE TAUPE',
            
            // ROSA et variantes
            'ROSA', 'ROSA IMPRIMEE FLORAL', 'ROSA IMPRIMEE GEOMETRIQUE', 'ROSA IMPRIMEE NATURE',
            'ROSA UNIE BEIGE CLAIRE', 'ROSA UNIE GRENAT', 'ROSA UNIE ROSE',
            
            // Autres marques
            'BEAUTYDREAM', 'BeautyDream', 'COCOON COMFORT', 'Cocoon Comfort',
            'DUO TOI ET MOI', 'DUOLUX', 'FIRST PILLOW COMFORT', 'First Pillow Comfort',
            'HEAVEN COMFORT', 'Heaven Comfort', 'IMPERIAL', 'Imperial',
            'SOFTYREST THERAPY', 'Softyrest Therapy', 'TOP HOME',
            
            // Variantes de couleurs et tailles
            'HELLO', 'PROTECT', 'VITAL', 'ULTIMA', 'DORSAL', 'BLANC', 'BLEU BEBE', 'GREIGE',
            'LAVANDE', 'NATURE', 'VERT EAU', 'BEIGE CLAIR', 'GRIS COOL', 'NAVY BLEU', 'NOIR',
            'ROSE DE BOIS', 'VERT CANARD', 'VIOLET', 'MOUTARDE', 'GRIS CARBON', 'NUDE ROSE',
            'BLEU MARINE', 'CREME', 'GRIS', 'TAUPE', 'BEIGE FONCE', 'GRIS CLAIR', 'TERACOTTA',
            'SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'SUPER KING'
          ];
          
          // Diviser par virgules et vérifier chaque sous-marque
          const sousMarquesArray = value.split(',').map(sm => sm.trim().toUpperCase());
          const validSousMarquesUpper = validSousMarques.map(sm => sm.toUpperCase());
          
          // Vérifier si toutes les sous-marques sont valides
          const invalidSousMarques = sousMarquesArray.filter(sm => 
            sm && !validSousMarquesUpper.some(valid => 
              valid.includes(sm) || sm.includes(valid)
            )
          );
          
          if (invalidSousMarques.length > 0) {
            return `Sous marque invalide: ${invalidSousMarques.join(', ')}. Plus de 100 sous-marques acceptées (R VITAL, R ULTIMA, R HELLO, R PROTECT, R DORSAL, COTONELLE, COTON CARDE, DRAP HOUSSE, etc.)`;
          }
          
          return null;
        }
      }
    ];

    // Template avec structure Excel réelle (valeurs héritées) - basé sur l'image fournie
    const templateData = [
      // Groupe R VITAL
      {
        'Photo': 'image_matelas_r_vital.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'R VITAL',
        'CODE EAN': '6111250526067',
        'Désignation article': 'R VITAL 190X090',
        'PVC TTC': '1 659,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526074',
        'Désignation article': 'R VITAL 190X140',
        'PVC TTC': '2 359,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526081',
        'Désignation article': 'R VITAL 190X160',
        'PVC TTC': '2 899,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526098',
        'Désignation article': 'R VITAL 200x160',
        'PVC TTC': '3 799,00'
      },
      // Groupe R ULTIMA
      {
        'Photo': 'image_matelas_r_ultima.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'R Ultima',
        'CODE EAN': '2000014520899',
        'Désignation article': 'R ULTIMA 190X090',
        'PVC TTC': '1 659,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '2000014520905',
        'Désignation article': 'R ULTIMA 190X140',
        'PVC TTC': '2 199,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '2000014520912',
        'Désignation article': 'R ULTIMA 200x160',
        'PVC TTC': '3 199,00'
      },
      // Groupe R HELLO
      {
        'Photo': 'image_matelas_r_hello.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'R Hello',
        'CODE EAN': '6111270385583',
        'Désignation article': 'R HELLO 190x090',
        'PVC TTC': '1 999,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111270385590',
        'Désignation article': 'R HELLO 190x140',
        'PVC TTC': '2 699,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111270385606',
        'Désignation article': 'R HELLO 190x160',
        'PVC TTC': '3 299,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111270385613',
        'Désignation article': 'R HELLO 200x160',
        'PVC TTC': '3 799,00'
      },
      // Groupe R PROTECT
      {
        'Photo': 'image_matelas_r_protect.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'R Protect',
        'CODE EAN': '6111250526029',
        'Désignation article': 'R PROTECT 190X090',
        'PVC TTC': '2 599,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526036',
        'Désignation article': 'R PROTECT 190X160',
        'PVC TTC': '3 599,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526043',
        'Désignation article': 'R PROTECT 200x160',
        'PVC TTC': '3 999,00'
      },
      // Groupe CONFORT DORSAL
      {
        'Photo': 'image_confort_dorsal.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'CONFORT DORSAL',
        'CODE EAN': '40038810',
        'Désignation article': 'CONFORT DORSAL 190X140 BLANC',
        'PVC TTC': '3 299,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '40038964',
        'Désignation article': 'CONFORT DORSAL 190X160 BLANC',
        'PVC TTC': '3 899,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '40039015',
        'Désignation article': 'CONFORT DORSAL 200X160 BLANC',
        'PVC TTC': '4 199,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '40039060',
        'Désignation article': 'CONFORT DORSAL 200X180 BLANC',
        'PVC TTC': '5 299,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '2000000970189',
        'Désignation article': 'CONFORT DORSAL PREMIUM 190X140',
        'PVC TTC': '4 099,00'
      },
      // Groupe R DORSAL
      {
        'Photo': 'image_r_dorsal.jpg',
        'Marque': 'RICHBOND',
        'Famille': 'MATELAS',
        'Sous marques': 'R DORSAL',
        'CODE EAN': '6111250526005',
        'Désignation article': 'R DORSAL 190X140',
        'PVC TTC': '4 299,90'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526289',
        'Désignation article': 'R DORSAL 190X160',
        'PVC TTC': '4 819,00'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526012',
        'Désignation article': 'R DORSAL 200X160',
        'PVC TTC': '5 499,90'
      },
      {
        'Photo': '',
        'Marque': '',
        'Famille': '',
        'Sous marques': '',
        'CODE EAN': '6111250526296',
        'Désignation article': 'R DORSAL 200X180',
        'PVC TTC': '6 899,90'
      }
    ];

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


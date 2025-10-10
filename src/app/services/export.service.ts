import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { User } from './user.service';
import { Merchendiseur } from './merchendiseur.service';
import { Magasin } from './magasin.service';
import { VisitDTO } from './visit.service';
import { Produit } from './produit.service';
import { Superviseur } from './superveseur.service';
import { Planification } from './planification.service';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Test simple d'exportation pour vérifier le fonctionnement
   */
  testExport(): void {
    const testData = [
      { nom: 'Test', prenom: 'User', email: 'test@example.com', date: new Date().toISOString() },
      { nom: 'Demo', prenom: 'User', email: 'demo@example.com', date: new Date().toISOString() }
    ];
    
    console.log('Test d\'exportation avec des données simples...');
    this.exportToExcel(testData, {
      filename: 'test_export',
      sheetName: 'Test'
    });
  }

  /**
   * Exporte en CSV (format universellement compatible)
   */
  exportToCSV(data: any[], filename: string = 'export'): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    try {
      // Préparer les données
      const exportData = this.prepareDataForExport(data, true, 'DD/MM/YYYY');
      
      // Créer le contenu CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','), // En-têtes
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Échapper les virgules et guillemets dans les valeurs
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          }).join(',')
        )
      ].join('\n');

      // Créer le blob CSV
      const csvBlob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      // Télécharger le fichier CSV
      this.downloadFile(csvBlob, `${filename}_${this.getCurrentDateString()}.csv`);
      
      console.log('Fichier CSV généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du fichier CSV:', error);
    }
  }


  /**
   * Méthode de téléchargement robuste
   */
  private downloadFile(data: Blob, filename: string): void {
    try {
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Ajouter le lien au DOM, cliquer et le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      // Fallback: ouvrir dans un nouvel onglet
      const url = window.URL.createObjectURL(data);
      window.open(url, '_blank');
    }
  }

  /**
   * Exporte des données vers Excel
   * @param data - Les données à exporter
   * @param options - Options d'exportation
   */
  exportToExcel(data: any[], options: ExportOptions = {}): void {
    const {
      filename = 'export',
      sheetName = 'Données',
      includeHeaders = true,
      dateFormat = 'DD/MM/YYYY'
    } = options;

    try {
      // Vérifier que les données ne sont pas vides
      if (!data || data.length === 0) {
        console.warn('Aucune donnée à exporter');
        return;
      }

      // Préparer les données
      const exportData = this.prepareDataForExport(data, includeHeaders, dateFormat);
      console.log('Données préparées pour export:', exportData);

      // Créer le workbook
      const workbook = XLSX.utils.book_new();
      
      // Créer la feuille de calcul avec les données nettoyées
      const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: includeHeaders ? Object.keys(exportData[0] || {}) : undefined,
        skipHeader: !includeHeaders
      });

      // Définir la largeur des colonnes
      const colWidths = this.calculateColumnWidths(exportData);
      worksheet['!cols'] = colWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Générer le fichier Excel avec des options optimisées
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        compression: false, // Désactiver la compression pour une meilleure compatibilité
        cellStyles: false,  // Désactiver les styles complexes
        cellDates: true     // Activer le formatage des dates
      });
      
      const dataBlob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Vérifier que le blob est valide
      if (dataBlob.size === 0) {
        throw new Error('Le fichier généré est vide');
      }

      console.log('Fichier Excel généré, taille:', dataBlob.size, 'bytes');

      // Télécharger le fichier
      this.downloadFile(dataBlob, `${filename}_${this.getCurrentDateString()}.xlsx`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du fichier Excel:', error);
      throw error;
    }
  }

  /**
   * Exporte des utilisateurs vers Excel
   */
  exportUsers(users: User[], options: ExportOptions = {}): void {
    const exportData = users.map(user => ({
      'ID': user.id,
      'Nom': user.nom,
      'Prénom': user.prenom,
      'Email': user.email,
      'Téléphone': user.telephone,
      'Rôle': user.role,
      'Statut': user.status,
      'Nom d\'utilisateur': user.username || '',
      'Image': user.imagePath || ''
    }));

    this.exportToExcel(exportData, {
      filename: 'utilisateurs',
      sheetName: 'Utilisateurs',
      ...options
    });
  }

  /**
   * Exporte des merchandisers vers Excel
   */
  exportMerchandisers(merchandisers: Merchendiseur[], options: ExportOptions = {}): void {
    const exportData = merchandisers.map(merch => ({
      'ID': merch.id,
      'Nom': merch.nom,
      'Prénom': merch.prenom,
      'Email': merch.email,
      'Téléphone': merch.telephone,
      'Région': merch.region,
      'Ville': merch.ville,
      'Marques': Array.isArray(merch.marques) ? merch.marques.join(', ') : merch.marques,
      'Rôle': merch.role,
      'Statut': merch.status,
      'Date d\'intégration': merch.dateDebutIntegration ? this.formatDate(merch.dateDebutIntegration) : '',
      'Date de sortie': merch.dateSortie ? this.formatDate(merch.dateSortie) : '',
      'Superviseur': merch.superviseur ? `${merch.superviseur.nom} ${merch.superviseur.prenom}` : 'Non assigné',
      'Enseignes': Array.isArray(merch.enseignes) ? merch.enseignes.join(', ') : merch.enseignes
    }));

    this.exportToExcel(exportData, {
      filename: 'merchandisers',
      sheetName: 'Merchandisers',
      ...options
    });
  }

  /**
   * Exporte des magasins vers Excel
   */
  exportMagasins(magasins: Magasin[], options: ExportOptions = {}): void {
    const exportData = magasins.map(magasin => ({
      'ID': magasin.id,
      'Nom': magasin.nom,
      'Localisation': magasin.localisation,
      'Région': magasin.region,
      'Ville': magasin.ville,
      'Type': magasin.type,
      'Enseigne': magasin.enseigne,
      'Adresse': magasin.adresse || '',
      'Téléphone': magasin.telephone || '',
      'Email': magasin.email || '',
      'Statut': magasin.status || '',
      'Latitude': magasin.latitude || '',
      'Longitude': magasin.longitude || '',
      'Merchandiser': magasin.merchandiseur ? 
        `${magasin.merchandiseur.nom} ${magasin.merchandiseur.prenom}` : 'Non assigné',
      'Superviseur': magasin.merchandiseur?.superviseur ? 
        `${magasin.merchandiseur.superviseur.nom} ${magasin.merchandiseur.superviseur.prenom}` : 'Non assigné'
    }));

    this.exportToExcel(exportData, {
      filename: 'magasins',
      sheetName: 'Magasins',
      ...options
    });
  }

  /**
   * Exporte des visites vers Excel
   */
  exportVisits(visits: VisitDTO[], options: ExportOptions = {}): void {
    const exportData = visits.map(visit => ({
      'ID': visit.id,
      'Heure d\'arrivée': visit.heureArrivee,
      'Heure de départ': visit.heureDepart,
      'Nombre de facings': visit.nombreFacings,
      'Nombre de facings total': visit.nombreFacingsTotal,
      'Prix normal': visit.prixNormal,
      'Prix promotionnel': visit.prixPromotionnel,
      'Niveau de stock': visit.niveauStock,
      'Nouveauté concurrente': visit.nouveauteConcurrente,
      'Prix nouveauté': visit.prixNouveaute,
      'Latitude': visit.latitude,
      'Longitude': visit.longitude,
      'Photo prise': visit.photoPrise ? 'Oui' : 'Non',
      'Magasin': visit.planning?.magasin?.nom || '',
      'Merchandiser': visit.planning?.merchandiser ? 
        `${visit.planning.merchandiser.nom} ${visit.planning.merchandiser.prenom}` : '',
      'Date de visite': visit.planning?.dateVisite ? this.formatDate(visit.planning.dateVisite) : '',
      'Statut': visit.planning?.statut || '',
      'Produits visités': visit.produits?.map(p => p.nom).join(', ') || ''
    }));

    this.exportToExcel(exportData, {
      filename: 'visites',
      sheetName: 'Visites',
      ...options
    });
  }

  /**
   * Exporte des produits vers Excel
   */
  exportProduits(produits: Produit[], options: ExportOptions = {}): void {
    const exportData = produits.map(produit => ({
      'ID': produit.id,
      'Marque': produit.marque,
      'Référence': produit.reference,
      'Catégorie': produit.categorie,
      'Article': produit.article,
      'Type': produit.type,
      'Dimensions': produit.dimensions,
      'Disponible': produit.disponible ? 'Oui' : 'Non',
      'Prix': produit.prix,
      'Famille': produit.famille || '',
      'Sous-marques': produit.sousMarques || '',
      'Code EAN': produit.codeEAN || '',
      'Désignation article': produit.designationArticle || ''
    }));

    this.exportToExcel(exportData, {
      filename: 'produits',
      sheetName: 'Produits',
      ...options
    });
  }

  /**
   * Exporte des superviseurs vers Excel
   */
  exportSuperviseurs(superviseurs: Superviseur[], options: ExportOptions = {}): void {
    const exportData = superviseurs.map(sup => {
      // Récupérer les enseignes des merchandiseurs
      const enseignes = this.getMerchandiseurEnseignes(sup);
      
      // Récupérer les magasins des merchandiseurs
      const magasins = this.getMerchandiseurMagasins(sup);
      
      // Récupérer les noms des merchandiseurs
      const merchandiseurs = sup.merchendiseurs && sup.merchendiseurs.length > 0
        ? sup.merchendiseurs.map(m => `${m.nom} ${m.prenom}`).join(', ')
        : 'Aucun merchandiser';
      
      return {
      'ID': sup.id,
      'Nom': sup.nom,
      'Prénom': sup.prenom,
      'Région': sup.region,
      'Ville': sup.ville,
        'Magasins': magasins,
        'Merchandiseurs': merchandiseurs,
        'Enseignes': enseignes,
        'Téléphone': sup.telephone,
        'Email': sup.email,
      'Statut': sup.status,
      'Marques couvertes': sup.marquesCouvertes || '',
      'Date d\'intégration': sup.dateIntegration ? this.formatDate(sup.dateIntegration) : '',
      'Date de sortie': sup.dateSortie ? this.formatDate(sup.dateSortie) : '',
      'Nombre de merchandisers': sup.merchendiseurs?.length || 0
      };
    });

    this.exportToExcel(exportData, {
      filename: 'superviseurs',
      sheetName: 'Superviseurs',
      ...options
    });
  }

  /**
   * Récupère les enseignes des merchandiseurs d'un superviseur
   */
  private getMerchandiseurEnseignes(superviseur: Superviseur): string {
    if (!superviseur.merchendiseurs || superviseur.merchendiseurs.length === 0) {
      return 'Aucune enseigne';
    }

    const enseignes: string[] = [];
    superviseur.merchendiseurs.forEach((merch: any) => {
      if (merch.enseignes && merch.enseignes.length > 0) {
        enseignes.push(...merch.enseignes);
      }
    });

    // Retourner les enseignes uniques
    const uniqueEnseignes = [...new Set(enseignes)];
    return uniqueEnseignes.length > 0 ? uniqueEnseignes.join(', ') : 'Aucune enseigne';
  }

  /**
   * Récupère les magasins des merchandiseurs d'un superviseur
   */
  private getMerchandiseurMagasins(superviseur: Superviseur): string {
    if (!superviseur.merchendiseurs || superviseur.merchendiseurs.length === 0) {
      return 'Aucun magasin';
    }

    const magasins: string[] = [];
    superviseur.merchendiseurs.forEach((merch: any) => {
      if (merch.magasinNoms && merch.magasinNoms.length > 0) {
        magasins.push(...merch.magasinNoms);
      }
    });

    // Retourner les magasins uniques
    const uniqueMagasins = [...new Set(magasins)];
    return uniqueMagasins.length > 0 ? uniqueMagasins.join(', ') : 'Aucun magasin';
  }

  /**
   * Exporte des planifications vers Excel
   */
  exportPlanifications(planifications: Planification[], options: ExportOptions = {}): void {
    const exportData = planifications.map(planif => ({
      'ID': planif.id,
      'Date de visite': planif.dateVisite ? this.formatDate(planif.dateVisite) : '',
      'Statut': planif.statut,
      'Commentaire': planif.commentaire || '',
      'Durée de visite': planif.dureeVisite || '',
      'Validé': planif.valide ? 'Oui' : 'Non',
      'Date de création': planif.dateCreation ? this.formatDate(planif.dateCreation) : '',
      'Magasin': planif.magasin?.nom || '',
      'Région du magasin': planif.magasin?.region || '',
      'Type de magasin': planif.magasin?.type || '',
      'Enseigne': planif.magasin?.enseigne || '',
      'Merchandiser': planif.merchandiser?.nom || ''
    }));

    this.exportToExcel(exportData, {
      filename: 'planifications',
      sheetName: 'Planifications',
      ...options
    });
  }

  /**
   * Exporte l'historique de connexions vers Excel
   */
  exportLoginHistory(loginHistory: any[], options: ExportOptions = {}): void {
    const exportData = loginHistory.map(entry => ({
      'Utilisateur': entry.user?.username || '',
      'Nom Complet': entry.user?.nom && entry.user?.prenom ? 
        `${entry.user.prenom} ${entry.user.nom}` : 
        (entry.user?.nom || entry.user?.prenom || ''),
      'Rôle': entry.user?.role || '',
      'Statut': entry.user?.status || '',
      'Magasins': this.getStoreInfoForExport(entry.user),
      'Merchandiser': this.getMerchandiserInfoForExport(entry.user),
      'Région': entry.user?.region || 'N/A',
      'Ville': entry.user?.ville || 'N/A',
      'Date Connexion': this.formatDate(entry.loginTime, 'DD/MM/YYYY HH:mm'),
      'Date Déconnexion': entry.logoutTime ? this.formatDate(entry.logoutTime, 'DD/MM/YYYY HH:mm') : 'En cours',
      'Durée Session': this.calculateSessionDuration(entry.loginTime, entry.logoutTime),
      'Adresse IP': entry.ipAddress || '',
      'User Agent': entry.userAgent || '',
      'Type Appareil': this.getDeviceType(entry.userAgent || '')
    }));

    this.exportToExcel(exportData, {
      filename: options.filename || 'historique_connexions',
      sheetName: options.sheetName || 'Historique Connexions',
      ...options
    });
  }

  /**
   * Exporte toutes les données vers un fichier Excel multi-feuilles
   */
  exportAllData(data: {
    users?: User[];
    merchandisers?: Merchendiseur[];
    magasins?: Magasin[];
    visits?: VisitDTO[];
    produits?: Produit[];
    superviseurs?: Superviseur[];
    planifications?: Planification[];
  }, options: ExportOptions = {}): void {
    const workbook = XLSX.utils.book_new();

    // Ajouter chaque feuille si les données existent
    if (data.users && data.users.length > 0) {
      const usersData = data.users.map(user => ({
        'ID': user.id,
        'Nom': user.nom,
        'Prénom': user.prenom,
        'Email': user.email,
        'Téléphone': user.telephone,
        'Rôle': user.role,
        'Statut': user.status
      }));
      const usersSheet = XLSX.utils.json_to_sheet(usersData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Utilisateurs');
    }

    if (data.merchandisers && data.merchandisers.length > 0) {
      const merchData = data.merchandisers.map(merch => ({
        'ID': merch.id,
        'Nom': merch.nom,
        'Prénom': merch.prenom,
        'Email': merch.email,
        'Région': merch.region,
        'Ville': merch.ville,
        'Rôle': merch.role,
        'Statut': merch.status
      }));
      const merchSheet = XLSX.utils.json_to_sheet(merchData);
      XLSX.utils.book_append_sheet(workbook, merchSheet, 'Merchandisers');
    }

    if (data.magasins && data.magasins.length > 0) {
      const magasinsData = data.magasins.map(magasin => ({
        'ID': magasin.id,
        'Nom': magasin.nom,
        'Région': magasin.region,
        'Ville': magasin.ville,
        'Type': magasin.type,
        'Enseigne': magasin.enseigne,
        'Statut': magasin.status
      }));
      const magasinsSheet = XLSX.utils.json_to_sheet(magasinsData);
      XLSX.utils.book_append_sheet(workbook, magasinsSheet, 'Magasins');
    }

    if (data.visits && data.visits.length > 0) {
      const visitsData = data.visits.map(visit => ({
        'ID': visit.id,
        'Heure d\'arrivée': visit.heureArrivee,
        'Heure de départ': visit.heureDepart,
        'Magasin': visit.planning?.magasin?.nom || '',
        'Merchandiser': visit.planning?.merchandiser ? 
          `${visit.planning.merchandiser.nom} ${visit.planning.merchandiser.prenom}` : ''
      }));
      const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
      XLSX.utils.book_append_sheet(workbook, visitsSheet, 'Visites');
    }

    if (data.produits && data.produits.length > 0) {
      const produitsData = data.produits.map(produit => ({
        'ID': produit.id,
        'Marque': produit.marque,
        'Référence': produit.reference,
        'Catégorie': produit.categorie,
        'Prix': produit.prix,
        'Disponible': produit.disponible ? 'Oui' : 'Non'
      }));
      const produitsSheet = XLSX.utils.json_to_sheet(produitsData);
      XLSX.utils.book_append_sheet(workbook, produitsSheet, 'Produits');
    }

    if (data.superviseurs && data.superviseurs.length > 0) {
      const superviseursData = data.superviseurs.map(sup => ({
        'ID': sup.id,
        'Nom': sup.nom,
        'Prénom': sup.prenom,
        'Email': sup.email,
        'Région': sup.region,
        'Ville': sup.ville,
        'Statut': sup.status
      }));
      const superviseursSheet = XLSX.utils.json_to_sheet(superviseursData);
      XLSX.utils.book_append_sheet(workbook, superviseursSheet, 'Superviseurs');
    }

    if (data.planifications && data.planifications.length > 0) {
      const planificationsData = data.planifications.map(planif => ({
        'ID': planif.id,
        'Date de visite': planif.dateVisite ? this.formatDate(planif.dateVisite) : '',
        'Statut': planif.statut,
        'Magasin': planif.magasin?.nom || '',
        'Merchandiser': planif.merchandiser?.nom || ''
      }));
      const planificationsSheet = XLSX.utils.json_to_sheet(planificationsData);
      XLSX.utils.book_append_sheet(workbook, planificationsSheet, 'Planifications');
    }

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Télécharger le fichier
    const filename = options.filename || 'export_complet';
    this.downloadFile(dataBlob, `${filename}_${this.getCurrentDateString()}.xlsx`);
  }

  /**
   * Prépare les données pour l'export en formatant les dates et autres champs
   */
  private prepareDataForExport(data: any[], includeHeaders: boolean, dateFormat: string): any[] {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const processedItem: any = {};
      
      // Parcourir toutes les propriétés de l'objet
      Object.keys(item).forEach(key => {
        const value = item[key];
        
        // Nettoyer le nom de la clé (supprimer les caractères spéciaux)
        const cleanKey = this.cleanString(key);
        
        // Gérer les valeurs null/undefined
        if (value === null || value === undefined) {
          processedItem[cleanKey] = '';
        }
        // Formater les dates
        else if (value instanceof Date) {
          processedItem[cleanKey] = this.formatDate(value.toISOString(), dateFormat);
        } else if (typeof value === 'string' && this.isDateString(value)) {
          processedItem[cleanKey] = this.formatDate(value, dateFormat);
        }
        // Convertir les objets en chaînes lisibles
        else if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            processedItem[cleanKey] = value.join(', ');
          } else {
            processedItem[cleanKey] = this.objectToString(value);
          }
        }
        // Convertir les booléens en texte
        else if (typeof value === 'boolean') {
          processedItem[cleanKey] = value ? 'Oui' : 'Non';
        }
        // Convertir les nombres
        else if (typeof value === 'number') {
          processedItem[cleanKey] = isNaN(value) ? '' : value;
        }
        // Nettoyer les chaînes
        else if (typeof value === 'string') {
          processedItem[cleanKey] = this.cleanString(value);
        }
        // Autres types
        else {
          processedItem[cleanKey] = String(value || '');
        }
      });

      return processedItem;
    });
  }

  /**
   * Nettoie une chaîne de caractères
   */
  private cleanString(str: string): string {
    if (!str) return '';
    return str.toString()
      .replace(/[\r\n\t]/g, ' ') // Remplacer les retours à la ligne et tabulations
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim(); // Supprimer les espaces en début/fin
  }

  /**
   * Convertit un objet en chaîne lisible
   */
  private objectToString(obj: any): string {
    if (!obj) return '';
    
    try {
      // Si c'est un objet simple avec des propriétés de base
      if (obj.nom || obj.name) {
        const parts = [];
        if (obj.nom || obj.name) parts.push(obj.nom || obj.name);
        if (obj.prenom || obj.firstName) parts.push(obj.prenom || obj.firstName);
        if (obj.email) parts.push(`(${obj.email})`);
        return parts.join(' ');
      }
      
      // Sinon, convertir en JSON compact
      return JSON.stringify(obj).replace(/[{}"]/g, '').replace(/:/g, ': ');
    } catch (error) {
      return String(obj);
    }
  }

  /**
   * Calcule la largeur optimale des colonnes
   */
  private calculateColumnWidths(data: any[]): any[] {
    if (!data || data.length === 0) return [];

    const headers = Object.keys(data[0]);
    return headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => String(row[header] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
  }

  /**
   * Formate une date selon le format spécifié
   */
  private formatDate(dateString: string, format: string = 'DD/MM/YYYY'): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString);
        return dateString;
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      switch (format) {
        case 'DD/MM/YYYY':
          return `${day}/${month}/${year}`;
        case 'DD/MM/YYYY HH:mm':
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        default:
          return date.toLocaleDateString('fr-FR');
      }
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return dateString;
    }
  }

  /**
   * Vérifie si une chaîne est une date valide
   */
  private isDateString(str: string): boolean {
    const date = new Date(str);
    return !isNaN(date.getTime()) && str.includes('-');
  }

  /**
   * Génère une chaîne de date pour les noms de fichiers
   */
  private getCurrentDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}`;
  }

  /**
   * Calcule la durée de session
   */
  private calculateSessionDuration(loginTime: string, logoutTime: string | null): string {
    if (!logoutTime) return 'En cours';
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Détermine le type d'appareil basé sur le user agent
   */
  private getDeviceType(userAgent: string): string {
    if (!userAgent) return 'Inconnu';
    
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'Mobile';
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return 'Tablette';
    } else {
      return 'Ordinateur';
    }
  }

  /**
   * Obtient les informations des magasins pour l'export selon le rôle de l'utilisateur
   */
  private getStoreInfoForExport(user: any): string {
    if (!user) return 'N/A';

    const role = user.role;
    
    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leurs magasins assignés
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          return user.magasinNoms.join(', ');
        }
        return 'Aucun magasin assigné';
        
      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leurs merchandisers et leurs magasins
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          let result = '';
          user.merchendiseurs.forEach((merch: any, index: number) => {
            if (index > 0) result += ' | ';
            result += `${merch.prenom} ${merch.nom}`;
            if (merch.magasinNoms && merch.magasinNoms.length > 0) {
              result += ` (${merch.magasinNoms.join(', ')})`;
            } else {
              result += ' (Aucun magasin)';
            }
          });
          return result;
        }
        return 'Aucun merchandiser assigné';
        
      case 'ADMIN':
        return 'Tous les magasins';
        
      default:
        return 'N/A';
    }
  }

  /**
   * Obtient les informations du merchandiser pour l'export selon le rôle de l'utilisateur
   */
  private getMerchandiserInfoForExport(user: any): string {
    if (!user) return 'N/A';

    const role = user.role;

    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leurs magasins assignés
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          return user.magasinNoms.join(', ');
        }
        return 'Aucun magasin assigné';

      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leurs merchandisers
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          return user.merchendiseurs.map((merch: any) => `${merch.prenom} ${merch.nom}`).join(', ');
        }
        return 'Aucun merchandiser assigné';

      case 'ADMIN':
        // Pour les admins, afficher "N/A"
        return 'N/A';

      default:
        return 'N/A';
    }
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VisitImage {
  id?: number;
  imageData?: string; // Base64 string (optionnel pour compatibilité)
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  thumbnailPath?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  contentType?: string;
  uploadDate?: Date | string;
  description?: string;
  imageUrl?: string; // URL pour récupérer l'image depuis le backend
  thumbnailUrl?: string; // URL pour récupérer la thumbnail
}

export interface Produit {
  id?: number;
  nom: string;
  description?: string;
  prix?: number;
  categorie?: string;
}

export interface Planification {
  id?: number;
  dateVisite: string;
  statut?: string;
  magasin?: {
    id: number;
    nom: string;
    adresse?: string;
    ville?: string;
    region?: string;
  };
  merchandiser?: {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
    imagePath?: string;
  };
}

export interface VisitDTO {
  id?: number;
  heureArrivee: string;
  heureDepart: string;
  nombreFacings: number;
  nombreFacingsTotal: number;
  prixNormal: number;
  prixPromotionnel: number;
  niveauStock: number;
  nouveauteConcurrente: string;
  prixNouveaute: number;
  latitude: number;
  longitude: number;
  photoPrise: boolean;
  images: VisitImage[]; // Array of base64 images
  produits: Produit[]; // Array of visited products
  planning: Planification; // Planning information
  planningId: number;
}

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private apiUrl = 'http://68.183.71.119:8080/api/api/visits';

  constructor(private http: HttpClient) {}

  // 📌 Ajouter une visite
  createVisit(visit: VisitDTO): Observable<any> {
    return this.http.post(this.apiUrl, visit);
  }

  // 📌 Récupérer toutes les visites
  getAllVisits(): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}?includePlanning=true`);
  }

  // 📌 Récupérer toutes les visites avec planification complète
  getAllVisitsWithPlanning(): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/with-planning`);
  }

  // 📌 Récupérer une seule visite
  getVisitById(id: number): Observable<VisitDTO> {
    return this.http.get<VisitDTO>(`${this.apiUrl}/${id}`);
  }

  // 📌 Modifier une visite
  updateVisit(id: number, visit: VisitDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, visit);
  }

  // 📌 Supprimer une visite
  deleteVisit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 📌 Récupérer les visites par planification
  getVisitsByPlanning(planningId: number): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/planning/${planningId}`);
  }

  // 📌 Récupérer les visites par magasin
  getVisitsByStore(storeId: number): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/store/${storeId}`);
  }

  // 📌 Récupérer les visites par merchandiseur
  getVisitsByMerchandiser(merchandiserId: number): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/merchandiser/${merchandiserId}`);
  }

  // 📌 Récupérer les visites par date
  getVisitsByDate(date: string): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/date/${date}`);
  }

  // 📌 Récupérer les visites par période
  getVisitsByDateRange(startDate: string, endDate: string): Observable<VisitDTO[]> {
    return this.http.get<VisitDTO[]>(`${this.apiUrl}/date-range?start=${startDate}&end=${endDate}`);
  }

  // 📌 Ajouter une image à une visite
  addImageToVisit(visitId: number, image: VisitImage): Observable<any> {
    return this.http.post(`${this.apiUrl}/${visitId}/images`, image);
  }

  // 📌 Supprimer une image d'une visite
  deleteImageFromVisit(visitId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${visitId}/images/${imageId}`);
  }

  // ✅ Récupérer toutes les images d'une visite
  getVisitImages(visitId: number): Observable<VisitImage[]> {
    return this.http.get<VisitImage[]>(`${this.apiUrl}/${visitId}/images`);
  }

  // ✅ Uploader une image pour une visite (multipart/form-data)
  uploadVisitImage(visitId: number, file: File, description?: string): Observable<VisitImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (description) {
      formData.append('description', description);
    }
    
    console.log(`📤 Upload image pour visite ${visitId}:`, file.name);
    return this.http.post<VisitImage>(`${this.apiUrl}/${visitId}/images`, formData);
  }

  // ✅ Construire l'URL de l'image complète
  getVisitImageUrl(visitId: number, imageId: number): string {
    const url = `http://68.183.71.119:8080/api/api/visits/${visitId}/images/${imageId}`;
    console.log(`🔗 Construction URL image complète: ${url}`);
    return url;
  }

  // ✅ Construire l'URL de la thumbnail
  getVisitImageThumbnailUrl(visitId: number, imageId: number): string {
    const url = `http://68.183.71.119:8080/api/api/visits/${visitId}/images/${imageId}/thumbnail`;
    console.log(`🔗 Construction URL thumbnail: ${url}`);
    return url;
  }

  // ✅ Télécharger une image
  downloadVisitImage(visitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${visitId}/images/${imageId}/download`, {
      responseType: 'blob'
    });
  }

  // 📌 Convertir un fichier en base64
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // 📌 Valider une image (taille et type)
  validateImage(file: File): { valid: boolean; message?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSize) {
      return { valid: false, message: 'La taille de l\'image ne doit pas dépasser 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Seuls les formats JPEG, PNG et JPG sont autorisés' };
    }

    return { valid: true };
  }

  // 📌 Compresser une image base64
  async compressImage(base64: string, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = base64;
    });
  }

  // ==================== MÉTHODES KPI ====================

  // 📊 Calculer le taux de réalisation des visites
  calculateVisitCompletionRate(visits: VisitDTO[]): number {
    if (visits.length === 0) return 0;
    
    const completedVisits = visits.filter(visit => this.isVisitComplete(visit)).length;
    return Math.round((completedVisits / visits.length) * 100 * 10) / 10;
  }

  // 📊 Calculer les métriques de facing
  calculateFacingMetrics(visits: VisitDTO[]): { total: number; average: number; max: number; min: number } {
    if (visits.length === 0) return { total: 0, average: 0, max: 0, min: 0 };

    const facingCounts = visits.map(visit => visit.nombreFacings);
    const total = facingCounts.reduce((sum, count) => sum + count, 0);
    const average = total / visits.length;
    const max = Math.max(...facingCounts);
    const min = Math.min(...facingCounts);

    return {
      total,
      average: Math.round(average * 10) / 10,
      max,
      min
    };
  }

  // 📊 Calculer les métriques de prix
  calculatePriceMetrics(visits: VisitDTO[]): { 
    averageNormalPrice: number; 
    averagePromoPrice: number; 
    priceAccuracyRate: number;
    totalPriceVariations: number;
  } {
    if (visits.length === 0) return { 
      averageNormalPrice: 0, 
      averagePromoPrice: 0, 
      priceAccuracyRate: 0,
      totalPriceVariations: 0
    };

    let totalNormalPrice = 0;
    let totalPromoPrice = 0;
    let validPrices = 0;
    let priceVariations = 0;

    visits.forEach(visit => {
      if (visit.prixNormal > 0) {
        totalNormalPrice += visit.prixNormal;
        validPrices++;
      }
      
      if (visit.prixPromotionnel > 0) {
        totalPromoPrice += visit.prixPromotionnel;
      }

      // Calculer les variations de prix
      if (visit.prixNormal > 0 && visit.prixPromotionnel > 0) {
        const variation = Math.abs(visit.prixNormal - visit.prixPromotionnel) / visit.prixNormal;
        priceVariations += variation;
      }
    });

    const averageNormalPrice = validPrices > 0 ? totalNormalPrice / validPrices : 0;
    const averagePromoPrice = validPrices > 0 ? totalPromoPrice / validPrices : 0;
    const priceAccuracyRate = validPrices > 0 ? 
      Math.round((priceVariations / validPrices) * 100 * 10) / 10 : 0;

    return {
      averageNormalPrice: Math.round(averageNormalPrice * 100) / 100,
      averagePromoPrice: Math.round(averagePromoPrice * 100) / 100,
      priceAccuracyRate,
      totalPriceVariations: Math.round(priceVariations * 100) / 100
    };
  }

  // 📊 Calculer les métriques de stock
  calculateStockMetrics(visits: VisitDTO[]): { 
    averageStockLevel: number; 
    stockAccuracyRate: number;
    lowStockVisits: number;
    outOfStockVisits: number;
  } {
    if (visits.length === 0) return { 
      averageStockLevel: 0, 
      stockAccuracyRate: 0,
      lowStockVisits: 0,
      outOfStockVisits: 0
    };

    let totalStock = 0;
    let validStocks = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    visits.forEach(visit => {
      if (visit.niveauStock >= 0) {
        totalStock += visit.niveauStock;
        validStocks++;

        if (visit.niveauStock === 0) {
          outOfStockCount++;
        } else if (visit.niveauStock < 5) { // Seuil bas stock
          lowStockCount++;
        }
      }
    });

    const averageStockLevel = validStocks > 0 ? totalStock / validStocks : 0;
    const stockAccuracyRate = validStocks > 0 ? 
      Math.round(((validStocks - outOfStockCount) / validStocks) * 100 * 10) / 10 : 0;

    return {
      averageStockLevel: Math.round(averageStockLevel * 10) / 10,
      stockAccuracyRate,
      lowStockVisits: lowStockCount,
      outOfStockVisits: outOfStockCount
    };
  }

  // 📊 Calculer la durée moyenne des visites
  calculateVisitDurationMetrics(visits: VisitDTO[]): { 
    averageDuration: number; 
    totalDuration: number;
    shortestVisit: number;
    longestVisit: number;
  } {
    if (visits.length === 0) return { 
      averageDuration: 0, 
      totalDuration: 0,
      shortestVisit: 0,
      longestVisit: 0
    };

    let totalDuration = 0;
    let validVisits = 0;
    const durations: number[] = [];

    visits.forEach(visit => {
      if (visit.heureArrivee && visit.heureDepart) {
        const start = new Date(visit.heureArrivee);
        const end = new Date(visit.heureDepart);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // en heures
        
        if (duration > 0) {
          totalDuration += duration;
          durations.push(duration);
          validVisits++;
        }
      }
    });

    const averageDuration = validVisits > 0 ? totalDuration / validVisits : 0;
    const shortestVisit = durations.length > 0 ? Math.min(...durations) : 0;
    const longestVisit = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      averageDuration: Math.round(averageDuration * 10) / 10,
      totalDuration: Math.round(totalDuration * 10) / 10,
      shortestVisit: Math.round(shortestVisit * 10) / 10,
      longestVisit: Math.round(longestVisit * 10) / 10
    };
  }

  // 📊 Obtenir les statistiques par enseigne
  getVisitsByEnseigne(visits: VisitDTO[]): { [enseigne: string]: number } {
    const enseigneCount: { [enseigne: string]: number } = {};
    
    visits.forEach(visit => {
      const enseigne = visit.planning?.magasin?.nom || 'Non définie';
      enseigneCount[enseigne] = (enseigneCount[enseigne] || 0) + 1;
    });

    return enseigneCount;
  }

  // 📊 Obtenir les statistiques par marque
  getVisitsByMarque(visits: VisitDTO[]): { [marque: string]: number } {
    const marqueCount: { [marque: string]: number } = {};
    
    visits.forEach(visit => {
      visit.produits.forEach(produit => {
        if (produit.categorie) {
          const marque = produit.categorie;
          marqueCount[marque] = (marqueCount[marque] || 0) + 1;
        }
      });
    });

    return marqueCount;
  }

  // 📊 Obtenir les visites par statut
  getVisitsByStatus(visits: VisitDTO[]): { [status: string]: number } {
    const statusCount: { [status: string]: number } = {
      'Complètes': 0,
      'Incomplètes': 0,
      'En cours': 0
    };
    
    visits.forEach(visit => {
      if (this.isVisitComplete(visit)) {
        statusCount['Complètes']++;
      } else if (visit.heureArrivee && !visit.heureDepart) {
        statusCount['En cours']++;
      } else {
        statusCount['Incomplètes']++;
      }
    });

    return statusCount;
  }

  // 📊 Vérifier si une visite est complète (méthode utilitaire)
  private isVisitComplete(visit: VisitDTO): boolean {
    return !!(
      visit.heureArrivee &&
      visit.heureDepart &&
      visit.nombreFacings > 0 &&
      visit.nombreFacingsTotal > 0 &&
      visit.prixNormal > 0 &&
      visit.niveauStock >= 0 &&
      visit.images && visit.images.length > 0 &&
      visit.produits && visit.produits.length > 0
    );
  }

  // 📊 Obtenir les visites récentes
  getRecentVisits(visits: VisitDTO[], limit: number = 10): VisitDTO[] {
    return visits
      .filter(visit => visit.heureArrivee)
      .sort((a, b) => new Date(b.heureArrivee).getTime() - new Date(a.heureArrivee).getTime())
      .slice(0, limit);
  }

  // 📊 Obtenir les visites par période
  getVisitsByPeriod(visits: VisitDTO[], startDate: string, endDate: string): VisitDTO[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return visits.filter(visit => {
      if (!visit.heureArrivee) return false;
      const visitDate = new Date(visit.heureArrivee);
      return visitDate >= start && visitDate <= end;
    });
  }

  // 📊 Filtrer les visites par merchandiser (méthode utilitaire)
  filterVisitsByMerchandiser(visits: VisitDTO[], merchandiserId: number): VisitDTO[] {
    return visits.filter(visit => 
      visit.planning?.merchandiser?.id === merchandiserId
    );
  }

  // 📊 Filtrer les visites par magasin (méthode utilitaire)
  filterVisitsByStore(visits: VisitDTO[], storeId: number): VisitDTO[] {
    return visits.filter(visit => 
      visit.planning?.magasin?.id === storeId
    );
  }
}

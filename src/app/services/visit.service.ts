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
}

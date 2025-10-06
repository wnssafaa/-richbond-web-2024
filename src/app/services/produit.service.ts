import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ProduitImageDTO {
  id?: number;
  produitId?: number;
  fileName?: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadDate: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  primary?: boolean;
  isPrimary?: boolean; // Alias pour compatibilité
}

export interface Produit {
  id?: number;
  marque: string;
  reference: string;
  categorie: string;
  image?: string; // Gardé pour compatibilité, sera remplacé par les URLs d'images
  imageUrl?: string; // URL de l'image principale
  thumbnailUrl?: string; // URL de la thumbnail
  imageData?: ProduitImageDTO; // Données de l'image principale
  images?: ProduitImageDTO[]; // Toutes les images du produit
  article: string;
  type: string;
  dimensions: string;
  disponible: boolean;
  prix: number;
  
  // Nouveaux attributs ajoutés
  famille: string;           // ex: "MATELAS"
  sousMarques: string;       // ex: "R VITAL"
  codeEAN: string;          // ex: "6111250526067"
  designationArticle: string; // ex: "R VITAL 190X090"
  
  // Propriétés internes pour la gestion des images
  _loadingImage?: boolean;
  _imageBlobUrl?: string; // URL blob temporaire pour l'affichage
  _thumbnailBlobUrl?: string; // URL blob temporaire pour la thumbnail
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://localhost:8080/api/produits';

  constructor(private http: HttpClient) { }

  // Ajouter un produit
  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/add`, produit);
  }

  // Obtenir tous les produits
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/all`);
  }

  // Méthode de test pour vérifier les données
  testGetAllProduits(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  // Obtenir un produit par ID
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

 updateProduit(id: number, produit: Produit): Observable<Produit> {
  console.log('Update produit payload:', produit);
  return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
}


  // Supprimer un produit
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des produits par marque
  getProduitsByMarque(marque: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/marque/${marque}`);
  }

  // ========== MÉTHODES POUR LA GESTION DES IMAGES ==========

  /**
   * Uploader une image pour un produit (remplace l'ancienne si elle existe)
   */
  uploadImage(produitId: number, file: File, description?: string): Observable<ProduitImageDTO> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    return this.http.post<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images`, formData);
  }

  /**
   * Récupérer l'image d'un produit (OneToOne)
   */
  getImageByProduit(produitId: number): Observable<ProduitImageDTO> {
    return this.http.get<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images`);
  }

  /**
   * Récupérer l'image principale d'un produit (alias pour getImageByProduit)
   */
  getPrimaryImage(produitId: number): Observable<ProduitImageDTO> {
    return this.http.get<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images/primary`);
  }

  /**
   * Récupérer une image spécifique comme blob
   */
  getImage(produitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${produitId}/images/${imageId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Récupérer la thumbnail d'une image comme blob
   */
  getThumbnail(produitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${produitId}/images/${imageId}/thumbnail`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Télécharger une image
   */
  downloadImage(produitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${produitId}/images/${imageId}/download`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Définir une image comme principale (non utilisé avec OneToOne)
   */
  setPrimaryImage(produitId: number, imageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${produitId}/images/${imageId}/set-primary`, {});
  }

  /**
   * Supprimer une image
   */
  deleteImage(produitId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${produitId}/images/${imageId}`);
  }

  // ========== MÉTHODES UTILITAIRES POUR LES URLs D'IMAGES ==========

  /**
   * Obtenir l'URL complète d'une image
   */
  getImageUrl(produitId: number, imageId: number): string {
    return `${this.apiUrl}/${produitId}/images/${imageId}`;
  }

  /**
   * Obtenir l'URL de la thumbnail
   */
  getThumbnailUrl(produitId: number, imageId: number): string {
    return `${this.apiUrl}/${produitId}/images/${imageId}/thumbnail`;
  }

  /**
   * Obtenir l'URL de téléchargement
   */
  getDownloadUrl(produitId: number, imageId: number): string {
    return `${this.apiUrl}/${produitId}/images/${imageId}/download`;
  }

  /**
   * Convertir un blob en URL d'objet pour l'affichage
   */
  createBlobUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Libérer une URL d'objet blob pour éviter les fuites mémoire
   */
  revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Charger une image et créer une URL blob pour l'affichage
   */
  loadImageAsBlobUrl(produitId: number, imageId: number): Observable<string> {
    return this.getImage(produitId, imageId).pipe(
      map(blob => this.createBlobUrl(blob))
    );
  }

  /**
   * Charger une thumbnail et créer une URL blob pour l'affichage
   */
  loadThumbnailAsBlobUrl(produitId: number, imageId: number): Observable<string> {
    return this.getThumbnail(produitId, imageId).pipe(
      map(blob => this.createBlobUrl(blob))
    );
  }

  /**
   * Charge les images principales pour plusieurs produits avec URLs blob
   */
  loadPrimaryImagesForProducts(produits: Produit[]): Observable<Produit[]> {
    const productsWithImages = produits.map(produit => {
      if (produit.id && !produit._imageBlobUrl && !produit._loadingImage) {
        produit._loadingImage = true;
        return this.getImageByProduit(produit.id).pipe(
          switchMap(imageData => {
            if (imageData && imageData.id && produit.id) {
              // Stocker les métadonnées de l'image
              produit.imageData = imageData;
              produit.images = [imageData];
              produit.imageUrl = this.getImageUrl(produit.id, imageData.id);
              produit.thumbnailUrl = this.getThumbnailUrl(produit.id, imageData.id);
              
              // Charger l'image comme URL blob
              return this.loadImageAsBlobUrl(produit.id, imageData.id).pipe(
                switchMap(imageBlobUrl => {
                  produit._imageBlobUrl = imageBlobUrl;
                  
                  // Essayer de charger la thumbnail
                  return this.loadThumbnailAsBlobUrl(produit.id!, imageData.id!).pipe(
                    map(thumbnailBlobUrl => {
                      produit._thumbnailBlobUrl = thumbnailBlobUrl;
                      produit._loadingImage = false;
                      return produit;
                    }),
                    catchError(error => {
                      // Si la thumbnail n'existe pas, continuer sans
                      produit._loadingImage = false;
                      return of(produit);
                    })
                  );
                }),
                catchError(error => {
                  produit._loadingImage = false;
                  return of(produit);
                })
              );
            }
            produit._loadingImage = false;
            return of(produit);
          }),
          catchError(error => {
            produit._loadingImage = false;
            return of(produit);
          })
        );
      }
      return of(produit);
    });

    return forkJoin(productsWithImages);
  }

  /**
   * Version simplifiée pour charger seulement les métadonnées d'images
   */
  loadImageMetadataForProducts(produits: Produit[]): Observable<Produit[]> {
    const productsWithMetadata = produits.map(produit => {
      if (produit.id && !produit.imageData && !produit._loadingImage) {
        produit._loadingImage = true;
        return this.getImageByProduit(produit.id).pipe(
          map(imageData => {
            if (imageData && imageData.id && produit.id) {
              produit.imageData = imageData;
              produit.images = [imageData];
              produit.imageUrl = this.getImageUrl(produit.id, imageData.id);
              produit.thumbnailUrl = this.getThumbnailUrl(produit.id, imageData.id);
            }
            produit._loadingImage = false;
            return produit;
          }),
          catchError(error => {
            produit._loadingImage = false;
            return of(produit);
          })
        );
      }
      return of(produit);
    });

    return forkJoin(productsWithMetadata);
  }

  /**
   * Charger l'image blob pour un produit spécifique
   */
  loadImageBlobForProduct(produit: Produit): Observable<Produit> {
    if (!produit.id || !produit.imageData?.id || produit._imageBlobUrl) {
      return of(produit);
    }

    return this.loadImageAsBlobUrl(produit.id, produit.imageData.id).pipe(
      map(blobUrl => {
        produit._imageBlobUrl = blobUrl;
        return produit;
      }),
      catchError(error => {
        console.warn('Impossible de charger l\'image blob pour le produit', produit.id, error);
        return of(produit);
      })
    );
  }

  /**
   * Charger la thumbnail blob pour un produit spécifique
   */
  loadThumbnailBlobForProduct(produit: Produit): Observable<Produit> {
    if (!produit.id || !produit.imageData?.id || produit._thumbnailBlobUrl) {
      return of(produit);
    }

    return this.loadThumbnailAsBlobUrl(produit.id, produit.imageData.id).pipe(
      map(blobUrl => {
        produit._thumbnailBlobUrl = blobUrl;
        return produit;
      }),
      catchError(error => {
        console.warn('Impossible de charger la thumbnail blob pour le produit', produit.id, error);
        return of(produit);
      })
    );
  }

  /**
   * Nettoyer les URLs blob pour éviter les fuites mémoire
   */
  cleanupBlobUrls(produits: Produit[]): void {
    produits.forEach(produit => {
      if (produit._imageBlobUrl) {
        this.revokeBlobUrl(produit._imageBlobUrl);
        produit._imageBlobUrl = undefined;
      }
      if (produit._thumbnailBlobUrl) {
        this.revokeBlobUrl(produit._thumbnailBlobUrl);
        produit._thumbnailBlobUrl = undefined;
      }
    });
  }

  /**
   * Obtenir l'URL d'affichage optimale pour un produit
   * Préfère la thumbnail si disponible, sinon l'image complète
   */
  getDisplayUrl(produit: Produit): string | null {
    if (produit._thumbnailBlobUrl) {
      return produit._thumbnailBlobUrl;
    }
    if (produit._imageBlobUrl) {
      return produit._imageBlobUrl;
    }
    if (produit.thumbnailUrl) {
      return produit.thumbnailUrl;
    }
    if (produit.imageUrl) {
      return produit.imageUrl;
    }
    return null;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { map, catchError, switchMap as rxSwitchMap } from 'rxjs/operators';

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

export interface ProduitDTO {
  id?: number;
  marque: string;
  reference: string;
  categorie: string;
  article: string;
  type: string;
  dimensions: string;
  disponible: boolean;
  prix: number;
  famille: string;
  sousMarques: string;
  codeEAN: string;
  designationArticle: string;
  image?: string; // URL de l'image (compatibilité)
  imageUrl?: string; // URL de l'image principale
  thumbnailUrl?: string; // URL de la thumbnail
  imageData?: ProduitImageDTO;
  images?: ProduitImageDTO[];
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
  _noImageAvailable?: boolean; // Indique qu'aucune image n'est disponible
  _extractedImage?: any; // Image extraite depuis Excel
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://localhost:8080/api/produits';

  constructor(private http: HttpClient) { }

  // Ajouter un produit
  createProduit(produit: Produit): Observable<Produit> {
    // Si le produit contient une image extraite, l'envoyer avec l'image
    if (produit._extractedImage) {
      return this.createProduitWithImage(produit);
    }
    
    return this.http.post<Produit>(`${this.apiUrl}/add`, produit);
  }

  // Créer un produit avec une image extraite
  private createProduitWithImage(produit: Produit): Observable<Produit> {
    // Pour l'instant, créer le produit sans image, puis uploader l'image séparément
    const { _extractedImage, _imageBlobUrl, _thumbnailBlobUrl, _loadingImage, _noImageAvailable, ...produitData } = produit;
    
    console.log('📤 Création du produit sans image d\'abord:', produitData);
    
    // Créer le produit d'abord
    return this.http.post<Produit>(`${this.apiUrl}/add`, produitData).pipe(
      rxSwitchMap(createdProduit => {
        console.log('✅ Produit créé:', createdProduit);
        
        // Si le produit a été créé et qu'il y a une image, l'uploader
        if (createdProduit.id && _extractedImage && _extractedImage.dataUrl) {
          return this.uploadExtractedImage(createdProduit.id, _extractedImage).pipe(
            map(() => createdProduit) // Retourner le produit même si l'upload d'image échoue
          );
        }
        
        return of(createdProduit);
      })
    );
  }

  // Uploader une image extraite depuis Excel
  private uploadExtractedImage(produitId: number, extractedImage: any): Observable<any> {
    if (!extractedImage.dataUrl) {
      console.log('⚠️ Aucune data URL disponible pour l\'upload');
      return of(null);
    }

    try {
      // Convertir la data URL en blob
      const base64Data = extractedImage.dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: extractedImage.mimeType });
      
      // Créer un fichier à partir du blob
      const fileName = `produit_${produitId}_${Date.now()}.${extractedImage.extension || 'jpg'}`;
      const file = new File([blob], fileName, { type: extractedImage.mimeType });
      
      console.log('📤 Upload de l\'image extraite:', fileName);
      
      // Uploader l'image
      return this.uploadImage(produitId, file, 'Image importée depuis Excel');
    } catch (error) {
      console.error('❌ Erreur lors de la conversion de l\'image:', error);
      return of(null);
    }
  }

  // Mapper les données d'import Excel vers l'interface Produit
  mapImportDataToProduit(importData: any): Produit {
    // Extraire les dimensions de la désignation article (ex: "R VITAL 190X090" -> "190X090")
    const dimensionsMatch = importData.designationArticle?.match(/(\d+X\d+)/);
    const dimensions = dimensionsMatch ? dimensionsMatch[1] : '';
    
    // Extraire le type d'article de la désignation (ex: "R VITAL 190X090" -> "R VITAL")
    const typeMatch = importData.designationArticle?.match(/^([^0-9]+)/);
    const type = typeMatch ? typeMatch[1].trim() : importData.sousMarques || '';
    
    const produit: Produit = {
      marque: importData.marque || 'RICHBOND',
      reference: importData.codeEAN || '', // Utiliser le code EAN comme référence
      categorie: importData.famille || 'MATELAS',
      article: importData.designationArticle || '',
      type: type,
      dimensions: dimensions,
      disponible: true, // Par défaut disponible
      prix: parseFloat(importData.prix) || 0,
      famille: importData.famille || 'MATELAS',
      sousMarques: importData.sousMarques || '',
      codeEAN: importData.codeEAN || '',
      designationArticle: importData.designationArticle || '',
    };

    // Gérer les images extraites depuis Excel
    if (importData.extractedImage) {
      console.log('🖼️ Image extraite trouvée:', importData.extractedImage);
      // Ajouter les données d'image pour l'envoi au backend
      produit._extractedImage = importData.extractedImage;
    } else if (importData.photo && importData.photo.trim() !== '') {
      // Image par nom de fichier (méthode traditionnelle)
      produit.image = importData.photo;
    }
    
    console.log('🔄 Mapping des données d\'import vers Produit:', { importData, produit });
    return produit;
  }

  // Obtenir tous les produits
  getAllProduits(): Observable<Produit[]> {
    console.log('🔄 Récupération de tous les produits depuis:', `${this.apiUrl}/all`);
    
    return this.http.get<ProduitDTO[]>(`${this.apiUrl}/all`).pipe(
      map(produitDTOs => {
        console.log('📦 Produits DTOs reçus du backend:', produitDTOs);
        const produits = produitDTOs.map(dto => this.convertDTOToProduit(dto));
        console.log('✅ Produits convertis:', produits);
        return produits;
      })
    );
  }

  // Méthode de test pour vérifier les données
  testGetAllProduits(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  // Méthode de debug pour tester les images
  debugProductImages(): void {
    console.log('🔍 Debug des images de produits...');
    
    this.testGetAllProduits().subscribe({
      next: (data) => {
        console.log('📊 Données brutes du backend:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          const premierProduit = data[0];
          console.log('🔍 Premier produit analysé:', premierProduit);
          
          if (premierProduit.imageData) {
            console.log('✅ Données d\'image trouvées:', premierProduit.imageData);
            console.log('🔗 URL d\'image construite:', `http://localhost:8080/api/produits/${premierProduit.id}/images/${premierProduit.imageData.id}`);
          } else {
            console.log('❌ Aucune donnée d\'image trouvée dans le premier produit');
          }
        } else {
          console.log('❌ Aucun produit trouvé ou format de données incorrect');
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du test des images:', error);
      }
    });
  }

  // Obtenir un produit par ID
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<ProduitDTO>(`${this.apiUrl}/${id}`).pipe(
      map(produitDTO => this.convertDTOToProduit(produitDTO))
    );
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
    return this.http.get<ProduitDTO[]>(`${this.apiUrl}/marque/${marque}`).pipe(
      map(produitDTOs => produitDTOs.map(dto => this.convertDTOToProduit(dto)))
    );
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
    return this.http.get<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images`).pipe(
      catchError(error => {
        // Si l'endpoint n'existe pas ou retourne 404, retourner un observable vide
        if (error.status === 404) {
          console.log(`Aucune image trouvée pour le produit ${produitId}`);
          return of(null as any);
        }
        // Pour les autres erreurs, les propager
        throw error;
      })
    );
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
    const imageUrl = this.getImageUrl(produitId, imageId);
    console.log('🖼️ Tentative de chargement de l\'image:', imageUrl);
    
    return this.getImage(produitId, imageId).pipe(
      map(blob => {
        console.log('✅ Image chargée avec succès:', imageUrl);
        return this.createBlobUrl(blob);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement de l\'image:', imageUrl, error);
        throw error;
      })
    );
  }

  /**
   * Charger une thumbnail et créer une URL blob pour l'affichage
   */
  loadThumbnailAsBlobUrl(produitId: number, imageId: number): Observable<string> {
    const thumbnailUrl = this.getThumbnailUrl(produitId, imageId);
    console.log('🖼️ Tentative de chargement de la thumbnail:', thumbnailUrl);
    
    return this.getThumbnail(produitId, imageId).pipe(
      map(blob => {
        console.log('✅ Thumbnail chargée avec succès:', thumbnailUrl);
        return this.createBlobUrl(blob);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement de la thumbnail:', thumbnailUrl, error);
        throw error;
      })
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
                  console.warn(`⚠️ Impossible de charger l'image pour le produit ${produit.id}:`, error);
                  produit._loadingImage = false;
                  // Marquer qu'il n'y a pas d'image disponible
                  produit._noImageAvailable = true;
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
            console.warn(`⚠️ Aucune image trouvée pour le produit ${produit.id}:`, error);
            produit._loadingImage = false;
            // Marquer qu'il n'y a pas d'image disponible
            produit._noImageAvailable = true;
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

  /**
   * Convertit un ProduitDTO en Produit
   */
  private convertDTOToProduit(dto: ProduitDTO): Produit {
    console.log('🔄 Conversion DTO vers Produit:', dto);
    
    const produit: Produit = {
      id: dto.id,
      marque: dto.marque,
      reference: dto.reference,
      categorie: dto.categorie,
      article: dto.article,
      type: dto.type,
      dimensions: dto.dimensions,
      disponible: dto.disponible,
      prix: dto.prix,
      famille: dto.famille,
      sousMarques: dto.sousMarques,
      codeEAN: dto.codeEAN,
      designationArticle: dto.designationArticle,
      imageData: dto.imageData,
      images: dto.images
    };

    // Si le DTO contient des données d'image, utiliser les URLs du backend
    if (dto.imageData && dto.imageData.id && dto.id) {
      // Utiliser les URLs du backend si disponibles
      if (dto.imageUrl) {
        produit.imageUrl = dto.imageUrl.startsWith('/api/') ? `http://localhost:8080${dto.imageUrl}` : dto.imageUrl;
      } else {
        produit.imageUrl = this.getImageUrl(dto.id, dto.imageData.id);
      }
      
      if (dto.thumbnailUrl) {
        produit.thumbnailUrl = dto.thumbnailUrl.startsWith('/api/') ? `http://localhost:8080${dto.thumbnailUrl}` : dto.thumbnailUrl;
      } else {
        produit.thumbnailUrl = this.getThumbnailUrl(dto.id, dto.imageData.id);
      }
      
      console.log('✅ URLs d\'images construites pour le produit', dto.id, ':', {
        imageUrl: produit.imageUrl,
        thumbnailUrl: produit.thumbnailUrl
      });
    } else {
      console.log('⚠️ Pas de données d\'image pour le produit', dto.id);
    }

    return produit;
  }
}

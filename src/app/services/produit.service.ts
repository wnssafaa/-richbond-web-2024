﻿import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { map, catchError, switchMap as rxSwitchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  isPrimary?: boolean; // Alias pour compatibilitÃ©
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
  image?: string; // URL de l'image (compatibilitÃ©)
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
  image?: string; // GardÃ© pour compatibilitÃ©, sera remplacÃ© par les URLs d'images
  imageUrl?: string; // URL de l'image principale
  thumbnailUrl?: string; // URL de la thumbnail
  imageData?: ProduitImageDTO; // DonnÃ©es de l'image principale
  images?: ProduitImageDTO[]; // Toutes les images du produit
  article: string;
  type: string;
  dimensions: string;
  disponible: boolean;
  prix: number;
  
  // Nouveaux attributs ajoutÃ©s
  famille: string;           // ex: "MATELAS"
  sousMarques: string;       // ex: "R VITAL"
  codeEAN: string;          // ex: "6111250526067"
  designationArticle: string; // ex: "R VITAL 190X090"
  
  // PropriÃ©tÃ©s internes pour la gestion des images
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

  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) { }

  // Ajouter un produit
  createProduit(produit: Produit): Observable<Produit> {
    // Si le produit contient une image extraite, l'envoyer avec l'image
    if (produit._extractedImage) {
      return this.createProduitWithImage(produit);
    }
    
    return this.http.post<Produit>(`${this.apiUrl}/add`, produit);
  }

  // CrÃ©er un produit avec une image extraite
  private createProduitWithImage(produit: Produit): Observable<Produit> {
    // Pour l'instant, crÃ©er le produit sans image, puis uploader l'image sÃ©parÃ©ment
    const { _extractedImage, _imageBlobUrl, _thumbnailBlobUrl, _loadingImage, _noImageAvailable, ...produitData } = produit;
    
    console.log('ðŸ“¤ CrÃ©ation du produit sans image d\'abord:', produitData);
    
    // CrÃ©er le produit d'abord
    return this.http.post<Produit>(`${this.apiUrl}/add`, produitData).pipe(
      rxSwitchMap(createdProduit => {
        console.log('âœ… Produit crÃ©Ã©:', createdProduit);
        
        // Si le produit a Ã©tÃ© crÃ©Ã© et qu'il y a une image, l'uploader
        if (createdProduit.id && _extractedImage && _extractedImage.dataUrl) {
          return this.uploadExtractedImage(createdProduit.id, _extractedImage).pipe(
            map(() => createdProduit) // Retourner le produit mÃªme si l'upload d'image Ã©choue
          );
        }
        
        return of(createdProduit);
      })
    );
  }

  // Uploader une image extraite depuis Excel
  private uploadExtractedImage(produitId: number, extractedImage: any): Observable<any> {
    if (!extractedImage.dataUrl) {
      console.log('âš ï¸ Aucune data URL disponible pour l\'upload');
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
      
      // CrÃ©er un fichier Ã  partir du blob
      const fileName = `produit_${produitId}_${Date.now()}.${extractedImage.extension || 'jpg'}`;
      const file = new File([blob], fileName, { type: extractedImage.mimeType });
      
      console.log('ðŸ“¤ Upload de l\'image extraite:', fileName);
      
      // Uploader l'image
      return this.uploadImage(produitId, file, 'Image importÃ©e depuis Excel');
    } catch (error) {
      console.error('âŒ Erreur lors de la conversion de l\'image:', error);
      return of(null);
    }
  }

  // Mapper les donnÃ©es d'import Excel vers l'interface Produit
  mapImportDataToProduit(importData: any): Produit {
    // Extraire les dimensions de la dÃ©signation article (ex: "R VITAL 190X090" -> "190X090")
    const dimensionsMatch = importData.designationArticle?.match(/(\d+X\d+)/);
    const dimensions = dimensionsMatch ? dimensionsMatch[1] : '';
    
    // Extraire le type d'article de la dÃ©signation (ex: "R VITAL 190X090" -> "R VITAL")
    const typeMatch = importData.designationArticle?.match(/^([^0-9]+)/);
    const type = typeMatch ? typeMatch[1].trim() : importData.sousMarques || '';
    
    const produit: Produit = {
      marque: importData.marque || 'RICHBOND',
      reference: importData.codeEAN || '', // Utiliser le code EAN comme rÃ©fÃ©rence
      categorie: importData.famille || 'MATELAS',
      article: importData.designationArticle || '',
      type: type,
      dimensions: dimensions,
      disponible: true, // Par dÃ©faut disponible
      prix: parseFloat(importData.prix) || 0,
      famille: importData.famille || 'MATELAS',
      sousMarques: importData.sousMarques || '',
      codeEAN: importData.codeEAN || '',
      designationArticle: importData.designationArticle || '',
    };

    // GÃ©rer les images extraites depuis Excel
    if (importData.extractedImage) {
      console.log('ðŸ–¼ï¸ Image extraite trouvÃ©e:', importData.extractedImage);
      // Ajouter les donnÃ©es d'image pour l'envoi au backend
      produit._extractedImage = importData.extractedImage;
    } else if (importData.photo && importData.photo.trim() !== '') {
      // Image par nom de fichier (mÃ©thode traditionnelle)
      produit.image = importData.photo;
    }
    
    console.log('ðŸ”„ Mapping des donnÃ©es d\'import vers Produit:', { importData, produit });
    return produit;
  }

  // Obtenir tous les produits
  getAllProduits(): Observable<Produit[]> {
    console.log('ðŸ”„ RÃ©cupÃ©ration de tous les produits depuis:', `${this.apiUrl}/all`);
    
    return this.http.get<ProduitDTO[]>(`${this.apiUrl}/all`).pipe(
      map(produitDTOs => {
        console.log('ðŸ“¦ Produits DTOs reÃ§us du backend:', produitDTOs);
        const produits = produitDTOs.map(dto => this.convertDTOToProduit(dto));
        console.log('âœ… Produits convertis:', produits);
        return produits;
      })
    );
  }

  // MÃ©thode de test pour vÃ©rifier les donnÃ©es
  testGetAllProduits(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  // MÃ©thode de debug pour tester les images
  debugProductImages(): void {
    console.log('ðŸ” Debug des images de produits...');
    
    this.testGetAllProduits().subscribe({
      next: (data) => {
        console.log('ðŸ“Š DonnÃ©es brutes du backend:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          const premierProduit = data[0];
          console.log('ðŸ” Premier produit analysÃ©:', premierProduit);
          
          if (premierProduit.imageData) {
            console.log('âœ… DonnÃ©es d\'image trouvÃ©es:', premierProduit.imageData);
            console.log('ðŸ”— URL d\'image construite:', `http://68.183.71.119:8080/api/api/produits/${premierProduit.id}/images/${premierProduit.imageData.id}`);
          } else {
            console.log('âŒ Aucune donnÃ©e d\'image trouvÃ©e dans le premier produit');
          }
        } else {
          console.log('âŒ Aucun produit trouvÃ© ou format de donnÃ©es incorrect');
        }
      },
      error: (error) => {
        console.error('âŒ Erreur lors du test des images:', error);
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

  // ========== MÃ‰THODES POUR LA GESTION DES IMAGES ==========

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
   * RÃ©cupÃ©rer l'image d'un produit (OneToOne)
   */
  getImageByProduit(produitId: number): Observable<ProduitImageDTO> {
    return this.http.get<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images`).pipe(
      catchError(error => {
        // Si l'endpoint n'existe pas ou retourne 404, retourner un observable vide
        if (error.status === 404) {
          console.log(`Aucune image trouvÃ©e pour le produit ${produitId}`);
          return of(null as any);
        }
        // Pour les autres erreurs, les propager
        throw error;
      })
    );
  }

  /**
   * RÃ©cupÃ©rer l'image principale d'un produit (alias pour getImageByProduit)
   */
  getPrimaryImage(produitId: number): Observable<ProduitImageDTO> {
    return this.http.get<ProduitImageDTO>(`${this.apiUrl}/${produitId}/images/primary`);
  }

  /**
   * RÃ©cupÃ©rer une image spÃ©cifique comme blob
   */
  getImage(produitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${produitId}/images/${imageId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * RÃ©cupÃ©rer la thumbnail d'une image comme blob
   */
  getThumbnail(produitId: number, imageId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${produitId}/images/${imageId}/thumbnail`, { 
      responseType: 'blob' 
    });
  }

  /**
   * TÃ©lÃ©charger une image
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

  // ========== MÃ‰THODES UTILITAIRES POUR LES URLs D'IMAGES ==========

  /**
   * Obtenir l'URL complÃ¨te d'une image
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
   * Obtenir l'URL de tÃ©lÃ©chargement
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
   * LibÃ©rer une URL d'objet blob pour Ã©viter les fuites mÃ©moire
   */
  revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Charger une image et crÃ©er une URL blob pour l'affichage
   */
  loadImageAsBlobUrl(produitId: number, imageId: number): Observable<string> {
    const imageUrl = this.getImageUrl(produitId, imageId);
    console.log('ðŸ–¼ï¸ Tentative de chargement de l\'image:', imageUrl);
    
    return this.getImage(produitId, imageId).pipe(
      map(blob => {
        console.log('âœ… Image chargÃ©e avec succÃ¨s:', imageUrl);
        return this.createBlobUrl(blob);
      }),
      catchError(error => {
        console.error('âŒ Erreur lors du chargement de l\'image:', imageUrl, error);
        throw error;
      })
    );
  }

  /**
   * Charger une thumbnail et crÃ©er une URL blob pour l'affichage
   */
  loadThumbnailAsBlobUrl(produitId: number, imageId: number): Observable<string> {
    const thumbnailUrl = this.getThumbnailUrl(produitId, imageId);
    console.log('ðŸ–¼ï¸ Tentative de chargement de la thumbnail:', thumbnailUrl);
    
    return this.getThumbnail(produitId, imageId).pipe(
      map(blob => {
        console.log('âœ… Thumbnail chargÃ©e avec succÃ¨s:', thumbnailUrl);
        return this.createBlobUrl(blob);
      }),
      catchError(error => {
        console.error('âŒ Erreur lors du chargement de la thumbnail:', thumbnailUrl, error);
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
              // Stocker les mÃ©tadonnÃ©es de l'image
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
                  console.warn(`âš ï¸ Impossible de charger l'image pour le produit ${produit.id}:`, error);
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
   * Version simplifiÃ©e pour charger seulement les mÃ©tadonnÃ©es d'images
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
            console.warn(`âš ï¸ Aucune image trouvÃ©e pour le produit ${produit.id}:`, error);
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
   * Charger l'image blob pour un produit spÃ©cifique
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
   * Charger la thumbnail blob pour un produit spÃ©cifique
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
   * Nettoyer les URLs blob pour Ã©viter les fuites mÃ©moire
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
   * PrÃ©fÃ¨re la thumbnail si disponible, sinon l'image complÃ¨te
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
    console.log('ðŸ”„ Conversion DTO vers Produit:', dto);
    
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

    // Si le DTO contient des donnÃ©es d'image, utiliser les URLs du backend
    if (dto.imageData && dto.imageData.id && dto.id) {
      // Utiliser les URLs du backend si disponibles
      if (dto.imageUrl) {
        produit.imageUrl = dto.imageUrl.startsWith('/api/') ? `http://68.183.71.119:8080${dto.imageUrl}` : dto.imageUrl;
      } else {
        produit.imageUrl = this.getImageUrl(dto.id, dto.imageData.id);
      }
      
      if (dto.thumbnailUrl) {
        produit.thumbnailUrl = dto.thumbnailUrl.startsWith('/api/') ? `http://68.183.71.119:8080${dto.thumbnailUrl}` : dto.thumbnailUrl;
      } else {
        produit.thumbnailUrl = this.getThumbnailUrl(dto.id, dto.imageData.id);
      }
      
      console.log('âœ… URLs d\'images construites pour le produit', dto.id, ':', {
        imageUrl: produit.imageUrl,
        thumbnailUrl: produit.thumbnailUrl
      });
    } else {
      console.log('âš ï¸ Pas de donnÃ©es d\'image pour le produit', dto.id);
    }

    return produit;
  }
}



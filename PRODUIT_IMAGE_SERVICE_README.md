# Service Produit avec Gestion d'Images

Ce service Angular a été mis à jour pour gérer les images de produits de manière similaire à votre backend Spring Boot, sans utiliser de base64.

## 🚀 Fonctionnalités

- **Upload d'images** : Remplace l'ancienne image si elle existe (relation OneToOne)
- **Récupération d'images** : Via URLs directes ou blobs
- **Gestion des thumbnails** : Chargement optimisé des miniatures
- **Téléchargement** : Possibilité de télécharger les images
- **Gestion mémoire** : Nettoyage automatique des URLs blob
- **Lazy loading** : Chargement à la demande des images

## 📋 Endpoints Correspondants

Le service utilise exactement les mêmes endpoints que votre backend :

```typescript
// Upload d'image (remplace l'ancienne)
POST /api/produits/{produitId}/images

// Récupérer l'image d'un produit
GET /api/produits/{produitId}/images

// Récupérer l'image principale
GET /api/produits/{produitId}/images/primary

// Récupérer une image spécifique
GET /api/produits/{produitId}/images/{imageId}

// Récupérer la thumbnail
GET /api/produits/{produitId}/images/{imageId}/thumbnail

// Télécharger une image
GET /api/produits/{produitId}/images/{imageId}/download

// Supprimer une image
DELETE /api/produits/{produitId}/images/{imageId}
```

## 🔧 Utilisation de Base

### 1. Injection du Service

```typescript
import { ProduitService } from './services/produit.service';

constructor(private produitService: ProduitService) {}
```

### 2. Charger les Produits avec Images

```typescript
// Méthode simple - charge seulement les métadonnées
loadProduits(): void {
  this.produitService.getAllProduits().subscribe(produits => {
    this.produitService.loadImageMetadataForProducts(produits).subscribe(produitsWithImages => {
      this.produits = produitsWithImages;
    });
  });
}

// Méthode complète - charge aussi les URLs blob
loadProduitsWithBlobs(): void {
  this.produitService.getAllProduits().subscribe(produits => {
    this.produitService.loadPrimaryImagesForProducts(produits).subscribe(produitsWithImages => {
      this.produits = produitsWithImages;
    });
  });
}
```

### 3. Affichage dans le Template

```html
<!-- Image du produit -->
<img 
  *ngIf="produitService.getDisplayUrl(produit)" 
  [src]="produitService.getDisplayUrl(produit)" 
  [alt]="produit.article"
  (error)="onImageError($event)"
/>
```

### 4. Upload d'Image

```typescript
uploadImage(produitId: number, file: File, description?: string): void {
  this.produitService.uploadImage(produitId, file, description).subscribe({
    next: (imageData) => {
      console.log('Image uploadée:', imageData);
      // Mettre à jour le produit avec les nouvelles données d'image
    },
    error: (error) => console.error('Erreur upload:', error)
  });
}
```

## 🎯 Méthodes Principales

### Gestion des Images

```typescript
// Uploader une image
uploadImage(produitId: number, file: File, description?: string): Observable<ProduitImageDTO>

// Récupérer l'image d'un produit
getImageByProduit(produitId: number): Observable<ProduitImageDTO>

// Récupérer une image comme blob
getImage(produitId: number, imageId: number): Observable<Blob>

// Récupérer la thumbnail comme blob
getThumbnail(produitId: number, imageId: number): Observable<Blob>

// Télécharger une image
downloadImage(produitId: number, imageId: number): Observable<Blob>
```

### Méthodes Utilitaires

```typescript
// Obtenir l'URL d'affichage optimale (thumbnail si disponible, sinon image complète)
getDisplayUrl(produit: Produit): string | null

// Charger l'image blob pour un produit spécifique
loadImageBlobForProduct(produit: Produit): Observable<Produit>

// Nettoyer les URLs blob pour éviter les fuites mémoire
cleanupBlobUrls(produits: Produit[]): void
```

### Gestion des URLs

```typescript
// URLs directes vers les endpoints
getImageUrl(produitId: number, imageId: number): string
getThumbnailUrl(produitId: number, imageId: number): string
getDownloadUrl(produitId: number, imageId: number): string

// Conversion blob vers URL d'affichage
createBlobUrl(blob: Blob): string
revokeBlobUrl(url: string): void
```

## 🔄 Stratégies de Chargement

### 1. Chargement Immédiat (Recommandé pour listes courtes)

```typescript
// Charge tout d'un coup
this.produitService.loadPrimaryImagesForProducts(produits).subscribe(produitsWithImages => {
  this.produits = produitsWithImages;
});
```

### 2. Lazy Loading (Recommandé pour listes longues)

```typescript
// Charge d'abord les métadonnées
this.produitService.loadImageMetadataForProducts(produits).subscribe(produitsWithMetadata => {
  this.produits = produitsWithMetadata;
});

// Puis charge l'image blob quand nécessaire
onProductHover(produit: Produit): void {
  this.produitService.loadImageBlobForProduct(produit).subscribe();
}
```

### 3. Chargement à la Demande

```typescript
// Charge l'image seulement quand l'utilisateur clique
viewImage(produit: Produit): void {
  if (!produit._imageBlobUrl && produit.imageData?.id) {
    this.produitService.loadImageBlobForProduct(produit).subscribe();
  }
}
```

## 🧹 Gestion Mémoire

```typescript
// Toujours nettoyer les URLs blob lors de la destruction du composant
ngOnDestroy(): void {
  this.produitService.cleanupBlobUrls(this.produits);
}
```

## 🎨 Interface Produit

```typescript
interface Produit {
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
  
  // Images
  imageData?: ProduitImageDTO;           // Métadonnées de l'image
  images?: ProduitImageDTO[];            // Toutes les images
  imageUrl?: string;                     // URL directe vers l'image
  thumbnailUrl?: string;                 // URL directe vers la thumbnail
  
  // URLs blob pour l'affichage (gérées automatiquement)
  _imageBlobUrl?: string;                // URL blob de l'image
  _thumbnailBlobUrl?: string;            // URL blob de la thumbnail
  _loadingImage?: boolean;               // État de chargement
}
```

## 🐛 Gestion d'Erreurs

```typescript
// Gestion d'erreur dans le template
onImageError(event: any): void {
  console.warn('Erreur de chargement d\'image:', event);
  // Optionnel: essayer de charger l'image blob
  const produit = this.produits.find(p => this.getDisplayUrl(p) === event.target.src);
  if (produit) {
    this.produitService.loadImageBlobForProduct(produit).subscribe();
  }
}
```

## 📱 Exemple Complet

Voir le fichier `src/app/services/produit-image-usage-example.ts` pour un exemple complet d'utilisation avec un composant Angular.

## ⚡ Performance

- **URLs blob** : Chargées une seule fois et mises en cache
- **Lazy loading** : Images chargées à la demande
- **Nettoyage automatique** : Évite les fuites mémoire
- **Fallback** : Utilise les URLs directes si les blobs échouent
- **Thumbnails** : Chargement optimisé des miniatures

## 🔒 Sécurité

- Validation des types de fichiers côté backend
- Gestion des erreurs de chargement
- Nettoyage des URLs blob pour éviter les fuites
- CORS configuré pour localhost:4200 et localhost:8081



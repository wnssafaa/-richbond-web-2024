import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ProduitService, Produit } from '../../services/produit.service';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [   CommonModule,
      MatDialogModule,
      MatButtonModule,
      MatIcon,MatIcon],
  templateUrl: './produit-detail.component.html',
  styleUrl: './produit-detail.component.css'
})
export class ProduitDetailComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private produitService: ProduitService
  ) {}

  printFile(): void {
    window.print();
  }

  /**
   * Obtient l'URL de l'image d'un produit
   */
  getProductImageUrl(produit: Produit): string {
    // 1. Utiliser l'imageUrl directe si disponible
    if (produit.imageUrl) {
      // Si c'est une URL relative, ajouter le base URL
      if (produit.imageUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080${produit.imageUrl}`;
      }
      return produit.imageUrl;
    }

    // 2. Utiliser thumbnailUrl si disponible
    if (produit.thumbnailUrl) {
      if (produit.thumbnailUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080${produit.thumbnailUrl}`;
      }
      return produit.thumbnailUrl;
    }

    // 3. Utiliser imageData si disponible
    if (produit.imageData && produit.imageData.imageUrl) {
      if (produit.imageData.imageUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080${produit.imageData.imageUrl}`;
      }
      return produit.imageData.imageUrl;
    }

    // 4. Utiliser les images du tableau
    if (produit.images && produit.images.length > 0) {
      const primaryImage = produit.images.find(img => img.primary || img.isPrimary) || produit.images[0];
      if (primaryImage.imageUrl) {
        if (primaryImage.imageUrl.startsWith('/api/')) {
          return `http://68.183.71.119:8080${primaryImage.imageUrl}`;
        }
        return primaryImage.imageUrl;
      }
    }

    // 5. Fallback vers l'ancien système base64 si disponible
    if (produit.image && produit.image.startsWith('data:image')) {
      return produit.image;
    }

    // 6. Image par défaut
    return 'assets/logo.png';
  }

  /**
   * Charge l'image d'un produit depuis la base de données
   */
  private loadProductImage(produit: Produit): void {
    // Pour l'instant, on ne charge pas d'image depuis l'API car elle n'est pas encore disponible
    // Cette méthode sera utilisée quand l'API sera prête
    console.log('Chargement d\'image pour le produit', produit.id, '- API pas encore disponible');
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/logo.png';
    }
  }
}

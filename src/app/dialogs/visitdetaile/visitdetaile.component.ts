import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-visitdetaile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './visitdetaile.component.html',
  styleUrl: './visitdetaile.component.css'
})
export class VisitdetaileComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    // Debug: Afficher les données reçues
    console.log('🔍 Données reçues dans le dialogue:', this.data);
    console.log('🖼️ Images reçues:', this.data.images);
  }

  /**
   * Obtient l'URL de l'image en gérant les formats base64 et URL
   */
  getImageUrl(image: any): string {
    if (!image) {
      console.log('❌ Image vide ou null');
      return '';
    }
    
    console.log('🔍 Traitement de l\'image:', image);
    
    // Si c'est un objet avec une propriété imageData (base64)
    if (image.imageData) {
      console.log('✅ Image trouvée dans imageData');
      return image.imageData;
    }
    
    // Si c'est un objet avec une propriété imageUrl (base64)
    if (image.imageUrl) {
      console.log('✅ Image trouvée dans imageUrl');
      return image.imageUrl;
    }
    
    // Si c'est directement une chaîne base64
    if (typeof image === 'string' && image.startsWith('data:image')) {
      console.log('✅ Image trouvée comme chaîne base64');
      return image;
    }
    
    // Si c'est un chemin d'URL
    if (typeof image === 'string' && !image.startsWith('data:image')) {
      console.log('✅ Image trouvée comme URL');
      return image.startsWith('http') ? image : `http://68.183.71.119:8080/uploads/${image}`;
    }
    
    // Fallback pour les anciens formats
    if (image.url) {
      console.log('✅ Image trouvée dans url');
      return image.url;
    }
    
    console.log('❌ Aucun format d\'image reconnu');
    return '';
  }

  /**
   * Calcule la durée de la visite
   */
  getVisitDuration(): string {
    if (!this.data.heureArrivee || !this.data.heureDepart) {
      return 'Non disponible';
    }

    const arrivee = new Date(this.data.heureArrivee);
    const depart = new Date(this.data.heureDepart);
    const diffMs = depart.getTime() - arrivee.getTime();
    
    if (diffMs <= 0) return '0 min';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  /**
   * Détermine la classe CSS pour le niveau de stock
   */
  getStockLevelClass(): string {
    const stock = this.data.niveauStock;
    if (stock >= 80) return 'stock-high';
    if (stock >= 50) return 'stock-medium';
    if (stock >= 20) return 'stock-low';
    return 'stock-critical';
  }

  /**
   * Ouvre le dialogue d'image pour afficher une image en plein écran
   */
  openImageDialog(images: any[], selectedIndex: number = 0): void {
    // Dialogue d'images supprimé - fonctionnalité désactivée
    console.log('Images disponibles:', images);
    console.log('Index sélectionné:', selectedIndex);
  }

  /**
   * Imprime la fiche de visite
   */
  printFile(): void {
    window.print();
  }

  /**
   * Obtenir le nombre d'images disponibles
   */
  getImageCount(): number {
    return this.data.images?.length || 0;
  }

  /**
   * Vérifier s'il y a des images à afficher
   */
  hasImages(): boolean {
    return this.getImageCount() > 0;
  }

  /**
   * Gérer les erreurs de chargement d'images
   */
  onImageError(event: any): void {
    console.log('❌ Erreur de chargement d\'image:', event);
    event.target.style.display = 'none';
  }
}

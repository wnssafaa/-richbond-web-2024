import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProduitService, Produit } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AddProduitComponent } from '../../dialogs/add-produit/add-produit.component';

@Component({
  selector: 'app-produit-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIcon,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatDialogModule,
    TranslateModule,
    RouterLink,
    RouterModule
  ],
  templateUrl: './produit-detail-page.component.html',
  styleUrl: './produit-detail-page.component.css'
})
export class ProduitDetailPageComponent implements OnInit {
  produit: Produit | null = null;
  loading = true;
  error: string | null = null;
  menuOpen = false;
  currentLanguage = 'fr';
  
  // User info
  username: any;
  email: any;
  role: any;
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduit(id);
      } else {
        this.error = 'ID du produit non fourni';
        this.loading = false;
      }
    });
  }

  loadProduit(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        this.produit = produit;
        
        // Charger les métadonnées d'image si le produit n'en a pas encore
        if (produit.id && !produit.imageData) {
          this.produitService.getImageByProduit(produit.id).subscribe({
            next: (imageData) => {
              if (imageData && imageData.id && produit.id) {
                this.produit!.imageData = imageData;
                this.produit!.images = [imageData];
                this.produit!.imageUrl = this.produitService.getImageUrl(produit.id, imageData.id);
                this.produit!.thumbnailUrl = this.produitService.getThumbnailUrl(produit.id, imageData.id);
              }
            },
            error: (error) => {
              console.log('Aucune image trouvée pour le produit', id);
              // Pas d'erreur, le produit n'a simplement pas d'image
            }
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.error = 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/Produit']);
  }

  printPage(): void {
    window.print();
  }

  editProduit(): void {
    if (this.produit) {
      const dialogRef = this.dialog.open(AddProduitComponent, {
        width: '700px',
        data: { mode: 'edit', produit: this.produit }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.produitService.updateProduit(this.produit!.id!, result).subscribe({
            next: () => {
              this.snackBar.open('Produit modifié avec succès', 'Fermer', { duration: 3000 });
              this.loadProduit(this.produit!.id!);
            },
            error: () => {
              this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
            }
          });
        }
      });
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (data) => {
        this.username = data.username ?? '';
        this.role = data.role ?? '';
        this.email = data.email ?? '';
        this.nom = data.nom ?? '';
        this.prenom = data.prenom ?? '';
        this.telephone = data.telephone ?? '';
        this.status = data.status ?? '';
        this.imagePath = data.imagePath ?? '';
        // Gestion de l'avatar : base64 ou URL
        this.avatarUrl = data.imagePath
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://68.183.71.119:8080/api/api/uploads/' + data.imagePath)
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  /**
   * Obtient l'URL de l'image d'un produit
   */
  getProductImageUrl(produit: Produit): string {
    // 1. Utiliser l'imageUrl directe si disponible
    if (produit.imageUrl) {
      // Si c'est une URL relative, ajouter le base URL
      if (produit.imageUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080/api/api${produit.imageUrl}`;
      }
      return produit.imageUrl;
    }

    // 2. Utiliser thumbnailUrl si disponible
    if (produit.thumbnailUrl) {
      if (produit.thumbnailUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080/api/api${produit.thumbnailUrl}`;
      }
      return produit.thumbnailUrl;
    }

    // 3. Utiliser imageData si disponible
    if (produit.imageData && produit.imageData.imageUrl) {
      if (produit.imageData.imageUrl.startsWith('/api/')) {
        return `http://68.183.71.119:8080/api/api${produit.imageData.imageUrl}`;
      }
      return produit.imageData.imageUrl;
    }

    // 4. Utiliser les images du tableau
    if (produit.images && produit.images.length > 0) {
      const primaryImage = produit.images.find(img => img.primary || img.isPrimary) || produit.images[0];
      if (primaryImage.imageUrl) {
        if (primaryImage.imageUrl.startsWith('/api/')) {
          return `http://68.183.71.119:8080/api/api${primaryImage.imageUrl}`;
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

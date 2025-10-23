import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitService, VisitDTO } from '../../services/visit.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { ShareVisitEmailComponent } from '../../dialogs/share-visit-email/share-visit-email.component';

@Component({
  selector: 'app-visit-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './visit-detail-page.component.html',
  styleUrl: './visit-detail-page.component.css'
})
export class VisitDetailPageComponent implements OnInit {
  visit: VisitDTO | null = null;
  loading = true;
  error: string | null = null;
  imageUrls: Map<number, string> = new Map(); // Stocker les URLs des images
  thumbnailUrls: Map<number, string> = new Map(); // Stocker les URLs des thumbnails

  // Propriétés pour le header et sidebar
  menuOpen = false;
  currentLanguage = 'fr';
  username: any; email: any; role: any; nom: string | undefined; prenom: string | undefined;
  telephone: string | undefined; avatarUrl: string | undefined; imagePath: string | undefined;
  status: string | undefined;

  // Propriétés de permissions
  isConsultant: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private authService: AuthService,
    private permissionService: PermissionService,
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
        this.loadVisit(id);
      } else {
        this.error = 'ID visite non fourni';
        this.loading = false;
      }
    });
  }

  loadVisit(id: number): void {
    this.loading = true;
    this.error = null;
    
    // Essayer d'abord avec getVisitById
    this.visitService.getVisitById(id).subscribe({
      next: (visit) => {
        console.log('✅ Visite chargée via getVisitById:', visit);
        this.visit = visit;
        // Charger les images de la visite
        this.loadVisitImages(id);
        this.loading = false;
      },
      error: (error) => {
        console.warn('⚠️ Erreur avec getVisitById, essai avec getAllVisits:', error);
        // Fallback: récupérer toutes les visites et filtrer par ID
        this.visitService.getAllVisits().subscribe({
          next: (visits) => {
            console.log('📊 Toutes les visites chargées:', visits);
            const visit = visits.find(v => v.id === id);
            if (visit) {
              console.log('✅ Visite trouvée dans la liste:', visit);
              this.visit = visit;
              // Charger les images de la visite
              this.loadVisitImages(id);
              this.loading = false;
            } else {
              this.error = 'Visite non trouvée';
              this.loading = false;
            }
          },
          error: (fallbackError) => {
            console.error('❌ Erreur lors du chargement des visites:', fallbackError);
            this.error = 'Erreur lors du chargement de la visite';
            this.loading = false;
          }
        });
      }
    });
  }

  // ✅ Charger les images de la visite depuis le backend
  loadVisitImages(visitId: number): void {
    console.log(`🖼️ Chargement des images pour la visite ${visitId}...`);
    
    this.visitService.getVisitImages(visitId).subscribe({
      next: (images) => {
        console.log(`✅ ${images.length} image(s) récupérée(s):`, images);
        
        if (this.visit) {
          // Ajouter les images à la visite avec les URLs construites
          this.visit.images = images.map(img => {
            const imageUrl = this.visitService.getVisitImageUrl(visitId, img.id!);
            const thumbnailUrl = this.visitService.getVisitImageThumbnailUrl(visitId, img.id!);
            
            console.log(`🔗 URL Image ${img.id}:`, imageUrl);
            console.log(`🔗 URL Thumbnail ${img.id}:`, thumbnailUrl);
            
            return {
              ...img,
              imageUrl,
              thumbnailUrl
            };
          });
          
          console.log('📸 Images avec URLs:', this.visit.images);
          
          // Stocker les URLs dans les Maps pour un accès rapide
          images.forEach(img => {
            if (img.id) {
              this.imageUrls.set(img.id, this.visitService.getVisitImageUrl(visitId, img.id));
              this.thumbnailUrls.set(img.id, this.visitService.getVisitImageThumbnailUrl(visitId, img.id));
            }
          });
        }
      },
      error: (err) => {
        console.warn('⚠️ Erreur lors du chargement des images (peut être normal si pas d\'images):', err);
        // Ne pas afficher d'erreur si pas d'images, c'est normal
        if (this.visit) {
          this.visit.images = [];
        }
      }
    });
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
        this.avatarUrl = data.imagePath
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://68.183.71.119:8080/uploads/' + data.imagePath)
          : 'assets/default-avatar.png';
        
        // Initialiser les permissions
        this.initializePermissions();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  // Méthode pour initialiser les permissions
  private initializePermissions(): void {
    this.isConsultant = this.permissionService.isConsultant(this.role);
    this.canEdit = this.permissionService.canEdit(this.role);
    this.canDelete = this.permissionService.canDelete(this.role);
    this.canAdd = this.permissionService.canAdd(this.role);
  }

  goBack(): void {
    this.router.navigate(['/gestion-visites']);
  }

  printPage(): void {
    window.print();
  }

  shareByEmail(): void {
    if (!this.visit) {
      this.snackBar.open('Aucune visite à partager', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(ShareVisitEmailComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { visit: this.visit },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Rapport de visite partagé avec succès');
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
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

  logout(): void {
    this.authService.logout();
  }

  getMerchandiserImageUrl(): string {
    if (!this.visit?.planning?.merchandiser?.imagePath) {
      return '';
    }
    
    if (this.visit.planning.merchandiser.imagePath.startsWith('data:image')) {
      return this.visit.planning.merchandiser.imagePath;
    }
    
    if (this.visit.planning.merchandiser.imagePath.startsWith('http')) {
      return this.visit.planning.merchandiser.imagePath;
    }
    
    return 'data:image/jpeg;base64,' + this.visit.planning.merchandiser.imagePath;
  }

  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTMyIDIwQzM2LjQxODMgMjAgNDAgMjMuNTgxNyA0MCAyOEM0MCAzMi40MTgzIDM2LjQxODMgMzYgMzIgMzZDMjcuNTgxNyAzNiAyNCAzMi40MTgzIDI0IDI4QzI0IDIzLjU4MTcgMjcuNTgxNyAyMCAzMiAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMyIDQwQzI1LjM3MjYgNDAgMjAgNDUuMzcyNiAyMCA1MkgyNEMyNCA0Ny41ODI3IDI3LjU4MjcgNDQgMzIgNDRDMzYuNDE3MyA0NCA0MCA0Ny41ODI3IDQwIDUySDQ0QzQ0IDQ1LjM3MjYgMzguNjI3NCA0MCAzMiA0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR');
  }

  formatPrice(price: number): string {
    return `${price} MAD`;
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#757575';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminé':
        return '#4CAF50';
      case 'pending':
      case 'en cours':
        return '#FF9800';
      case 'cancelled':
      case 'annulé':
        return '#F44336';
      default:
        return '#757575';
    }
  }

  getStatusIcon(status: string | undefined): string {
    if (!status) return 'help';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminé':
        return 'check_circle';
      case 'pending':
      case 'en cours':
        return 'schedule';
      case 'cancelled':
      case 'annulé':
        return 'cancel';
      default:
        return 'help';
    }
  }

  calculateDuration(startTime: string | undefined, endTime: string | undefined): string {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs < 0) return 'N/A';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  openInMaps(): void {
    if (this.visit?.latitude && this.visit?.longitude) {
      const url = `https://www.google.com/maps?q=${this.visit.latitude},${this.visit.longitude}`;
      window.open(url, '_blank');
    }
  }

  // ✅ Obtenir l'URL de l'image (thumbnail pour affichage, URL complète pour modal)
  getImageUrl(image: any, useThumbnail: boolean = true): string {
    console.log('🖼️ getImageUrl appelé pour image:', image, 'useThumbnail:', useThumbnail);
    
    // Si l'image a un ID et qu'on a l'ID de la visite, construire l'URL
    if (image.id && this.visit?.id) {
      const url = useThumbnail 
        ? this.visitService.getVisitImageThumbnailUrl(this.visit.id, image.id)
        : this.visitService.getVisitImageUrl(this.visit.id, image.id);
      console.log('🔗 URL générée:', url);
      return url;
    }
    
    // Si l'image a une URL pré-construite, l'utiliser
    if (useThumbnail && image.thumbnailUrl) {
      console.log('🔗 URL thumbnail pré-construite:', image.thumbnailUrl);
      return image.thumbnailUrl;
    }
    if (!useThumbnail && image.imageUrl) {
      console.log('🔗 URL image pré-construite:', image.imageUrl);
      return image.imageUrl;
    }
    
    // Fallback: utiliser imageData si disponible (compatibilité base64)
    if (image.imageData) {
      console.log('🔗 Utilisation imageData base64');
      return image.imageData;
    }
    
    // Dernier fallback
    console.warn('⚠️ Aucune URL trouvée pour l\'image:', image);
    return '';
  }

  openImageModal(image: any): void {
    const imageUrl = this.getImageUrl(image, false); // Utiliser l'image complète, pas la thumbnail
    
    if (!imageUrl) {
      console.error('❌ Impossible d\'ouvrir l\'image: pas d\'URL disponible');
      return;
    }
    
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Image de la visite</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
              }
              img { 
                max-width: 100%; 
                max-height: 100%; 
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Image de la visite">
          </body>
        </html>
      `);
    }
  }

  onImageError(event: any): void {
    console.error('❌ Erreur de chargement d\'image:', event.target.src);
    
    // Essayer l'URL complète si la thumbnail échoue
    const currentSrc = event.target.src;
    if (currentSrc.includes('/thumbnail')) {
      const fullImageUrl = currentSrc.replace('/thumbnail', '');
      console.log('🔄 Tentative avec URL complète:', fullImageUrl);
      event.target.src = fullImageUrl;
    } else {
      // Essayer avec l'URL directe du fichier si disponible
      const imgElement = event.target;
      const imageData = imgElement.getAttribute('data-original-src');
      if (imageData && imageData !== '') {
        console.log('🔄 Tentative avec data-original-src:', imageData);
        event.target.src = imageData;
      } else {
        // Afficher une image par défaut avec plus d'informations
        const errorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDA0L3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iMjAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjEyIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD4KPHRleHQgeD0iNTAlIiB5PSI0MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTAiPkVycmV1ciBkZSBjaGFyZ2VtZW50PC90ZXh0Pgo8dGV4dCB4PSI1MCUiIHk9IjYwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSI4Ij5VUkw6IDwvdGV4dD4KPC9zdmc+';
        event.target.src = errorImage;
        console.log('❌ Toutes les tentatives ont échoué, affichage de l\'image d\'erreur');
      }
    }
  }

  onImageLoad(event: any): void {
    console.log('✅ Image chargée avec succès:', event.target.src);
  }

  onMerchandiseurImageError(event: any): void {
    event.target.src = this.getDefaultAvatar();
  }
}

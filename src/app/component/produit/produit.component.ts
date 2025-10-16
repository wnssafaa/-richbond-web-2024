import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProduitService, Produit, ProduitImageDTO } from '../../services/produit.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdduserComponent } from '../adduser/adduser.component';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import{ MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {  AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Region } from '../../enum/Region';
import { Role } from '../../enum/Role';
import { AddProduitComponent } from '../../dialogs/add-produit/add-produit.component';
import { MatDrawer } from '@angular/material/sidenav';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { ProduitDetailComponent } from '../../dialogs/produit-detail/produit-detail.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GenericImportDialogComponent } from '../../dialogs/generic-import-dialog/generic-import-dialog.component';
import { ImportConfigService } from '../../services/import-config.service';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [
    CommonModule, MatSortModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,TranslateModule,
    MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule, MatChipsModule,MatTooltipModule,
    MatSlideToggleModule, MatMenuModule, MatListModule, HttpClientModule,RouterLink,MatPaginatorModule,RouterModule,
    GenericImportDialogComponent
  ],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit, OnDestroy, AfterViewInit {
openUserDetails(_t288: any) {
throw new Error('Method not implemented.');
}
  username: any;
  email: any;
  role: any;
 
    exportToExcel(): void {
       this.exportService.exportProduits(this.dataSource.data, {
         filename: 'produits',
         sheetName: 'Produits'
       });
     }
    displayedColumns: string[] = [
      'marque', 'categorie', 'image',
      'article', 'dimensions', 'prix',
      'famille', 'sousMarques', 'codeEAN', 
      'actions'
    ];
    dataSource = new MatTableDataSource<Produit>();
    selection = new SelectionModel<Produit>(true, []);
    showFilters = false;
    menuOpen = false;
    searchText = '';
  
    // Configuration des filtres
    filters = {
      marque: '',
      reference: '',
      categorie: '',
      article: '',
      type: '',
      dimensions: '',
      famille: ''
    };
  
    // Options des filtres
    categories: string[] = ['Matelas', 'Sommier', 'Tête de lit'];
    dimensionsOptions: string[] = ['190×140', '190×160', '200×200'];
    types: string[] = ['Standard', 'Premium', 'Luxe'];
    marques: string[] = Object.values(MarqueProduit);
    familles: string[] = ['MATELAS', 'Oreiller', 'Couette', 'Linge'];
    articles: string[] = [];
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    
   currentLanguage = 'fr';
    constructor(
      private produitService: ProduitService,
      private snackBar: MatSnackBar,
      private dialog: MatDialog, 
      private athService:AuthService,
      private router: Router,
      private translate: TranslateService,
      private exportService: ExportService,
      private importConfigService: ImportConfigService
    ) {
          this.translate.setDefaultLang('fr');
  this.translate.use('fr');
    }
 @ViewChild(MatDrawer) drawer!: MatDrawer;
  onToggleDashboard(event: any): void {
  if (event.checked) {
    this.router.navigate(['/Dashbord']);
  }}
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
        nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;
 loadCurrentUser(): void {
  this.athService.getCurrentUserInfo().subscribe({
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
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
        : 'assets/profil.webp';
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
}
    changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
    toggleDrawer(action: 'open' | 'close') {
      if (action === 'open') {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
    ngOnInit(): void {
      this.loadProduits();
      this.setupCustomFilter();
      this.loadCurrentUser();
    }
  
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  
  
   // Méthode pour la sélection/désélection de toutes les lignes
   masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  // Vérifie si toutes les lignes sont sélectionnées
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
// Ajouter cette nouvelle propriété
dataSourceFilter = {
  searchText: '',
  filters: {
    marque: '',
    reference: '',
    categorie: '',
    article: '',
    type: '',
    dimensions: '',
    famille: ''
  }
};

private setupCustomFilter(): void {
  this.dataSource.filterPredicate = (data: Produit, filter: string) => {
    const filterObj = JSON.parse(filter);
    const searchText = filterObj.searchText ? filterObj.searchText.toLowerCase() : '';
    
    // Recherche globale dans toutes les colonnes
    let matchesSearch = false;
    if (searchText) {
      matchesSearch = 
        (data.marque?.toLowerCase().includes(searchText)) ||
        (data.reference?.toLowerCase().includes(searchText)) ||
        (data.categorie?.toLowerCase().includes(searchText)) ||
        (data.article?.toLowerCase().includes(searchText)) ||
        (data.type?.toLowerCase().includes(searchText)) ||
        (data.dimensions?.toLowerCase().includes(searchText)) ||
        (data.famille?.toLowerCase().includes(searchText)) ||
        (data.sousMarques?.toLowerCase().includes(searchText)) ||
        (data.codeEAN?.toLowerCase().includes(searchText)) ||
        (data.designationArticle?.toLowerCase().includes(searchText));
    } else {
      matchesSearch = true;
    }

    // Filtres individuels
    const matchesMarque = filterObj.filters.marque ? 
      data.marque?.toLowerCase().includes(filterObj.filters.marque.toLowerCase()) : true;
    const matchesCategorie = filterObj.filters.categorie ? 
      data.categorie?.toLowerCase().includes(filterObj.filters.categorie.toLowerCase()) : true;
    const matchesArticle = filterObj.filters.article ? 
      data.article?.toLowerCase().includes(filterObj.filters.article.toLowerCase()) : true;
    const matchesType = filterObj.filters.type ? 
      data.type?.toLowerCase().includes(filterObj.filters.type.toLowerCase()) : true;
    const matchesDimensions = filterObj.filters.dimensions ? 
      data.dimensions?.toLowerCase().includes(filterObj.filters.dimensions.toLowerCase()) : true;
    const matchesFamille = filterObj.filters.famille ? 
      data.famille?.toLowerCase().includes(filterObj.filters.famille.toLowerCase()) : true;

    return matchesSearch && 
           matchesMarque && 
           matchesCategorie && 
           matchesArticle && 
           matchesType && 
           matchesDimensions &&
           matchesFamille;
  };
}
  // Filtrer les superviseurs
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
applyFilters(): void {
  // Mettre à jour les valeurs de filtre
  this.dataSourceFilter.searchText = this.searchText;
  this.dataSourceFilter.filters = { ...this.filters };
  
  this.dataSource.filter = JSON.stringify(this.dataSourceFilter);
}

resetFilters(): void {
  this.filters = {
    marque: '',
    reference: '',
    categorie: '',
    article: '',
    type: '',
    dimensions: '',
    famille: ''
  };
  this.searchText = '';
  this.applyFilters();
}
  
    loadProduits(): void {
      // Debug des images avant de charger les produits
      this.produitService.debugProductImages();
      
      // Test avec les données brutes
      this.produitService.testGetAllProduits().subscribe({
        next: (rawData: any) => {
          console.log('🔍 DONNÉES BRUTES DE L\'API:', rawData);
          console.log('🔍 TYPE DE DONNÉES:', typeof rawData);
          console.log('🔍 EST UN TABLEAU?', Array.isArray(rawData));
        },
        error: (error) => {
          console.error('❌ Erreur test données brutes:', error);
        }
      });

      this.produitService.getAllProduits().subscribe({
        next: (produits: Produit[]) => {
          console.log('📦 Produits reçus de l\'API:', produits);
          console.log('🔍 Premier produit détaillé:', produits[0]);
          
          this.dataSource.data = produits;
          // Charger les articles uniques pour le filtre
          this.articles = [...new Set(produits.map(p => p.article).filter(article => article))];
          
          // Charger les images pour tous les produits en parallèle
          this.loadImagesForAllProducts(produits);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des produits:', error);
          this.snackBar.open("Erreur lors du chargement des produits.", 'Fermer', { duration: 3000 });
        }
      });
    }

    /**
     * Charge les images pour tous les produits
     */
    private loadImagesForAllProducts(produits: Produit[]): void {
      console.log('🔄 Chargement des métadonnées d\'images pour', produits.length, 'produits');
      
      // Charger d'abord les métadonnées des images
      this.produitService.loadImageMetadataForProducts(produits).subscribe({
        next: (produitsWithMetadata) => {
          console.log('✅ Métadonnées d\'images chargées pour', produitsWithMetadata.length, 'produits');
          this.dataSource.data = produitsWithMetadata;
          
          // Optionnel: Charger les blobs pour les premiers produits visibles
          // (pour optimiser les performances)
          this.loadBlobsForVisibleProducts(produitsWithMetadata);
        },
        error: (error) => {
          console.warn('⚠️ Erreur lors du chargement des métadonnées d\'images:', error);
          // Continuer sans les images
          this.dataSource.data = produits;
        }
      });
    }

    /**
     * Charge les blobs pour les produits visibles (optimisation)
     */
    private loadBlobsForVisibleProducts(produits: Produit[]): void {
      // Charger les thumbnails pour les premiers produits (lazy loading)
      const visibleProducts = produits.slice(0, 10); // Premiers 10 produits
      
      visibleProducts.forEach(produit => {
        if (produit.imageData?.id && produit.id) {
          this.produitService.loadThumbnailBlobForProduct(produit).subscribe({
            next: () => {
              console.log('✅ Thumbnail blob chargée pour le produit:', produit.id);
            },
            error: (error) => {
              console.warn('❌ Erreur lors du chargement de la thumbnail blob pour le produit:', produit.id, error);
            }
          });
        }
      });
    }

 
      ajouterProduit(): void {
        const dialogRef = this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'add' }
        });
    
    // ✅ Recharger la liste automatiquement après fermeture du dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Le produit est déjà créé dans AddProduitComponent
        // On recharge juste la liste pour afficher le nouveau produit
        console.log('🔄 Rechargement de la liste après ajout de produit');
        this.loadProduits();
      }
    });
      }
    
      viewProduit(produit: Produit): void {
        this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'view', produit }
        });
      }
    
      editProduit(produit: Produit): void {
        const dialogRef = this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'edit', produit }
        });
    
        // ✅ Recharger la liste automatiquement après fermeture du dialog
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Le produit est déjà modifié dans AddProduitComponent
            // On recharge juste la liste pour afficher les modifications
            console.log('🔄 Rechargement de la liste après modification de produit');
            this.loadProduits();
          }
        });
      }

      deleteProduit(produit: Produit): void {
        if (!produit.id) {
          console.error('Produit sans ID:', produit);
          return;
        }
      
        if (confirm(`Supprimer le produit "${produit.article}" ?`)) {
          this.produitService.deleteProduit(produit.id).subscribe({
            next: () => {
              this.snackBar.open('Produit supprimé', 'Fermer', { duration: 2000 });
              this.loadProduits();
            },
            error: (err) => {
              console.error('Erreur de suppression:', err);
              this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
            }
          });
        }
      }
deleteSuperviseur(produitid: number): void {
  const confirmation = window.confirm("Voulez-vous vraiment supprimer ce magasin ?");

  if (confirmation) {
    this.produitService.deleteProduit(produitid).subscribe(
      () => {
        this.snackBar.open('produit supprimé avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadProduits();
      },
      error => {
        console.error('Erreur de suppression', error);
        this.snackBar.open("Erreur lors de la suppression", "Fermer", {
          duration: 3000
        });
      }
    );
  }
}
 logout(): void {
        this.athService.logout();
      }
      openLogoutDialog(): void {
                    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
                    width: '700px',
                  });
            
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  // Si l'utilisateur confirme, rediriger vers la page de login
                  this.logout();
                }
              });
            }
              openPtoduitDetails(produit: Produit): void {
              this.router.navigate(['/produit-detail', produit.id]);
            }
onRowClick(event: MouseEvent, row: Produit): void {
  const target = event.target as HTMLElement;
  
  // Vérifie spécifiquement les boutons edit/delete via leurs classes
  const isEditOrDelete = target.closest('.edit-button') || 
                        target.closest('.delete-button') ||
                        target.closest('mat-icon')?.parentElement?.classList.contains('edit-button') ||
                        target.closest('mat-icon')?.parentElement?.classList.contains('delete-button');

  if (isEditOrDelete) {
    return;
  }

  // Navigation vers la page de détail au lieu du dialog
  this.router.navigate(['/produit-detail', row.id]);
}
 userMenuOpen = false;

  /**
   * Obtient l'URL d'affichage optimale pour un produit
   * Utilise les URLs d'images du backend directement
   */
  getProductImageUrl(produit: Produit): string {
    // Debug réduit - seulement si nécessaire
    if (!produit.imageUrl && !produit.thumbnailUrl && !produit.imageData) {
      console.log('🔍 Debug getProductImageUrl pour produit:', produit.id, produit.article);
    }
    
    // Debug spécial pour les URLs relatives
    if (produit.imageUrl && produit.imageUrl.startsWith('/api/')) {
      const fullUrl = `http://localhost:8080${produit.imageUrl}`;
      console.log('🔗 URL relative détectée, conversion en absolue:', fullUrl);
      return fullUrl;
    }

    // 1. Utiliser l'URL blob de la thumbnail si disponible (priorité)
    if (produit._thumbnailBlobUrl) {
      return produit._thumbnailBlobUrl;
    }

    // 2. Utiliser l'URL blob de l'image complète si disponible
    if (produit._imageBlobUrl) {
      return produit._imageBlobUrl;
    }

    // 3. Utiliser l'URL directe de l'image principale (priorité sur thumbnail)
    if (produit.imageUrl) {
      if (produit.imageUrl.startsWith('/api/')) {
        const fullUrl = `http://localhost:8080${produit.imageUrl}`;
        return fullUrl;
      }
      return produit.imageUrl;
    }

    // 4. Utiliser l'URL directe de la thumbnail si disponible (fallback)
    if (produit.thumbnailUrl) {
      if (produit.thumbnailUrl.startsWith('/api/')) {
        const fullUrl = `http://localhost:8080${produit.thumbnailUrl}`;
        return fullUrl;
      }
      return produit.thumbnailUrl;
    }

    // 5. Si on a des métadonnées d'image mais pas d'URL, construire l'URL
    if (produit.imageData?.id && produit.id) {
      const imageUrl = `http://localhost:8080/api/produits/${produit.id}/images/${produit.imageData.id}`;
      return imageUrl;
    }

    // 6. Si on a des images dans le tableau, utiliser la première
    if (produit.images && produit.images.length > 0 && produit.id) {
      const firstImage = produit.images[0];
      if (firstImage.id) {
        const imageUrl = `http://localhost:8080/api/produits/${produit.id}/images/${firstImage.id}`;
        return imageUrl;
      }
    }

    // 7. Si pas de blob URL mais qu'il y a des métadonnées d'image, charger la thumbnail
    if (produit.imageData?.id && produit.id && !produit._loadingImage) {
      this.produitService.loadThumbnailBlobForProduct(produit).subscribe({
        next: () => {
          // Le composant se mettra à jour automatiquement grâce au binding
        },
        error: (error) => {
          console.warn('❌ Erreur lors du chargement de la thumbnail blob:', error);
        }
      });
    }

    // 8. Image par défaut
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
  // onImageError(event: any): void {
  //   console.log('❌ Erreur de chargement d\'image, utilisation du logo par défaut');
  //   event.target.src = 'assets/logo.png';
  // }

  /**
   * Obtient l'URL de la thumbnail d'un produit
   */
  getProductThumbnailUrl(produit: Produit): string {
    // 1. Utiliser thumbnailUrl directe si disponible
    if (produit.thumbnailUrl) {
      if (produit.thumbnailUrl.startsWith('/api/')) {
        return `http://localhost:8080${produit.thumbnailUrl}`;
      }
      return produit.thumbnailUrl;
    }

    // 2. Utiliser imageData.thumbnailUrl si disponible
    if (produit.imageData && produit.imageData.thumbnailUrl) {
      if (produit.imageData.thumbnailUrl.startsWith('/api/')) {
        return `http://localhost:8080${produit.imageData.thumbnailUrl}`;
      }
      return produit.imageData.thumbnailUrl;
    }

    // 3. Utiliser les images du tableau
    if (produit.images && produit.images.length > 0) {
      const primaryImage = produit.images.find(img => img.primary || img.isPrimary) || produit.images[0];
      if (primaryImage.thumbnailUrl) {
        if (primaryImage.thumbnailUrl.startsWith('/api/')) {
          return `http://localhost:8080${primaryImage.thumbnailUrl}`;
        }
        return primaryImage.thumbnailUrl;
      }
    }

    // 4. Fallback vers l'image normale
    return this.getProductImageUrl(produit);
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.warn('❌ Erreur de chargement d\'image pour l\'URL:', target.src);
      
      // Essayer de charger l'image blob si l'URL directe a échoué
      const produit = this.dataSource.data.find(p => 
        p.imageUrl === target.src || 
        p.thumbnailUrl === target.src ||
        (p.imageData?.imageUrl && target.src.includes(p.imageData.imageUrl!))
      );
      
      if (produit && produit.id && produit.imageData?.id && !produit._loadingImage) {
        console.log('🔄 Tentative de chargement de l\'image blob pour le produit:', produit.id);
        
        // Essayer de charger la thumbnail blob
        this.produitService.loadThumbnailBlobForProduct(produit).subscribe({
          next: () => {
            console.log('✅ Image blob chargée avec succès pour le produit:', produit.id);
            // L'image se mettra à jour automatiquement grâce au binding
          },
          error: (error) => {
            console.warn('❌ Échec du chargement de l\'image blob pour le produit:', produit.id, error);
            // Fallback vers l'image par défaut
            target.src = 'assets/logo.png';
          }
        });
      } else {
        // Fallback direct vers l'image par défaut
        target.src = 'assets/logo.png';
      }
    }
  }

  /**
   * Nettoyage lors de la destruction du composant
   */
  ngOnDestroy(): void {
    // Nettoyer les URLs blob pour éviter les fuites mémoire
    if (this.dataSource.data && this.dataSource.data.length > 0) {
      this.produitService.cleanupBlobUrls(this.dataSource.data);
    }
  }

  openImportDialog(): void {
    const config = this.importConfigService.getProduitImportConfig();
    const dialogRef = this.dialog.open(GenericImportDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { config }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadProduits();
        this.snackBar.open(
          `${result.count} produits importés avec succès`,
          'Fermer',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );
      }
    });
  }
}
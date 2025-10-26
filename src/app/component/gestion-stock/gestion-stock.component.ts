import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { StockService, StockMagasinDTO, StockStatistiquesDTO, HistoriqueStockDTO, RapportStockDTO } from '../../services/stock.service';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { ProduitService, Produit } from '../../services/produit.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { Region } from '../../enum/Region';

@Component({
  selector: 'app-gestion-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatSortModule,
    MatSidenavModule,
    MatCardModule,
    FormsModule,
    MatDialogModule,
    TranslateModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatListModule,
    RouterLink,
    HttpClientModule,
    MatPaginatorModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ColumnCustomizationPanelComponent
  ],
  templateUrl: './gestion-stock.component.html',
  styleUrls: ['./gestion-stock.component.css']
})
export class GestionStockComponent implements OnInit, AfterViewInit {
  // ========== PROPRIÉTÉS DU TABLEAU ==========
  displayedColumns: string[] = [
    'id',
    'produitNom',
    'magasinNom',
    'quantite',
    'seuilMin',
    'seuilMax',
    'dateMiseAJour',
    'enRupture',
    'stockBas',
    'enPromotion',
    'prixPromotionnel',
    'actions'
  ];

  // Configuration des colonnes pour la personnalisation
  columnConfig = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'produitNom', label: 'Produit', visible: true },
    { key: 'magasinNom', label: 'Magasin', visible: true },
    { key: 'quantite', label: 'Quantité', visible: true },
    { key: 'seuilMin', label: 'Seuil Min', visible: true },
    { key: 'seuilMax', label: 'Seuil Max', visible: true },
    { key: 'dateMiseAJour', label: 'Dernière MAJ', visible: true },
    { key: 'enRupture', label: 'Rupture', visible: true },
    { key: 'stockBas', label: 'Stock Bas', visible: true },
    { key: 'enPromotion', label: 'Promotion', visible: true },
    { key: 'prixPromotionnel', label: 'Prix Promo', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  dataSource = new MatTableDataSource<StockMagasinDTO>([]);
  allStocks: StockMagasinDTO[] = [];
  isLoading = false;
  isColumnCustomizationOpen: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ========== FILTRES ==========
  showFilters = false;
  searchText = '';
  
  // Filtres de sélection
  selectedMagasinId: number | null = null;
  selectedProduitId: number | null = null;
  selectedStatut: string | null = null;
  selectedPromotion: boolean | null = null;
  filterStatus: 'all' | 'rupture' | 'bas' | 'promotion' = 'all';
  selectedDateRange: { start: Date | null, end: Date | null } = { start: null, end: null };

  // Options pour les filtres
  magasins: Magasin[] = [];
  produits: Produit[] = [];
  magasinsOptions: { value: number, label: string }[] = [];
  produitsOptions: { value: number, label: string }[] = [];
  statutOptions = [
    { value: null, label: 'Tous les statuts' },
    { value: 'normal', label: 'Stock Normal' },
    { value: 'bas', label: 'Stock Bas' },
    { value: 'rupture', label: 'En Rupture' }
  ];

  promotionOptions = [
    { value: null, label: 'Toutes les promotions' },
    { value: true, label: 'En Promotion' },
    { value: false, label: 'Pas en Promotion' }
  ];

  // ========== STATISTIQUES ==========
  statistiquesGlobales: StockStatistiquesDTO | null = null;
  totalStockGlobal = 0;
  totalProduits = 0;
  totalRuptures = 0;
  totalPromotions = 0;

  // ========== PROPRIÉTÉS UI ==========
  menuOpen = false;
  currentLanguage = 'fr';
  username: any;
  role: any;
  email: any;
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  status!: string;
  imagePath: string | undefined;
  avatarUrl: string | undefined;

  @ViewChild(MatDrawer) drawer!: MatDrawer;

  constructor(
    private stockService: StockService,
    private magasinService: MagasinService,
    private produitService: ProduitService,
    private merchendiseurService: MerchendiseurService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
    private exportService: ExportService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadMagasins();
    this.loadProduits();
    this.loadStocks();
    this.loadMagasinsOptions();
    this.loadProduitsOptions();
    this.loadStatistiquesGlobales();
    this.updateDisplayedColumns();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ========== CHARGEMENT DES DONNÉES ==========
  loadStocks(): void {
    this.isLoading = true;
    this.stockService.getAllStocks().subscribe({
      next: (stocks) => {
        this.allStocks = stocks;
        this.dataSource.data = stocks;
        this.isLoading = false;
        this.calculateGlobalStats();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stocks:', err);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des stocks', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadMagasinsOptions(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (magasins: Magasin[]) => {
        this.magasinsOptions = magasins.map(magasin => ({
          value: magasin.id!,
          label: `${magasin.nom} - ${magasin.ville}`
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des magasins:', err);
      }
    });
  }

  loadProduitsOptions(): void {
    // Cette méthode devrait charger les produits depuis un service de produits
    // Pour l'instant, on utilise les produits des stocks existants
    this.produitsOptions = this.allStocks
      .filter((stock, index, self) => 
        index === self.findIndex(s => s.produit?.id === stock.produit?.id)
      )
      .map(stock => ({
        value: stock.produit?.id!,
        label: `${stock.produit?.marque} - ${stock.produit?.categorie}`
      }));
  }

  loadStatistiquesGlobales(): void {
    this.stockService.getStockTotalGlobal().subscribe({
      next: (total) => {
        this.totalStockGlobal = total;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques globales:', err);
      }
    });
  }

  // ========== CALCULS ET STATISTIQUES ==========
  calculateGlobalStats(): void {
    this.totalProduits = this.allStocks.length;
    this.totalRuptures = this.allStocks.filter(stock => stock.quantite <= 0).length;
    this.totalPromotions = this.allStocks.filter(stock => stock.enPromotion).length;
  }

  getStockStatus(stock: StockMagasinDTO): string {
    if (stock.quantite <= 0) return 'rupture';
    if (stock.quantite <= stock.seuilMinimum) return 'bas';
    return 'normal';
  }

  getStockStatusColor(stock: StockMagasinDTO): string {
    const status = this.getStockStatus(stock);
    switch (status) {
      case 'rupture': return '#f44336';
      case 'bas': return '#ff9800';
      case 'normal': return '#4caf50';
      default: return '#6c757d';
    }
  }

  getStockStatusText(stock: StockMagasinDTO): string {
    const status = this.getStockStatus(stock);
    switch (status) {
      case 'rupture': return 'En Rupture';
      case 'bas': return 'Stock Bas';
      case 'normal': return 'Stock Normal';
      default: return 'Inconnu';
    }
  }

  // ========== FILTRES ==========
  onSearchChange(): void {
    this.applyAllFilters();
  }

  applyAllFilters(): void {
    let filtered = [...this.allStocks];

     // Filtre par recherche textuelle
     if (this.searchText && this.searchText.trim()) {
       const searchTerm = this.searchText.toLowerCase().trim();
       filtered = filtered.filter(stock => 
         stock.id?.toString().includes(searchTerm) ||
         stock.produit?.marque?.toLowerCase().includes(searchTerm) ||
         stock.produit?.categorie?.toLowerCase().includes(searchTerm) ||
         stock.magasin?.nom?.toLowerCase().includes(searchTerm) ||
         stock.quantite?.toString().includes(searchTerm) ||
         stock.prixUnitaire?.toString().includes(searchTerm)
       );
     }

    // Filtre par magasin
    if (this.selectedMagasinId) {
      filtered = filtered.filter(stock => stock.magasinId === this.selectedMagasinId);
    }

    // Filtre par produit
    if (this.selectedProduitId) {
      filtered = filtered.filter(stock => stock.produitId === this.selectedProduitId);
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter(stock => this.getStockStatus(stock) === this.selectedStatut);
    }

    // Filtre par promotion
    if (this.selectedPromotion !== null) {
      filtered = filtered.filter(stock => stock.enPromotion === this.selectedPromotion);
    }

    // Filtre par plage de dates
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      const startDate = new Date(this.selectedDateRange.start);
      const endDate = new Date(this.selectedDateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(stock => {
        const stockDate = new Date(stock.dateDerniereMiseAJour);
        return stockDate >= startDate && stockDate <= endDate;
      });
    }

    this.dataSource.data = filtered;
  }

  resetFilters(): void {
    this.selectedMagasinId = null;
    this.selectedProduitId = null;
    this.selectedStatut = null;
    this.selectedPromotion = null;
    this.filterStatus = 'all';
    this.selectedDateRange = { start: null, end: null };
    this.searchText = '';
    this.dataSource.data = [...this.allStocks];
  }

  // ========== ACTIONS ==========
  exportToExcel(): void {
    this.exportService.exportToCSV(this.dataSource.data, 'stocks');
    this.snackBar.open('Fichier CSV téléchargé', 'Fermer', { duration: 3000 });
  }

  editStock(stock: StockMagasinDTO): void {
    // TODO: Implémenter l'édition du stock
    this.snackBar.open('Édition du stock à implémenter', 'Fermer', {
      duration: 3000,
    });
  }

  viewStock(stock: StockMagasinDTO): void {
    // TODO: Implémenter la vue détaillée du stock
    this.snackBar.open('Vue détaillée à implémenter', 'Fermer', {
      duration: 3000,
    });
  }

  openDialog(): void {
    // TODO: Implémenter le dialog d'ajout de stock
    this.snackBar.open('Ajout de stock à implémenter', 'Fermer', {
      duration: 3000,
    });
  }

  onRowClick(event: MouseEvent, row: any): void {
    // TODO: Implémenter l'action de clic sur une ligne
    console.log('Clic sur la ligne:', row);
  }

  // ========== MÉTHODES DE FILTRAGE ==========
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    // Appliquer tous les filtres
    let filteredData = [...this.allStocks];

     // Filtre par texte de recherche
     if (this.searchText) {
       filteredData = filteredData.filter(stock => 
         (stock.produit?.marque || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
         (stock.magasin?.nom || '').toLowerCase().includes(this.searchText.toLowerCase())
       );
     }

    // Filtre par magasin
    if (this.selectedMagasinId) {
      filteredData = filteredData.filter(stock => stock.magasinId === this.selectedMagasinId);
    }

    // Filtre par produit
    if (this.selectedProduitId) {
      filteredData = filteredData.filter(stock => stock.produitId === this.selectedProduitId);
    }

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      if (this.filterStatus === 'rupture') {
        filteredData = filteredData.filter(stock => stock.quantite <= 0);
      } else if (this.filterStatus === 'bas') {
        filteredData = filteredData.filter(stock => stock.quantite <= stock.seuilMinimum);
      } else if (this.filterStatus === 'promotion') {
        filteredData = filteredData.filter(stock => stock.enPromotion);
      }
    }

    // Filtre par date
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      filteredData = filteredData.filter(stock => {
        const stockDate = new Date(stock.dateDerniereMiseAJour);
        return stockDate >= this.selectedDateRange.start! && stockDate <= this.selectedDateRange.end!;
      });
    }

    this.dataSource.data = filteredData;
  }

  deleteStock(stock: StockMagasinDTO): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      this.stockService.deleteStock(stock.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(s => s.id !== stock.id);
          this.allStocks = this.allStocks.filter(s => s.id !== stock.id);
          this.snackBar.open('Stock supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // ========== RAPPORTS ==========
  generateRapportHebdomadaire(magasinId: number): void {
    this.stockService.genererRapportHebdomadaire(magasinId).subscribe({
      next: (rapport) => {
        console.log('Rapport hebdomadaire:', rapport);
        this.snackBar.open('Rapport hebdomadaire généré', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport:', err);
        this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  generateRapportMensuel(magasinId: number): void {
    this.stockService.genererRapportMensuel(magasinId).subscribe({
      next: (rapport) => {
        console.log('Rapport mensuel:', rapport);
        this.snackBar.open('Rapport mensuel généré', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport:', err);
        this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ========== PERSONNALISATION DES COLONNES ==========
  updateDisplayedColumns(): void {
    this.displayedColumns = this.columnConfig
      .filter(col => col.visible)
      .map(col => col.key);
  }

  toggleColumnVisibility(columnKey: string): void {
    const column = this.columnConfig.find(col => col.key === columnKey);
    if (column) {
      column.visible = !column.visible;
      this.updateDisplayedColumns();
    }
  }

  openColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = true;
  }

  closeColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = false;
  }

  onColumnCustomizationSave(columnConfig: any[]): void {
    this.columnConfig = columnConfig;
    this.updateDisplayedColumns();
  }

  // ========== IMPORT ==========
  openImportDialog(): void {
    // TODO: Implémenter le dialog d'importation pour les stocks
    this.snackBar.open('Fonctionnalité d\'importation à venir', 'Fermer', {
      duration: 3000,
    });
  }

  // ========== UTILISATEUR ==========
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
          ? data.imagePath.startsWith('data:image')
            ? data.imagePath
            : 'http://68.183.71.119:8080/api/api/uploads/' + data.imagePath
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  loadMagasins(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (data: Magasin[]) => {
        this.magasins = data;
        this.magasinsOptions = data.map((magasin: Magasin) => ({
          value: magasin.id!,
          label: magasin.nom
        }));
      },
      error: (err: any) => console.error('Error loading magasins:', err),
    });
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (data: Produit[]) => {
        this.produits = data;
        this.produitsOptions = data.map((produit: Produit) => ({
          value: produit.id!,
          label: produit.marque
        }));
      },
      error: (err: any) => console.error('Error loading produits:', err),
    });
  }

  // ========== NAVIGATION ==========
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

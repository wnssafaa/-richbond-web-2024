import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlanificationService } from '../../services/planification.service';
import { VisitDTO, VisitService } from '../../services/visit.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddVisitComponent } from '../add-visit/add-visit.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { PermissionService } from '../../services/permission.service';
import { PermissionDirectivesModule } from '../../directives/permission-directives.module';
import { Inject } from '@angular/core';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { Region } from '../../enum/Region';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AfterViewInit, OnInit } from '@angular/core';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';

// import { VisitDetailDialogComponent } from '../../dialogs/visit-detail-dialog/visit-detail-dialog.component';


export interface Visit {
  id: number;
  heureArrivee: string;
  heureDepart: string;
  nombreFacings: number;
  nombreFacingsTotal: number;
  prixNormal: number;
  prixPromotionnel: number;
  niveauStock: number;
  nouveauteConcurrente: string;
  prixNouveaute: number;
  latitude: number;
  longitude: number;
  photoPrise: boolean;
  images: any[]; // Array of images (base64 or URLs)
  produits?: any[]; // Array of visited products
  planning?: any; // Planning information
  planningId: number;
}
@Component({
  selector: 'app-gestion-visites',
  standalone: true,
  providers: [TranslateService],
  imports: [
    CommonModule, MatSortModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,
    MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, TranslateModule,
    MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule,
    MatChipsModule, MatSlideToggleModule, MatMenuModule, MatListModule, RouterLink, HttpClientModule,
    MatPaginatorModule, RouterModule, MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule,
    MatTooltipModule, ColumnCustomizationPanelComponent, PermissionDirectivesModule
  ],
  templateUrl: './gestion-visites.component.html',
  styleUrls: ['./gestion-visites.component.css']
})


export class GestionVisitesComponent implements OnInit, AfterViewInit {
// deleteVisit(_t216: any) {
// throw new Error('Method not implemented.');
// }
editVisit(visit: VisitDTO) {
  const dialogRef = this.dialog.open(AddVisitComponent, {
    width: '700px',
    data: { visit } // On passe la visite à éditer
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Mettre à jour la visite dans le tableau localement
      const index = this.dataSource.data.findIndex(v => v.id === result.id);
      if (index !== -1) {
        this.dataSource.data[index] = result;
        this.dataSource._updateChangeSubscription(); // Rafraîchir le tableau
      }
    }
  });
}
  displayedColumns: string[] = [
    'id',
    'heureArrivee',
    'heureDepart',
    'nombreFacings',
    'produitsVisites',
    'prixNormal',
    'merchandiser',
    'magasin',
    'images',
    'actions'
  ];

  // Configuration des colonnes pour la personnalisation
  columnConfig = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'heureArrivee', label: 'Heure d\'arrivée', visible: true },
    { key: 'heureDepart', label: 'Heure de départ', visible: true },
    { key: 'nombreFacings', label: 'Total Facings', visible: true },
    { key: 'produitsVisites', label: 'Produits visités', visible: true },
    { key: 'prixNormal', label: 'Prix normal', visible: true },
    { key: 'merchandiser', label: 'Merchandiseur', visible: true },
    { key: 'magasin', label: 'Magasin', visible: true },
    { key: 'images', label: 'Images', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  dataSource = new MatTableDataSource<VisitDTO>([]);
  isLoading = false;
  isColumnCustomizationOpen: boolean = false;
  
  // Filtres de recherche
  showFilters = false;
  searchText = '';
  generalSearch = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  stockLevelFilter = '';
  photoTakenFilter = '';
  
  // Nouveaux filtres
  selectedMagasin: number | null = null;
  selectedMerchandiseur: number | null = null;
  selectedDateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  showDatePicker = false;
  today = new Date();

  // Options pour les filtres
  magasinsOptions: { value: number, label: string }[] = [];
  merchandiseursOptions: { value: number, label: string }[] = [];
  
  // Données originales pour les filtres
  allVisits: VisitDTO[] = [];

  // Permissions de l'utilisateur
  isConsultant: boolean = false;
  canEdit = false;
  canDelete = false;
  canAdd = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private visitService: VisitService,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private magasinService: MagasinService,
    private merchendiseurService: MerchendiseurService,
    private planificationService: PlanificationService,
    private router: Router,
    private permissionService: PermissionService,
    @Inject(ExportService) private exportService: ExportService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }
 deleteVisit(visit: VisitDTO): void {
  // Confirmation avant suppression
  const confirmMessage = this.translate.instant('VISITS.CONFIRM_DELETE');
  if (!confirm(confirmMessage)) {
    return;
  }

  this.isLoading = true;
  this.visitService.deleteVisit(visit.id!).subscribe({
    next: () => {
      // Suppression réussie - mettre à jour le tableau localement
      this.dataSource.data = this.dataSource.data.filter(v => v.id !== visit.id);
      
      // Afficher un message de succès
      const successMessage = this.translate.instant('VISITS.DELETE_SUCCESS');
      this.snackBar.open(successMessage, 'OK', { duration: 3000 });
      
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Erreur lors de la suppression', err);
      
      // Afficher un message d'erreur
      const errorMessage = this.translate.instant('VISITS.DELETE_ERROR');
      this.snackBar.open(errorMessage, 'OK', { duration: 3000 });
      
      this.isLoading = false;
    }
  });
}
  openImageDialog(images: any[]): void {
    // Dialogue d'images supprimé - fonctionnalité désactivée
    console.log('Images disponibles:', images);
  }
 @ViewChild(MatDrawer) drawer!: MatDrawer;
 menuOpen = false;
  username: any;
  role: any;
  email: any;
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
     logout(): void {
        this.authService.logout();
      }
        nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  status!: string;
  imagePath: string | undefined;
  avatarUrl: string | undefined;
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
      
      // Initialiser les permissions basées sur le rôle
      this.initializePermissions(this.role);
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
}

  private initializePermissions(userRole: string): void {
    this.canEdit = this.permissionService.canEdit(userRole);
    this.canDelete = this.permissionService.canDelete(userRole);
    this.canAdd = this.permissionService.canAdd(userRole);
    this.isConsultant = this.permissionService.isConsultant(userRole);
  }

  ngOnInit(): void {
    this.loadVisits();
    this.loadCurrentUser();
    this.loadMagasinsOptions();
    this.loadMerchandiseursOptions();
    this.updateDisplayedColumns();
  }


  // Méthode pour enrichir les visites avec les données de planification
  private enrichVisitsWithPlanning(visits: VisitDTO[]): void {
    visits.forEach(visit => {
      if (visit.planningId && (!visit.planning || !visit.planning.magasin || !visit.planning.merchandiser)) {
        // Récupérer les données de planification manquantes via le service de planification
        this.planificationService.getPlanificationById(visit.planningId).subscribe({
          next: (planification) => {
            if (planification) {
              visit.planning = {
                id: planification.id,
                dateVisite: planification.dateVisite,
                statut: planification.statut,
                magasin: {
                  id: planification.magasin.id,
                  nom: planification.magasin.nom,
                  adresse: undefined,
                  ville: undefined,
                  region: planification.magasin.region || undefined
                },
                merchandiser: {
                  id: planification.merchandiser.id,
                  nom: planification.merchandiser.nom,
                  prenom: '', // Valeur par défaut si manquante
                  email: undefined,
                  imagePath: undefined
                }
              };
              this.cdRef.detectChanges();
            }
          },
          error: (err) => {
            console.warn(`Impossible de récupérer les données de planification pour la visite ${visit.id}:`, err);
          }
        });
      }
    });
  }
  openAddMagasinDialog(): void {
      const dialogRef = this.dialog.open(AddVisitComponent, {
        width: '900px',
        data: {}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Ajouter le nouveau magasin dans la liste sans recharger tout
          this.dataSource.data = [...this.dataSource.data, result];
        }
      });
    }
  exportToExcel(): void {
        this.exportService.exportVisits(this.dataSource.data, {
          filename: 'visites',
          sheetName: 'Visites'
        });
      }

  // Méthodes pour la personnalisation des colonnes
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

  // Méthode pour ouvrir le dialog d'importation (à implémenter selon vos besoins)
  openImportDialog(): void {
    // TODO: Implémenter le dialog d'importation pour les visites
    this.snackBar.open('Fonctionnalité d\'importation à venir', 'Fermer', {
      duration: 3000,
    });
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVisits(): void {
    this.isLoading = true;
    // Essayer d'abord avec la méthode qui inclut la planification
    this.visitService.getAllVisitsWithPlanning().subscribe({
      next: (visits) => {
        console.log('Réponse brute reçue avec planification :', visits);
        // Debug: afficher la structure des données
        if (visits && visits.length > 0) {
          console.log('Première visite structure:', visits[0]);
          console.log('Planning de la première visite:', visits[0].planning);
        }
        this.allVisits = visits;
        this.dataSource.data = visits;
        this.isLoading = false;
        this.cdRef.detectChanges();
        // Enrichir avec les données de planification si nécessaire
        this.enrichVisitsWithPlanning(visits);
      },
      error: (err) => {
        console.warn('Erreur avec getAllVisitsWithPlanning, essai avec getAllVisits:', err);
        // Fallback vers la méthode standard
        this.visitService.getAllVisits().subscribe({
          next: (visits) => {
            console.log('Réponse brute reçue (fallback) :', visits);
            // Debug: afficher la structure des données
            if (visits && visits.length > 0) {
              console.log('Première visite structure (fallback):', visits[0]);
              console.log('Planning de la première visite (fallback):', visits[0].planning);
            }
            this.allVisits = visits;
            this.dataSource.data = visits;
            this.isLoading = false;
            this.cdRef.detectChanges();
            // Enrichir avec les données de planification si nécessaire
            this.enrichVisitsWithPlanning(visits);
          },
          error: (fallbackErr) => {
            this.handleLoadError(fallbackErr);
          }
        });
      }
    });
  }

  private handleLoadError(err: any): void {
    console.error('Erreur lors du chargement des visites', err);
    this.isLoading = false;
    
    // Gestion spécifique de l'erreur 403 (Forbidden)
    if (err.status === 403) {
      this.snackBar.open('Accès refusé. Vérifiez vos permissions.', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } else if (err.status === 401) {
      this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } else {
      this.snackBar.open('Erreur lors du chargement des visites', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
    currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
  userMenuOpen = false;
  // Méthodes pour les filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    let filteredVisits = [...this.allVisits];

    // Filtre par recherche générale
    if (this.generalSearch.trim()) {
      const searchTerm = this.generalSearch.toLowerCase();
      filteredVisits = filteredVisits.filter(visit => 
        visit.id?.toString().includes(searchTerm) ||
        visit.heureArrivee?.toLowerCase().includes(searchTerm) ||
        visit.heureDepart?.toLowerCase().includes(searchTerm) ||
        visit.nombreFacings?.toString().includes(searchTerm) ||
        visit.prixNormal?.toString().includes(searchTerm) ||
        visit.prixPromotionnel?.toString().includes(searchTerm) ||
        visit.niveauStock?.toString().includes(searchTerm) ||
        visit.nouveauteConcurrente?.toLowerCase().includes(searchTerm) ||
        visit.prixNouveaute?.toString().includes(searchTerm)
      );
    }

    // Filtre par date
    if (this.dateFrom) {
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.heureArrivee);
        return visitDate >= this.dateFrom!;
      });
    }

    if (this.dateTo) {
      filteredVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.heureArrivee);
        return visitDate <= this.dateTo!;
      });
    }

    // Filtre par niveau de stock
    if (this.stockLevelFilter) {
      filteredVisits = filteredVisits.filter(visit => {
        const stock = visit.niveauStock;
        switch (this.stockLevelFilter) {
          case 'high': return stock >= 80;
          case 'medium': return stock >= 50 && stock < 80;
          case 'low': return stock >= 20 && stock < 50;
          case 'critical': return stock < 20;
          default: return true;
        }
      });
    }

    // Filtre par photo prise
    if (this.photoTakenFilter !== '') {
      const photoTaken = this.photoTakenFilter === 'true';
      filteredVisits = filteredVisits.filter(visit => visit.photoPrise === photoTaken);
    }

    this.dataSource.data = filteredVisits;
  }

  clearFilters(): void {
    this.generalSearch = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.stockLevelFilter = '';
    this.photoTakenFilter = '';
    this.dataSource.data = [...this.allVisits];
  }

  // Méthode de filtrage simple (pour compatibilité)
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Méthode pour la recherche dans la barre de recherche
  onSearchChange(): void {
    this.applyAllFilters();
  }

  // Charger les options des magasins
  loadMagasinsOptions(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (magasins: Magasin[]) => {
        this.magasinsOptions = magasins.map(magasin => ({
          value: magasin.id!,
          label: `${magasin.nom} - ${magasin.ville}`
        }));
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des magasins:', err);
        if (err.status === 403) {
          this.snackBar.open('Accès refusé pour charger les magasins', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  // Charger les options des merchandiseurs
  loadMerchandiseursOptions(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (merchandiseurs: Merchendiseur[]) => {
        this.merchandiseursOptions = merchandiseurs.map((merch: Merchendiseur) => ({
          value: merch.id!,
          label: `${merch.nom} ${merch.prenom}`
        }));
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des merchandiseurs:', err);
        if (err.status === 403) {
          this.snackBar.open('Accès refusé pour charger les merchandiseurs', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  // Filtres par magasin
  filterByMagasin(): void {
    this.applyAllFilters();
  }

  // Filtres par merchandiseur
  filterByMerchandiseur(): void {
    this.applyAllFilters();
  }

  // Filtres par date
  onDateRangeChange(): void {
    this.applyAllFilters();
  }

  // Toggle date picker
  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  // Appliquer tous les filtres
  applyAllFilters(): void {
    let filtered = [...this.allVisits];

    // Filtre par recherche textuelle
    if (this.searchText && this.searchText.trim()) {
      const searchTerm = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(visit => 
        visit.id?.toString().includes(searchTerm) ||
        visit.heureArrivee?.toLowerCase().includes(searchTerm) ||
        visit.heureDepart?.toLowerCase().includes(searchTerm) ||
        visit.nombreFacings?.toString().includes(searchTerm) ||
        visit.prixNormal?.toString().includes(searchTerm) ||
        visit.planning?.magasin?.nom?.toLowerCase().includes(searchTerm) ||
        visit.planning?.merchandiser?.nom?.toLowerCase().includes(searchTerm) ||
        visit.planning?.merchandiser?.prenom?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre par magasin
    if (this.selectedMagasin) {
      filtered = filtered.filter(visit => visit.planning?.magasin?.id === this.selectedMagasin);
    }

    // Filtre par merchandiseur
    if (this.selectedMerchandiseur) {
      filtered = filtered.filter(visit => visit.planning?.merchandiser?.id === this.selectedMerchandiseur);
    }

    // Filtre par plage de dates
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      const startDate = new Date(this.selectedDateRange.start);
      const endDate = new Date(this.selectedDateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.heureArrivee);
        return visitDate >= startDate && visitDate <= endDate;
      });
    }

    this.dataSource.data = filtered;
  }

  // Réinitialiser tous les filtres
  resetAllFilters(): void {
    this.selectedMagasin = null;
    this.selectedMerchandiseur = null;
    this.selectedDateRange = { start: null, end: null };
    this.showDatePicker = false;
    this.searchText = '';
    this.generalSearch = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.stockLevelFilter = '';
    this.photoTakenFilter = '';
    this.dataSource.data = [...this.allVisits];
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
    openVisitDetail(visit: any): void {
      if (visit.id) {
        this.router.navigate(['/visit-detail', visit.id]);
      }
    }

    /**
     * Rafraîchit les données
     */
    refresh(): void {
      this.loadVisits();
    }
}



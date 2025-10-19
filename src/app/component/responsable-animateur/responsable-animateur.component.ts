import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Region } from '../../enum/Region';
import { Role } from '../../enum/Role';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { ResponsableAnimateurService, ResponsableAnimateur } from '../../services/responsable-animateur.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ExportService } from '../../services/export.service';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
import { AddResponsableAnimateurComponent } from '../add-responsable-animateur/add-responsable-animateur.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-responsable-animateur',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    MatSidenavModule,
    HttpClientModule,
    RouterModule,
    MatListModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatBadgeModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    ColumnCustomizationPanelComponent,
    AddResponsableAnimateurComponent
  ],
  templateUrl: './responsable-animateur.component.html',
  styleUrls: ['./responsable-animateur.component.css']
})
export class ResponsableAnimateurComponent implements OnInit {
  dataSource = new MatTableDataSource<ResponsableAnimateur>([]);
  selection = new SelectionModel<ResponsableAnimateur>(true, []);
  showFilters = false;
  menuOpen = false;
  searchText = '';

  // Options des filtres
  regions: string[] = Object.values(Region);
  villes: string[] = [];
  statuses: string[] = ['ACTIVE', 'INACTIVE'];
  marques: string[] = Object.values(MarqueProduit);
  enseignes: string[] = [];
  superviseurs: any[] = [];

  // Filtres sélectionnés
  selectedRegion = '';
  selectedVille = '';
  selectedStatus = '';
  selectedMarque = '';
  selectedEnseigne = '';
  selectedSuperviseur = '';
  selectedIntegrationDate: Date | null = null;
  selectedSortieDate: Date | null = null;

  // Filtres object for filtering
  filters = {
    region: '',
    ville: '',
    status: '',
    marque: '',
    enseigne: '',
    superviseur: ''
  };

  // Permissions
  isConsultant = false;
  canEdit = false;
  canDelete = false;
  canAdd = false;

  // User info
  username = '';
  role = '';
  avatarUrl = 'assets/default-avatar.png';
  currentLanguage = 'fr';

  // Column configuration
  columnConfig = [
    { key: 'nom', label: 'Nom', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'ville', label: 'Ville', visible: true },
    { key: 'marques', label: 'Marques', visible: true },
    { key: 'enseignes', label: 'Enseignes', visible: true },
    { key: 'superviseur', label: 'Superviseur', visible: true },
    { key: 'status', label: 'Statut', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  displayedColumns: string[] = this.columnConfig
    .filter(col => col.visible)
    .map(col => col.key);

  isColumnCustomizationOpen = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private responsableAnimateurService: ResponsableAnimateurService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private exportService: ExportService,
    private permissionService: PermissionService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadResponsableAnimateurs();
    this.loadFilterOptions();
    this.setupDataSource();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (user) => {
        this.username = user.username || '';
        this.role = user.role || '';
        this.avatarUrl = user.imagePath || 'assets/default-avatar.png';
        this.initializePermissions(user.role || '');
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      }
    });
  }

  initializePermissions(userRole: string): void {
    this.isConsultant = this.permissionService.isConsultant(userRole);
    this.canEdit = this.permissionService.canEdit(userRole);
    this.canDelete = this.permissionService.canDelete(userRole);
    this.canAdd = this.permissionService.canAdd(userRole);
  }

  loadResponsableAnimateurs(): void {
    this.responsableAnimateurService.getAllResponsableAnimateurs().subscribe({
      next: (responsables) => {
        this.dataSource.data = responsables;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.setupFilterPredicate();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des responsables animateurs:', error);
        this.snackBar.open('Erreur lors du chargement des responsables animateurs', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: ResponsableAnimateur, filter: string): boolean => {
      const filterObj = JSON.parse(filter);
      const searchText = filterObj.searchText ? filterObj.searchText.toLowerCase() : '';
      
      // Recherche globale
      let matchesSearch = false;
      if (searchText) {
        matchesSearch = 
          (data.nom?.toLowerCase().includes(searchText)) ||
          (data.prenom?.toLowerCase().includes(searchText)) ||
          (data.region?.toLowerCase().includes(searchText)) ||
          (data.ville?.toLowerCase().includes(searchText)) ||
          (data.marqueCouverte?.toLowerCase().includes(searchText)) ||
          (data.telephone?.toLowerCase().includes(searchText));
      } else {
        matchesSearch = true;
      }

      // Filtres individuels
      const matchesRegion = filterObj.filters.region ? 
        data.region?.toLowerCase().includes(filterObj.filters.region.toLowerCase()) : true;
      const matchesVille = filterObj.filters.ville ? 
        data.ville?.toLowerCase().includes(filterObj.filters.ville.toLowerCase()) : true;
      const matchesStatus = filterObj.filters.status ? 
        data.status?.toLowerCase().includes(filterObj.filters.status.toLowerCase()) : true;
      const matchesMarque = filterObj.filters.marque ? 
        (data.marques && data.marques.includes(filterObj.filters.marque)) : true;
      const matchesEnseigne = filterObj.filters.enseigne ? 
        (data.enseignes && data.enseignes.includes(filterObj.filters.enseigne)) : true;

      return matchesSearch && matchesRegion && matchesVille && matchesStatus && matchesMarque && matchesEnseigne;
    };
  }

  loadFilterOptions(): void {
    // Charger les villes et enseignes depuis les données
    this.responsableAnimateurService.getAllResponsableAnimateurs().subscribe({
      next: (responsables) => {
        // Extraire les villes uniques
        const villeSet = new Set(
          responsables.map(r => r.ville).filter(ville => ville)
        );
        this.villes = Array.from(villeSet).sort();

        // Extraire les enseignes uniques
        const enseigneSet = new Set(
          responsables.flatMap(r => r.enseignes || []).filter(enseigne => enseigne)
        );
        this.enseignes = Array.from(enseigneSet).sort();
      }
    });
  }

  applyFilter(event?: Event): void {
    if (event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.searchText = filterValue;
    }
    this.dataSource.filter = JSON.stringify({
      searchText: this.searchText.trim().toLowerCase(),
      filters: this.filters
    });
  }

  onRegionChange(region?: string): void {
    if (region) {
      this.selectedRegion = region;
    }
    // Réinitialiser la ville quand la région change
    this.selectedVille = '';
    this.filters.ville = '';
    this.filters.region = this.selectedRegion;
    this.applyFilter();
  }

  onCityChange(): void {
    this.filters.ville = this.selectedVille;
    this.applyFilter();
  }

  applyFilters(): void {
    // Mettre à jour les filtres avec les valeurs sélectionnées
    this.filters.region = this.selectedRegion;
    this.filters.ville = this.selectedVille;
    this.filters.status = this.selectedStatus;
    this.filters.marque = this.selectedMarque;
    this.filters.enseigne = this.selectedEnseigne;
    this.filters.superviseur = this.selectedSuperviseur;
    
    // Appliquer le filtre
    this.applyFilter();
  }

  clearAllFilters(): void {
    this.selectedRegion = '';
    this.selectedVille = '';
    this.selectedStatus = '';
    this.selectedMarque = '';
    this.selectedEnseigne = '';
    this.selectedSuperviseur = '';
    
    this.filters = {
      region: '',
      ville: '',
      status: '',
      marque: '',
      enseigne: '',
      superviseur: ''
    };
    
    this.searchText = '';
    this.applyFilter();
  }

  // Actions CRUD
  openAddResponsableDialog(): void {
    const dialogRef = this.dialog.open(AddResponsableAnimateurComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadResponsableAnimateurs();
      }
    });
  }

  editResponsable(responsable: ResponsableAnimateur): void {
    const dialogRef = this.dialog.open(AddResponsableAnimateurComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: responsable
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadResponsableAnimateurs();
      }
    });
  }

  deleteResponsable(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce responsable animateur ?')) {
      this.responsableAnimateurService.deleteResponsableAnimateur(id).subscribe({
        next: () => {
          this.snackBar.open('Responsable animateur supprimé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadResponsableAnimateurs();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  viewResponsable(responsable: ResponsableAnimateur): void {
    // TODO: Implémenter la vue détaillée
    console.log('Voir responsable:', responsable);
  }

  toggleStatus(responsable: ResponsableAnimateur): void {
    const newStatus = responsable.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedResponsable = { ...responsable, status: newStatus };
    
    this.responsableAnimateurService.updateResponsableAnimateur(responsable.id!, updatedResponsable).subscribe({
      next: () => {
        responsable.status = newStatus;
        this.snackBar.open(`Statut changé en ${newStatus}`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Export
  exportToExcel(): void {
    const data = this.dataSource.data;
    this.exportService.exportToExcel(data, {
      filename: 'responsables_animateurs.xlsx',
      sheetName: 'Responsables Animateurs'
    });
  }

  // Column customization
  openColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = true;
  }

  closeColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = false;
  }

  onColumnCustomizationSave(event: any): void {
    const updatedConfig = event as any[];
    this.columnConfig = updatedConfig;
    this.displayedColumns = this.columnConfig
      .filter(col => col.visible)
      .map(col => col.key);
    this.closeColumnCustomizationPanel();
  }

  // Méthodes pour correspondre à la structure du composant merchendiseur
  setupDataSource(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openImportDialog(): void {
    // Logique pour l'import
    console.log('Ouvrir dialog d\'import');
  }

  // Menu
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }

  openLogoutDialog(): void {
    this.dialog.open(ConfirmLogoutComponent);
  }

  onRowClick(event: Event, row: ResponsableAnimateur): void {
    // TODO: Implémenter la navigation vers les détails
    console.log('Clic sur la ligne:', row);
  }

}




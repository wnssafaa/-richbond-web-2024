import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { AdduserComponent } from '../adduser/adduser.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';
import { RouterLink, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { User, UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SuperveseurService,
  Superviseur,
} from '../../services/superveseur.service';
import {
  MerchendiseurService,
  Merchendiseur,
} from '../../services/merchendiseur.service';
import { AddSupComponent } from '../../dialogs/add-sup/add-sup.component';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import { SelectRoleComponent } from '../../dialogs/select-role/select-role.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { PermissionService } from '../../services/permission.service';
import { SuperviseurDetailsDialogComponent } from '../../dialogs/superviseur-details-dialog/superviseur-details-dialog.component';
import { MerchandiserDetailsDialogComponent } from '../../dialogs/merchandiser-details-dialog/merchandiser-details-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Region } from '../../enum/Region';
import { ImportConfigService } from '../../services/import-config.service';
import { GenericImportDialogComponent } from '../../dialogs/generic-import-dialog/generic-import-dialog.component';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
const componentMap: { [key: string]: { component: any; dataKey: string } } = {
  ADMIN: { component: AdduserComponent, dataKey: 'user' },
  SUPERVISEUR: { component: AddSupComponent, dataKey: 'superviseur' },
  MERCHANDISEUR_MONO: {
    component: AddMerchComponent,
    dataKey: 'Merchendiseur',
  },
  MERCHANDISEUR_MULTI: {
    component: AddMerchComponent,
    dataKey: 'Merchendiseur',
  },
  RESPONSABLE_ANIMATEUR: { component: AdduserComponent, dataKey: 'user' },
  CONSULTANT: { component: AdduserComponent, dataKey: 'user' },
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatSortModule,
    MatSidenavModule,
    MatSidenavModule,
    MatCardModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatPaginatorModule,
    TranslateModule,
    MatTooltipModule,
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
    RouterModule,
    GenericImportDialogComponent,
    ColumnCustomizationPanelComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  // showFiller = false;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  currentLanguage = 'fr';
  menuOpen = false;
  selectedRole: string = '';
  selectedStatus: string = '';
  selectedRegion: string = '';
  selectedCity: string = '';
  selectedStore: string = '';
  selectedBrand: string = '';
  selectedEnseigne: string = '';
  // showFilters = false;

  // Available options for filters
  availableRegions: string[] = Object.keys(Region).map(
    (key) => Region[key as keyof typeof Region]
  );
  availableCities: string[] = [];
  availableStores: string[] = [];
  availableBrands: string[] = [];
  availableEnseignes: string[] = [];
  componentMap: { [key: string]: { component: any; dataKey: string } } = {
    SUPERVISEUR: { component: AddSupComponent, dataKey: 'superviseur' },
    MERCHANDISEUR_MONO: {
      component: AddMerchComponent,
      dataKey: 'Merchendiseur',
    },
    MERCHANDISEUR_MULTI: {
      component: AddMerchComponent,
      dataKey: 'Merchendiseur',
    },
    MERCHENDISEUR: { component: AddMerchComponent, dataKey: 'Merchendiseur' },
  };
  showFilters: boolean = false;
  
  // Propriétés de permissions
  isConsultant: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;
  
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
          ? data.imagePath.startsWith('data:image')
            ? data.imagePath
            : 'http://environment.apiUrl.replace('/api', '')/uploads/' + data.imagePath
          : 'assets/profil.webp';
        
        // Initialiser les permissions
        this.initializePermissions();
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération des infos utilisateur :',
          err
        );
        // Valeurs par défaut en cas d'erreur
        this.avatarUrl = 'assets/profil.webp';
      },
    });
  }
  userMenuOpen = false;
  username: any;
  role: any;
  email: any;
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;
  searchTerm = '';
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [];
  combinedDataSource = new MatTableDataSource<any>([]);

  // Propriétés pour la personnalisation des colonnes
  isColumnCustomizationOpen = false;
  columnConfig = [
    { key: 'nom', label: 'Nom complet', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'city', label: 'Ville', visible: true },
    { key: 'store', label: 'Magasin', visible: true },
    { key: 'marques', label: 'Marques', visible: true },
    { key: 'enseignes', label: 'Enseignes', visible: true },
    { key: 'connexion', label: 'Dernière connexion', visible: true },
    { key: 'sessions', label: 'Sessions', visible: true },
    { key: 'role', label: 'Rôle', visible: true },
    { key: 'status', label: 'Statut', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  constructor(
    private translate: TranslateService,
    private superviseurService: SuperveseurService,
    private merchendiseurService: MerchendiseurService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private exportService: ExportService,
    private importConfigService: ImportConfigService,
    private permissionService: PermissionService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    // Initialiser les colonnes affichées
    this.displayedColumns = this.columnConfig
      .filter(col => col.visible)
      .map(col => col.key);
    
    this.loadUsers();
    this.loadCurrentUser();
    this.loadBrandsAndStores();
  }

  ngAfterViewInit() {
    this.combinedDataSource.filterPredicate = (data: any, filter: string) => {
      const filterObj = JSON.parse(filter);
      const matchesSearch =
        !filterObj.searchTerm ||
        data.nom.toLowerCase().includes(filterObj.searchTerm) ||
        data.id.toString().includes(filterObj.searchTerm);

      const matchesRole = !filterObj.role || data.type === filterObj.role;
      const matchesStatus =
        !filterObj.status || data.status === filterObj.status;
      const matchesRegion =
        !filterObj.region || data.region === filterObj.region;
      const matchesCity = !filterObj.city || data.ville === filterObj.city;
      const matchesStore = !filterObj.store || data.magasin === filterObj.store;
      const matchesBrand = !filterObj.brand || (data.marques && data.marques.includes(filterObj.brand));
      const matchesEnseigne = !filterObj.enseigne || (data.enseignes && data.enseignes.includes(filterObj.enseigne));

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesRegion &&
        matchesCity &&
        matchesStore &&
        matchesBrand &&
        matchesEnseigne
      );
    };
  }

  loadUsers(): void {
    // Charger les superviseurs et marchandiseurs en parallèle
    Promise.all([
      firstValueFrom(this.superviseurService.getAll()),
      firstValueFrom(this.merchendiseurService.getAllMerchendiseurs())
    ]).then(([superviseurs, merchandiseurs]) => {
      // Vérifier que les données ne sont pas undefined
      const superviseursData = superviseurs || [];
      const merchandiseursData = merchandiseurs || [];
      
      // Debug: Afficher les données brutes des superviseurs
      console.log('🔍 Données brutes des superviseurs:', superviseursData.map(s => ({
        id: s.id,
        nom: s.nom,
        prenom: s.prenom,
        magasin: s.magasin,
        marquesCouvertes: s.marquesCouvertes,
        merchendiseurIds: s.merchendiseurIds,
        merchendiseurs: s.merchendiseurs
      })));

      const formattedSuperviseurs = superviseursData.map((s) => ({
        ...s,
        type: 'SUPERVISEUR',
        // Utiliser les champs existants de l'interface Superviseur
        marques: s.marquesCouvertes ? [s.marquesCouvertes] : [],
        enseignes: [], // Sera rempli par enrichUserData
        magasin: s.magasin || '—'
      }));
      
      // Debug: Afficher les données brutes des marchandiseurs
      console.log('🔍 Données brutes des marchandiseurs:', merchandiseursData.map(m => ({
        nom: m.nom,
        marqueCouverte: m.marqueCouverte,
        enseignes: m.enseignes,
        magasinNoms: m.magasinNoms,
        superviseurId: m.superviseurId
      })));

      const formattedMerch = merchandiseursData.map((m) => ({
        ...m,
        type: 'MERCHENDISEUR',
        // Pré-remplir les données des marchandiseurs
        marques: [m.marqueCouverte].filter(Boolean) || [],
        enseignes: m.enseignes || [],
        magasin: m.magasinNoms?.join(', ') || '—'
      }));

      // Debug: Afficher les données formatées des marchandiseurs
      console.log('📊 Marchandiseurs formatés:', formattedMerch.map(m => ({
        nom: m.nom,
        marques: m.marques,
        enseignes: m.enseignes,
        magasin: m.magasin
      })));

      const combined = [...formattedSuperviseurs, ...formattedMerch];

      // Enrichir les données avec les informations de connexion et les marques/enseignes des superviseurs
      this.enrichUserData(combined, merchandiseursData).then((enrichedData) => {
        this.combinedDataSource.data = enrichedData;
        this.combinedDataSource.sort = this.sort;
        this.combinedDataSource.paginator = this.paginator;

        // Populate available cities and stores
        this.populateFilterOptions(enrichedData);
      });
    }).catch(error => {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    });
  }

  private async enrichUserData(users: any[], merchandiseursData: any[] = []): Promise<any[]> {
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          let derniereConnexion = '—';
          let derniereSession = '—';
          let marques = user.marques || [];
          let enseignes = user.enseignes || [];
          let magasin = user.magasin || '—';

          // Pour les superviseurs, récupérer les marques, enseignes et magasins de leurs marchandiseurs
          if (user.type === 'SUPERVISEUR') {
            // Méthode 1: Utiliser les marchandiseurs déjà présents dans l'objet superviseur
            let marchandiseursDuSuperviseur = [];
            
            if (user.merchendiseurs && user.merchendiseurs.length > 0) {
              marchandiseursDuSuperviseur = user.merchendiseurs;
              console.log(`🔍 Superviseur ${user.nom} utilise merchendiseurs direct:`, marchandiseursDuSuperviseur.length);
            } else if (user.merchendiseurIds && user.merchendiseurIds.length > 0) {
              // Méthode 2: Utiliser les IDs pour trouver les marchandiseurs
              marchandiseursDuSuperviseur = merchandiseursData.filter(m => 
                user.merchendiseurIds.includes(m.id)
              );
              console.log(`🔍 Superviseur ${user.nom} utilise merchendiseurIds:`, marchandiseursDuSuperviseur.length);
            } else {
              // Méthode 3: Fallback - chercher par superviseurId
              marchandiseursDuSuperviseur = merchandiseursData.filter(m => {
                return m.superviseurId === user.id || 
                       (m.superviseur && m.superviseur.id === user.id) ||
                       (m.superviseurId && m.superviseurId.toString() === user.id.toString());
              });
              console.log(`🔍 Superviseur ${user.nom} utilise fallback superviseurId:`, marchandiseursDuSuperviseur.length);
            }
            
            console.log(`🔍 Superviseur ${user.nom} (ID: ${user.id}) a ${marchandiseursDuSuperviseur.length} marchandiseurs:`, 
              marchandiseursDuSuperviseur.map((m: any) => ({ 
                nom: m.nom, 
                superviseurId: m.superviseurId,
                superviseur: m.superviseur,
                marqueCouverte: m.marqueCouverte,
                enseignes: m.enseignes,
                magasinNoms: m.magasinNoms
              })));
            
            // Collecter toutes les marques des marchandiseurs du superviseur
            const marquesDuSuperviseur = new Set(
              marchandiseursDuSuperviseur
                .map((m: any) => m.marqueCouverte)
                .filter(Boolean)
            );
            marques = Array.from(marquesDuSuperviseur);

            // Collecter toutes les enseignes des marchandiseurs du superviseur
            const enseignesDuSuperviseur = new Set(
              marchandiseursDuSuperviseur
                .flatMap((m: any) => m.enseignes || [])
                .filter(Boolean)
            );
            enseignes = Array.from(enseignesDuSuperviseur);

            // Collecter tous les magasins des marchandiseurs du superviseur
            const magasinsDuSuperviseur = new Set(
              marchandiseursDuSuperviseur
                .flatMap((m: any) => m.magasinNoms || [])
                .filter(Boolean)
            );
            magasin = Array.from(magasinsDuSuperviseur).join(', ') || '—';

            console.log(`📊 Résultat pour superviseur ${user.nom}:`, {
              marques,
              enseignes,
              magasin
            });
          }

          // Récupérer l'historique de connexion pour tous les utilisateurs
          try {
            const userLoginHistory = await firstValueFrom(this.authService.getUserLoginHistory(user.id));
            if (userLoginHistory) {
              derniereConnexion = userLoginHistory.lastLoginDate || user.derniereConnexion || '—';
              derniereSession = userLoginHistory.sessionId || user.derniereSession || '—';
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'historique de connexion pour l'utilisateur ${user.id}:`, error);
          }

          return {
            ...user,
            marques,
            enseignes,
            magasin,
            derniereConnexion,
            derniereSession
          };
        } catch (error) {
          console.error(`Erreur lors de l'enrichissement des données pour l'utilisateur ${user.id}:`, error);
          return {
            ...user,
            marques: user.marques || [],
            enseignes: user.enseignes || [],
            magasin: user.magasin || '—',
            derniereConnexion: user.derniereConnexion || '—',
            derniereSession: user.derniereSession || '—'
          };
        }
      })
    );

    return enrichedUsers;
  }

  private loadBrandsAndStores(): void {
    // Utiliser les 4 marques spécifiées
    this.availableBrands = [
      'RICHBOND',
      'SIMMONS', 
      'ROSA',
      'GÉNÉRIQUE'
    ];

    // Charger les enseignes depuis les données des marchandiseurs
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (marchandiseurs) => {
        // Extraire toutes les enseignes uniques
        const enseigneSet = new Set(
          marchandiseurs
            .flatMap(m => m.enseignes || [])
            .filter(Boolean)
        );
        this.availableEnseignes = Array.from(enseigneSet).sort();
        
        // Ajouter "Aswak Assalam" s'il n'est pas déjà présent
        if (!this.availableEnseignes.includes('Aswak Assalam')) {
          this.availableEnseignes.push('Aswak Assalam');
          this.availableEnseignes.sort();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignes:', error);
        this.availableEnseignes = [];
      }
    });
  }

  private populateFilterOptions(users: any[]): void {
    // Extract unique cities
    const citySet = new Set(
      users.map((user) => user.ville).filter((city) => city)
    );
    this.availableCities = Array.from(citySet).sort();

    // Extract unique stores
    const storeSet = new Set(
      users.map((user) => user.magasin).filter((store) => store)
    );
    this.availableStores = Array.from(storeSet).sort();

    // Les marques et enseignes sont déjà chargées dans loadBrandsAndStores()
    // mais on peut les mettre à jour avec les données enrichies
    const brandSet = new Set(
      users.flatMap((user) => user.marques || []).filter((brand) => brand)
    );
    this.availableBrands = Array.from(brandSet).sort();

    const enseigneSet = new Set(
      users.flatMap((user) => user.enseignes || []).filter((enseigne) => enseigne)
    );
    this.availableEnseignes = Array.from(enseigneSet).sort();
  }

  applyFilter(): void {
    this.combinedDataSource.filter = JSON.stringify({
      searchTerm: this.searchTerm.trim().toLowerCase(),
      role: this.selectedRole,
      status: this.selectedStatus,
      region: this.selectedRegion,
      city: this.selectedCity,
      store: this.selectedStore,
      brand: this.selectedBrand,
      enseigne: this.selectedEnseigne,
    });
  }

  clearAllFilters(): void {
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedRegion = '';
    this.selectedCity = '';
    this.selectedStore = '';
    this.selectedBrand = '';
    this.selectedEnseigne = '';
    this.searchTerm = '';
    this.applyFilter();
  }

  onRegionChange(): void {
    // When region changes, we don't automatically clear city filter
    // This makes region and city filters independent as requested
    this.applyFilter();
  }

  onCityChange(): void {
    // When city changes, we don't automatically clear region filter
    // This makes region and city filters independent as requested
    this.applyFilter();
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.combinedDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.combinedDataSource.data.forEach((row) =>
          this.selection.select(row)
        );
  }

  toggleStatus(row: any): void {
    const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log(
      `Changement de statut pour ${row.nom}: ${row.status} -> ${newStatus}`
    );

    if (row.type === 'SUPERVISEUR') {
      this.superviseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
        // Forcer la détection des changements
        this.combinedDataSource.data = [...this.combinedDataSource.data];
        console.log(
          `Statut mis à jour pour superviseur ${row.nom}: ${row.status}`
        );
        console.log(
          `Classe CSS appliquée: ${
            row.status === 'ACTIVE'
              ? 'btn-active (VERT)'
              : 'btn-inactive (ROUGE)'
          }`
        );
      });
    } else if (
      row.type === 'MERCHANDISEUR_MONO' ||
      row.type === 'MERCHANDISEUR_MULTI' ||
      row.type === 'MERCHENDISEUR'
    ) {
      this.merchendiseurService
        .updateStatus(row.id, newStatus)
        .subscribe(() => {
          row.status = newStatus;
          // Forcer la détection des changements
          this.combinedDataSource.data = [...this.combinedDataSource.data];
          console.log(
            `Statut mis à jour pour merchandiseur ${row.nom}: ${row.status}`
          );
          console.log(
            `Classe CSS appliquée: ${
              row.status === 'ACTIVE'
                ? 'btn-active (VERT)'
                : 'btn-inactive (ROUGE)'
            }`
          );
        });
    }
  }

  exportToExcel(): void {
    // Séparer les utilisateurs par type
    const superviseurs = this.combinedDataSource.data.filter(
      (user) => user.type === 'SUPERVISEUR'
    );
    const merchandisers = this.combinedDataSource.data.filter(
      (user) =>
        user.type === 'MERCHENDISEUR' ||
        user.type === 'MERCHANDISEUR_MONO' ||
        user.type === 'MERCHANDISEUR_MULTI'
    );

    // Exporter tous les utilisateurs dans un fichier multi-feuilles
    this.exportService.exportAllData(
      {
        superviseurs: superviseurs,
        merchandisers: merchandisers,
      },
      {
        filename: 'utilisateurs_complets',
        sheetName: 'Utilisateurs',
      }
    );
  }

  deleteUser(userId: number, type: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      if (type === 'SUPERVISEUR') {
        this.superviseurService.delete(userId).subscribe(
          () => {
            this.combinedDataSource.data = this.combinedDataSource.data.filter(
              (user: any) => user.id !== userId
            );
            this.snackBar.open('Superviseur supprimé avec succès', 'Fermer', {
              duration: 3000,
            });
          },
          (error) => {
            this.snackBar.open(
              'Erreur lors de la suppression du superviseur',
              'Fermer',
              { duration: 3000 }
            );
          }
        );
      } else if (type === 'MERCHENDISEUR') {
        this.merchendiseurService.deleteMerchendiseur(userId).subscribe(
          () => {
            this.combinedDataSource.data = this.combinedDataSource.data.filter(
              (user: any) => user.id !== userId
            );
            this.snackBar.open('Merchandiseur supprimé avec succès', 'Fermer', {
              duration: 3000,
            });
          },
          (error) => {
            this.snackBar.open(
              'Erreur lors de la suppression du merchandiseur',
              'Fermer',
              { duration: 3000 }
            );
          }
        );
      }
    }
  }

  onToggleDashboard(event: any): void {
    if (event.checked) {
      this.router.navigate(['/Dashbord']);
    }
  }

  removeFromTable(id: number): void {
    this.combinedDataSource.data = this.combinedDataSource.data.filter(
      (item) => item.id !== id
    );
    this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
      duration: 3000,
    });
  }

  editUser(row: any): void {
    const config = this.componentMap[row.type];
    if (!config) {
      console.warn('Type non pris en charge :', row.type);
      return;
    }

    const dialogRef = this.dialog.open(config.component, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { [config.dataKey]: row },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openAddUserDialog(): void {
    // Ouvrir d'abord le dialogue de sélection de rôle
    const roleDialogRef = this.dialog.open(SelectRoleComponent, {
      width: '600px',
      disableClose: true,
    });

    roleDialogRef.afterClosed().subscribe((result) => {
      if (result && result.selectedRole) {
        this.openUserFormByRole(result.selectedRole);
      }
    });
  }

  openUserFormByRole(role: string): void {
    let component: any;
    let data: any = {};
    let width = '700px';

    switch (role) {
      case 'SUPERVISEUR':
        component = AddSupComponent;
        data = { superviseur: null };
        break;
      case 'MERCHANDISEUR':
        component = AddMerchComponent;
        data = { Merchendiseur: null };
        break;
      default:
        console.warn('Rôle non reconnu:', role);
        return;
    }

    const dialogRef = this.dialog.open(component, {
      width: width,
      data: data,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers(); // Recharge la liste après ajout
      }
    });
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si l'utilisateur confirme, rediriger vers la page de login
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  onRowClick(event: MouseEvent, row: any): void {
    // Popup supprimée - ne fait plus rien lors du clic sur une ligne
    return;
  }

  showUserDetails(row: any): void {
    if (row.type === 'SUPERVISEUR') {
      this.dialog.open(SuperviseurDetailsDialogComponent, {
        width: '800px',
        data: row,
      });
    } else if (
      row.type === 'MERCHENDISEUR' ||
      row.type === 'MERCHANDISEUR_MONO' ||
      row.type === 'MERCHANDISEUR_MULTI'
    ) {
      this.dialog.open(MerchandiserDetailsDialogComponent, {
        width: '800px',
        data: row,
      });
    } else {
      console.warn("Type d'utilisateur non reconnu:", row.type);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDrawer(action: 'open' | 'close') {
    if (action === 'open') {
      this.drawer.open();
    } else {
      this.drawer.close();
    }
  }

  // Méthodes pour la personnalisation des colonnes
  openColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = true;
  }

  closeColumnCustomizationPanel(): void {
    this.isColumnCustomizationOpen = false;
  }

  onColumnCustomizationSave(updatedConfig: any[]): void {
    this.columnConfig = updatedConfig;
    this.displayedColumns = this.columnConfig
      .filter(col => col.visible)
      .map(col => col.key);
    this.closeColumnCustomizationPanel();
  }

  // Méthode pour l'import
  openImportDialog(): void {
    const dialogRef = this.dialog.open(GenericImportDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: {
        importType: 'users',
        title: 'Importer des utilisateurs',
        description: 'Sélectionnez un fichier Excel contenant les données des utilisateurs à importer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger les données après import
        this.loadUsers();
        this.snackBar.open('Import terminé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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
}

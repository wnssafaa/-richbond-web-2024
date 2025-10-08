import { Component, OnInit, ViewChild } from '@angular/core';
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
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { AddSupComponent } from '../../dialogs/add-sup/add-sup.component';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import { SelectRoleComponent } from '../../dialogs/select-role/select-role.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Region } from '../../enum/Region';
const componentMap: { [key: string]: { component: any, dataKey: string } } = {
  SUPERVISEUR: { component: AddSupComponent, dataKey: 'superviseur' },
  MERCHANDISEUR_MONO: { component: AddMerchComponent, dataKey: 'Merchendiseur' },
  MERCHANDISEUR_MULTI: { component: AddMerchComponent, dataKey: 'Merchendiseur' }
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, MatSortModule, MatSidenavModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,
    MatCheckboxModule, MatPaginatorModule, TranslateModule,MatTooltipModule,
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
    MatMenuModule, MatListModule, RouterLink, RouterModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
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
  // showFilters = false;
  
  // Available options for filters
  availableRegions: string[] = Object.keys(Region).map(key => Region[key as keyof typeof Region]);
  availableCities: string[] = [];
  availableStores: string[] = [];
  componentMap: { [key: string]: { component: any, dataKey: string } } = {
    SUPERVISEUR: { component: AddSupComponent, dataKey: 'superviseur' },
    MERCHANDISEUR_MONO: { component: AddMerchComponent, dataKey: 'Merchendiseur' },
    MERCHANDISEUR_MULTI: { component: AddMerchComponent, dataKey: 'Merchendiseur' },
    MERCHENDISEUR: { component: AddMerchComponent, dataKey: 'Merchendiseur' }
  };
  showFilters: boolean = false;
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
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
          : 'assets/profil.webp';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
        // Valeurs par défaut en cas d'erreur
        this.avatarUrl = 'assets/profil.webp';
      }
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
  displayedColumns: string[] = [ 'numero', 'nom', 'region', 'city', 'store', 'connexion', 'sessions', 'role', 'status', 'actions'];
  combinedDataSource = new MatTableDataSource<any>([]);

  constructor(
    private translate: TranslateService,
    private superviseurService: SuperveseurService,
    private merchendiseurService: MerchendiseurService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private exportService: ExportService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCurrentUser();
  }

  ngAfterViewInit() {
    this.combinedDataSource.filterPredicate = (data: any, filter: string) => {
      const filterObj = JSON.parse(filter);
      const matchesSearch = !filterObj.searchTerm ||
        data.nom.toLowerCase().includes(filterObj.searchTerm) ||
        data.id.toString().includes(filterObj.searchTerm);

      const matchesRole = !filterObj.role || data.type === filterObj.role;
      const matchesStatus = !filterObj.status || data.status === filterObj.status;
      const matchesRegion = !filterObj.region || data.region === filterObj.region;
      const matchesCity = !filterObj.city || data.ville === filterObj.city;
      const matchesStore = !filterObj.store || data.magasin === filterObj.store;

      return matchesSearch && matchesRole && matchesStatus && matchesRegion && matchesCity && matchesStore;
    };
  }

  loadUsers(): void {
    this.superviseurService.getAll().subscribe(superviseurs => {
      const formattedSuperviseurs = superviseurs.map(s => ({ ...s, type: 'SUPERVISEUR' }));
      this.merchendiseurService.getAllMerchendiseurs().subscribe(merchandiseurs => {
        const formattedMerch = merchandiseurs.map(m => ({ ...m, type: 'MERCHENDISEUR' }));
        const combined = [...formattedSuperviseurs, ...formattedMerch];

        // Debug: Afficher les données pour vérifier les statuts
        console.log('Données combinées:', combined);
        combined.forEach(user => {
          console.log(`User ${user.nom}: status=${user.status}, type=${user.type}`);
        });

        this.combinedDataSource.data = combined;
        this.combinedDataSource.sort = this.sort;
        this.combinedDataSource.paginator = this.paginator;
        
        // Populate available cities and stores
        this.populateFilterOptions(combined);
      });
    });
  }

  private populateFilterOptions(users: any[]): void {
    // Extract unique cities
    const citySet = new Set(users.map(user => user.ville).filter(city => city));
    this.availableCities = Array.from(citySet).sort();
    
    // Extract unique stores
    const storeSet = new Set(users.map(user => user.magasin).filter(store => store));
    this.availableStores = Array.from(storeSet).sort();
  }

  applyFilter(): void {
    this.combinedDataSource.filter = JSON.stringify({
      searchTerm: this.searchTerm.trim().toLowerCase(),
      role: this.selectedRole,
      status: this.selectedStatus,
      region: this.selectedRegion,
      city: this.selectedCity,
      store: this.selectedStore
    });
  }

  clearAllFilters(): void {
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedRegion = '';
    this.selectedCity = '';
    this.selectedStore = '';
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
      : this.combinedDataSource.data.forEach(row => this.selection.select(row));
  }

  toggleStatus(row: any): void {
    const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log(`Changement de statut pour ${row.nom}: ${row.status} -> ${newStatus}`);

    if (row.type === 'SUPERVISEUR') {
      this.superviseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
        // Forcer la détection des changements
        this.combinedDataSource.data = [...this.combinedDataSource.data];
        console.log(`Statut mis à jour pour superviseur ${row.nom}: ${row.status}`);
        console.log(`Classe CSS appliquée: ${row.status === 'ACTIVE' ? 'btn-active (VERT)' : 'btn-inactive (ROUGE)'}`);
      });
    } else if (row.type === 'MERCHANDISEUR_MONO' || row.type === 'MERCHANDISEUR_MULTI' || row.type === 'MERCHENDISEUR') {
      this.merchendiseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
        // Forcer la détection des changements
        this.combinedDataSource.data = [...this.combinedDataSource.data];
        console.log(`Statut mis à jour pour merchandiseur ${row.nom}: ${row.status}`);
        console.log(`Classe CSS appliquée: ${row.status === 'ACTIVE' ? 'btn-active (VERT)' : 'btn-inactive (ROUGE)'}`);
      });
    }
  }

  exportToExcel(): void {
    // Séparer les utilisateurs par type
    const superviseurs = this.combinedDataSource.data.filter(user => user.type === 'SUPERVISEUR');
    const merchandisers = this.combinedDataSource.data.filter(user => user.type === 'MERCHENDISEUR' || user.type === 'MERCHANDISEUR_MONO' || user.type === 'MERCHANDISEUR_MULTI');
    
    // Exporter tous les utilisateurs dans un fichier multi-feuilles
    this.exportService.exportAllData({
      superviseurs: superviseurs,
      merchandisers: merchandisers
    }, {
      filename: 'utilisateurs_complets',
      sheetName: 'Utilisateurs'
    });
  }

  deleteUser(userId: number, type: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      if (type === 'SUPERVISEUR') {
        this.superviseurService.delete(userId).subscribe(() => {
          this.combinedDataSource.data = this.combinedDataSource.data.filter((user: any) => user.id !== userId);
          this.snackBar.open('Superviseur supprimé avec succès', 'Fermer', { duration: 3000 });
        }, error => {
          this.snackBar.open('Erreur lors de la suppression du superviseur', 'Fermer', { duration: 3000 });
        });

      } else if (type === 'MERCHENDISEUR') {
        this.merchendiseurService.deleteMerchendiseur(userId).subscribe(() => {
          this.combinedDataSource.data = this.combinedDataSource.data.filter((user: any) => user.id !== userId);
          this.snackBar.open('Merchandiseur supprimé avec succès', 'Fermer', { duration: 3000 });
        }, error => {
          this.snackBar.open('Erreur lors de la suppression du merchandiseur', 'Fermer', { duration: 3000 });
        });
      }
    }
  }

  onToggleDashboard(event: any): void {
    if (event.checked) {
      this.router.navigate(['/Dashbord']);
    }
  }

  removeFromTable(id: number): void {
    this.combinedDataSource.data = this.combinedDataSource.data.filter(item => item.id !== id);
    this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
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
      data: { [config.dataKey]: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openAddUserDialog(): void {
    // Ouvrir d'abord le dialogue de sélection de rôle
    const roleDialogRef = this.dialog.open(SelectRoleComponent, {
      width: '600px',
      disableClose: true
    });

    roleDialogRef.afterClosed().subscribe(result => {
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
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Recharge la liste après ajout
      }
    });
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

  logout(): void {
    this.authService.logout();
  }

  onRowClick(event: MouseEvent, row: any): void {
    const target = event.target as HTMLElement;

    // Vérifie spécifiquement les boutons edit/delete via leurs classes
    const isEditOrDelete = target.closest('.edit-button') ||
      target.closest('.delete-button') ||
      target.closest('mat-icon')?.parentElement?.classList.contains('edit-button') ||
      target.closest('mat-icon')?.parentElement?.classList.contains('delete-button');

    if (isEditOrDelete) {
      return;
    }

    // Ouvrir le bon dialog selon le type d'utilisateur
    this.showUserDetails(row);
  }

  showUserDetails(row: any): void {
    if (row.type === 'SUPERVISEUR') {
      this.router.navigate(['/superviseur-detail', row.id]);
    } else if (row.type === 'MERCHENDISEUR' || row.type === 'MERCHANDISEUR_MONO' || row.type === 'MERCHANDISEUR_MULTI') {
      this.router.navigate(['/merchendiseur-detail', row.id]);
    } else {
      console.warn('Type d\'utilisateur non reconnu:', row.type);
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
}







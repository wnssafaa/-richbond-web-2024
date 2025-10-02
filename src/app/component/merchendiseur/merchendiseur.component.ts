import { Component, OnInit } from '@angular/core';
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
import { AdduserComponent } from '../adduser/adduser.component';
import {
  MerchendiseurService,
  Merchendiseur,
} from '../../services/merchendiseur.service';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Region } from '../../enum/Region';
import { Role } from '../../enum/Role';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import {
  trigger,
  transition,
  style,
  animate,
  keyframes,
} from '@angular/animations';
import { ExportService } from '../../services/export.service';
import { MerchandiserDetailsDialogComponent } from '../../dialogs/merchandiser-details-dialog/merchandiser-details-dialog.component';
import {
  SuperveseurService,
  Superviseur,
} from '../../services/superveseur.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MagasinService, Magasin } from '../../services/magasin.service';
// import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-merchendiseur',
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
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatListModule,
    HttpClientModule,
    RouterLink,
    MatPaginatorModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ColumnCustomizationPanelComponent,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: './merchendiseur.component.html',
  styleUrl: './merchendiseur.component.css',
})
export class MerchendiseurComponent implements OnInit {
  merchandiseurs: Merchendiseur[] = [];
  searchText: string = '';
  selection = new SelectionModel<Merchendiseur>(true, []);
  dashboardView: boolean = false;
  dataSource = new MatTableDataSource<any>();
  isColumnCustomizationOpen: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'id',
    'nom',
   
    'Profil',
    'region',
    'ville',
    'superviseur',
    'marques',
    'magasin',
    'telephone',
    'dateIntegration',
    'dateSortie',
    'actions',
  ];

  // Configuration des colonnes pour la personnalisation
  columnConfig = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'nom', label: 'Nom', visible: true },
    // { key: 'prenom', label: 'Prénom', visible: true },
    { key: 'Profil', label: 'Profil', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'ville', label: 'Ville', visible: true },
    { key: 'superviseur', label: 'Superviseur', visible: true },
    { key: 'marques', label: 'Marques', visible: true },
    { key: 'magasin', label: 'Magasin', visible: true },
    { key: 'telephone', label: 'Téléphone', visible: true },
    { key: 'dateIntegration', label: 'Date d\'intégration', visible: true },
    { key: 'dateSortie', label: 'Date de sortie', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  status!: string;
  imagePath: string | undefined;
  avatarUrl: string | undefined;
  onToggleDashboard(event: any): void {
    if (event.checked) {
      this.router.navigate(['/Dashbord']);
    }
  }
  exportToExcel(): void {
    console.log('Début de l\'exportation des merchandisers...');
    console.log('Données à exporter:', this.dataSource.data);
    
    try {
      this.exportService.exportMerchandisers(this.dataSource.data, {
        filename: 'merchandiseurs',
        sheetName: 'Merchandiseurs'
      });
      console.log('Exportation Excel lancée avec succès');
      this.snackBar.open('Fichier Excel téléchargé', 'Fermer', { duration: 3000 });
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      this.snackBar.open('Erreur lors de l\'exportation', 'Fermer', { duration: 3000 });
    }
  }


  testExport(): void {
    console.log('Test d\'exportation simple...');
    this.exportService.testExport();
  }

  enseignes = [
    'Carrefour',
    'Marjane',
    'Aswak Assalam',
    'Acima',
    "Label'Vie",
    'BIM',
    'Atacadao',
    'Carrefour Market',
    'Metro',
    'Super U',
    'Uniprix',
    'Hanouty',
    'Miniprix',
    'Decathlon',
    'IKEA',
    'Electroplanet',
    'Virgin Megastore',
    'LC Waikiki',
  ];
  profils: string[] = ['MERCHANDISEUR_MONO', 'MERCHANDISEUR_MULTI'];

  magasins: Magasin[] = [];

  magasinNames: string[] = [];

  marques: string[] = Object.values(MarqueProduit);

  roles: string[] = Object.values(Role);

  superviseurs: Superviseur[] = [];

  superviseurNames: string[] = [];

  villesParRegion: { [key: string]: string[] } = {
    'Tanger-Tétouan-Al Hoceïma': [
      'Tanger',
      'Tétouan',
      'Al Hoceïma',
      'Chefchaouen',
      'Larache',
      'Ksar El Kebir',
      'Fnideq',
      'Mdiq',
    ],
    "l'Oriental": [
      'Oujda',
      'Berkane',
      'Nador',
      'Taourirt',
      'Jerada',
      'Figuig',
      'Driouch',
      'Guercif',
    ],
    'Fès-Meknès': [
      'Fès',
      'Meknès',
      'Taza',
      'Sefrou',
      'Moulay Yacoub',
      'El Hajeb',
      'Ifrane',
      'Boulemane',
    ],
    'Rabat-Salé-Kénitra': [
      'Rabat',
      'Salé',
      'Kénitra',
      'Skhirat',
      'Témara',
      'Sidi Kacem',
      'Sidi Slimane',
      'Khémisset',
    ],
    'Béni Mellal-Khénifra': [
      'Béni Mellal',
      'Khénifra',
      'Khouribga',
      'Fquih Ben Salah',
      'Azilal',
      'Kasba Tadla',
    ],
    'Casablanca-Settat': [
      'Casablanca',
      'Settat',
      'Mohammedia',
      'Berrechid',
      'El Jadida',
      'Benslimane',
      'Nouaceur',
      'Sidi Bennour',
    ],
    'Marrakech-Safi': [
      'Marrakech',
      'Safi',
      'Essaouira',
      'Youssoufia',
      'Chichaoua',
      'El Kelâa des Sraghna',
      'Rehamna',
      'Al Haouz',
    ],
    'Drâa-Tafilalet': [
      'Errachidia',
      'Ouarzazate',
      'Midelt',
      'Tinghir',
      'Zagora',
      'Rissani',
      'Alnif',
    ],
    'Souss-Massa': [
      'Agadir',
      'Inezgane',
      'Taroudant',
      'Tiznit',
      'Chtouka Aït Baha',
      'Tata',
      'Biougra',
    ],
    'Guelmim-Oued Noun': [
      'Guelmim',
      'Sidi Ifni',
      'Tan-Tan',
      'Assa',
      'Foum Zguid',
      'Taghjijt',
      'Mirleft',
    ],
    'Laâyoune-Sakia El Hamra': [
      'Laâyoune',
      'Boujdour',
      'Tarfaya',
      'El Marsa',
      'Tichla',
      'Daoura',
    ],
    'Dakhla-Oued Ed-Dahab': [
      'Dakhla',
      'Aousserd',
      'Bir Gandouz',
      'Gleibat El Foula',
      'Ntirett',
    ],
  };
  selectedRegion: string = '';
  selectedVille: string = '';
  selectedEnseigne: string = '';
  selectedMagasin: string = '';

  selectedMarque: string = '';

  selectedProfil: string = '';

  selectedRole: string = '';

  selectedSuperviseur: string = '';

  // Variables pour les filtres de dates
  selectedIntegrationDate: Date | null = null;
  selectedSortieDate: Date | null = null;

  villes: string[] = [];

  onRegionChange(region: string) {
    this.villes = this.villesParRegion[region] || [];
    this.selectedVille = '';
    this.applyFilters();
  }

  showFilters: any;

  constructor(
    private translate: TranslateService,
    private merchendiseurService: MerchendiseurService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private superviseurService: SuperveseurService,
    private magasinService: MagasinService,
    private exportService: ExportService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }
  username: any;
  email: any;
  role: any;
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  regions: string[] = Object.values(Region);
  menuOpen = false;
  // loadCurrentUser(): void {
  //   this.authService.getCurrentUserInfo().subscribe({
  //     next: (data) => {
  //       console.log('Utilisateur connecté :', data);
  //       this.username = data.username;
  //       this.role = data.role;
  //       this.email=data.email
  //     },
  //     error: (err) => {
  //       console.error('Erreur lors de la récupération des infos utilisateur :', err);
  //     }
  //   });
  // }
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.getMerchendiseurs();
    this.setupCustomFilter();
    this.loadCurrentUser();

    this.loadMagasins();

    this.loadSuperviseurs();
    this.updateDisplayedColumns();
  }

  private setupCustomFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterObj = JSON.parse(filter);
      const matchesSearch =
        !filterObj.searchText ||
        data.nom?.toLowerCase().includes(filterObj.searchText) ||
        data.prenom?.toLowerCase().includes(filterObj.searchText) ||
        data.email?.toLowerCase().includes(filterObj.searchText);

      const matchesRegion =
        !filterObj.region || data.region === filterObj.region;
      const matchesVille = !filterObj.ville || data.ville === filterObj.ville;
      const matchesEnseigne =
        !filterObj.enseigne ||
        (data.enseignes && data.enseignes.includes(filterObj.enseigne));
      // Logique de filtrage par magasin

      const matchesMagasin =
        !filterObj.magasin ||
        (data.magasinNom && data.magasinNom.toLowerCase().includes(filterObj.magasin.toLowerCase()));

      // Logique de filtrage par marque

      const matchesMarque =
        !filterObj.marque ||
        (data.marques && data.marques.includes(filterObj.marque));
      const matchesProfil = !filterObj.profil || data.role === filterObj.profil;

      // Logique de filtrage par rôle

      const matchesRole = !filterObj.role || data.role === filterObj.role;

      // Logique de filtrage par superviseur

      const matchesSuperviseur =
        !filterObj.superviseur ||
        Boolean(
          data.superviseur &&
            `${data.superviseur.nom} ${data.superviseur.prenom}`
              .toLowerCase()
              .includes(filterObj.superviseur.toLowerCase())
        );

      // Logique de filtrage par date d'intégration
      const matchesIntegrationDate = this.matchesExactDate(
        data.dateDebutIntegration,
        filterObj.integrationDate
      );

      // Logique de filtrage par date de sortie
      const matchesSortieDate = this.matchesExactDate(
        data.dateSortie,
        filterObj.sortieDate
        );

      return (
        matchesSearch &&
        matchesRegion &&
        matchesVille &&
        matchesEnseigne &&
        matchesMagasin &&
        matchesMarque &&
        matchesProfil &&
        matchesRole &&
        matchesSuperviseur &&
        matchesIntegrationDate &&
        matchesSortieDate
      );
    };
  }

  // Méthode utilitaire pour vérifier si une date correspond exactement
  private matchesExactDate(date: Date | string | null | undefined, filterDate: string | null): boolean {
    if (!filterDate) return true;
    if (!date) return false;

    const checkDate = new Date(date);
    const filter = new Date(filterDate);

    // Comparer seulement l'année, le mois et le jour (ignorer l'heure)
    return checkDate.getFullYear() === filter.getFullYear() &&
           checkDate.getMonth() === filter.getMonth() &&
           checkDate.getDate() === filter.getDate();
  }
  currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
  loadMagasins(): void {
    this.magasinService.getAllMagasins().subscribe(
      (magasins) => {
        this.magasins = magasins;

        this.magasinNames = magasins.map((magasin) => magasin.nom);
      },

      (error) => {
        console.error('Erreur lors du chargement des magasins:', error);
      }
    );
  }

  loadSuperviseurs(): void {
    this.superviseurService.getAll().subscribe(
      (superviseurs: Superviseur[]) => {
        this.superviseurs = superviseurs;

        this.superviseurNames = superviseurs.map(
          (superviseur: Superviseur) =>
            `${superviseur.nom} ${superviseur.prenom}`
        );
      },

      (error: any) => {
        console.error('Erreur lors du chargement des superviseurs:', error);
      }
    );
  }
  getMerchendiseurs(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe(
      (data) => {
        this.merchandiseurs = data;
        this.loadSuperviseurNames(); // Charge les noms des superviseurs
      },
      (error) => console.error(error)
    );
  }
  loadSuperviseurNames(): void {
    let loadedCount = 0;
    const totalToLoad = this.merchandiseurs.filter(merch => merch.superviseurId).length;
    
    if (totalToLoad === 0) {
      // Aucun superviseur à charger, mettre à jour le DataSource
      this.createExpandedDataSource();
      return;
    }

    this.merchandiseurs.forEach((merch) => {
      if (merch.superviseurId) {
        this.superviseurService
          .getById(merch.superviseurId)
          .subscribe((superviseur) => {
            if (superviseur.id !== undefined) {
              merch.superviseur = {
                id: superviseur.id!,
                nom: superviseur.nom,
                prenom: superviseur.prenom
              };
            }
            merch.superviseurNom = superviseur.nom;
            merch.superviseurPrenom = superviseur.prenom;
            
            loadedCount++;
            // Mettre à jour le DataSource quand tous les superviseurs sont chargés
            if (loadedCount === totalToLoad) {
              this.createExpandedDataSource();
            }
          });
      }
    });
  }

  // Méthode pour créer une ligne par merchandiser-magasin
  createExpandedDataSource(): void {
    const expandedData: any[] = [];

    this.merchandiseurs.forEach((merch) => {
      if (merch.magasinIds && merch.magasinIds.length > 0) {
        // Si le merchandiser a des magasins, créer une ligne pour chaque magasin
        merch.magasinIds.forEach((magasinId) => {
          const magasin = this.magasins.find(m => m.id === magasinId);
          const expandedMerch = {
            ...merch,
            uniqueKey: `${merch.id}_${magasinId}`, // Clé unique pour chaque ligne
            magasinId: magasinId,
            magasinNom: magasin ? magasin.nom : `Magasin ${magasinId}`,
            magasinNoms: [magasin ? magasin.nom : `Magasin ${magasinId}`], // Un seul magasin par ligne
            dateIntegration: merch.dateDebutIntegration // Mapper la propriété correcte
          };
          expandedData.push(expandedMerch);
        });
      } else {
        // Si le merchandiser n'a pas de magasins, créer une ligne sans magasin
        const expandedMerch = {
          ...merch,
          uniqueKey: `${merch.id}_no_magasin`,
          magasinId: null,
          magasinNom: 'Aucun magasin',
          magasinNoms: [],
          dateIntegration: merch.dateDebutIntegration // Mapper la propriété correcte
        };
        expandedData.push(expandedMerch);
      }
    });

    this.dataSource.data = expandedData;
  }


  // Méthode pour obtenir les noms des magasins d'un merchandiser
  getMagasinNames(merch: any): string {
    // Utiliser le nom du magasin unique pour cette ligne
    return merch.magasinNom || 'Aucun magasin';
  }
  userMenuOpen = false;
  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      searchText: this.searchText.toLowerCase(),
      region: this.selectedRegion,
      ville: this.selectedVille,
      enseigne: this.selectedEnseigne,
      magasin: this.selectedMagasin,
      marque: this.selectedMarque,
      profil: this.selectedProfil,
      role: this.selectedRole,
      superviseur: this.selectedSuperviseur,
      integrationDate: this.selectedIntegrationDate?.toISOString(),
      sortieDate: this.selectedSortieDate?.toISOString(),
    });
  }
  // Filtrer les superviseurs
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  openAddUserDialog(): void {
    this.openAddDialog(); // Réutilise ton openAddDialog existant
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddMerchComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Ajout dynamique aux données
        this.merchandiseurs = [...this.merchandiseurs, result];

        // Mise à jour du DataSource
        this.dataSource.data = this.merchandiseurs; // <-- Ligne cruciale

        this.snackBar.open('Merchendiseur ajouté avec succès', 'Fermer', {
          duration: 2000,
        });
      }
    });
  }

  openEditMerchDialog(merch: Merchendiseur): void {
    // Tu peux ouvrir le même AddMerchComponent en mode édition avec les données
    const dialogRef = this.dialog.open(AddMerchComponent, {
      width: '400px',
      data: merch,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.merchandiseurs.findIndex((m) => m.id === result.id);
        if (index !== -1) this.merchandiseurs[index] = result;
        this.snackBar.open('Merchendiseur mis à jour', 'Fermer', {
          duration: 2000,
        });
      }
    });
  }

  deleteMerch(id: number): void {
    this.deleteMerchendiseur(id);
  }

  updateStatus(id: number, status: string): void {
    this.merchendiseurService.updateStatus(id, status).subscribe(
      (updatedMerchendiseur) => {
        const index = this.merchandiseurs.findIndex((m) => m.id === id);
        if (index !== -1) {
          this.merchandiseurs[index] = updatedMerchendiseur;
        }
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', {
          duration: 2000,
        });
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du statut', error);
        this.snackBar.open(
          'Erreur lors de la mise à jour du statut',
          'Fermer',
          {
            duration: 2000,
          }
        );
      }
    );
  }

  get merchandisers(): Merchendiseur[] {
    if (!this.searchText) return this.merchandiseurs;
    return this.merchandiseurs.filter(
      (m) =>
        m.nom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        m.prenom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        m.email?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  editUser(merchandiseur: Merchendiseur) {
    const dialogRef = this.dialog.open(AddMerchComponent, {
      width: '700px',
      data: { merchandiseur },
    });

    dialogRef.afterClosed().subscribe((updatedMerch) => {
      if (updatedMerch) {
        // Trouver l'index
        const index = this.merchandiseurs.findIndex(
          (m) => m.id === updatedMerch.id
        );

        if (index > -1) {
          // Mise à jour locale
          this.merchandiseurs[index] = updatedMerch;

          // Rafraîchir le DataSource
          this.dataSource.data = [...this.merchandiseurs]; // <-- Nouveau tableau

          this.snackBar.open('Merchendiseur modifié', 'Fermer', {
            duration: 2000,
          });
        }
      }
    });
  }
  deleteMerchendiseur(Id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet Merchediseur ?')) {
      this.merchendiseurService.deleteMerchendiseur(Id).subscribe(
        () => {
          this.dataSource.data = this.dataSource.data.filter(
            (user: Merchendiseur) => user.id !== Id
          ); // Met à jour le tableau
          this.snackBar.open('Merchediseur supprimé avec succès', 'Fermer', {
            duration: 3000,
          });
        },
        (error) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
          });
        }
      );
    }
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
  onRowClick(event: MouseEvent, row: Merchendiseur): void {
    const target = event.target as HTMLElement;

    // Vérifie spécifiquement les boutons edit/delete via leurs classes
    const isEditOrDelete =
      target.closest('.edit-button') ||
      target.closest('.delete-button') ||
      target
        .closest('mat-icon')
        ?.parentElement?.classList.contains('edit-button') ||
      target
        .closest('mat-icon')
        ?.parentElement?.classList.contains('delete-button');

    if (isEditOrDelete) {
      return;
    }

    this.router.navigate(['/merchendiseur-detail', row.id]);
  }
  viewMerchendiseur(merchendiseur: Merchendiseur): void {
    this.router.navigate(['/merchendiseur-detail', merchendiseur.id]);
  }

  logout(): void {
    this.authService.logout();
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
          ? data.imagePath.startsWith('data:image')
            ? data.imagePath
            : 'http://localhost:8080/uploads/' + data.imagePath
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération des infos utilisateur :',
          err
        );
      },
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
}

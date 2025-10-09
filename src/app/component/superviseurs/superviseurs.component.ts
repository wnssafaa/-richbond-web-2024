import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {
  SuperveseurService,
  Superviseur,
} from '../../services/superveseur.service';
import { AddSupComponent } from '../../dialogs/add-sup/add-sup.component';
import { GenericImportDialogComponent } from '../../dialogs/generic-import-dialog/generic-import-dialog.component';
import { ImportConfigService } from '../../services/import-config.service';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Region } from '../../enum/Region';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  Merchendiseur,
  MerchendiseurService,
} from '../../services/merchendiseur.service';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { SuperviseurDetailsDialogComponent } from '../../dialogs/superviseur-details-dialog/superviseur-details-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-superviseurs',
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
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
    ColumnCustomizationPanelComponent,
  ],
  templateUrl: './superviseurs.component.html',
  styleUrl: './superviseurs.component.css',
})
export class SuperviseursComponent implements OnInit {
  // Sélection pour les cases à cocher
  selection = new SelectionModel<Superviseur>(true, []);
  superviseurs: Superviseur[] = [];
  dataSource = new MatTableDataSource<Superviseur>();
  searchText: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isColumnCustomizationOpen: boolean = false;
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
  @ViewChild(MatSort) sort!: MatSort;
  username: any;
  email: any;
  role: any;
  exportToExcel(): void {
    this.exportService.exportSuperviseurs(this.dataSource.data, {
      filename: 'superviseurs',
      sheetName: 'Superviseurs'
    });
  }
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = [
    'id',
    'nom',
    'prenom',
    'region',
    'villeIntervention',
    'magasin',
    'merchandiseurs',
    'enseigne',
    'telephone',
    'dateIntegration',
    'dateSortie',
    'actions',
  ];

  // Configuration des colonnes pour la personnalisation
  columnConfig = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'nom', label: 'Nom', visible: true },
    { key: 'prenom', label: 'Prénom', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'villeIntervention', label: 'Ville d\'intervention', visible: true },
    { key: 'magasin', label: 'Magasins', visible: true },
    { key: 'merchandiseurs', label: 'Merchandiseurs', visible: true },
    { key: 'enseigne', label: 'Enseigne', visible: true },
    { key: 'telephone', label: 'Téléphone', visible: true },
    { key: 'dateIntegration', label: 'Date d\'intégration', visible: true },
    { key: 'dateSortie', label: 'Date de sortie', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];
  showFilters: boolean = false;
  selectedRegion: string = '';
  selectedVille: string = '';
  selectedEnseigne: string = '';
  selectedMagasin: string = '';
  selectedMarque: string = '';
  selectedMerchandiseur: string = '';
  selectedDateDebut: Date | null = null;
  selectedDateSortie: Date | null = null;

  // Listes pour les filtres

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

  magasins: Magasin[] = [];

  magasinNames: string[] = [];

  marques: string[] = Object.values(MarqueProduit);

  merchandisers: Merchendiseur[] = [];

  merchandiserNames: string[] = [];
  onToggleDashboard(event: any): void {
    if (event.checked) {
      this.router.navigate(['/Dashbord']);
    }
  }
  villesDisponibles: string[] = [];
  regionVillesMap: { [key in Region]: string[] } = {
    [Region.SUD]: ['Assa', 'Zag', 'Tata', 'Akka', 'Foum Zguid'],
    [Region.NORD]: [
      'Al Hoceïma',
      'Chefchaouen',
      'Ouezzane',
      'Fahs-Anjra',
      "M'diq-Fnideq",
    ],
    [Region.ORIENT]: [], // À supprimer (doublon avec ORIENTAL)
    [Region.CENTRE]: [
      'Khouribga',
      'Beni Mellal',
      'Fquih Ben Salah',
      'Azilal',
      'Oulad Ayad',
    ],

    [Region.TANGER_TETOUAN_AL_HOCEIMA]: [
      'Tanger',
      'Tétouan',
      'Al Hoceïma',
      'Larache',
      'Chefchaouen',
      'Ouezzane',
      "M'diq-Fnideq",
      'Fahs-Anjra',
    ],

    [Region.ORIENTAL]: [
      'Oujda',
      'Nador',
      'Berkane',
      'Taourirt',
      'Jerada',
      'Figuig',
      'Driouch',
      'Guercif',
    ],

    [Region.FES_MEKNES]: [
      'Fès',
      'Meknès',
      'Ifrane',
      'El Hajeb',
      'Sefrou',
      'Boulemane',
      'Taza',
      'Taounate',
    ],

    [Region.RABAT_SALE_KENITRA]: [
      'Rabat',
      'Salé',
      'Kénitra',
      'Skhirat',
      'Témara',
      'Sidi Kacem',
      'Sidi Slimane',
      'Khémisset',
    ],

    [Region.BENI_MELLAL_KHENIFRA]: [
      'Béni Mellal',
      'Khénifra',
      'Khouribga',
      'Fquih Ben Salah',
      'Azilal',
    ],

    [Region.CASABLANCA_SETTAT]: [
      'Casablanca',
      'Mohammedia',
      'Settat',
      'El Jadida',
      'Berrechid',
      'Mediouna',
      'Nouaceur',
      'Benslimane',
      'Sidi Bennour',
    ],

    [Region.MARRAKECH_SAFI]: [
      'Marrakech',
      'Safi',
      'Essaouira',
      'El Kelaâ des Sraghna',
      'Youssoufia',
      'Chichaoua',
      'Al Haouz',
      'Rhamna',
    ],

    [Region.DRAA_TAFILALET]: [
      'Errachidia',
      'Ouarzazate',
      'Midelt',
      'Tinghir',
      'Zagora',
    ],

    [Region.SOUSS_MASSA]: [
      'Agadir',
      'Inezgane',
      'Taroudant',
      'Tiznit',
      'Chtouka-Aït Baha',
    ],

    [Region.GUELMIM_OUED_NOUN]: [
      'Guelmim',
      'Tan-Tan',
      'Assa',
      'Zag',
      'Sidi Ifni',
    ],

    [Region.LAAYOUNE_SAKIA_EL_HAMRA]: [
      'Laâyoune',
      'Smara',
      'Tarfaya',
      'Boujdour',
    ],

    [Region.DAKHLA_OUED_ED_DAHAB]: ['Dakhla', 'Aousserd'],
  };
  onRegionChange(selectedRegion: string): void {
    this.selectedRegion = selectedRegion;
    // Ne pas vider selectedVille automatiquement, laisser l'utilisateur choisir
    this.applyFilters();
  }

  // Méthode pour initialiser toutes les villes disponibles
  initializeAllVilles(): void {
    const allVilles: string[] = [];
    Object.values(this.regionVillesMap).forEach(villes => {
      allVilles.push(...villes);
    });
    // Supprimer les doublons et trier
    this.villesDisponibles = [...new Set(allVilles)].sort();
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      searchText: this.searchText.toLowerCase(),
      region: this.selectedRegion,
      ville: this.selectedVille,
      enseigne: this.selectedEnseigne,
      magasin: this.selectedMagasin,
      marque: this.selectedMarque,
      marchandiseur: this.selectedMerchandiseur,
      dateDebut: this.selectedDateDebut?.toISOString(),
      dateSortie: this.selectedDateSortie?.toISOString(),
    });
  }
  regions: string[] = Object.values(Region);
  villes: string[] = [];
  profils: string[] = [];
  selectedProfil: string = '';
  constructor(
    @Inject(SuperveseurService) private superviseurService: SuperveseurService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private athService: AuthService,
    private translate: TranslateService,
    private magasinService: MagasinService,
    private merchandiserService: MerchendiseurService,
    private exportService: ExportService,
    private importConfigService: ImportConfigService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
  menuOpen = false;
  userMenuOpen = false;
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
  ngOnInit() {
    this.loadSuperviseurs();
    this.loadCurrentUser();

    this.loadMagasins();

    this.loadMerchandisers();

    this.setupCustomFilter();
    this.updateDisplayedColumns();
    this.initializeAllVilles(); // Initialiser toutes les villes disponibles
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadSuperviseurs() {
    this.superviseurService.getAll().subscribe((data: Superviseur[]) => {
      console.log('Superviseurs chargés :', data);
      this.superviseurs = data;
      this.createExpandedDataSource();
    });
  }

  // Méthode pour créer une ligne par superviseur-merchandiser
  createExpandedDataSource(): void {
    const expandedData: any[] = [];

    this.superviseurs.forEach((superviseur) => {
      if (superviseur.merchendiseurs && superviseur.merchendiseurs.length > 0) {
        // Si le superviseur a des merchandiseurs, créer une ligne pour chaque merchandiseur
        superviseur.merchendiseurs.forEach((merchandiseur) => {
          const expandedSuperviseur = {
            ...superviseur,
            uniqueKey: `${superviseur.id}_${merchandiseur.id}`, // Clé unique pour chaque ligne
            merchandiseurId: merchandiseur.id,
            merchandiseurNom: merchandiseur.nom,
            merchandiseurPrenom: merchandiseur.prenom,
            merchandiseurEmail: merchandiseur.email,
            merchandiseurTelephone: merchandiseur.telephone,
            merchandiseurRegion: merchandiseur.region,
            merchandiseurVille: merchandiseur.ville
          };
          expandedData.push(expandedSuperviseur);
        });
      } else {
        // Si le superviseur n'a pas de merchandiseurs, créer une ligne sans merchandiseur
        const expandedSuperviseur = {
          ...superviseur,
          uniqueKey: `${superviseur.id}_no_merchandiseur`,
          merchandiseurId: null,
          merchandiseurNom: 'Aucun merchandiseur',
          merchandiseurPrenom: '',
          merchandiseurEmail: '',
          merchandiseurTelephone: '',
          merchandiseurRegion: '',
          merchandiseurVille: ''
        };
        expandedData.push(expandedSuperviseur);
      }
    });

    this.dataSource.data = expandedData;
    this.dataSource.paginator = this.paginator;
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
  getMerchandiseurEnseignes(superviseur: Superviseur): string[] {
    if (!superviseur.merchendiseurs || superviseur.merchendiseurs.length === 0) return [];
    
    const enseignes: string[] = [];
    superviseur.merchendiseurs.forEach(merch => {
      if (merch.enseignes && merch.enseignes.length > 0) {
        enseignes.push(...merch.enseignes);
      }
    });
    
    // Retourner les enseignes uniques
    return [...new Set(enseignes)];
  }
    getMerchandiseurMagasins(superviseur: Superviseur): string[] {
    if (!superviseur.merchendiseurs || superviseur.merchendiseurs.length === 0) return [];
    
    const magasins: string[] = [];
    superviseur.merchendiseurs.forEach(merch => {
      if (merch.magasinNoms && merch.magasinNoms.length > 0) {
        magasins.push(...merch.magasinNoms);
      }
    });
    
    // Retourner les magasins uniques
    return [...new Set(magasins)];
  }
  loadMerchandisers(): void {
    this.merchandiserService.getAllMerchendiseurs().subscribe(
      (merchandisers: Merchendiseur[]) => {
        this.merchandisers = merchandisers;

        this.merchandiserNames = merchandisers.map(
          (merchandiser: Merchendiseur) =>
            `${merchandiser.nom} ${merchandiser.prenom}`
        );
      },

      (error: any) => {
        console.error('Erreur lors du chargement des marchandiseurs:', error);
      }
    );
  }

  private setupCustomFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterObj = JSON.parse(filter);

      const matchesSearch =
        !filterObj.searchText ||
        data.nom?.toLowerCase().includes(filterObj.searchText) ||
        data.prenom?.toLowerCase().includes(filterObj.searchText) ||
        data.email?.toLowerCase().includes(filterObj.searchText) ||
        data.merchandiseurNom?.toLowerCase().includes(filterObj.searchText) ||
        data.merchandiseurPrenom?.toLowerCase().includes(filterObj.searchText);

      const matchesRegion =
        !filterObj.region || data.region === filterObj.region;

      // Filtre ville indépendant de la région
      const matchesVille = !filterObj.ville || data.ville === filterObj.ville;

      const matchesMagasin =
        !filterObj.magasin ||
        Boolean(
          data.magasin &&
            data.magasin.toLowerCase().includes(filterObj.magasin.toLowerCase())
        );

      const matchesMarque =
        !filterObj.marque ||
        Boolean(
          data.marquesCouvertes &&
            data.marquesCouvertes
              .toLowerCase()
              .includes(filterObj.marque.toLowerCase())
        );

      const matchesEnseigne =
        !filterObj.enseigne ||
        Boolean(
          data.magasin &&
            data.magasin
              .toLowerCase()
              .includes(filterObj.enseigne.toLowerCase())
        );

      const matchesMerchandiseur =
        !filterObj.merchandiseur ||
        Boolean(
          data.merchandiseurNom &&
            data.merchandiseurNom.toLowerCase().includes(filterObj.merchandiseur.toLowerCase())
        );

      // Filtres par date
      const matchesDateDebut = !filterObj.dateDebut || 
        this.matchesExactDate(data.dateIntegration, filterObj.dateDebut);

      const matchesDateSortie = !filterObj.dateSortie || 
        this.matchesExactDate(data.dateSortie, filterObj.dateSortie);

      return (
        matchesSearch &&
        matchesRegion &&
        matchesVille &&
        matchesEnseigne &&
        matchesMagasin &&
        matchesMarque &&
        matchesMerchandiseur &&
        matchesDateDebut &&
        matchesDateSortie
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

  // Méthode pour la sélection/désélection de toutes les lignes
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }
  getMerchandiseurNames(merchendiseurs: Merchendiseur[]): string {
    if (!merchendiseurs || merchendiseurs.length === 0) return '';
    return merchendiseurs.map((m) => m.nom).join(', ');
  }
  // Vérifie si toutes les lignes sont sélectionnées
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // Filtrer les superviseurs
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  // Méthode pour exporter les données
  exportData() {
    console.log('Exportation des données en cours...');
    // Implémentez votre logique d'exportation ici (CSV, Excel, etc.)
  }

  // Ouvrir le dialogue pour ajouter un superviseur
  openDialog() {
    const dialogRef = this.dialog.open(AddSupComponent, {
      width: '700px',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.superviseurService.create(result).subscribe({
          next: (newSuperviseur: Superviseur) => {
            this.superviseurs = [...this.superviseurs, result];
            this.loadSuperviseurs(); // Recharger tous les superviseurs
            // Ou ajouter localement:
            // this.superviseurs.push(newSuperviseur);
            this.dataSource.data = [...this.superviseurs];
          },
          error: (error) =>
            console.error("Erreur lors de l'ajout du superviseur", error),
        });
      }
    });
  }
  getMerchandiseurNoms(merchandiseurs: any): string {
    if (!merchandiseurs) return '';
    if (Array.isArray(merchandiseurs)) {
      return merchandiseurs.map((m) => m.nom).join(', ');
    }
    return merchandiseurs.nom || '';
  }
  // Méthode pour éditer un superviseur
  editSuperviseur(superviseur: Superviseur) {
    const dialogRef = this.dialog.open(AddSupComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: { superviseur }, // on envoie l'objet sous la forme { user }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadSuperviseurs(); // Rafraîchir les données si l'utilisateur a été modifié
      }
    });
  }
  // loadCurrentUser(): void {
  //   this.athService.getCurrentUserInfo().subscribe({
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
  // Méthode pour supprimer un superviseur
  deleteSuperviseur(superviseurId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet superviseur ?')) {
      this.superviseurService.delete(superviseurId).subscribe(
        () => {
          this.dataSource.data = this.dataSource.data.filter(
            (superviseur: Superviseur) =>
              superviseur.id !== Number(superviseurId)
          ); // Met à jour le tableau
          this.snackBar.open('superviseur supprimé avec succès', 'Fermer', {
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

  // Méthode pour voir les détails d'un superviseur
  viewSuperviseur(superviseur: Superviseur) {
    this.router.navigate(['/superviseur-detail', superviseur.id]);
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
    this.athService.logout();
  }

  // ✅ Méthode pour ouvrir le dialog d'importation
  openImportDialog(): void {
    const config = this.importConfigService.getSuperviseurImportConfig();
    
    const dialogRef = this.dialog.open(GenericImportDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { config }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Recharger la liste des superviseurs
        this.superviseurService.getAll().subscribe(
          (data) => {
            this.superviseurs = data;
            this.dataSource.data = this.superviseurs;
          }
        );
        
        this.snackBar.open(
          `${result.count} superviseurs importés avec succès`,
          'Fermer',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
      }
    });
  }
  openSuperviseurDetails(superviseur: any): void {
    this.dialog.open(SuperviseurDetailsDialogComponent, {
      data: superviseur,
      width: '700px',
    });
  }
  openDetails(superviseur: any): void {
    this.dialog.open(SuperviseurDetailsDialogComponent, {
      data: superviseur,
      width: '800px',
    });
  }
  onRowClick(event: MouseEvent, row: Superviseur): void {
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

    this.router.navigate(['/superviseur-detail', row.id]);
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

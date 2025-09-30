import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
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
import { AdduserComponent } from '../adduser/adduser.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Magasin, MagasinService } from '../../services/magasin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddMagasinComponent } from '../../dialogs/add-magasin/add-magasin.component';
import { Region } from '../../enum/Region';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { MagasinDetailComponent } from '../../dialogs/magasin-detail/magasin-detail.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { SuperveseurService } from '../../services/superveseur.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
@Component({
  selector: 'app-magasins',
  standalone: true,
   providers: [TranslateService],
  imports: [
    CommonModule,
    MatSortModule,
    MatSidenavModule,
    MatCardModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    TranslateModule,
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
    MatTooltipModule
  ],
  templateUrl: './magasins.component.html',
  styleUrl: './magasins.component.css'
})
export class MagasinsComponent { 
  searchText: string = '';

  filters: {
    marque: string;
    reference: string;
    categorie: string;
    article: string;
    type: string;
    dimensions: string;
  } = {
    marque: '',
    reference: '',
    categorie: '',
    article: '',
    type: '',
    dimensions: ''
  };
  nom: string = '';
  avatarUrl: string = '';
  imagePath: string = '';
  status: string = '';
  prenom: string = '';
  telephone: string = '';

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
 @ViewChild(MatDrawer) drawer!: MatDrawer;
 menuOpen = false;
  username: string = '';
  role: string = '';
  email: string = '';
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
    
     exportToExcel(): void {
        this.exportService.exportMagasins(this.dataSource.data, {
          filename: 'magasins',
          sheetName: 'Magasins'
        });
      }
        onToggleDashboard(event: any): void {
  if (event.checked) {
    this.router.navigate(['/Dashbord']);
  }}
    toggleDrawer(action: 'open' | 'close') {
      if (action === 'open') {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
selectedRegion: string = '';
selectedVille: string = '';
selectedEnseigne: string = '';
selectedMerchandiseur: string = '';
selectedSuperviseur: string = '';
villes: string[] = [];
merchandiseurs: Merchendiseur[] = [];
superviseurs: any[] = [];
 // même tableau d'enseignes que dans MerchendiseurComponent
regions: string[] = Object.values(Region);
enseignes = [
  'Carrefour', 'Marjane', 'Aswak Assalam', 'Acima', 
  'Label\'Vie', 'BIM', 'Atacadao', 'Carrefour Market',
  'Metro', 'Super U', 'Uniprix', 'Hanouty', 'Miniprix',
  'Decathlon', 'IKEA', 'Electroplanet', 'Virgin Megastore', 'LC Waikiki'
];
  dashboardView: boolean = false;
  villesParRegion: { [key: string]: string[] } = {
    'Tanger-Tétouan-Al Hoceïma': [
      'Tanger', 'Tétouan', 'Al Hoceïma', 'Chefchaouen', 'Larache', 'Ksar El Kebir', 'Fnideq', 'Mdiq'
    ],
    'l\'Oriental': [
      'Oujda', 'Berkane', 'Nador', 'Taourirt', 'Jerada', 'Figuig', 'Driouch', 'Guercif'
    ],
    'Fès-Meknès': [
      'Fès', 'Meknès', 'Taza', 'Sefrou', 'Moulay Yacoub', 'El Hajeb', 'Ifrane', 'Boulemane'
    ],
    'Rabat-Salé-Kénitra': [
      'Rabat', 'Salé', 'Kénitra', 'Skhirat', 'Témara', 'Sidi Kacem', 'Sidi Slimane', 'Khémisset'
    ],
    'Béni Mellal-Khénifra': [
      'Béni Mellal', 'Khénifra', 'Khouribga', 'Fquih Ben Salah', 'Azilal', 'Kasba Tadla'
    ],
    'Casablanca-Settat': [
      'Casablanca', 'Settat', 'Mohammedia', 'Berrechid', 'El Jadida', 'Benslimane', 
      'Nouaceur', 'Sidi Bennour'
    ],
    'Marrakech-Safi': [
      'Marrakech', 'Safi', 'Essaouira', 'Youssoufia', 'Chichaoua', 'El Kelâa des Sraghna',
      'Rehamna', 'Al Haouz'
    ],
    'Drâa-Tafilalet': [
      'Errachidia', 'Ouarzazate', 'Midelt', 'Tinghir', 'Zagora', 'Rissani', 'Alnif'
    ],
    'Souss-Massa': [
      'Agadir', 'Inezgane', 'Taroudant', 'Tiznit', 'Chtouka Aït Baha', 'Tata', 'Biougra'
    ],
    'Guelmim-Oued Noun': [
      'Guelmim', 'Sidi Ifni', 'Tan-Tan', 'Assa', 'Foum Zguid', 'Taghjijt', 'Mirleft'
    ],
    'Laâyoune-Sakia El Hamra': [
      'Laâyoune', 'Boujdour', 'Tarfaya', 'El Marsa', 'Tichla', 'Daoura'
    ],
    'Dakhla-Oued Ed-Dahab': [
      'Dakhla', 'Aousserd', 'Bir Gandouz', 'Gleibat El Foula', 'Ntirett'
    ]
  };
  showFilters: boolean = false;
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
        // Valeurs par défaut en cas d'erreur
        this.avatarUrl = 'assets/profil.webp';
      }
    });
  }

    selection = new SelectionModel<Magasin>(true, []);

    dataSource = new MatTableDataSource<Magasin>();
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    currentLanguage = 'fr';
    constructor(
      private translate: TranslateService,
       private cd: ChangeDetectorRef,
      private magasinService: MagasinService,
      private snackBar: MatSnackBar,
      private dialog: MatDialog,
      private router: Router,
      private athService: AuthService,
      private superviseurService: SuperveseurService,
      private merchendiseurService: MerchendiseurService,
      private exportService: ExportService
    ) {

this.translate.setDefaultLang('fr');
  this.translate.use('fr');

      
    }
//     changeLanguage(lang: string) {
//   this.currentLanguage = lang;
//   this.translate.use(lang);
  
//   // Sauvegarder la préférence de langue
//   localStorage.setItem('userLanguage', lang);
  
//   // Recharger les données si nécessaire
  
// }
displayedColumns: string[] = [
  'id',
  'nom',
  'localisation',
  'region',
  'ville',
  'merchandiseur',
  'superviseur',
  'enseigne',
  'typeMagasin',
  'actions']

dataSourceFilter = {
  searchText: '',
  filters: {
    nom: '',
    ville: '',
    type: '',
    enseigne: '',
    merchandiseur: '',
    superviseur: ''
  }
};


  // Filtrer les magasins
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }


loadMagasins() {
  this.magasinService.getAllMagasins().subscribe({
    next: (magasins) => {
      this.dataSource.data = magasins;
      console.log('Magasins chargés:', magasins);
      // Charger les données des merchandiseurs et leurs superviseurs
      this.loadMerchandiseurAndSuperviseurData(magasins);
    },
    error: (err) => console.error(err)
  });
}

// Méthode pour charger les données des merchandiseurs et leurs superviseurs
loadMerchandiseurAndSuperviseurData(magasins: Magasin[]) {
  // Récupérer tous les merchandiseurs
  this.merchendiseurService.getAllMerchendiseurs().subscribe({
    next: (merchandiseurs) => {
      // Stocker les merchandiseurs pour les filtres
      this.merchandiseurs = merchandiseurs;
      // Pour chaque magasin, trouver le merchandiseur assigné et charger son superviseur
      magasins.forEach(magasin => {
        // Trouver le merchandiseur assigné à ce magasin
        const assignedMerchandiseur = merchandiseurs.find(merch => 
          merch.magasinIds && merch.magasinIds.includes(magasin.id!)
        );
        
        if (assignedMerchandiseur) {
          magasin.merchandiseur = {
            id: assignedMerchandiseur.id!,
            nom: assignedMerchandiseur.nom,
            prenom: assignedMerchandiseur.prenom,
            superviseur: undefined
          };
          
          // Charger le superviseur du merchandiseur
          if (assignedMerchandiseur.superviseurId) {
            this.superviseurService.getById(assignedMerchandiseur.superviseurId).subscribe({
              next: (superviseur) => {
                if (magasin.merchandiseur && superviseur.id) {
                  magasin.merchandiseur.superviseur = {
                    id: superviseur.id,
                    nom: superviseur.nom,
                    prenom: superviseur.prenom
                  };
                }
                // Mettre à jour le DataSource
                this.dataSource.data = [...this.dataSource.data];
              },
              error: (err) => console.error('Erreur lors du chargement du superviseur:', err)
            });
          }
        }
      });
      
      // Mettre à jour le DataSource
      this.dataSource.data = [...magasins];
      
      // Charger tous les superviseurs pour les filtres
      this.loadSuperviseurs();
    },
    error: (err) => console.error('Erreur lors du chargement des merchandiseurs:', err)
  });
}

// Méthode pour charger tous les superviseurs
loadSuperviseurs() {
  // Charger les superviseurs depuis les merchandiseurs
  const superviseurIds = [...new Set(this.merchandiseurs
    .map(merch => merch.superviseurId)
    .filter(id => id != null))] as number[];

  this.superviseurs = [];
  superviseurIds.forEach(superviseurId => {
    this.superviseurService.getById(superviseurId).subscribe({
      next: (superviseur: any) => {
        this.superviseurs.push(superviseur);
      },
      error: (err: any) => console.error('Erreur lors du chargement du superviseur:', err)
    });
  });
}


  ngOnInit(): void {
    this.loadCurrentUser();
    this.changeLanguage('fr'); 
    this.loadMagasins();
    this.dataSource.filterPredicate = (data: Magasin, filter: string) => {
      const filterObj = JSON.parse(filter);
      
      const matchesSearch = !filterObj.searchText || 
        (data.nom?.toLowerCase().includes(filterObj.searchText) ||
        data.localisation?.toLowerCase().includes(filterObj.searchText) ||
        data.region?.toLowerCase().includes(filterObj.searchText) ||
        data.ville?.toLowerCase().includes(filterObj.searchText) ||
        data.type?.toLowerCase().includes(filterObj.searchText) ||
        data.enseigne?.toLowerCase().includes(filterObj.searchText));
        
      const matchesRegion = !filterObj.region || data.region === filterObj.region;
      const matchesVille = !filterObj.ville || data.ville === filterObj.ville;
      const matchesEnseigne = !filterObj.enseigne || data.enseigne === filterObj.enseigne;
      
      // Filtre par merchandiseur
      const matchesMerchandiseur = !filterObj.merchandiseur || 
        (data.merchandiseur && data.merchandiseur.id === parseInt(filterObj.merchandiseur));
      
      // Filtre par superviseur
      const matchesSuperviseur = !filterObj.superviseur || 
        (data.merchandiseur && data.merchandiseur.superviseur && 
         data.merchandiseur.superviseur.id === parseInt(filterObj.superviseur));
    
      return Boolean(matchesSearch && matchesRegion && matchesVille && matchesEnseigne && 
             matchesMerchandiseur && matchesSuperviseur);
    };
    
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  get filteredMagasins() {
    if (!this.searchText) return this.dataSource.data;
    const lowerText = this.searchText.toLowerCase();
    return this.dataSource.data.filter(m =>
      m.nom?.toLowerCase().includes(lowerText) ||
      m.localisation?.toLowerCase().includes(lowerText) ||
      m.region?.toLowerCase().includes(lowerText) ||
      m.ville?.toLowerCase().includes(lowerText) ||
      m.type?.toLowerCase().includes(lowerText) ||
      m.enseigne?.toLowerCase().includes(lowerText)
    );
  }
  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      searchText: this.searchText.toLowerCase(),
      region: this.selectedRegion,
      ville: this.selectedVille,
      enseigne: this.selectedEnseigne,
      merchandiseur: this.selectedMerchandiseur,
      superviseur: this.selectedSuperviseur
    });
  }
  onRegionChange(region: string) {
    this.villes = this.villesParRegion[region] || [];
    this.selectedVille = '';
    this.applyFilters();
  }
    
  isAllSelected() {
     const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  openFilter() {
    // Logique d’ouverture de modal ou filtre avancé
    console.log('Filtre ouvert');
  }

  exportData() {
    // Implémenter l’exportation
    console.log('Exportation des données...');
  }


deleteMagasin(magasinid: number | undefined): void {
  if (!magasinid) {
    console.error('ID du magasin non défini');
    return;
  }

  const confirmation = window.confirm("Voulez-vous vraiment supprimer ce magasin ?");

  if (confirmation) {
    this.magasinService.deleteMagasin(magasinid).subscribe({
      next: () => {
        this.snackBar.open('Magasin supprimé avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadMagasins();
      },
      error: (error) => {
        console.error('Erreur de suppression', error);
        this.snackBar.open("Erreur lors de la suppression", "Fermer", {
          duration: 3000
        });
      }
    });
  }
}

  viewMagasin(magasin: any) {
    console.log('Détails :', magasin);
  }
   openAddUserDialog() {
      const dialogRef = this.dialog.open(AdduserComponent, {
        width: '700px',
        panelClass: 'custom-dialog-container',
     // tu peux adapter la taille
        data: {} // si tu veux passer des données
      });
    
      dialogRef.afterClosed().subscribe(result => {
        // action après fermeture du dialogue
        console.log('Le dialogue est fermé', result);
        // ici tu peux actualiser la liste des utilisateurs si nécessaire
      });
    }
    openEditUserDialog(user: any) {}
    masterToggle() {
      if (this.isAllSelected()) {
        this.selection.clear();
      } else {
        this.dataSource.data.forEach(row => this.selection.select(row));
      }
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
openAddMagasinDialog(): void {
    const dialogRef = this.dialog.open(AddMagasinComponent, {
      width: '700px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter le nouveau magasin dans la liste sans recharger tout
        this.dataSource.data = [...this.dataSource.data, result];
      }
    });
  }


  openEditMagasinDialog(magasin: Magasin): void {
    if (!magasin.id) {
      console.error('ID du magasin non défini');
      return;
    }

    const dialogRef = this.dialog.open(AddMagasinComponent, {
      width: '700px',
      data: { mode: 'edit', magasin }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.magasinService.updateMagasin(magasin.id!, result).subscribe({
          next: () => {
            this.snackBar.open('Magasin modifié avec succès', 'Fermer', { duration: 3000 });
            this.loadMagasins();
          },
          error: (error) => {
            console.error('Erreur lors de la modification', error);
            this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

 logout(): void {
        this.athService.logout();
      }
   onRowClick(event: MouseEvent, row: Magasin): void {
      const target = event.target as HTMLElement;
      
      // Vérifie spécifiquement les boutons edit/delete via leurs classes
      const isEditOrDelete = target.closest('.edit-button') || 
                            target.closest('.delete-button') ||
                            target.closest('mat-icon')?.parentElement?.classList.contains('edit-button') ||
                            target.closest('mat-icon')?.parentElement?.classList.contains('delete-button');
    
      if (isEditOrDelete) {
        return;
      }
    
      // Navigation vers la page de détail
      this.router.navigate(['/magasin-detail', row.id]);
    }

    viewMagasinDetail(magasin: Magasin): void {
      this.router.navigate(['/magasin-detail', magasin.id]);
    }
     userMenuOpen: boolean = false;
}
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ExportService } from '../../services/export.service';
import { MagasinService } from '../../services/magasin.service';
import { MerchendiseurService } from '../../services/merchendiseur.service';
import { SuperveseurService } from '../../services/superveseur.service';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';

@Component({
  selector: 'app-login-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    TranslateModule,
    ColumnCustomizationPanelComponent
  ],
  providers: [DatePipe],
  templateUrl: './login-history.component.html',
  styleUrl: './login-history.component.css'
})
export class LoginHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('paginator') paginator!: MatPaginator;

  // Propriétés pour le tableau
  displayedColumns: string[] = [
    'user',
    'date login',
    'date logout',
    'session',
    'role',
    'status',
    'magasin',
    'merchandiser',
    'region',
    'ville',
    'ip',
   
  ];
  
  dataSource = new MatTableDataSource<any>();
  loginHistory: any[] = [];
  
  // Propriétés pour les filtres
  searchText: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  selectedRegion: string = '';
  selectedVille: string = '';
  selectedMagasin: string = '';
  selectedDateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  showFilters: boolean = false;
  
  // Options pour les filtres
  roles: string[] = ['ADMIN', 'SUPERVISEUR', 'MERCHANDISEUR_MONO', 'MERCHANDISEUR_MULTI'];
  statuses: string[] = ['ACTIVE', 'INACTIVE'];
  regions: string[] = [];
  villes: string[] = [];
  magasinNames: string[] = [];

  
  // État de chargement
  isLoading: boolean = false;
  errorMessage: string = '';

  // Configuration des colonnes pour la personnalisation
  isColumnCustomizationOpen: boolean = false;
  columnConfig = [
    { key: 'user', label: 'Utilisateur', visible: true },
    { key: 'date login', label: 'Date Connexion', visible: true },
    { key: 'date logout', label: 'Date Déconnexion', visible: true },
    { key: 'session', label: 'Durée Session', visible: true },
    { key: 'role', label: 'Rôle', visible: true },
    { key: 'status', label: 'Statut', visible: true },
    { key: 'magasin', label: 'Magasins', visible: true },
    { key: 'merchandiser', label: 'Merchandiser/Magasins', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'ville', label: 'Ville', visible: true },
    { key: 'ip', label: 'Adresse IP', visible: true },
   
  ];

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private magasinService: MagasinService,
    private merchendiseurService: MerchendiseurService,
    private superviseurService: SuperveseurService
  ) {}

  ngOnInit(): void {
    this.loadLoginHistory();
    this.updateDisplayedColumns();
  }

  ngAfterViewInit(): void {
    // Configuration du paginateur après l'initialisation de la vue
    // Utiliser setTimeout pour s'assurer que le DOM est complètement rendu
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyage si nécessaire
  }

  /**
   * Charge l'historique de connexion depuis le service
   */
  loadLoginHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getLoginHistory().subscribe({
      next: (history: any) => {
        this.loginHistory = Array.isArray(history) ? history : (history.content || []);
        
        // Enrichir les données utilisateur avec les informations complètes
        this.enrichUserData();
        
        this.dataSource.data = this.loginHistory;
        
        // Extraire les options de filtres depuis les données
        this.extractFilterOptions();
        
        // Reconfigurer le paginateur après le chargement des données
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique de connexion:', err);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
      }
    });
  }

  /**
   * Enrichit les données utilisateur avec les informations complètes selon leur rôle
   */
  enrichUserData(): void {
    this.loginHistory.forEach(entry => {
      const user = entry.user;
      if (user && user.role) {
        // Enrichir selon le rôle
        switch (user.role) {
          case 'MERCHANDISEUR_MONO':
          case 'MERCHANDISEUR_MULTI':
            this.enrichMerchandiseurData(user);
            break;
          case 'SUPERVISEUR':
            this.enrichSuperviseurData(user);
            break;
          case 'ADMIN':
            // Pour les admins, on peut laisser les données par défaut
            break;
        }
      }
    });
  }

  /**
   * Enrichit les données d'un merchandiser
   */
  enrichMerchandiseurData(user: any): void {
    // Charger tous les merchandisers et trouver celui qui correspond
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (merchandiseurs) => {
        const matchingMerchandiseur = merchandiseurs.find(merch => 
          (merch.email === user.email) || 
          (merch.username === user.username) ||
          (merch.nom === user.nom && merch.prenom === user.prenom)
        );
        
        if (matchingMerchandiseur) {
          // Enrichir les données utilisateur
          user.region = matchingMerchandiseur.region;
          user.ville = matchingMerchandiseur.ville;
          user.magasinNoms = matchingMerchandiseur.magasinNoms;
          user.superviseur = matchingMerchandiseur.superviseur;
          console.log('Données merchandiser enrichies:', user.username, user.region, user.ville);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des merchandisers:', err);
      }
    });
  }

  /**
   * Enrichit les données d'un superviseur
   */
  enrichSuperviseurData(user: any): void {
    // Charger tous les superviseurs et trouver celui qui correspond
    this.superviseurService.getAll().subscribe({
      next: (superviseurs) => {
        const matchingSuperviseur = superviseurs.find(sup => 
          (sup.email === user.email) || 
          (sup.username === user.username) ||
          (sup.nom === user.nom && sup.prenom === user.prenom)
        );
        
        if (matchingSuperviseur) {
          // Enrichir les données utilisateur
          user.region = matchingSuperviseur.region;
          user.ville = matchingSuperviseur.ville;
          user.merchendiseurs = matchingSuperviseur.merchendiseurs;
          console.log('Données superviseur enrichies:', user.username, user.region, user.ville);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des superviseurs:', err);
      }
    });
  }

  /**
   * Extrait les options de filtres depuis les données chargées
   */
  extractFilterOptions(): void {
    // Extraire les régions et villes des utilisateurs connectés
    this.extractRegionsAndVillesFromHistory();
    
    // Charger les magasins depuis l'API
    this.loadMagasins();
    
    // Initialiser les villes selon la région sélectionnée
    this.updateVillesForRegion();
  }

  /**
   * Extrait les régions et villes des utilisateurs connectés
   */
  extractRegionsAndVillesFromHistory(): void {
    const regionsSet = new Set<string>();
    const villesSet = new Set<string>();

    this.loginHistory.forEach(entry => {
      const user = entry.user;
      if (user) {
        // Extraire région et ville de l'utilisateur connecté
        if (user.region) {
          regionsSet.add(user.region);
        }
        if (user.ville) {
          villesSet.add(user.ville);
        }
      }
    });

    this.regions = Array.from(regionsSet).sort();
    this.villes = Array.from(villesSet).sort();
  }

  /**
   * Charge les magasins depuis l'API
   */
  loadMagasins(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (magasins) => {
        this.magasinNames = magasins.map(magasin => magasin.nom).sort();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des magasins:', err);
        // En cas d'erreur, utiliser les magasins des données d'historique comme fallback
        this.extractMagasinsFromHistory();
      }
    });
  }

  /**
   * Extrait les magasins depuis les données d'historique (fallback)
   */
  extractMagasinsFromHistory(): void {
    const magasinsSet = new Set<string>();

    this.loginHistory.forEach(entry => {
      const user = entry.user;
      if (user) {
        // Magasins
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          user.magasinNoms.forEach((magasin: string) => {
            magasinsSet.add(magasin);
          });
        }
        
        // Magasins des merchandisers sous superviseur
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          user.merchendiseurs.forEach((merch: any) => {
            if (merch.magasinNoms && merch.magasinNoms.length > 0) {
              merch.magasinNoms.forEach((magasin: string) => {
                magasinsSet.add(magasin);
              });
            }
          });
        }
      }
    });

    this.magasinNames = Array.from(magasinsSet).sort();
  }

  /**
   * Met à jour la liste des villes selon la région sélectionnée
   */
  updateVillesForRegion(): void {
    if (this.selectedRegion) {
      // Filtrer les villes selon la région sélectionnée
      const villesSet = new Set<string>();
      
      this.loginHistory.forEach(entry => {
        const user = entry.user;
        if (user && user.region === this.selectedRegion && user.ville) {
          villesSet.add(user.ville);
        }
      });
      
      this.villes = Array.from(villesSet).sort();
    } else {
      // Si aucune région sélectionnée, afficher toutes les villes des utilisateurs connectés
      this.extractRegionsAndVillesFromHistory();
    }
  }

  /**
   * Gère le changement de région
   */
  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.selectedVille = ''; // Réinitialiser la ville
    this.updateVillesForRegion();
    this.applyFilters();
  }

  /**
   * Applique les filtres sur les données
   */
  applyFilters(): void {
    let filteredData = [...this.loginHistory];

    // Filtre par texte de recherche
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(entry => 
        entry.user?.username?.toLowerCase().includes(searchLower) ||
        entry.user?.nom?.toLowerCase().includes(searchLower) ||
        entry.user?.prenom?.toLowerCase().includes(searchLower) ||
        entry.ipAddress?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filteredData = filteredData.filter(entry => 
        entry.user?.role === this.selectedRole
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filteredData = filteredData.filter(entry => 
        entry.user?.status === this.selectedStatus
      );
    }

    // Filtre par région
    if (this.selectedRegion) {
      filteredData = filteredData.filter(entry => 
        entry.user?.region === this.selectedRegion
      );
    }

    // Filtre par ville
    if (this.selectedVille) {
      filteredData = filteredData.filter(entry => 
        entry.user?.ville === this.selectedVille
      );
    }

    // Filtre par magasin
    if (this.selectedMagasin) {
      filteredData = filteredData.filter(entry => {
        const user = entry.user;
        if (!user) return false;
        
        // Vérifier les magasins directs de l'utilisateur
        if (user.magasinNoms && user.magasinNoms.includes(this.selectedMagasin)) {
          return true;
        }
        
        // Vérifier les magasins des merchandisers sous superviseur
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          return user.merchendiseurs.some((merch: any) => 
            merch.magasinNoms && merch.magasinNoms.includes(this.selectedMagasin)
          );
        }
        
        return false;
      });
    }

    // Filtre par plage de dates
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      filteredData = filteredData.filter(entry => {
        const loginDate = new Date(entry.loginTime);
        return loginDate >= this.selectedDateRange.start! && 
               loginDate <= this.selectedDateRange.end!;
      });
    }

    this.dataSource.data = filteredData;
    
    // Reconfigurer le paginateur après l'application des filtres
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchText = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedRegion = '';
    this.selectedVille = '';
    this.selectedMagasin = '';
    this.selectedDateRange = { start: null, end: null };
    this.dataSource.data = this.loginHistory;
    
    // Reconfigurer le paginateur après la réinitialisation des filtres
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage();
      }
    });
  }

  /**
   * Formate la date de connexion/déconnexion
   */
  formatLoginDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || dateString;
  }

  /**
   * Calcule la durée de session
   */
  calculateSessionDuration(loginTime: string, logoutTime: string | null): string {
    if (!logoutTime) return 'En cours';
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Détermine le type d'appareil basé sur le user agent
   */
  getDeviceType(userAgent: string): string {
    if (!userAgent) return 'Inconnu';
    
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'Mobile';
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return 'Tablette';
    } else {
      return 'Ordinateur';
    }
  }

  /**
   * Obtient l'icône de l'appareil
   */
  getDeviceIcon(userAgent: string): string {
    if (!userAgent) return 'devices_other';
    
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'smartphone';
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return 'tablet';
    } else {
      return 'computer';
    }
  }

  /**
   * Obtient la couleur du statut de connexion
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'INACTIVE': return 'warn';
      default: return '';
    }
  }

  /**
   * Obtient l'icône du statut de connexion
   */
  getStatusIcon(loginDate: string, logoutDate: string | null): string {
    if (!logoutDate) {
      return 'wifi'; // Connexion active
    }
    return 'wifi_off'; // Déconnexion
  }

  /**
   * Exporte les données vers Excel
   */
  exportToExcel(): void {
    this.exportService.exportLoginHistory(this.dataSource.data, {
      filename: 'historique_connexions',
      sheetName: 'Historique Connexions'
    });
  }


  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadLoginHistory();
  }


  /**
   * Obtient les informations des magasins selon le rôle de l'utilisateur
   */
  getStoreInfo(user: any): string {
    if (!user) return 'N/A';

    const role = user.role;
    
    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leurs magasins assignés
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          return user.magasinNoms.join(', ');
        }
        return 'Aucun magasin assigné';
        
      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leurs merchandisers et leurs magasins
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          let result = '';
          user.merchendiseurs.forEach((merch: any, index: number) => {
            if (index > 0) result += '\n';
            result += `• ${merch.prenom} ${merch.nom}`;
            if (merch.magasinNoms && merch.magasinNoms.length > 0) {
              result += ` (${merch.magasinNoms.join(', ')})`;
            } else {
              result += ' (Aucun magasin)';
            }
          });
          return result;
        }
        return 'Aucun merchandiser assigné';
        
      case 'ADMIN':
        return 'Tous les magasins';
        
      default:
        return 'N/A';
    }
  }

  /**
   * Obtient les informations des magasins formatées avec HTML
   */
  getFormattedStoreInfo(user: any): string {
    if (!user) return 'N/A';

    const role = user.role;
    
    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leurs magasins assignés
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          return user.magasinNoms.join(', ');
        }
        return '<span class="no-data">Aucun magasin assigné</span>';
        
      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leurs merchandisers et leurs magasins
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          let result = '';
          user.merchendiseurs.forEach((merch: any, index: number) => {
            if (index > 0) result += '<br>';
            result += `<div class="merchandiser-item">
              <span class="merchandiser-name">• ${merch.prenom} ${merch.nom}</span>`;
            if (merch.magasinNoms && merch.magasinNoms.length > 0) {
              result += `<span class="merchandiser-stores"> (${merch.magasinNoms.join(', ')})</span>`;
            } else {
              result += '<span class="no-data"> (Aucun magasin)</span>';
            }
            result += '</div>';
          });
          return result;
        }
        return '<span class="no-data">Aucun merchandiser assigné</span>';
        
      case 'ADMIN':
        return '<span class="admin-info">Tous les magasins</span>';
        
      default:
        return 'N/A';
    }
  }

  /**
   * Obtient les informations de localisation (ville et région)
   */
  getLocationInfo(user: any): string {
    if (!user) return '';

    const role = user.role;
    
    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leur ville et région
        if (user.ville && user.region) {
          return `${user.ville}, ${user.region}`;
        } else if (user.ville) {
          return user.ville;
        } else if (user.region) {
          return user.region;
        }
        return '';
        
      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leur ville et région
        if (user.ville && user.region) {
          return `${user.ville}, ${user.region}`;
        } else if (user.ville) {
          return user.ville;
        } else if (user.region) {
          return user.region;
        }
        return '';
        
      case 'ADMIN':
        return 'Système';
        
      default:
        return '';
    }
  }

  /**
   * Obtient les informations du merchandiser pour un utilisateur
   */
  getMerchandiserInfo(user: any): string {
    if (!user) return 'N/A';

    const role = user.role;

    switch (role) {
      case 'MERCHANDISEUR_MONO':
      case 'MERCHANDISEUR_MULTI':
        // Pour les merchandisers, afficher leurs magasins assignés
        if (user.magasinNoms && user.magasinNoms.length > 0) {
          return user.magasinNoms.join(', ');
        }
        return 'Aucun magasin assigné';

      case 'SUPERVISEUR':
        // Pour les superviseurs, afficher leurs merchandisers
        if (user.merchendiseurs && user.merchendiseurs.length > 0) {
          return user.merchendiseurs.map((merch: any) => `${merch.prenom} ${merch.nom}`).join(', ');
        }
        return 'Aucun merchandiser assigné';

      case 'ADMIN':
        // Pour les admins, afficher "N/A"
        return 'N/A';

      default:
        return 'N/A';
    }
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

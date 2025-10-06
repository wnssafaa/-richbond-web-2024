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
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExportService } from '../../services/export.service';
import { Region } from '../../enum/Region';
import { MagasinService, Magasin } from '../../services/magasin.service';

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
    FormsModule,
    TranslateModule
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
    'region',
    'ville',
    'magasin',
    'fonction',
    'status',
    'date login',
    'date logout',
    'session',
    'ip'
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
  regions: string[] = Object.values(Region);
  villes: string[] = [];
  magasins: string[] = [];
  
  // Mapping direct des régions pour les traductions
  regionTranslationMap: { [key: string]: { fr: string, en: string } } = {
    'Tanger-Tétouan-Al Hoceïma': { fr: 'Tanger-Tétouan-Al Hoceïma', en: 'Tangier-Tetouan-Al Hoceima' },
    "L'Oriental": { fr: "L'Oriental", en: 'Eastern Region' },
    'Fès-Meknès': { fr: 'Fès-Meknès', en: 'Fez-Meknes' },
    'Rabat-Salé-Kénitra': { fr: 'Rabat-Salé-Kénitra', en: 'Rabat-Sale-Kenitra' },
    'Béni Mellal-Khénifra': { fr: 'Béni Mellal-Khénifra', en: 'Beni Mellal-Khenifra' },
    'Casablanca-Settat': { fr: 'Casablanca-Settat', en: 'Casablanca-Settat' },
    'Marrakech-Safi': { fr: 'Marrakech-Safi', en: 'Marrakech-Safi' },
    'Drâa-Tafilalet': { fr: 'Drâa-Tafilalet', en: 'Draa-Tafilalet' },
    'Souss-Massa': { fr: 'Souss-Massa', en: 'Souss-Massa' },
    'Guelmim-Oued Noun': { fr: 'Guelmim-Oued Noun', en: 'Guelmim-Oued Noun' },
    'Laâyoune-Sakia El Hamra': { fr: 'Laâyoune-Sakia El Hamra', en: 'Laayoune-Sakia El Hamra' },
    'Dakhla-Oued Ed Dahab': { fr: 'Dakhla-Oued Ed Dahab', en: 'Dakhla-Oued Ed Dahab' },
    'Sud': { fr: 'Sud', en: 'South' },
    'Nord': { fr: 'Nord', en: 'North' },
    'Orient': { fr: 'Orient', en: 'East' },
    'Centre': { fr: 'Centre', en: 'Center' }
  };
  
  // État de chargement
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private magasinService: MagasinService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadLoginHistory();
    this.loadMagasins();
    
    // Initialiser les villes avec des données de test si nécessaire
    setTimeout(() => {
      if (this.villes.length === 0) {
        console.log('🚨 Initialisation avec des villes de test...');
        this.villes = [
          'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 
          'Meknès', 'Agadir', 'Oujda', 'Kénitra', 'Tétouan'
        ];
      }
    }, 2000); // Attendre 2 secondes pour voir si les données se chargent
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
    console.log('🚀 Début du chargement de l\'historique de connexion...');
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getLoginHistory().subscribe({
      next: (history: any) => {
        console.log('📥 Données reçues du service:', history);
        console.log('🔍 Type de données:', typeof history);
        console.log('📊 Est un tableau:', Array.isArray(history));
        
        this.loginHistory = Array.isArray(history) ? history : (history.content || []);
        console.log('📋 LoginHistory après traitement:', this.loginHistory);
        console.log('📊 Nombre d\'entrées:', this.loginHistory.length);
        
        this.dataSource.data = this.loginHistory;
        
        // Extraire les villes uniques des données
        this.extractUniqueVilles();
        
        // Reconfigurer le paginateur après le chargement des données
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        });
        
        this.isLoading = false;
        console.log('✅ Chargement terminé');
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l\'historique de connexion:', err);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
        
        // En cas d'erreur, ajouter des données de test
        console.log('🧪 Ajout de données de test en cas d\'erreur...');
        this.loginHistory = [
          {
            user: { username: 'test1', ville: 'Casablanca', region: 'Casablanca-Settat' },
            loginTime: new Date().toISOString(),
            logoutTime: null,
            ipAddress: '192.168.1.1'
          },
          {
            user: { username: 'test2', ville: 'Rabat', region: 'Rabat-Salé-Kénitra' },
            loginTime: new Date().toISOString(),
            logoutTime: null,
            ipAddress: '192.168.1.2'
          },
          {
            user: { username: 'test3', ville: 'Marrakech', region: 'Marrakech-Safi' },
            loginTime: new Date().toISOString(),
            logoutTime: null,
            ipAddress: '192.168.1.3'
          }
        ];
        this.dataSource.data = this.loginHistory;
        this.extractUniqueVilles();
        this.isLoading = false;
      }
    });
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
        entry.user?.region?.toLowerCase().includes(searchLower) ||
        entry.user?.ville?.toLowerCase().includes(searchLower) ||
        entry.user?.magasin?.toLowerCase().includes(searchLower) ||
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

    // Filtre par région (INDÉPENDANT du filtre ville)
    if (this.selectedRegion) {
      filteredData = filteredData.filter(entry => 
        entry.user?.region === this.selectedRegion
      );
    }

    // Filtre par ville (INDÉPENDANT du filtre région)
    if (this.selectedVille) {
      filteredData = filteredData.filter(entry => 
        entry.user?.ville === this.selectedVille
      );
    }

    // Filtre par magasin
    if (this.selectedMagasin) {
      filteredData = filteredData.filter(entry => 
        entry.user?.magasin === this.selectedMagasin
      );
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
   * Gère le changement de date de début
   */
  onStartDateChange(dateString: string): void {
    if (dateString) {
      this.selectedDateRange.start = new Date(dateString);
    } else {
      this.selectedDateRange.start = null;
    }
    this.applyFilters();
  }

  /**
   * Gère le changement de date de fin
   */
  onEndDateChange(dateString: string): void {
    if (dateString) {
      this.selectedDateRange.end = new Date(dateString);
    } else {
      this.selectedDateRange.end = null;
    }
    this.applyFilters();
  }

  /**
   * Extrait les villes uniques des données chargées
   * Cette méthode charge TOUTES les villes disponibles, indépendamment de la région sélectionnée
   */
  private extractUniqueVilles(): void {
    console.log('🔍 Début de l\'extraction des villes...');
    console.log('📊 Nombre total d\'entrées dans loginHistory:', this.loginHistory.length);
    
    const uniqueVilles = new Set<string>();
    let villesTrouvees = 0;
    
    this.loginHistory.forEach((entry, index) => {
      console.log(`📋 Entrée ${index}:`, {
        username: entry.user?.username,
        ville: entry.user?.ville,
        region: entry.user?.region,
        hasUser: !!entry.user,
        hasVille: !!entry.user?.ville
      });
      
      if (entry.user?.ville && entry.user.ville.trim() !== '') {
        uniqueVilles.add(entry.user.ville.trim());
        villesTrouvees++;
        console.log(`✅ Ville trouvée: "${entry.user.ville.trim()}"`);
      } else {
        console.log(`❌ Pas de ville pour l'utilisateur: ${entry.user?.username || 'Inconnu'}`);
      }
    });
    
    this.villes = Array.from(uniqueVilles).sort();
    console.log(`🎯 Résultat final:`);
    console.log(`   - Villes trouvées: ${villesTrouvees}`);
    console.log(`   - Villes uniques: ${this.villes.length}`);
    console.log(`   - Liste des villes:`, this.villes);
    
    // Si aucune ville n'est trouvée, essayer d'autres sources
    if (this.villes.length === 0) {
      console.log('⚠️ Aucune ville trouvée, recherche dans d\'autres champs...');
      
      // Essayer de trouver des villes dans d'autres champs
      const alternativeVilles = new Set<string>();
      this.loginHistory.forEach(entry => {
        // Essayer différents champs possibles
        const possibleVilleFields = [
          entry.user?.city,
          entry.user?.location,
          entry.user?.address,
          entry.user?.ville,
          entry.user?.nom?.includes(' ') ? entry.user.nom.split(' ').pop() : null
        ];
        
        possibleVilleFields.forEach(field => {
          if (field && field.trim() !== '') {
            alternativeVilles.add(field.trim());
          }
        });
      });
      
      if (alternativeVilles.size > 0) {
        this.villes = Array.from(alternativeVilles).sort();
        console.log('✅ Villes trouvées dans d\'autres champs:', this.villes);
      } else {
        // En dernier recours, ajouter des villes communes du Maroc
        console.log('🧪 Aucune ville trouvée, ajout de villes communes du Maroc...');
        this.villes = [
          'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 
          'Meknès', 'Agadir', 'Oujda', 'Kénitra', 'Tétouan',
          'Safi', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida',
          'Taza', 'Nador', 'Settat', 'Larache', 'Ksar El Kebir'
        ];
        console.log('🧪 Villes communes ajoutées:', this.villes);
      }
    }
  }

  /**
   * Gère le changement de filtre région
   * IMPORTANT: Ce filtre fonctionne indépendamment du filtre ville
   */
  onRegionChange(region: string): void {
    this.selectedRegion = region;
    // Le filtre ville reste inchangé - ils sont indépendants
    this.applyFilters();
  }

  /**
   * Gère le changement de filtre ville
   * IMPORTANT: Ce filtre fonctionne indépendamment du filtre région
   */
  onVilleChange(ville: string): void {
    this.selectedVille = ville;
    // Le filtre région reste inchangé - ils sont indépendants
    this.applyFilters();
  }

  /**
   * Charge la liste des magasins
   */
  loadMagasins(): void {
    this.magasinService.getAllMagasins().subscribe({
      next: (magasins: Magasin[]) => {
        this.magasins = magasins.map(m => m.nom).sort();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des magasins:', err);
      }
    });
  }

  /**
   * Gère le changement de filtre magasin
   */
  onMagasinChange(magasin: string): void {
    this.selectedMagasin = magasin;
    this.applyFilters();
  }


  /**
   * Obtient la traduction d'une région
   */
  getRegionTranslation(region: string): string {
    if (!region) return region;
    
    const currentLang = this.translate.currentLang || 'fr';
    const translation = this.regionTranslationMap[region];
    
    if (translation) {
      return currentLang === 'en' ? translation.en : translation.fr;
    }
    
    return region;
  }

  /**
   * Obtient les villes disponibles (pour débogage)
   */
  getAvailableVilles(): string[] {
    console.log('🔍 État actuel des villes:');
    console.log('   - Villes dans le filtre:', this.villes);
    console.log('   - Nombre de villes:', this.villes.length);
    console.log('   - Région sélectionnée:', this.selectedRegion);
    console.log('   - Ville sélectionnée:', this.selectedVille);
    console.log('   - Données loginHistory:', this.loginHistory.length, 'entrées');
    
    // Afficher quelques exemples de données
    if (this.loginHistory.length > 0) {
      console.log('📋 Exemples de données utilisateur:');
      this.loginHistory.slice(0, 3).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.user?.username}: ville="${entry.user?.ville}", region="${entry.user?.region}"`);
      });
    }
    
    return this.villes;
  }

  /**
   * Force le rechargement des villes (pour débogage)
   */
  forceReloadVilles(): void {
    console.log('🔄 Rechargement forcé des villes...');
    this.extractUniqueVilles();
  }
}
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
import { TranslateModule } from '@ngx-translate/core';
import { ExportService } from '../../services/export.service';

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
    'date login',
    'date logout',
    'session',
    'role',
    'status',
    'ip'
  ];
  
  dataSource = new MatTableDataSource<any>();
  loginHistory: any[] = [];
  
  // Propriétés pour les filtres
  searchText: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  selectedDateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  showFilters: boolean = false;
  
  // Options pour les filtres
  roles: string[] = ['ADMIN', 'SUPERVISEUR', 'MERCHANDISEUR_MONO', 'MERCHANDISEUR_MULTI'];
  statuses: string[] = ['ACTIVE', 'INACTIVE'];
  
  // État de chargement
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private datePipe: DatePipe,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadLoginHistory();
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
        this.dataSource.data = this.loginHistory;
        
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
}

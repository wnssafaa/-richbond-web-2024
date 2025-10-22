import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput, CalendarApi } from '@fullcalendar/core';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import {
  Merchendiseur,
  MerchendiseurService,
} from '../../services/merchendiseur.service';
import { AddPlanificationComponent } from '../../dialogs/add-planification/add-planification.component';
import {
  Planification,
  PlanificationService,
  StatutVisite,
} from '../../services/planification.service';
import { Magasin, MagasinService } from '../../services/magasin.service';
import { SuperveseurService } from '../../services/superveseur.service';
import { Region } from '../../enum/Region';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take, forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ColumnCustomizationPanelComponent } from '../../dialogs/column-customization/column-customization-panel.component';
import { GenericImportDialogComponent } from '../../dialogs/generic-import-dialog/generic-import-dialog.component';
import { ExportService } from '../../services/export.service';
import { environment } from '../../../environments/environment';

// Add this before initializing your maps
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon-2x.png', // Utiliser la même image pour les deux
  shadowUrl: 'assets/marker-shadow.png',
});

interface CalendarEvent extends EventInput {
  id?: string;
  title: string;
  start: string | Date;
  end: string | Date;
  className?: string;
  extendedProps?: {
    magasin?: any;
    merchandiser?: any;
    commentaire?: string;
    duree?: number;
    statut?: string;
    heureDebut?: string;
    heureFin?: string;
  };
}

interface FilterOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-planification',
  standalone: true,
  animations: [
    trigger('counterAnimation', [
      transition(':increment', [
        style({ color: '#4CAF50', transform: 'scale(1.1)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' })),
      ]),
      transition(':decrement', [
        style({ color: '#F44336', transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('countUp', [
      transition(':increment', [
        style({ color: '#4CAF50', transform: 'scale(1.1)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' })),
      ]),
      transition(':decrement', [
        style({ color: '#F44336', transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' })),
      ]),
    ]),
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    FormsModule,
    MatDialogModule,
    TranslateModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    FullCalendarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    HttpClientModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ColumnCustomizationPanelComponent,
    GenericImportDialogComponent,
  ],
  templateUrl: './planification.component.html',
  styleUrls: ['./planification.component.css', './stat-icons.css'],
})
export class PlanificationComponent {
  currentLanguage = 'fr';
  nom: any;
  prenom: any;
  telephone: any;
  status: any;
  imagePath: string | undefined;
  avatarUrl: any;

  // Propriétés de permissions
  isConsultant: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Planification>([]);

  // DataSource pour l'historique de connexion
  dataSourceLoginHistory = new MatTableDataSource<any>([]);
  @ViewChild('loginHistoryPaginator') loginHistoryPaginator!: MatPaginator;
  applyFilters(): void {
    if (this.loadingPlanifications) return;

    this.loadingPlanifications = true;

    this.planificationService
      .getAllPlanifications()
      .pipe(take(1))
      .subscribe({
        next: (planifs) => {
          // 1. Filtrage unifié pour toutes les vues
          let filteredPlanifs = this.applyUnifiedFilters(planifs);

          // 2. Calcul des statistiques
          this.calculateStatistics(filteredPlanifs, planifs);

          // 3. Mise à jour du calendrier
          this.updateCalendar(filteredPlanifs);

          // 4. Mise à jour du tableau si on est en vue tableau
          if (this.selectedTab === 'table') {
            this.allPlanifications = planifs;
            this.applyTableFilters();
          }

          // 5. Mise à jour de la carte si on est sur l'onglet map
          if (this.selectedTab === 'map' && this.map) {
            // Utiliser la nouvelle logique de marqueurs de planification
            this.updateMapMarkers();
          }

          // 6. Navigation dans le calendrier si semaine sélectionnée
          if (this.selectedSemaine) {
            this.navigateToSelectedWeek();
          }

          this.loadingPlanifications = false;
        },
        error: (err) => {
          console.error('Erreur lors du filtrage:', err);
          this.loadingPlanifications = false;
          this.snackBar.open('Erreur lors du filtrage des données', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  userMenuOpen = false;
  planningMenuOpen = false;
  // Méthode unifiée de filtrage pour les deux vues (calendrier et tableau)
  private applyUnifiedFilters(planifs: Planification[]): Planification[] {
    let filtered = [...planifs];

    // Filtre par terme de recherche
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.magasin?.nom?.toLowerCase().includes(searchLower) ||
          p.merchandiser?.nom?.toLowerCase().includes(searchLower) ||
          p.commentaire?.toLowerCase().includes(searchLower) ||
          p.statut?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par région
    if (this.selectedRegion) {
      filtered = filtered.filter(
        (p) => p.magasin?.region === this.selectedRegion
      );
    }

    // Filtre par ville
    if (this.selectedVille) {
      filtered = filtered.filter(
        (p) => p.magasin?.ville === this.selectedVille
      );
    }

    // Filtre par superviseur
    if (this.selectedSuperviseur) {
      filtered = filtered.filter(
        (p) => p.merchandiser?.superviseur?.id === this.selectedSuperviseur
      );
    }

    // Filtre par magasin
    if (this.selectedMagasin) {
      filtered = filtered.filter((p) => p.magasin?.id === this.selectedMagasin);
    }

    // Filtre par merchandiseur
    if (this.selectedMerchandiseur) {
      filtered = filtered.filter(
        (p) => p.merchandiser?.id === this.selectedMerchandiseur
      );
    }

    // Filtre par enseigne
    if (this.selectedEnseigne) {
      filtered = filtered.filter(
        (p) => p.magasin?.enseigne === this.selectedEnseigne
      );
    }

    // Filtre par marque
    if (this.selectedMarque) {
      filtered = filtered.filter((p) =>
        p.magasin?.marques?.some(
          (m: string) => m.toLowerCase() === this.selectedMarque?.toLowerCase()
        )
      );
    }

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter((p) => p.statut === this.selectedStatut);
    }

    // Filtre par heure
    if (this.selectedHeure) {
      filtered = filtered.filter((p) => {
        const visitDate = new Date(p.dateVisite);
        const visitHour = visitDate.getHours().toString().padStart(2, '0');
        const visitMinute = visitDate.getMinutes().toString().padStart(2, '0');
        const visitTime = `${visitHour}:${visitMinute}`;
        return visitTime.startsWith(this.selectedHeure!);
      });
    }

    // Filtre par semaine
    if (this.selectedSemaine) {
      filtered = this.filterByWeek(filtered, this.selectedSemaine);
    }

    // Filtre par plage de dates personnalisée
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      filtered = filtered.filter((p) => {
        const visitDate = new Date(p.dateVisite);
        return (
          visitDate >= this.selectedDateRange.start! &&
          visitDate <= this.selectedDateRange.end!
        );
      });
    }

    return filtered;
  }

  // Méthode pour le calendrier (utilise la méthode unifiée)
  private applyAllFilters(planifs: Planification[]): Planification[] {
    return this.applyUnifiedFilters(planifs);
  }

  private updateCalendar(filteredPlanifs: Planification[]): void {
    this.currentEvents = filteredPlanifs.map((p) =>
      this.mapPlanificationToEvent(p)
    );

    // Méthode plus robuste pour mettre à jour le calendrier
    const calendarApi = this.calendarComponent?.getApi();
    if (calendarApi) {
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(this.currentEvents);
    }
  }

  private navigateToSelectedWeek(): void {
    const calendarApi = this.calendarComponent?.getApi();
    if (!calendarApi) return;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Dimanche
    const monday = new Date(today);

    // Calcul du lundi de la semaine courante
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Ajustement selon la semaine sélectionnée
    if (this.selectedSemaine === 'Semaine précédente') {
      monday.setDate(monday.getDate() - 7);
    } else if (this.selectedSemaine === 'Semaine prochaine') {
      monday.setDate(monday.getDate() + 7);
    }

    calendarApi.gotoDate(monday);
  }
  differenceVisites = 0;

  // Méthode pour filtrer par région
  filterByRegion(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterBySemaine(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  // Nouvelle méthode pour gérer la sélection de date de semaine
  onWeekDateChange(): void {
    if (this.selectedWeekDate) {
      // Calculer la semaine à partir de la date sélectionnée
      const selectedDate = new Date(this.selectedWeekDate);
      const dayOfWeek = selectedDate.getDay();
      const monday = new Date(selectedDate);
      monday.setDate(
        selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );

      // Déterminer si c'est la semaine actuelle, précédente ou prochaine
      const today = new Date();
      const currentWeekStart = new Date(today);
      const currentDayOfWeek = today.getDay();
      currentWeekStart.setDate(
        today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)
      );

      const diffInDays = Math.floor(
        (monday.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) {
        this.selectedSemaine = 'Semaine actuelle';
      } else if (diffInDays === -7) {
        this.selectedSemaine = 'Semaine précédente';
      } else if (diffInDays === 7) {
        this.selectedSemaine = 'Semaine prochaine';
      } else {
        this.selectedSemaine = null; // Semaine personnalisée
      }

      // Mettre à jour les filtres
      this.applyUnifiedFiltersToBothViews();
    } else {
      this.selectedSemaine = null;
      this.applyUnifiedFiltersToBothViews();
    }
  }

  filterByEnseigne(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterByMagasin(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterMerchandiseurs(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterByMarque(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterByStatut(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterByHeure(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  // Méthodes pour le filtre de date
  onDateRangeChange(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  selectWeekFromCalendar(): void {
    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      // Calculer la semaine à partir de la date sélectionnée
      const startDate = new Date(this.selectedDateRange.start);
      const dayOfWeek = startDate.getDay();
      const monday = new Date(startDate);
      monday.setDate(
        startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );

      // Déterminer si c'est la semaine actuelle, précédente ou prochaine
      const today = new Date();
      const currentWeekStart = new Date(today);
      const currentDayOfWeek = today.getDay();
      currentWeekStart.setDate(
        today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)
      );

      const diffInDays = Math.floor(
        (monday.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) {
        this.selectedSemaine = 'Semaine actuelle';
      } else if (diffInDays === -7) {
        this.selectedSemaine = 'Semaine précédente';
      } else if (diffInDays === 7) {
        this.selectedSemaine = 'Semaine prochaine';
      } else {
        this.selectedSemaine = null; // Semaine personnalisée
      }

      this.showDatePicker = false;
      this.applyUnifiedFiltersToBothViews();
    }
  }

  clearDateFilter(): void {
    this.selectedDateRange = { start: null, end: null };
    this.selectedSemaine = null;
    this.showDatePicker = false;
    this.applyUnifiedFiltersToBothViews();
  }

  // Méthodes pour l'affichage de la semaine
  getWeekPlaceholder(): string {
    if (this.selectedWeekDate) {
      return this.getWeekRangeText();
    }
    return 'Cliquez pour sélectionner une semaine';
  }

  getWeekRangeText(): string {
    if (!this.selectedWeekDate) return '';

    const selectedDate = new Date(this.selectedWeekDate);
    const dayOfWeek = selectedDate.getDay();
    const monday = new Date(selectedDate);
    monday.setDate(
      selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = monday.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
    const sundayStr = sunday.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${mondayStr} - ${sundayStr}`;
  }

  private filterByWeek(
    planifs: Planification[],
    semaine: string
  ): Planification[] {
    const now = new Date();

    // Si on a une date de semaine sélectionnée, l'utiliser
    if (this.selectedWeekDate) {
      const selectedDate = new Date(this.selectedWeekDate);
      const dayOfWeek = selectedDate.getDay();
      const monday = new Date(selectedDate);
      monday.setDate(
        selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return planifs.filter((p) => {
        const date = new Date(p.dateVisite);
        return date >= monday && date <= sunday;
      });
    }

    // Logique originale pour les semaines prédéfinies
    const currentWeekStart = new Date(now);
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // Dimanche (0) devient -6, Lundi (1) => 0
    currentWeekStart.setDate(now.getDate() + diffToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const targetStart = new Date(currentWeekStart);
    const targetEnd = new Date(currentWeekEnd);

    if (semaine === 'Semaine précédente') {
      targetStart.setDate(targetStart.getDate() - 7);
      targetEnd.setDate(targetEnd.getDate() - 7);
    } else if (semaine === 'Semaine prochaine') {
      targetStart.setDate(targetStart.getDate() + 7);
      targetEnd.setDate(targetEnd.getDate() + 7);
    }

    return planifs.filter((p) => {
      const date = new Date(p.dateVisite);
      return date >= targetStart && date <= targetEnd;
    });
  }

  // Méthodes pour l'optimisation des colonnes
  updateDisplayedColumns(): void {
    this.displayedColumns = this.columnConfig
      .filter((col) => col.visible)
      .map((col) => col.key);
  }

  toggleColumnVisibility(columnKey: string): void {
    const column = this.columnConfig.find((col) => col.key === columnKey);
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

  // Méthode pour exporter les planifications en Excel
  exportToExcel(): void {
    this.exportService.exportPlanifications(this.dataSource.data, {
      filename: 'planifications',
      sheetName: 'Planifications',
    });
  }

  // Méthodes pour charger les superviseurs
  loadSuperviseurs(): void {
    this.superviseurService.getAll().subscribe({
      next: (superviseurs) => {
        this.superviseursOptions = [
          { value: null, label: 'Tous les superviseurs' },
          ...superviseurs.map((s) => ({
            value: s.id,
            label: `${s.nom} ${s.prenom}`,
          })),
        ];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des superviseurs:', err);
      },
    });
  }

  // Méthode pour extraire les régions et villes des magasins
  extractRegionsAndVilles(): void {
    console.log('🔍 Extraction des régions et villes...');
    console.log(`📊 Nombre de magasins: ${this.magasins.length}`);
    
    if (this.magasins.length > 0) {
      // Extraire les régions en filtrant les valeurs nulles/vides
      const regionsFiltered = this.magasins
        .map((m) => m.region)
        .filter((r) => r && r.trim() !== '');
      
      this.regions = [...new Set(regionsFiltered)].sort();
      
      // Extraire les villes en filtrant les valeurs nulles/vides
      const villesFiltered = this.magasins
        .map((m) => m.ville)
        .filter((v) => v && v.trim() !== '');
      
      this.villes = [...new Set(villesFiltered)].sort();
      
      console.log('✅ Régions extraites:', this.regions);
      console.log('✅ Villes extraites:', this.villes);
    } else {
      console.log('⚠️ Aucun magasin disponible pour extraire les régions et villes');
    }
  }

  // Méthodes pour les nouveaux filtres
  filterByRegionNew(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterByVille(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  filterBySuperviseur(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  // Méthode pour obtenir le superviseur d'un merchandiser
  getSuperviseurInfo(planification: Planification): string {
    if (planification.merchandiser && planification.merchandiser.superviseur) {
      return `${planification.merchandiser.superviseur.nom} ${planification.merchandiser.superviseur.prenom}`;
    }
    return 'N/A';
  }

  // Méthode pour obtenir la région du magasin
  getRegionInfo(planification: Planification): string {
    return planification.magasin?.region || 'N/A';
  }

  // Méthode pour obtenir la ville du magasin
  getVilleInfo(planification: Planification): string {
    return planification.magasin?.ville || 'N/A';
  }

  // Méthode pour réinitialiser tous les filtres
  resetFilters(): void {
    this.selectedRegion = null;
    this.selectedVille = null;
    this.selectedSuperviseur = null;
    this.selectedSemaine = null;
    this.selectedEnseigne = null;
    this.selectedMarque = null;
    this.selectedMagasin = null;
    this.selectedMerchandiseur = null;
    this.selectedStatut = null;
    this.selectedHeure = null;
    this.selectedWeekDate = null;
    this.selectedDateRange = { start: null, end: null };
    this.showDatePicker = false;
    this.searchTerm = '';
    this.showAdvancedFilters = false;
    this.applyUnifiedFiltersToBothViews();
  }

  // Méthode pour basculer l'affichage des filtres avancés
  // Méthode supprimée car maintenant gérée directement dans le template

  // Méthode pour gérer la recherche
  onSearchChange(): void {
    this.applyUnifiedFiltersToBothViews();
  }

  // Méthode pour charger les options des filtres
  loadFilterOptions(): void {
    forkJoin([
      this.merchService.getAllMerchendiseurs(),
      this.magasinService.getAllMagasins(),
    ]).subscribe({
      next: ([merchs, mags]) => {
        this.marchandiseurs = merchs;
        this.magasins = mags;

        // Options pour le filtre des merchandiseurs
        this.merchandiseursOptions = [
          { value: null, label: 'Tous les merchandiseurs' },
          ...merchs.map((m) => ({
            value: m.id,
            label: `${m.nom} ${m.prenom}`,
          })),
        ];

        // Options pour le filtre des magasins (si besoin)
        // this.magasinsOptions = [...];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des options de filtre:', err);
      },
    });
  }
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  @ViewChild('calendar') calendarComponent: any;
  progressGlobal = 0;
  progressParMerch: number | null = null;
  // Données pour les filtres
  regionsEnum = Object.entries(Region);
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
  marques = ['Richbond (linge / literie)', 'Simmons', 'Rosa', 'Générique'];
  semaines = ['Semaine actuelle', 'Semaine précédente', 'Semaine prochaine'];

  // Options pour le filtre de statut
  statutOptions = [
    { value: null, label: 'Tous les statuts' },
    { value: StatutVisite.PLANIFIEE, label: 'Planifiée' },
    { value: StatutVisite.EN_COURS, label: 'En cours' },
    { value: StatutVisite.EFFECTUEE, label: 'Effectuée' },
    { value: StatutVisite.REPROGRAMMEE, label: 'Reprogrammée' },
    { value: StatutVisite.NON_ACCOMPLIE, label: 'Non accomplie' },
  ];

  // Options pour le filtre par heure
  heuresOptions = [
    { value: null, label: 'Toutes les heures' },
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' },
    { value: '12:00', label: '12:00' },
    { value: '13:00', label: '13:00' },
    { value: '14:00', label: '14:00' },
    { value: '15:00', label: '15:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
    { value: '18:00', label: '18:00' },
  ];

  selectedRegion: string | null = null;
  selectedVille: string | null = null;
  selectedSuperviseur: number | null = null;
  selectedSemaine: string | null = null;
  selectedEnseigne: string | null = null;
  selectedMarque: string | null = null;
  selectedMagasin: number | null = null;
  selectedMerchandiseur: number | null = null;
  selectedStatut: StatutVisite | null = null;
  selectedHeure: string | null = null;

  // Filtre par semaine avec calendrier
  selectedWeekDate: Date | null = null;
  today = new Date();

  // Filtres de date pour le calendrier de plage
  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  showDatePicker = false;

  // Nouvelles propriétés pour la barre de recherche et filtres avancés
  searchTerm: string = '';
  showAdvancedFilters: boolean = false;
  // selectedMagasin: number | null = null;

  // Données
  currentEvents: CalendarEvent[] = [];
  marchandiseurs: Merchendiseur[] = [];
  magasins: Magasin[] = [];
  merchandiseursOptions: FilterOption[] = [];
  magasinsOptions: FilterOption[] = [];
  superviseursOptions: FilterOption[] = [];
  villesOptions: FilterOption[] = [];
  enseigneOptions: FilterOption[] = [];
  marqueOptions: FilterOption[] = [];

  // Nouvelles propriétés pour les filtres
  regions: string[] = [];
  villes: string[] = [];

  // Propriété pour l'optimisation des colonnes
  isColumnCustomizationOpen: boolean = false;

  // Données pour le tableau
  allPlanifications: Planification[] = [];
  filteredPlanifications: Planification[] = [];
  displayedColumns: string[] = [
    'dateVisite',
    'magasin',
    'merchandiser',
    'region',
    'ville',
    'superviseur',
    'statut',
    'dureeVisite',
    'commentaire',
    'actions',
  ];

  // Configuration des colonnes pour l'optimisation
  columnConfig = [
    { key: 'dateVisite', label: 'Date & Heure', visible: true },
    { key: 'magasin', label: 'Magasin', visible: true },
    { key: 'merchandiser', label: 'Merchandiseur', visible: true },
    { key: 'region', label: 'Région', visible: true },
    { key: 'ville', label: 'Ville', visible: true },
    { key: 'superviseur', label: 'Superviseur', visible: true },
    { key: 'statut', label: 'Statut', visible: true },
    { key: 'dureeVisite', label: 'Durée', visible: true },
    { key: 'commentaire', label: 'Commentaire', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ];

  // UI
  menuOpen = false;
  dashboardView = false;
  loadingPlanifications = false;
  username: string = '';
  email: string = '';
  role: string = '';

  // Options du calendrier
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'fr',
    selectable: true,
    editable: true,
    allDaySlot: true,
    eventClick: this.handleEventClick.bind(this),
    slotMinTime: '07:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '01:00:00', // Espace d'1 heure entre les créneaux
    slotLabelInterval: '01:00:00', // Affichage des labels toutes les heures
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: '',
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventContent: this.renderEventContent.bind(this),
    // dayCellDidMount: this.markWeekendsAsDisabled.bind(this),
    dayCellDidMount: this.highlightWeekends.bind(this),
  };

  totalVisites = 0;
  totalMagasins = 0;
  totalMerch = 0;
  tauxOccupation = 0;
  highlightWeekends(arg: any): void {
    const day = arg.date.getDay();
    if (day === 0 || day === 6) {
      arg.el.style.backgroundColor = '#f8f9fa'; // Couleur plus claire pour les weekends
      // Pas de pointerEvents: 'none' ni opacity pour permettre les interactions
    }
  }

  // Modifiez la fonction handleDateClick pour permettre les clics le weekend

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private planificationService: PlanificationService,
    private merchService: MerchendiseurService,
    private magasinService: MagasinService,
    private superviseurService: SuperveseurService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private exportService: ExportService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    console.log('Initialisation du composant');
    this.loadCurrentUser();
    this.loadInitialData();
    this.loadFilterOptions();
    this.loadMagasins();
    this.loadPlanificationsForTable();
    this.loadSuperviseurs();
    // Note: extractRegionsAndVilles() est maintenant appelé dans loadMagasins()
    this.updateDisplayedColumns();
    this.setupDailyUpdate();

    // Forcer le chargement des magasins après un délai pour s'assurer que tout est initialisé
    setTimeout(() => {
      console.log('🔄 Chargement forcé des magasins après initialisation...');
      this.loadMagasins();
      // Si on est sur l'onglet carte, utiliser la logique de marqueurs de planification
      if (this.selectedTab === 'map' && this.map) {
        this.updateMapMarkers();
      }
    }, 1000);
  }

  /**
   * Configure la mise à jour automatique de la carte chaque jour à minuit
   */
  private setupDailyUpdate(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Minuit du jour suivant
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log('🕐 Configuration de la mise à jour quotidienne:', {
      maintenant: now.toLocaleString('fr-FR'),
      prochainUpdate: tomorrow.toLocaleString('fr-FR'),
      delaiEnMs: timeUntilMidnight
    });
    
    // Premier timer pour minuit
    setTimeout(() => {
      this.updateMapForNewDay();
      // Ensuite, mettre à jour toutes les 24 heures
      setInterval(() => {
        this.updateMapForNewDay();
      }, 24 * 60 * 60 * 1000); // 24 heures en millisecondes
    }, timeUntilMidnight);
  }

  /**
   * Met à jour la carte pour un nouveau jour
   */
  private updateMapForNewDay(): void {
    console.log('🌅 Nouveau jour détecté - Mise à jour de la carte');
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Recharger les planifications
    this.loadPlanificationsForTable();
    
    // Mettre à jour la carte si elle est visible
    if (this.selectedTab === 'map' && this.map) {
      this.updateMapMarkers();
    }
    
    // Afficher une notification
    this.snackBar.open(
      `Carte mise à jour pour le ${today}`,
      'Fermer',
      {
        duration: 3000,
        panelClass: ['info-snackbar'],
      }
    );
  }

  /**
   * Retourne la date courante formatée pour l'affichage
   */
  getCurrentDateString(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            : 'http://environment.apiUrl.replace('/api', '')/uploads/' + data.imagePath
          : 'assets/default-avatar.png';
        
        // Initialiser les permissions
        this.initializePermissions();
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération des infos utilisateur :',
          err
        );
      },
    });
  }

  loadInitialData(): void {
    if (this.loadingPlanifications) return;
    this.loadingPlanifications = true;

    forkJoin([
      this.planificationService.getAllPlanifications().pipe(take(1)),
      this.merchService.getAllMerchendiseurs().pipe(take(1)),
      this.magasinService.getAllMagasins().pipe(take(1)),
    ]).subscribe({
      next: ([planifs, merchs, mags]) => {
        this.marchandiseurs = merchs;
        this.magasins = mags;
        this.currentEvents = planifs.map((p) =>
          this.mapPlanificationToEvent(p)
        );

        // Ajoutez ceci pour calculer les stats initiales
        this.calculateStatistics(planifs, planifs);

        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...this.currentEvents],
        };
        this.loadingPlanifications = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement initial:', err);
        this.loadingPlanifications = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onAnimationDone(event: import('@angular/animations').AnimationEvent) {
    // Callback après animation
    if (event.triggerName === 'cardAnimation' && event.toState === 'void') {
      // Logique supplémentaire si nécessaire
    }
  }
  mapPlanificationToEvent(planif: Planification): CalendarEvent {
    if (!planif.dateVisite) {
      console.error('Planification sans date:', planif);
      throw new Error('La planification doit avoir une date de visite');
    }

    const startDate = new Date(planif.dateVisite);
    const normalizedStart = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        startDate.getUTCHours(),
        startDate.getUTCMinutes()
      )
    );

    const endDate = planif.dureeVisite
      ? new Date(
          normalizedStart.getTime() + planif.dureeVisite * 60 * 60 * 1000
        )
      : new Date(normalizedStart.getTime() + 2 * 60 * 60 * 1000);

    return {
      id: planif.id?.toString(),
      title: `${planif.magasin?.nom || 'Magasin'} - ${
        planif.merchandiser?.nom || 'Merchandiseur'
      }`,
      start: normalizedStart,
      end: endDate,
      extendedProps: {
        magasin: planif.magasin,
        merchandiser: planif.merchandiser,
        commentaire: planif.commentaire,
        duree: planif.dureeVisite,
        statut: planif.statut,
        heureDebut: normalizedStart.toISOString(),
        heureFin: endDate.toISOString(),
      },
      className: `status-${planif.statut?.toLowerCase() || 'planifiee'}`,
    };
  }

  renderEventContent(arg: any): any {
    const start = arg.event.start ? new Date(arg.event.start) : null;
    const end = arg.event.end ? new Date(arg.event.end) : null;
    const timeText = start
      ? start.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    const duration =
      start && end
        ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
        : 2;

    const statut = arg.event.extendedProps['statut'] ?? 'NON_DEFINI';
    const magasin = arg.event.extendedProps['magasin'];
    const merch = arg.event.extendedProps['merchandiser'];

    const badgeColors: { [key: string]: string } = {
      PLANIFIEE: '#4e9af1',
      EN_COURS: '#ff9800',
      EFFECTUEE: '#4caf50',
      REPROGRAMMEE: '#ffca28',
      NON_ACCOMPLIE: '#f44336',
    };
    const badgeColor = badgeColors[statut.toUpperCase()] || 'gray';

    const magasinNom = magasin?.nom ?? `Magasin #${magasin?.id ?? '?'}`;
    const merchNom = merch?.nom ?? `Merchandiseur #${merch?.id ?? '?'}`;

    // Gestion de l'image du merchandiseur
    const merchImage = merch?.imagePath
      ? merch.imagePath.startsWith('data:image')
        ? merch.imagePath
        : 'http://environment.apiUrl.replace('/api', '')/uploads/' + merch.imagePath
      : 'assets/default-avatar.png';

    const div = document.createElement('div');
    div.style.cssText = `
    padding: 16px;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    font-family: 'Inter', 'Segoe UI', sans-serif;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    position: relative;
    border: 1px solid #e9ecef;
    min-height: 120px;
  `;

    div.innerHTML = `
    <!-- Header avec heure -->
    <div style="
      font-size: 12px; 
      color: #6c757d; 
      font-weight: 500; 
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span style="font-size: 14px;">🕒</span>
      ${timeText}
    </div>
    
    <!-- Nom du magasin -->
    <div style="
      font-size: 14px; 
      font-weight: 600; 
      margin-bottom: 8px; 
      color: #212529;
      line-height: 1.3;
    ">
      ${magasinNom}
    </div>
    
    <!-- Nom du merchandiseur -->
    <div style="
      font-size: 13px; 
      color: #495057; 
      margin-bottom: 12px;
      line-height: 1.3;
    ">
      ${merchNom}
    </div>
    
    <!-- Section participants avec avatars -->
    <div style="
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 12px;
    ">
      <!-- Avatars des participants -->
      <div style="
        display: flex; 
        align-items: center;
        gap: 2px;
      ">
        <img src="${merchImage}" 
             alt="${merchNom}" 
             style="
               width: 24px; 
               height: 24px; 
               border-radius: 50%; 
               border: 2px solid #ffffff;
               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
               object-fit: cover;
             "
             onerror="this.src='assets/default-avatar.png'"
        />
        <div style="
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          background: #e9ecef; 
          border: 2px solid #ffffff;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 10px;
          color: #6c757d;
          font-weight: 600;
        ">
          +4
        </div>
      </div>
      
      <!-- Bouton de suppression -->
      <button class="delete-button" data-event-id="${arg.event.id}" 
        style="
          background: none; 
          border: none; 
          color: black; 
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.background='#f8f9fa'"
        onmouseout="this.style.background='transparent'"
      >
        🗑️
      </button>
    </div>
    
    <!-- Badge de statut -->
    <div style="
      display: flex; 
      justify-content: flex-end;
    ">
      <span style="
        font-size: 10px;
        padding: 4px 8px;
        background-color: ${badgeColor};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        text-transform: lowercase;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        letter-spacing: 0.5px;
      ">
        ${statut.replace('_', ' ').toLowerCase()}
      </span>
    </div>
  `;

    // Hover effet
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'translateY(-2px)';
      div.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
    });
    div.addEventListener('mouseleave', () => {
      div.style.transform = 'translateY(0)';
      div.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    });

    // Suppression
    const deleteButton = div.querySelector('.delete-button');
    if (deleteButton) {
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.deletePlanification(arg.event.id);
      });
    }

    return { domNodes: [div] };
  }
  selectedTab: 'table' | 'map' | 'planification' = 'table';

  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    // Configuration de la pagination pour le tableau principal
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    // Configuration de la pagination pour l'historique de connexion
    if (this.loginHistoryPaginator) {
      this.dataSourceLoginHistory.paginator = this.loginHistoryPaginator;
    }

    if (this.selectedTab === 'map') {
      this.initMap();
      // Utiliser la nouvelle logique de marqueurs de planification
      setTimeout(() => {
        if (this.map) {
          this.updateMapMarkers();
        }
      }, 1000);
    }
  }

  private initMap(): void {
    if (this.map) {
      console.log("🗑️ Suppression de l'ancienne carte");
      this.map.remove();
      this.map = null;
    }

    const mapContainer = document.getElementById('maroc-map');
    if (!mapContainer) {
      console.error('❌ Conteneur de carte non trouvé');
      return;
    }

    console.log('✅ Conteneur de carte trouvé');

    this.map = L.map('maroc-map', {
      center: [31.7917, -7.0926],
      zoom: 6,
    });

    L.tileLayer(`https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=${environment.thunderforestApiKey}`, {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>',
        maxZoom: 22
      }).addTo(this.map);

  

    // Attendre un peu avant de mettre à jour les marqueurs
    setTimeout(() => {
      console.log('🔄 Mise à jour des marqueurs après initialisation...');
      // Utiliser la nouvelle logique de marqueurs de planification
      this.updateMapMarkers();
      this.map?.invalidateSize();
    }, 500);
  }

  deletePlanification(eventId: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette planification ?')) {
      this.planificationService.deletePlanification(Number(eventId)).subscribe({
        next: () => {
          // Supprimer l'événement du calendrier
          const calendarApi = this.calendarComponent.getApi();
          const event = calendarApi.getEventById(eventId);
          if (event) {
            event.remove();
          }
          
          // Mettre à jour la liste des événements
          this.currentEvents = this.currentEvents.filter(e => e.id !== eventId);
          
          this.snackBar.open('Planification supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // Gestion des événements du calendrier
  handleDateSelect(arg: any): void {
    const title = prompt('Entrez le titre de la planification :');
    if (title) {
      const calendarApi: CalendarApi = arg.view.calendar;
      calendarApi.addEvent({
        title,
        start: arg.start,
        end: arg.end,
        allDay: arg.allDay,
      });
    }
    arg.view.calendar.unselect();
  }

  handleEventClick(arg: any): void {
    const event = arg.event;
    const props = event.extendedProps;

    const data = {
      planification: {
        id: event.id,
        date: event.startStr,
        heureDebut: event.startStr,
        heureFin: event.endStr,
        statut: props.statut,
        merchendiseurId: props.merchandiser?.id,
        magasinId: props.magasin?.id,
        magasin: props.magasin,
        merchandiser: props.merchandiser,
      },
    };

    const dialogRef = this.dialog.open(AddPlanificationComponent, {
      width: '700px',
      data,
    });

    dialogRef.afterClosed().subscribe((updatedPlanif) => {
      if (updatedPlanif) {
        const index = this.currentEvents.findIndex(
          (e) => e.id === updatedPlanif.id
        );
        const updatedEvent = this.mapPlanificationToEvent(updatedPlanif);

        if (index >= 0) {
          this.currentEvents[index] = updatedEvent;
        } else {
          this.currentEvents.push(updatedEvent);
        }

        this.calendarOptions.events = [...this.currentEvents];
      }
    });
  }

  handleDateClick(info: any): void {
    const day = info.date.getDay();
    if (day === 0 || day === 6) {
      return;
    }
    console.log('Date cliquée autorisée :', info.dateStr);
  }

  handleEventDrop(arg: any): void {
    const day = arg.event.start.getDay();
    if (day === 0 || day === 6) {
      arg.revert();
      this.snackBar.open(
        'Le déplacement vers le week-end est interdit',
        'Fermer',
        {
          duration: 3000,
          panelClass: ['warning-snackbar'],
        }
      );
    }
  }
  onTabChange(tab: 'planification' | 'map' | 'table') {
    this.selectedTab = tab;
    if (tab === 'map') {
      console.log("🗺️ Changement vers l'onglet carte...");

      // Recharger les magasins pour s'assurer d'avoir les dernières données
      this.loadMagasins();

      setTimeout(() => {
        const mapContainer = document.getElementById('maroc-map');
        console.log('🗺️ Conteneur de carte:', mapContainer);

        // Si le conteneur n'existe pas ou a changé, on réinitialise la carte
        if (!mapContainer) {
          console.error('❌ Conteneur de carte non trouvé');
          return;
        }

        // Si la carte existe mais n'est pas attachée au bon conteneur, on la recrée
        if (!this.map || this.map.getContainer() !== mapContainer) {
          console.log('🔄 Réinitialisation de la carte...');
          if (this.map) {
            this.map.remove();
            this.map = null;
          }
          this.initMap();
          // Utiliser la nouvelle logique de marqueurs de planification
          setTimeout(() => {
            if (this.map) {
              this.updateMapMarkers();
            }
          }, 1000);
        } else {
          console.log('🔄 Mise à jour de la carte existante...');
          this.map.invalidateSize();
          // Utiliser la nouvelle logique de marqueurs de planification
          this.updateMapMarkers();
        }
      }, 500); // Augmenté le délai pour s'assurer que le DOM est prêt
    } else if (tab === 'table') {
      console.log("📊 Changement vers l'onglet tableau...");
      this.loadPlanificationsForTable();
    }
  }

  markWeekendsAsDisabled(arg: any): void {
    const day = arg.date.getDay();
    if (day === 0 || day === 6) {
      arg.el.style.backgroundColor = '#f2f2f2';
      arg.el.style.pointerEvents = 'none';
      arg.el.style.opacity = '0.6';
    }
  }

  // Autres méthodes
  openAddvisitDialog(): void {
    const dialogRef = this.dialog.open(AddPlanificationComponent, {
      width: '700px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInitialData(); // Recharger les données après ajout
        this.loadPlanificationsForTable(); // Recharger aussi le tableau
      }
    });
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
  public updateMapMarkers(): void {
    if (!this.map) {
      console.error('❌ Carte non initialisée');
      return;
    }

    console.log('=== DÉBOGAGE MAP - STATUTS DE PLANIFICATION ===');
    console.log('Planifications chargées:', this.allPlanifications);
    console.log('Nombre de planifications:', this.allPlanifications.length);

    // Supprimer tous les marqueurs existants de manière plus sûre
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map!.removeLayer(layer);
      }
    });
    
    console.log('🗑️ Tous les marqueurs existants ont été supprimés');

    // Filtrer les planifications par date courante
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Début du jour suivant
    
    console.log('📅 Filtrage par date courante:', {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString()
    });
    
    let planificationsToShow = this.allPlanifications.filter(planif => {
      const planifDate = new Date(planif.dateVisite);
      planifDate.setHours(0, 0, 0, 0);
      return planifDate.getTime() === today.getTime();
    });
    
    console.log(`📊 Planifications du jour (${today.toLocaleDateString('fr-FR')}):`, planificationsToShow.length);

    // Vérifier si on a des planifications à afficher
    if (planificationsToShow.length === 0) {
      console.log('⚠️ Aucune planification du jour à afficher');
      this.snackBar.open(
        `Aucune planification trouvée pour le ${today.toLocaleDateString('fr-FR')}. Veuillez créer des planifications pour cette date.`,
        'Fermer',
        {
          duration: 4000,
          panelClass: ['info-snackbar'],
        }
      );
      return;
    }
    
    // Appliquer les filtres additionnels
    if (this.selectedMagasin) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.magasin?.id === this.selectedMagasin
      );
    }
    if (this.selectedMerchandiseur) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.merchandiser?.id === this.selectedMerchandiseur
      );
    }
    if (this.selectedRegion) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.magasin?.region === this.selectedRegion
      );
    }
    if (this.selectedVille) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.magasin?.ville === this.selectedVille
      );
    }
    if (this.selectedEnseigne) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.magasin?.enseigne === this.selectedEnseigne
      );
    }
    if (this.selectedStatut) {
      planificationsToShow = planificationsToShow.filter(
        (p) => p.statut === this.selectedStatut
      );
    }

    console.log('Planifications à afficher:', planificationsToShow);

    // Coordonnées par défaut pour les principales villes du Maroc
    const defaultCoords: { [key: string]: [number, number] } = {
      Casablanca: [33.5731, -7.5898],
      Rabat: [34.0209, -6.8416],
      Marrakech: [31.6295, -7.9811],
      Fès: [34.0181, -5.0078],
      Agadir: [30.4278, -9.5981],
      Tanger: [35.7595, -5.834],
      Meknès: [33.8935, -5.5473],
      Oujda: [34.6814, -1.9086],
      Kénitra: [34.261, -6.5802],
      Tétouan: [35.5711, -5.3644],
      Safi: [32.2988, -9.2377],
      'El Jadida': [33.2316, -8.5007],
      Mohammedia: [33.6871, -7.3828],
      'Béni Mellal': [32.3373, -6.3498],
      Nador: [35.1681, -2.9273],
      Taza: [34.2139, -4.0088],
      Settat: [33.0011, -7.6167],
      Larache: [35.1933, -6.1557],
      Khouribga: [32.8848, -6.9064],
      Ouarzazate: [30.9333, -6.9],
      Essaouira: [31.5085, -9.7595],
      Ifrane: [33.5731, -5.365],
      Chefchaouen: [35.1681, -5.2636],
      Dakhla: [23.6847, -15.9579],
      Laayoune: [27.1536, -13.2033],
    };

    let markersAdded = 0;

    // Créer une map pour avoir une seule planification par magasin (celle du jour)
    const planificationsByMagasin = new Map<number, Planification>();
    planificationsToShow.forEach(planif => {
      if (planif.magasin?.id) {
        // Garder seulement la première planification trouvée pour chaque magasin
        if (!planificationsByMagasin.has(planif.magasin.id)) {
          planificationsByMagasin.set(planif.magasin.id, planif);
        }
      }
    });

    console.log('Planifications du jour par magasin:', planificationsByMagasin);

    planificationsByMagasin.forEach((planification, magasinId) => {
      const magasin = planification.magasin;
      if (!magasin) return;

      console.log(`Magasin ${magasin.nom}:`, planification);
      console.log(`- Ville: ${magasin.ville}`);
      console.log(`- Latitude: ${(magasin as any).latitude}`);
      console.log(`- Longitude: ${(magasin as any).longitude}`);
      console.log(`- Localisation: ${(magasin as any).localisation}`);

      let lat: number = 0, lng: number = 0;
      let hasCoords = false;

      // 1. Utiliser les coordonnées GPS si disponibles
      if ((magasin as any).latitude && (magasin as any).longitude) {
        lat = (magasin as any).latitude;
        lng = (magasin as any).longitude;
        hasCoords = true;
        console.log(`✅ Coordonnées GPS trouvées: ${lat}, ${lng}`);
      }
      // 2. Fallback: essayer de parser localisation si pas de coordonnées GPS
      else if ((magasin as any).localisation && (magasin as any).localisation.includes(',')) {
        const coords = (magasin as any).localisation.split(',').map(Number);
        if (!isNaN(coords[0]) && !isNaN(coords[1])) {
          lat = coords[0];
          lng = coords[1];
          hasCoords = true;
          console.log(`✅ Coordonnées parsées depuis localisation: ${lat}, ${lng}`);
        }
      }
      // 3. Fallback: utiliser des coordonnées par défaut basées sur la ville
      else if (magasin.ville) {
        console.log(`🔍 Recherche de coordonnées pour la ville: "${magasin.ville}"`);
        
        // Recherche insensible à la casse et plus flexible
        const villeKey = Object.keys(defaultCoords).find((key) => {
          const normalizedKey = key.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a');
          const normalizedVille = magasin.ville!.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a');
          
          return normalizedKey === normalizedVille ||
                 normalizedKey.includes(normalizedVille) ||
                 normalizedVille.includes(normalizedKey);
        });

        if (villeKey) {
          [lat, lng] = defaultCoords[villeKey];
          hasCoords = true;
          console.log(`✅ Coordonnées par défaut pour ${magasin.ville}: ${lat}, ${lng}`);
        } else {
          console.log(`❌ Aucune coordonnée trouvée pour la ville: "${magasin.ville}"`);
        }
      }
      // 4. Fallback: coordonnées par défaut du Maroc (Casablanca)
      if (!hasCoords) {
        lat = 33.5731;
        lng = -7.5898;
        hasCoords = true;
        console.log(`⚠️ Coordonnées par défaut (Casablanca): ${lat}, ${lng}`);
      }

      if (hasCoords) {
        try {
          // Utiliser le statut de la planification du jour
          const statutPrincipal = planification.statut;
          const couleur = this.getStatusColor(statutPrincipal);
          const icone = this.getStatusIcon(statutPrincipal);
          
          console.log(`🎨 Création du marqueur pour ${magasin.nom}:`, {
            statut: statutPrincipal,
            statutText: this.getStatusText(statutPrincipal),
            couleur: couleur,
            icone: icone
          });

          // Créer un marqueur coloré basé sur le statut avec HTML pur
          const markerIcon = L.divIcon({
            className: 'status-marker-html',
            html: `
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background-color: ${couleur};
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
                font-weight: bold;
                position: relative;
                z-index: 999;
              ">${icone}</div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
          });

          const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(this.map!);
          
          // Forcer la suppression des styles par défaut de Leaflet
          setTimeout(() => {
            const markerElement = marker.getElement();
            if (markerElement) {
              console.log(`🔧 Correction du marqueur pour ${magasin.nom}:`, {
                couleurAttendue: couleur,
                elementTrouve: !!markerElement
              });
              
              // Forcer les styles personnalisés
              markerElement.style.background = 'transparent';
              markerElement.style.border = 'none';
              markerElement.style.width = 'auto';
              markerElement.style.height = 'auto';
              
              // Vérifier que le div interne a la bonne couleur
              const innerDiv = markerElement.querySelector('div');
              if (innerDiv) {
                innerDiv.style.backgroundColor = couleur;
                console.log(`✅ Couleur appliquée au marqueur: ${couleur}`);
              }
            }
          }, 200);

          marker.bindPopup(`
             <div style="min-width: 320px; max-width: 400px; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
               <div style="background: linear-gradient(135deg, ${couleur} 0%, ${couleur}dd 100%); padding: 16px; border-radius: 12px 12px 0 0; position: relative;">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                   <span style="background-color: rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                     ${this.getStatusText(statutPrincipal)}
                   </span>
                   <div style="color: white; font-size: 18px;">🏪</div>
                 </div>
                 <h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                   ${magasin.nom}
                 </h4>
               </div>
               <div style="padding: 16px;">
                 <div style="display: grid; gap: 12px; margin-bottom: 16px;">
                   <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #007bff;">
                     <div style="color: #007bff; font-size: 16px;">📍</div>
                     <div>
                       <div style="font-size: 12px; color: #6c757d; font-weight: 500; margin-bottom: 2px;">Adresse</div>
                       <div style="font-size: 13px; color: #495057; line-height: 1.4;">${(magasin as any).localisation || 'Adresse non spécifiée'}</div>
                     </div>
                   </div>
                   <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #28a745;">
                     <div style="color: #28a745; font-size: 16px;">🏙️</div>
                     <div>
                       <div style="font-size: 12px; color: #6c757d; font-weight: 500; margin-bottom: 2px;">Localisation</div>
                       <div style="font-size: 13px; color: #495057; line-height: 1.4;">${magasin.ville}, ${magasin.region}</div>
                     </div>
                   </div>
                   <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #ffc107;">
                     <div style="color: #ffc107; font-size: 16px;">🏷️</div>
                     <div>
                       <div style="font-size: 12px; color: #6c757d; font-weight: 500; margin-bottom: 2px;">Enseigne</div>
                       <div style="font-size: 13px; color: #495057; line-height: 1.4;">${magasin.enseigne}</div>
                     </div>
                   </div>
                 </div>
                 
                 <!-- Planification du jour -->
                 <div style="background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; padding: 12px;">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                     <strong style="color: #495057; font-size: 13px;">📅 Planification du jour</strong>
                     <span style="font-size: 10px; color: #6c757d; background: #dee2e6; padding: 2px 6px; border-radius: 8px; font-weight: 500;">${new Date().toLocaleDateString('fr-FR')}</span>
                   </div>
                   <div style="
                     padding: 12px; 
                     background-color: white; 
                     border-radius: 6px; 
                     border-left: 4px solid ${couleur};
                     box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                   ">
                     <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                       <strong style="font-size: 13px; color: #212529;">${new Date(planification.dateVisite).toLocaleDateString('fr-FR')}</strong>
                       <span style="font-size: 11px; color: #6c757d; background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${new Date(planification.dateVisite).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                     </div>
                     <div style="font-size: 12px; color: #495057; margin-bottom: 4px; font-weight: 500;">
                       👤 ${planification.merchandiser?.nom || 'N/A'} ${planification.merchandiser?.prenom || ''}
                     </div>
                     <div style="font-size: 11px; color: #6c757d;">
                       <span style="background-color: ${couleur}; color: white; padding: 2px 8px; border-radius: 10px; font-weight: 500;">
                         ${this.getStatusText(planification.statut)}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
               <div style="padding: 12px 16px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 12px 12px;">
                 ${
                   !(magasin as any).latitude || !(magasin as any).longitude
                     ? '<div style="display: flex; align-items: center; gap: 8px; color: #ff9800; font-size: 12px; font-weight: 500;"><span style="font-size: 14px;">⚠️</span> Coordonnées estimées</div>'
                     : '<div style="display: flex; align-items: center; gap: 8px; color: #28a745; font-size: 12px; font-weight: 500;"><span style="font-size: 14px;">✅</span> Coordonnées GPS précises</div>'
                 }
               </div>
             </div>
           `);

          markersAdded++;
          console.log(`✅ Marqueur ajouté pour ${magasin.nom} (${this.getStatusText(statutPrincipal)}) à [${lat}, ${lng}]`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`, error);
        }
      }
    });

    console.log(`Total marqueurs ajoutés: ${markersAdded}`);

    // Afficher un message si aucune planification n'a de coordonnées GPS
    const planificationsWithCoords = planificationsToShow.filter(
      (p) => p.magasin && (
        ((p.magasin as any).latitude && (p.magasin as any).longitude) ||
        ((p.magasin as any).localisation && (p.magasin as any).localisation.includes(','))
      )
    );

    if (planificationsToShow.length > 0 && planificationsWithCoords.length === 0) {
      this.snackBar.open(
        "Aucune planification n'a de coordonnées GPS précises. Des coordonnées estimées ont été utilisées.",
        'Fermer',
        { duration: 8000, panelClass: ['info-snackbar'] }
      );
    }
  }
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  loadMagasins(): void {
    console.log('🔄 Chargement des magasins...');
    this.magasinService.getAllMagasins().subscribe({
      next: (magasins) => {
        console.log('✅ Magasins chargés avec succès:', magasins);
        console.log('Nombre de magasins:', magasins.length);

        // Afficher les détails de chaque magasin pour le débogage
        magasins.forEach((magasin, index) => {
          console.log(`Magasin ${index + 1}:`, {
            id: magasin.id,
            nom: magasin.nom,
            ville: magasin.ville,
            latitude: magasin.latitude,
            longitude: magasin.longitude,
            localisation: magasin.localisation,
            region: magasin.region,
            type: magasin.type,
            enseigne: magasin.enseigne,
          });
        });

        this.magasins = magasins;
        
        // 🔍 DEBUG: Vérifier la structure des magasins
        if (magasins.length > 0) {
          console.log('🔍 Premier magasin pour debug:', magasins[0]);
          console.log('🔍 Régions dans les magasins:', magasins.map(m => m.region));
        }
        
        this.magasinsOptions = magasins.map((magasin) => ({
          value: magasin.id,
          label: `${magasin.nom} - ${magasin.ville}`,
        }));

        // Initialiser les options de villes
        const villesUniques = [...new Set(magasins.map(m => m.ville).filter(v => v))].sort();
        this.villesOptions = villesUniques.map(ville => ({
          value: ville,
          label: ville
        }));

        // Initialiser les options d'enseignes
        const enseignesUniques = [...new Set(magasins.map(m => m.enseigne).filter(e => e))].sort();
        this.enseigneOptions = enseignesUniques.map(enseigne => ({
          value: enseigne,
          label: enseigne
        }));

        // Initialiser les options de marques (à partir de l'enum MarqueProduit si disponible)
        this.marqueOptions = this.marques.map(marque => ({
          value: marque,
          label: marque
        }));

        // 🔧 EXTRACTION DES RÉGIONS ET VILLES APRÈS CHARGEMENT DES MAGASINS
        this.extractRegionsAndVilles();

        console.log('Options des magasins:', this.magasinsOptions);
        console.log('Options des villes:', this.villesOptions);
        console.log('Options des enseignes:', this.enseigneOptions);
        console.log('Options des marques:', this.marqueOptions);
        console.log('Régions disponibles:', this.regions);

        // Vérifier si des magasins ont des coordonnées GPS
        const magasinsWithCoords = magasins.filter(
          (m) => m.latitude && m.longitude
        );
        const magasinsWithLocation = magasins.filter(
          (m) => m.localisation && m.localisation.includes(',')
        );
        const magasinsWithVille = magasins.filter((m) => m.ville);

        console.log(`📊 Statistiques des magasins:`);
        console.log(`- Avec coordonnées GPS: ${magasinsWithCoords.length}`);
        console.log(
          `- Avec localisation parsable: ${magasinsWithLocation.length}`
        );
        console.log(`- Avec ville: ${magasinsWithVille.length}`);
        console.log(`- Total: ${magasins.length}`);

        // Si on est sur l'onglet carte, forcer la mise à jour
        if (this.selectedTab === 'map') {
          if (this.map) {
            console.log('🗺️ Carte disponible, mise à jour des marqueurs...');
            // Utiliser la nouvelle logique de marqueurs de planification
            this.updateMapMarkers();
          } else {
            console.log('⚠️ Carte non disponible, initialisation...');
            setTimeout(() => {
              this.initMap();
            }, 100);
          }
        }

        // Afficher un message informatif
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des magasins', err);
        this.snackBar.open('Erreur lors du chargement des magasins', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // Méthode pour forcer le rechargement de la carte
  refreshMap(): void {
    console.log('🔄 Rafraîchissement forcé de la carte...');

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    setTimeout(() => {
      this.initMap();
      // Charger les magasins et utiliser la logique de marqueurs de planification
      this.loadMagasins();
      if (this.map) {
        this.updateMapMarkers();
      }
    }, 100);
  }

  // Méthode pour forcer l'affichage de tous les magasins
  forceShowAllMagasins(): void {
    console.log('🔄 Affichage forcé de tous les magasins...');

    if (this.magasins.length === 0) {
      this.snackBar.open(
        "Aucun magasin disponible. Veuillez d'abord ajouter des magasins.",
        'Fermer',
        {
          duration: 3000,
          panelClass: ['warning-snackbar'],
        }
      );
      return;
    }

    // Forcer la mise à jour des marqueurs
    if (this.map) {
      // Utiliser la nouvelle logique de marqueurs de planification
      this.updateMapMarkers();
    } else {
      this.initMap();
    }

    this.snackBar.open(
      `${this.magasins.length} magasin(s) affiché(s) sur la carte !`,
      'Fermer',
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
      }
    );
  }

  // Méthode pour afficher les magasins avec des coordonnées espacées
  showMagasinsWithSpacedCoords(): void {
    console.log('🔄 Affichage des magasins avec coordonnées espacées...');

    if (this.magasins.length === 0) {
      this.snackBar.open('Aucun magasin disponible.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar'],
      });
      return;
    }

    // S'assurer que la carte est initialisée
    if (!this.map) {
      console.log('🗺️ Carte non initialisée, initialisation...');
      this.initMap();
      setTimeout(() => {
        this.showMagasinsWithSpacedCoords();
      }, 500);
      return;
    }

    // Supprimer tous les marqueurs existants
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map!.removeLayer(layer);
      }
    });

    // Coordonnées de base pour espacer les magasins
    const baseLat = 31.7917;
    const baseLng = -7.0926;
    const spacing = 0.5; // Espacement en degrés

    console.log(`🗺️ Ajout de ${this.magasins.length} marqueurs espacés...`);

    this.magasins.forEach((magasin, index) => {
      const lat = baseLat + index * spacing;
      const lng = baseLng + index * spacing * 0.5;

      try {
        // Utiliser un marqueur simple sans icône personnalisée
        const marker = L.marker([lat, lng]).addTo(this.map!).bindPopup(`
            <div style="min-width: 250px; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">🏪 ${
                magasin.nom
              }</h4>
              <p style="margin: 5px 0; color: #666;">
                <strong>📍 Adresse:</strong><br>
                ${magasin.localisation || 'Adresse non spécifiée'}
              </p>
              <p style="margin: 5px 0; color: #666;">
                <strong>🏙️ Ville:</strong> ${magasin.ville}, ${magasin.region}
              </p>
              <p style="margin: 5px 0; color: #666;">
                <strong>🏪 Type:</strong> ${magasin.type}
              </p>
              <p style="margin: 5px 0; color: #666;">
                <strong>🏷️ Enseigne:</strong> ${magasin.enseigne}
              </p>
              <p style="margin: 5px 0; color: #ff9800; font-weight: bold;">📍 Position temporaire pour test</p>
            </div>
          `);

        console.log(
          `✅ Marqueur espacé ajouté pour ${magasin.nom} à [${lat}, ${lng}]`
        );
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`,
          error
        );
      }
    });

    // Centrer la carte sur les marqueurs
    if (this.magasins.length > 0) {
      const centerLat = baseLat + ((this.magasins.length - 1) * spacing) / 2;
      const centerLng =
        baseLng + ((this.magasins.length - 1) * spacing * 0.5) / 2;
      this.map.setView([centerLat, centerLng], 8);
    }

    this.snackBar.open(
      `${this.magasins.length} magasin(s) affiché(s) avec coordonnées espacées !`,
      'Fermer',
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
      }
    );
  }

  // Méthode de test pour afficher les magasins avec leurs vraies coordonnées
  testShowMagasinsWithRealCoords(): void {
    console.log("🧪 Test d'affichage avec coordonnées réelles...");

    if (this.magasins.length === 0) {
      this.snackBar.open('Aucun magasin disponible.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar'],
      });
      return;
    }

    // S'assurer que la carte est initialisée
    if (!this.map) {
      console.log('🗺️ Carte non initialisée, initialisation...');
      this.initMap();
      setTimeout(() => {
        this.updateMapMarkers();
      }, 500);
      return;
    }

    // Supprimer tous les marqueurs existants
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map!.removeLayer(layer);
      }
    });

    // 🔍 APPLIQUER LES FILTRES SUR LES MAGASINS
    let magasinsFiltered = [...this.magasins];

    // Filtrer par région
    if (this.selectedRegion) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.region === this.selectedRegion
      );
      console.log(`🔍 Filtre région "${this.selectedRegion}" appliqué: ${magasinsFiltered.length} magasins`);
    }

    // Filtrer par ville
    if (this.selectedVille) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.ville === this.selectedVille
      );
      console.log(`🔍 Filtre ville "${this.selectedVille}" appliqué: ${magasinsFiltered.length} magasins`);
    }

    // Filtrer par enseigne
    if (this.selectedEnseigne) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.enseigne === this.selectedEnseigne
      );
      console.log(`🔍 Filtre enseigne "${this.selectedEnseigne}" appliqué: ${magasinsFiltered.length} magasins`);
    }

    // Filtrer par magasin spécifique
    if (this.selectedMagasin) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.id === this.selectedMagasin
      );
      console.log(`🔍 Filtre magasin ID ${this.selectedMagasin} appliqué: ${magasinsFiltered.length} magasins`);
    }

    // Filtrer par merchandiseur
    if (this.selectedMerchandiseur) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.merchandiseur && m.merchandiseur.id === this.selectedMerchandiseur
      );
      console.log(`🔍 Filtre merchandiseur ID ${this.selectedMerchandiseur} appliqué: ${magasinsFiltered.length} magasins`);
    }

    // Filtrer par marque (note: filtre désactivé car la structure Magasin n'a pas de propriété 'marques' directe)
    // Si vous voulez filtrer par marque, il faut vérifier les produits du magasin
    if (this.selectedMarque) {
      magasinsFiltered = magasinsFiltered.filter(
        (m) => m.produits && m.produits.some((p: any) => p.marque === this.selectedMarque)
      );
      console.log(`🔍 Filtre marque "${this.selectedMarque}" appliqué: ${magasinsFiltered.length} magasins`);
    }

    console.log(`🧪 Affichage de ${magasinsFiltered.length} magasins filtrés sur ${this.magasins.length} au total`);

    // Si aucun magasin après filtrage, afficher un message
    if (magasinsFiltered.length === 0) {
      this.snackBar.open('Aucun magasin ne correspond aux filtres sélectionnés.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar'],
      });
      return;
    }

    magasinsFiltered.forEach((magasin, index) => {
      console.log(`🧪 Magasin ${index + 1}: ${magasin.nom}`);
      console.log(`   - Ville: ${magasin.ville}`);
      console.log(`   - Latitude: ${magasin.latitude}`);
      console.log(`   - Longitude: ${magasin.longitude}`);
      console.log(`   - Localisation: ${magasin.localisation}`);

      // Utiliser les coordonnées réelles si disponibles, sinon utiliser des coordonnées par défaut
      let lat: number = 0,
        lng: number = 0;
      let coordsAssigned = false;

      if (magasin.latitude && magasin.longitude) {
        lat = magasin.latitude;
        lng = magasin.longitude;
        coordsAssigned = true;
        console.log(`   ✅ Coordonnées GPS utilisées: ${lat}, ${lng}`);
      } else if (magasin.localisation && magasin.localisation.includes(',')) {
        // Essayer de parser les coordonnées depuis localisation
        const coords = magasin.localisation.split(',').map(Number);
        if (!isNaN(coords[0]) && !isNaN(coords[1])) {
          lat = coords[0];
          lng = coords[1];
          coordsAssigned = true;
          console.log(
            `   ✅ Coordonnées parsées depuis localisation: ${lat}, ${lng}`
          );
        } else {
          console.log(
            `   ❌ Impossible de parser les coordonnées depuis: "${magasin.localisation}"`
          );
        }
      }

      // Si les coordonnées n'ont pas encore été assignées, utiliser les coordonnées par défaut
      if (!coordsAssigned) {
        // Coordonnées par défaut pour les principales villes
        const defaultCoords: { [key: string]: [number, number] } = {
          Casablanca: [33.5731, -7.5898],
          Rabat: [34.0209, -6.8416],
          Marrakech: [31.6295, -7.9811],
          Fès: [34.0181, -5.0078],
          Agadir: [30.4278, -9.5981],
          Tanger: [35.7595, -5.834],
          Meknès: [33.8935, -5.5473],
          Oujda: [34.6814, -1.9086],
          Kénitra: [34.261, -6.5802],
          Tétouan: [35.5711, -5.3644],
          Safi: [32.2988, -9.2377],
          'El Jadida': [33.2316, -8.5007],
          Mohammedia: [33.6871, -7.3828],
          'Béni Mellal': [32.3373, -6.3498],
          Nador: [35.1681, -2.9273],
          Taza: [34.2139, -4.0088],
          Settat: [33.0011, -7.6167],
          Larache: [35.1933, -6.1557],
          Khouribga: [32.8848, -6.9064],
          Ouarzazate: [30.9333, -6.9],
          Essaouira: [31.5085, -9.7595],
          Berkane: [34.9167, -2.3167],
          Assa: [28.6167, -9.4333],
          'Al Hoceïma': [35.25, -3.9333],
          Témara: [33.9333, -6.9167],
          Skhirate: [33.85, -7.0333],
          'Aïn Harrouda': [33.6333, -7.45],
          Bouskoura: [33.45, -7.65],
          'Fquih Ben Salah': [32.5, -6.7],
          'Sidi Slimane': [34.2667, -5.9333],
          'Sidi Kacem': [34.2167, -5.7],
          Youssoufia: [32.25, -8.5333],
          'Tan-Tan': [28.4333, -11.1],
          'Sidi Ifni': [29.3833, -10.1833],
          Guelmim: [28.9833, -10.0667],
          Errachidia: [31.9333, -4.4167],
          Midelt: [32.6833, -4.7333],
          Azrou: [33.4333, -5.2167],
          Ifrane: [33.5731, -5.365],
          Chefchaouen: [35.1681, -5.2636],
          Dakhla: [23.6847, -15.9579],
          Laayoune: [27.1536, -13.2033],
        };

        const villeKey = Object.keys(defaultCoords).find(
          (key) => key.toLowerCase() === magasin.ville?.toLowerCase()
        );

        if (villeKey) {
          [lat, lng] = defaultCoords[villeKey];
          console.log(
            `   📍 Coordonnées par défaut pour ${magasin.ville}: ${lat}, ${lng}`
          );
        } else {
          // Si la ville n'est pas trouvée, utiliser des coordonnées espacées
          lat = 31.7917 + index * 0.3;
          lng = -7.0926 + index * 0.3;
          console.log(
            `   ⚠️ Coordonnées espacées pour ${magasin.ville}: ${lat}, ${lng}`
          );
        }
      }

      try {
        // Utiliser un marqueur simple sans icône personnalisée
        const marker = L.marker([lat, lng]).addTo(this.map!).bindPopup(`
           <div style="min-width: 250px; padding: 10px;">
             <h4 style="margin: 0 0 10px 0; color: #333;">🏪 ${magasin.nom}</h4>
             <p style="margin: 5px 0; color: #666;">
               <strong>📍 Adresse:</strong><br>
               ${magasin.localisation || 'Adresse non spécifiée'}
             </p>
             <p style="margin: 5px 0; color: #666;">
               <strong>🏙️ Ville:</strong> ${magasin.ville}, ${magasin.region}
             </p>
             <p style="margin: 5px 0; color: #666;">
               <strong>🏪 Type:</strong> ${magasin.type}
             </p>
             <p style="margin: 5px 0; color: #666;">
               <strong>🏷️ Enseigne:</strong> ${magasin.enseigne}
             </p>
             ${
               magasin.latitude && magasin.longitude
                 ? '<p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">✅ Coordonnées GPS précises</p>'
                 : '<p style="margin: 5px 0; color: #ff9800; font-weight: bold;">⚠️ Coordonnées estimées</p>'
             }
           </div>
         `);

        console.log(
          `✅ Marqueur ajouté pour ${magasin.nom} à [${lat}, ${lng}]`
        );
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`,
          error
        );
      }
    });

    // Message adapté selon les filtres
    const messageFiltre = (this.selectedRegion || this.selectedVille || this.selectedEnseigne || this.selectedMagasin || this.selectedMerchandiseur || this.selectedMarque)
      ? `${magasinsFiltered.length} magasin(s) affiché(s) (filtré(s) sur ${this.magasins.length})`
      : `${magasinsFiltered.length} magasin(s) affiché(s)`;

    this.snackBar.open(messageFiltre, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
  private calculateStatistics(
    filteredPlanifs: Planification[],
    allPlanifs: Planification[]
  ): void {
    this.totalVisites = filteredPlanifs.length;
    this.totalMagasins = new Set(
      filteredPlanifs.map((p) => p.magasin?.id)
    ).size;
    this.totalMerch = new Set(
      filteredPlanifs.map((p) => p.merchandiser?.id)
    ).size;

    // Progression globale sur la période affichée (tous les statuts)
    let planifsSemaine = allPlanifs;
    if (this.selectedSemaine) {
      planifsSemaine = this.filterByWeek(allPlanifs, this.selectedSemaine);
    } else {
      planifsSemaine = this.filterByWeek(allPlanifs, 'Semaine actuelle');
    }
    const total = planifsSemaine.length;
    const score = planifsSemaine.reduce(
      (acc, p) => acc + this.getScoreByStatut(p.statut),
      0
    );
    this.progressGlobal = total > 0 ? Math.round((score / total) * 100) : 0;

    // Progression par merchandiser si filtre actif
    if (this.selectedMerchandiseur) {
      const planifsMerch = planifsSemaine.filter(
        (p) => p.merchandiser?.id === this.selectedMerchandiseur
      );
      const totalMerch = planifsMerch.length;
      const scoreMerch = planifsMerch.reduce(
        (acc, p) => acc + this.getScoreByStatut(p.statut),
        0
      );
      this.progressParMerch =
        totalMerch > 0 ? Math.round((scoreMerch / totalMerch) * 100) : 0;
    } else {
      this.progressParMerch = null;
    }

    // Différence de visites
    let referenceWeekPlanifs: Planification[] = [];
    if (this.selectedSemaine === 'Semaine actuelle' || !this.selectedSemaine) {
      referenceWeekPlanifs = this.filterByWeek(
        allPlanifs,
        'Semaine précédente'
      );
    } else {
      referenceWeekPlanifs = this.filterByWeek(allPlanifs, 'Semaine actuelle');
    }
    this.differenceVisites = this.totalVisites - referenceWeekPlanifs.length;
  }

  private getScoreByStatut(statut: StatutVisite): number {
    switch (statut) {
      case StatutVisite.EFFECTUEE:
        return 1; // 100%
      case StatutVisite.EN_COURS:
        return 0.5; // 50%
      case StatutVisite.PLANIFIEE:
        return 0.2; // 20% (exemple, adapte selon ton besoin)
      case StatutVisite.REPROGRAMMEE:
        return 0.1; // 10% (exemple, adapte selon ton besoin)
      case StatutVisite.NON_ACCOMPLIE:
        return 0; // 0%
      default:
        return 0;
    }
  }

  // Méthodes pour le tableau
  loadPlanificationsForTable(): void {
    this.planificationService.getAllPlanifications().subscribe({
      next: (planifs) => {
        this.allPlanifications = planifs;
        this.applyTableFilters();

        // S'assurer que le paginator est configuré après le chargement des données
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        }, 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des planifications:', err);
        this.snackBar.open(
          'Erreur lors du chargement des planifications',
          'Fermer',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  // Méthode pour le tableau (utilise la méthode unifiée)
  applyTableFilters(): void {
    const filtered = this.applyUnifiedFilters(this.allPlanifications);
    
    this.filteredPlanifications = filtered;
    // Mettre à jour le dataSource pour la pagination
    this.dataSource.data = filtered;
  }

  // Méthode unifiée pour appliquer les filtres aux deux vues simultanément
  applyUnifiedFiltersToBothViews(): void {
    if (this.loadingPlanifications) return;

    this.loadingPlanifications = true;

    this.planificationService
      .getAllPlanifications()
      .pipe(take(1))
      .subscribe({
        next: (planifs) => {
          // 1. Filtrage unifié pour toutes les vues
          let filteredPlanifs = this.applyUnifiedFilters(planifs);

          // 2. Calcul des statistiques
          this.calculateStatistics(filteredPlanifs, planifs);

          // 3. Mise à jour du calendrier
          this.updateCalendar(filteredPlanifs);

          // 4. Mise à jour du tableau
          this.allPlanifications = planifs;
          this.applyTableFilters();

          // 5. Mise à jour de la carte si on est sur l'onglet map
          if (this.selectedTab === 'map' && this.map) {
            this.updateMapMarkers();
          }

          // 6. Navigation dans le calendrier si semaine sélectionnée
          if (this.selectedSemaine) {
            this.navigateToSelectedWeek();
          }

          this.loadingPlanifications = false;
        },
        error: (err) => {
          console.error('Erreur lors du filtrage:', err);
          this.loadingPlanifications = false;
          this.snackBar.open('Erreur lors du filtrage des données', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  getStatusColor(statut: StatutVisite): string {
    switch (statut) {
      case StatutVisite.PLANIFIEE:
        return '#4e9af1';
      case StatutVisite.EN_COURS:
        return '#ff9800';
      case StatutVisite.EFFECTUEE:
        return '#4caf50';
      case StatutVisite.REPROGRAMMEE:
        return '#ffca28';
      case StatutVisite.NON_ACCOMPLIE:
        return '#f44336';
      default:
        return '#6c757d';
    }
  }

  getStatusText(statut: StatutVisite): string {
    switch (statut) {
      case StatutVisite.PLANIFIEE:
        return 'Planifiée';
      case StatutVisite.EN_COURS:
        return 'En cours';
      case StatutVisite.EFFECTUEE:
        return 'Effectuée';
      case StatutVisite.REPROGRAMMEE:
        return 'Reprogrammée';
      case StatutVisite.NON_ACCOMPLIE:
        return 'Non accomplie';
      default:
        return 'Non défini';
    }
  }

  // Nouvelle méthode pour déterminer le statut principal d'un magasin
  getPrincipalStatut(planifications: Planification[]): StatutVisite {
    if (planifications.length === 0) {
      return StatutVisite.PLANIFIEE; // Par défaut
    }

    // Priorité des statuts (du plus important au moins important)
    const statutPriority = {
      [StatutVisite.NON_ACCOMPLIE]: 5,
      [StatutVisite.EN_COURS]: 4,
      [StatutVisite.EFFECTUEE]: 3,
      [StatutVisite.REPROGRAMMEE]: 2,
      [StatutVisite.PLANIFIEE]: 1
    };

    // Trouver le statut avec la priorité la plus élevée
    let principalStatut = StatutVisite.PLANIFIEE;
    let maxPriority = 0;

    planifications.forEach(planif => {
      const priority = statutPriority[planif.statut] || 0;
      if (priority > maxPriority) {
        maxPriority = priority;
        principalStatut = planif.statut;
      }
    });

    return principalStatut;
  }

  // Nouvelle méthode pour obtenir l'icône correspondant au statut
  getStatusIcon(statut: StatutVisite): string {
    switch (statut) {
      case StatutVisite.PLANIFIEE:
        return '📅';
      case StatutVisite.EN_COURS:
        return '🔄';
      case StatutVisite.EFFECTUEE:
        return '✅';
      case StatutVisite.REPROGRAMMEE:
        return '🔄';
      case StatutVisite.NON_ACCOMPLIE:
        return '❌';
      default:
        return '❓';
    }
  }

  editPlanification(planification: Planification): void {
    const data = {
      planification: {
        id: planification.id,
        date: planification.dateVisite,
        heureDebut: planification.dateVisite,
        heureFin: planification.dateVisite,
        statut: planification.statut,
        merchendiseurId: planification.merchandiser?.id,
        magasinId: planification.magasin?.id,
        magasin: planification.magasin,
        merchandiser: planification.merchandiser,
        commentaire: planification.commentaire,
        dureeVisite: planification.dureeVisite,
      },
    };

    const dialogRef = this.dialog.open(AddPlanificationComponent, {
      width: '700px',
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPlanificationsForTable();
        this.loadInitialData(); // Recharger aussi le calendrier
      }
    });
  }

  deletePlanificationFromTable(planification: Planification): void {
    if (confirm('Voulez-vous vraiment supprimer cette planification ?')) {
      this.planificationService
        .deletePlanification(planification.id!)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Planification supprimée avec succès',
              'Fermer',
              {
                duration: 3000,
                panelClass: ['success-snackbar'],
              }
            );
            this.loadPlanificationsForTable();
            this.loadInitialData(); // Recharger aussi le calendrier
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
    }
  }

  // Méthode pour l'import
  openImportDialog(): void {
    const dialogRef = this.dialog.open(GenericImportDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: {
        importType: 'planifications',
        title: 'Importer des planifications',
        description: 'Sélectionnez un fichier Excel contenant les données des planifications à importer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger les données après import
        this.loadPlanificationsForTable();
        this.loadInitialData(); // Recharger aussi le calendrier
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

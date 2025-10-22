import {
  MatCardModule,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { FormsModule, NgModel } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule, MatChip } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MatProgressBarModule,
  MatProgressBar,
} from '@angular/material/progress-bar';
import { MatSpinner } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AdduserComponent } from '../adduser/adduser.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, formatDate } from '@angular/common';
// import { Magasin, MagasinService } from '../../services/magasin.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { AddMagasinComponent } from '../../dialogs/add-magasin/add-magasin.component';
import { Region } from '../../enum/Region';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import {
  MatFormFieldModule,
  MatFormField,
  MatLabel,
} from '@angular/material/form-field';
import {
  MatSelectModule,
  MatSelect,
  MatOption,
} from '@angular/material/select';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule, MatInput } from '@angular/material/input';
import { Magasin, MagasinService } from '../../services/magasin.service';
import {
  Merchendiseur,
  MerchendiseurService,
} from '../../services/merchendiseur.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { Planification, PlanificationService, StatutVisite,  } from '../../services/planification.service';
import { VisitService } from '../../services/visit.service';
import { UserService } from '../../services/user.service';
import {
  KpiService,
  MerchandiserAssignmentTracking,
  AppUsageStats,
  ReportCompletionStats,
} from '../../services/kpi.service';
import { NzCalendarMode } from 'ng-zorro-antd/calendar';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
// import { MatTooltip } from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment';

// Enregistrer tous les composants de Chart.js
Chart.register(...registerables);

interface FilterOption {
  value: any;
  label: string;
}
@Component({
  selector: 'app-dachboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    TranslateModule,
    MatTooltipModule,
    CommonModule,
    MatSortModule,
    MatSidenavModule,
    MatCardModule,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    NzCalendarModule,
    MatIconModule,
    MatIcon,
    MatButtonModule,
    MatButton,
    MatInputModule,
    MatInput,
    MatFormFieldModule,
    MatFormField,
    MatLabel,
    MatSelectModule,
    MatSelect,
    MatOption,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatChipsModule,
    MatChip,
    MatMenuModule,
    MatListModule,
    RouterLink,
    HttpClientModule,
    MatPaginatorModule,
    RouterModule,
    MatProgressBarModule,
    MatProgressBar,
    MatTabsModule,
  ],
  providers: [
    TranslateService,
    // { provide: LOCALE_ID, useValue: 'fr' },
    DatePipe,
  ],

  templateUrl: './dachboard.component.html',
  styleUrl: './dachboard.component.css',
})
export class DachboardComponent implements OnDestroy {
  totalItems: number = 0;
  email: any;
  role: any;
  username: any;
  StatutVisite = StatutVisite;
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;

  // Propriétés de permissions
  isConsultant: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;

  // Injection des services
  // constructor(
  //   private athService: AuthService,
  //   private permissionService: PermissionService
  // ) {}

  // Graphiques Chart.js
  visitsChart: Chart | null = null;
  planificationsChart: Chart | null = null;
  usersIntegrationChart: Chart | null = null;

  // Graphiques KPI
  kpiAssignmentChart: Chart | null = null;
  kpiUsageChart: Chart | null = null;
  kpiReportChart: Chart | null = null;
  completionTrendChart: Chart | null = null;

  // Graphiques
  public usersChartData: ChartData<'doughnut'> = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 2,
      },
    ],
  };

  public visitsChartData: ChartData<'bar'> = {
    labels: ['Visites Complètes', 'Visites Incomplètes'],
    datasets: [
      {
        label: 'Nombre de Visites',
        data: [0, 0],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderColor: ['#4CAF50', '#FF9800'],
        borderWidth: 1,
      },
    ],
  };

  public planificationsChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#1f1f5e',
          '#ff9800',
          '#4caf50',
          '#beab71',
          '#f44336',
        ],
        borderWidth: 2,
      },
    ],
  };

  public usersIntegrationChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Utilisateurs intégrés',
        data: [],
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 1,
      },
    ],
  };

  // Données KPI
  kpiAssignmentData: MerchandiserAssignmentTracking[] = [];
  kpiAppUsageData: AppUsageStats | null = null;
  kpiReportData: ReportCompletionStats[] = [];

  // Table data sources pour les KPIs
  assignmentDataSource =
    new MatTableDataSource<MerchandiserAssignmentTracking>();
  reportDataSource = new MatTableDataSource<ReportCompletionStats>();

  // Colonnes des tables KPI
  assignmentColumns: string[] = [
    'merchandiserName',
    'region',
    'totalAssignments',
    'completionRate',
    'status',
    'lastActivity',
  ];
  reportColumns: string[] = [
    'merchandiserName',
    'region',
    'totalReports',
    'completionRate',
    'status',
    'averageTime',
  ];

  // Filtres KPI
  kpiFilters = {
    dateRange: {
      startDate: '',
      endDate: '',
    },
    region: '',
    merchandiserId: 0,
    status: '',
  };

  // Filtres KPI étendus
  selectedKpiRegion: string = '';
  selectedKpiPeriod: string = 'month';
  kpiDateRange = {
    start: new Date(),
    end: new Date(),
  };

  // Options de filtres KPI
  kpiRegions: string[] = [
    'Toutes',
    'Casablanca-Settat',
    'Rabat-Salé-Kénitra',
    'Marrakech-Safi',
    'Fès-Meknès',
    'Tanger-Tétouan-Al Hoceïma',
  ];
  kpiPeriods: string[] = ['week', 'month', 'quarter', 'year'];

  // État des données KPI
  kpiDataMode: 'real' | 'mock' = 'real';
  kpiLoading = false;

  // Méthodes utilitaires pour les calculs KPI
  getTotalAssignments(): number {
    return this.kpiAssignmentData.reduce(
      (sum, item) => sum + item.totalAssignments,
      0
    );
  }

  getCompletedAssignments(): number {
    return this.kpiAssignmentData.reduce(
      (sum, item) => sum + item.completedAssignments,
      0
    );
  }

  getPendingAssignments(): number {
    return this.kpiAssignmentData.reduce(
      (sum, item) => sum + item.pendingAssignments,
      0
    );
  }

  getTotalCompletedAssignments(): number {
    return this.getCompletedAssignments();
  }

  getAverageCompletionRate(): number {
    if (this.kpiReportData.length === 0) return 0;
    const total = this.kpiReportData.reduce(
      (sum, item) => sum + item.completionRate,
      0
    );
    return Math.round((total / this.kpiReportData.length) * 10) / 10;
  }

  getTotalCompletedReports(): number {
    return this.kpiReportData.reduce(
      (sum, item) => sum + item.completedReports,
      0
    );
  }

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };
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
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : environment.apiUrl + '/uploads/' + data.imagePath)
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

// Méthode pour initialiser les permissions
private initializePermissions(): void {
  this.isConsultant = this.permissionService.isConsultant(this.role);
  this.canEdit = this.permissionService.canEdit(this.role);
  this.canDelete = this.permissionService.canDelete(this.role);
  this.canAdd = this.permissionService.canAdd(this.role);
}

displayedColumnsMagasins = ['nom', 'Memebres','progress'];
headerRender = () => {
  return null;
};
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild('paginator1') paginator1!: MatPaginator;
@ViewChild('paginator2') paginator2!: MatPaginator;
@ViewChild('paginator3') paginator3!: MatPaginator;
@ViewChild('paginator4') paginator4!: MatPaginator;
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator1;
    this.dataSourceMagasins.paginator = this.paginator2;
    this.combinedDataSource.paginator = this.paginator3;
    this.dataSourceSuperviseurs.paginator = this.paginator4;
    
    // Initialiser les graphiques après le chargement des données
    setTimeout(() => {
      this.initializeCharts();
    }, 100);

    // Initialiser les graphiques KPI pour l'onglet actif
    setTimeout(() => {
      this.createKpiChartsSelectively();
    }, 200);
  }

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'select',
    'nomComplet',
    'progress',
    'status',
    'dateIntegration',
  ];
  progress: number = 0;
  displayedColumnsSuperviseurs: string[] = ['nom', 'region', 'merchendiseurs'];
  dataSourceSuperviseurs = new MatTableDataSource<Superviseur>();
  @ViewChild('customHeader', { static: true }) customHeader!: TemplateRef<void>;
  date = new Date(2012, 11, 21);
  mode: NzCalendarMode = 'month';
  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }

  selectedRegion: string | null = null;
  totalPlanifiees: number = 0;
  totalEffectuees: number = 0;
  totalRestantes: number = 0;

  filterByRegion(): void {
    if (!this.selectedRegion) {
      this.dataSourceMagasins.data = this.allMagasins;
    } else {
      this.dataSourceMagasins.data = this.allMagasins.filter(
        (magasin) => magasin.region === this.selectedRegion
      );
    }
    this.dataSourceMagasins.paginator?.firstPage();
  }
  filterMerchandiseurs(): void {
    if (!this.selectedMerchandiseur) {
      this.dataSource.data = [...this.marchandiseurs];
    } else {
      this.dataSource.data = this.marchandiseurs.filter(
        (m) => m.id === this.selectedMerchandiseur
      );
    }
    this.dataSource.paginator?.firstPage();
  }
marques = ['Richbond (linge / literie)', 'Simmons', 'Rosa', 'Générique'];
stores = [
  { name: 'Marjane', region: 'Casablanca-Settat', progress: 75 },
  { name: 'Carrefour', region: 'Marrakech-Safi', progress: 50 },
  { name: 'Aswak Assalam', region: 'Rabat-Salé-Kénitra', progress: 90 }
];
  selectedDate: Date = new Date();
  isLoading: any;
  errorMessage: any;

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private dialog: MatDialog,
    private magasinService: MagasinService,
    private merchendiseurService: MerchendiseurService,
    private athService: AuthService,
    private planificationService: PlanificationService,
    private superviseurService: SuperveseurService,
    private visitService: VisitService,
    private userService: UserService,
    private kpiService: KpiService,
    public cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private permissionService: PermissionService,
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.initializeChartLabels();
    
    // Écouter les changements de langue
    this.translate.onLangChange.subscribe(() => {
      this.updateChartLabelsOnLanguageChange();
    });
  }

  private initializeChartLabels(): void {
    this.translate
      .get([
        'DASHBOARD.PLANNED',
        'DASHBOARD.IN_PROGRESS',
        'DASHBOARD.COMPLETED',
        'DASHBOARD.RESCHEDULED',
        'DASHBOARD.NOT_COMPLETED',
      ])
      .subscribe((translations) => {
        this.planificationsChartData.labels = [
          translations['DASHBOARD.PLANNED'],
          translations['DASHBOARD.IN_PROGRESS'],
          translations['DASHBOARD.COMPLETED'],
          translations['DASHBOARD.RESCHEDULED'],
          translations['DASHBOARD.NOT_COMPLETED'],
        ];

        // S'assurer que les couleurs correspondent au calendrier
        this.planificationsChartData.datasets[0].backgroundColor = [
          '#1f1f5e',
          '#ff9800',
          '#4caf50',
          '#beab71',
          '#f44336',
        ];
      });
  }

  private updateChartLabelsOnLanguageChange(): void {
    // Mettre à jour les labels et le titre du graphique existant
    this.updatePlanificationsChartDisplay();
    this.updateChartTitle();
  }

  private updateChartTitle(): void {
    if (this.planificationsChart) {
      this.translate.get('DASHBOARD.PLANNING_BY_STATUS').subscribe((title) => {
        if (
          this.planificationsChart &&
          this.planificationsChart.options &&
          this.planificationsChart.options.plugins
        ) {
          this.planificationsChart.options.plugins.title = {
            display: true,
            text: title,
          };
          this.planificationsChart.update();
        }
      });
    }
  }
  getDayCellClass(date: Date): string {
    if (!date) return '';

    const events = this.getEventsForDate(date);
    if (events.length === 0) return '';

    const status = events[0].statut;
    switch (status) {
      case StatutVisite.PLANIFIEE:
        return 'event-planned';
      case StatutVisite.EN_COURS:
        return 'event-in-progress';
      case StatutVisite.EFFECTUEE:
        return 'event-done';
      case StatutVisite.REPROGRAMMEE:
        return 'event-rescheduled';
      case StatutVisite.NON_ACCOMPLIE:
        return 'event-not-done';
      default:
        return '';
    }
  }

  @ViewChild(MatDrawer) drawer!: MatDrawer;
  menuOpen = false;
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

  marchandiseurs: Merchendiseur[] = [];

  filterByMagasin(): void {
    if (!this.selectedMagasin) {
      this.dataSourceMagasins.data = this.allMagasins;
    } else {
      this.dataSourceMagasins.data = this.allMagasins.filter(
        (magasin) => magasin.id === this.selectedMagasin
      );
    }
    this.dataSourceMagasins.paginator?.firstPage();
  }

  applyGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.dataSource.filter = filterValue;
    this.dataSourceMagasins.filter = filterValue;
    this.combinedDataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if (this.dataSourceMagasins.paginator) {
      this.dataSourceMagasins.paginator.firstPage();
    }
  }
  filterPlanificationsByMonth(): void {
    const year = new Date().getFullYear();

    if (this.selectedMonth === 0) {
      // Tous les mois : on recharge tout ou affiche tout
      this.loadStatistics();
      this.calendarDate = new Date(); // Mois actuel
    } else {
      // Attention, getMonth() retourne 0 à 11 donc il faut faire -1 sur selectedMonth pour comparaison
      this.calendarDate = new Date(year, this.selectedMonth, 1);

      const filtered = this.planifications.filter((p) => {
        const date = new Date(p.datePlanification || p.dateVisite); // s'assurer d'avoir la bonne propriété
        return (
          date.getMonth() === this.selectedMonth - 1 &&
          date.getFullYear() === year
        );
      });

      this.updateStatistics(filtered);
    }
  }

  getMerchendiseurs(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (merch) => {
        this.dataSource.data = merch;

        this.marchandiseurs = merch.map((m) => ({
          ...m,
          nomComplet: `${m.nom} ${m.prenom}`,
          progress: this.calculateProgress(m),

          days: this.getWeeklyData(m),
        }));
      },
      error: (err) => console.error('Erreur chargement merchandiseurs:', err),
    });
  }
  months = [
    'PLANNING.FILTERS.JANUARY',
    'PLANNING.FILTERS.FEBRUARY',
    'PLANNING.FILTERS.MARCH',
    'PLANNING.FILTERS.APRIL',
    'PLANNING.FILTERS.MAY',
    'PLANNING.FILTERS.JUNE',
    'PLANNING.FILTERS.JULY',
    'PLANNING.FILTERS.AUGUST',
    'PLANNING.FILTERS.SEPTEMBER',
    'PLANNING.FILTERS.OCTOBER',
    'PLANNING.FILTERS.NOVEMBER',
    'PLANNING.FILTERS.DECEMBER',
  ];
  years: number[] = [];

  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  calendarDate: Date = new Date();

  onMonthChange(): void {
    this.filterPlanificationsByMonth();
  }

  onYearChange(): void {
    this.filterPlanificationsByMonth();
  }

  onValueChange(value: Date): void {
    console.log('Selected date:', value);
  }

  onPanelChange(change: { date: Date; mode: string }): void {
    console.log('Panel change:', change.date, change.mode);
  }

  displayedColumnsusers: string[] = ['nom', 'status', 'region', 'role'];
  toggleStatus(row: any): void {
    const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (row.type === 'SUPERVISEUR') {
      this.superviseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
      });
    } else if (
      row.type === 'MERCHANDISEUR_MONO' ||
      row.type === 'MERCHANDISEUR_MULTI'
    ) {
      this.merchendiseurService
        .updateStatus(row.id, newStatus)
        .subscribe(() => {
          row.status = newStatus;
        });
    }
  }
  stats: { [key: string]: number } = {};
  allMagasins: Magasin[] = [];
  isCurrentMonth(date: Date): boolean {
    return (
      date.getMonth() === this.calendarDate.getMonth() &&
      date.getFullYear() === this.calendarDate.getFullYear()
    );
  }
  isDateInCurrentMonth(date: Date): boolean {
    return (
      date.getMonth() === this.calendarDate.getMonth() &&
      date.getFullYear() === this.calendarDate.getFullYear()
    );
  }

  ngOnInit(): void {
    this.loadPlanifications();
    this.selectedMonth = new Date().getMonth();
    this.loadStatistics();
    this.magasinService.getAllMagasins().subscribe((data) => {
      this.allMagasins = data;
      this.dataSourceMagasins.data = data;
      this.magasinsOptions = data.map((m) => ({
        value: m.id,
        label: m.nom,
      }));
    });

    this.loadUsers();
    this.getMerchendiseurs();
    this.loadMerchandiseurs();
    this.loadCurrentUser();
    this.loadStatistics();

    // Charger les données des graphiques
    this.loadUsersChartData();
    this.loadVisitsChartData();
    this.loadUsersIntegrationChartData();

    // Charger les données KPI
    console.log('🔄 Démarrage du chargement des données KPI...');
    this.loadKpiData();

    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
    this.updateCalendarDate();

    this.superviseurService.getAll().subscribe((data) => {
      this.dataSourceSuperviseurs.data = data;
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  magasinsOptions: FilterOption[] = [];

  selectedMagasin: number | null = null;
  resetFilters(): void {
    this.selectedRegion = null;
    this.selectedMagasinType = null;
    this.selectedMerchandiseur = null;
    this.selectedMagasin = null;
    this.dataSourceMagasins.data = this.allMagasins;
    this.dataSource.data = [...this.marchandiseurs];

    this.dataSourceMagasins.paginator?.firstPage();
    this.dataSource.paginator?.firstPage();
  }
  // ngAfterViewInit(): void {
  //   this.dataSource.paginator = this.paginator1;
  //   this.dataSourceMagasins.paginator = this.paginator2;
  //   this.combinedDataSource.paginator = this.paginator3;
  //   this.dataSourceSuperviseurs.paginator = this.paginator4;
  // }
  loadUsers(): void {
    this.superviseurService.getAll().subscribe((superviseurs) => {
      const formattedSuperviseurs = superviseurs.map((s) => ({
        ...s,
        type: 'SUPERVISEUR',
      }));
      this.merchendiseurService
        .getAllMerchendiseurs()
        .subscribe((merchandiseurs) => {
          const formattedMerch = merchandiseurs.map((m) => ({
            ...m,
            type: 'MERCHENDISEUR',
          }));
          const combined = [...formattedSuperviseurs, ...formattedMerch];

          this.combinedDataSource.data = combined;

          this.combinedDataSource.data = combined;

          this.combinedDataSource.paginator = this.paginator3;
        });
    });
  }
  combinedDataSource = new MatTableDataSource<any>([]);

  regions = Object.entries(Region);

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

  semaines = [
    'DASHBOARD.WEEK_CURRENT',
    'DASHBOARD.WEEK_PREVIOUS',
    'DASHBOARD.WEEK_NEXT',
  ];
  dashboardView: boolean = false;

  merchandiseursOptions: any[] = [];
  private loadMerchandiseurs(): void {
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
      next: (merch) => {
        this.marchandiseurs = merch.map((m) => ({
          ...m,
          nomComplet: `${m.nom} ${m.prenom}`,
          progress: this.calculateProgress(m),
          days: this.getWeeklyData(m),
        }));

        this.merchandiseursOptions = merch.map((m) => ({
          value: m.id,
          label: `${m.nom} ${m.prenom}`,
        }));
      },
      error: (err) => console.error('Erreur chargement merchandiseurs:', err),
    });
  }

  private calculateProgress(merch: Merchendiseur): number {
    const progress = merch.marqueCouverte?.length * 10 || 0;
    return progress > 0 ? progress : 10;
  }

  private getWeeklyData(merch: Merchendiseur): any {
    return [0, 0, 0, 0, 0, 0, 0];
  }
  logout(): void {
    this.athService.logout();
  }

  selectedMagasinType: string | null = null;
  selectedMerchandiseur: number | null = null;

  filteredMagasins: any[] = [];
  filteredMerchandiseurs: any[] = [];

  typesMagasins: string[] = ['Hyper', 'Super', 'Boutique'];

  displayedColumnsMarchandiseurs: string[] = [
    'nomComplet',
    'progress',
    'status',
    'dateIntegration',
  ];
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  selection = new SelectionModel<any>(true, []);
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  currentMonth = 'Juin';
  currentYear = 2025;

  isOtherMonth(day: number, weekIndex: number, dayIndex: number): boolean {
    return (day < 7 && weekIndex > 3) || (day > 20 && weekIndex < 2);
  }

  dataSourceMagasins = new MatTableDataSource<Magasin>();

  isSameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  planifications: any[] = [];
  updateCalendarDate(): void {
    // Ici, selectedMonth doit être index JS 0-11
    this.calendarDate = new Date(this.selectedYear, this.selectedMonth, 1);
  }

  onCalendarMonthChange(change: { date: Date; mode: string }): void {
    this.selectedMonth = new Date().getMonth() + 1; // Pour correspondre à l'index 1..12 dans le select

    this.filterPlanificationsByMonth();
  }
  currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  private updateStatistics(filteredPlanifications: any[]): void {
    this.totalPlanifiees = filteredPlanifications.length;
    this.totalEffectuees = filteredPlanifications.filter(
      (p) => p.statut === 'EFFECTUEE'
    ).length;
    this.totalRestantes = filteredPlanifications.filter(
      (p) => p.statut === 'REPROGRAMMEE' || p.statut === 'EN_COURS'
    ).length;
  }

  calendarEvents: { [date: string]: Planification[] } = {};

  loadStatistics(): void {
    this.planificationService
      .getAllPlanifications()
      .subscribe((planifications) => {
        this.planifications = planifications;
        this.prepareCalendarEvents();

        this.totalPlanifiees = planifications.length;
        this.totalEffectuees = planifications.filter(
          (p) => p.statut === 'EFFECTUEE'
        ).length;
        this.totalRestantes = planifications.filter(
          (p) => p.statut === 'REPROGRAMMEE' || p.statut === 'EN_COURS'
        ).length;

        // Mettre à jour le graphique des planifications
        this.updatePlanificationsChart(planifications);
      });
  }

  // Méthodes pour les graphiques
  loadUsersChartData(): void {
    this.userService.getUsers().subscribe((users) => {
      const activeUsers = users.filter(
        (user) => user.status === 'ACTIVE'
      ).length;
      const inactiveUsers = users.filter(
        (user) => user.status === 'INACTIVE'
      ).length;

      this.usersChartData = {
        labels: ['Actifs', 'Inactifs'],
        datasets: [
          {
            data: [activeUsers, inactiveUsers],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderWidth: 2,
          },
        ],
      };
    });
  }

  loadVisitsChartData(): void {
    this.visitService.getAllVisits().subscribe((visits) => {
      // Grouper les visites par magasin
      const visitsByStore = new Map<
        string,
        { complete: number; incomplete: number }
      >();

      visits.forEach((visit) => {
        const storeName = visit.planning?.magasin?.nom || 'Magasin Inconnu';

        if (!visitsByStore.has(storeName)) {
          visitsByStore.set(storeName, { complete: 0, incomplete: 0 });
        }

        const storeData = visitsByStore.get(storeName)!;

        if (this.isVisitComplete(visit)) {
          storeData.complete++;
        } else {
          storeData.incomplete++;
        }
      });

      // Convertir en données pour le graphique
      const storeNames = Array.from(visitsByStore.keys());
      const completeData = storeNames.map(
        (store) => visitsByStore.get(store)!.complete
      );
      const incompleteData = storeNames.map(
        (store) => visitsByStore.get(store)!.incomplete
      );

      this.visitsChartData = {
        labels: storeNames,
        datasets: [
          {
            label: 'Visites Complètes',
            data: completeData,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1,
          },
          {
            label: 'Visites Incomplètes',
            data: incompleteData,
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            borderWidth: 1,
          },
        ],
      };

      // Mettre à jour le graphique des visites
      this.updateVisitsChart();
    });
  }

  loadUsersIntegrationChartData(): void {
    // Charger tous les utilisateurs (superviseurs et merchandisers)
    forkJoin([
      this.superviseurService.getAll(),
      this.merchendiseurService.getAllMerchendiseurs(),
    ]).subscribe(([superviseurs, merchandisers]) => {
      // Combiner tous les utilisateurs
      const allUsers = [
        ...superviseurs.map((s) => ({ ...s, type: 'Superviseur' })),
        ...merchandisers.map((m) => ({ ...m, type: 'Merchandiser' })),
      ];

      // Grouper par mois d'intégration
      const usersByMonth = new Map<string, number>();
      const monthNames = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
      ];

      // Initialiser tous les mois avec 0
      monthNames.forEach((month) => {
        usersByMonth.set(month, 0);
      });

      allUsers.forEach((user) => {
        // Accéder aux propriétés de date d'intégration selon le type d'utilisateur
        let integrationDate: string | undefined;

        if (user.type === 'Superviseur') {
          integrationDate = (user as any).dateIntegration;
        } else if (user.type === 'Merchandiser') {
          integrationDate = (user as any).dateDebutIntegration;
        }

        if (integrationDate) {
          const date = new Date(integrationDate);
          const monthIndex = date.getMonth();
          const monthName = monthNames[monthIndex];

          if (usersByMonth.has(monthName)) {
            usersByMonth.set(monthName, usersByMonth.get(monthName)! + 1);
          }
        }
      });

      // Préparer les données pour le graphique
      const labels = Array.from(usersByMonth.keys());
      const data = Array.from(usersByMonth.values());

      this.usersIntegrationChartData = {
        labels: labels,
        datasets: [
          {
            label: 'Utilisateurs intégrés',
            data: data,
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1,
          },
        ],
      };

      // Mettre à jour le graphique
      this.updateUsersIntegrationChart();
    });
  }

  // Méthode pour vérifier si une visite est complète
  private isVisitComplete(visit: any): boolean {
    // Vérifier les champs obligatoires
    const requiredFields = [
      'heureArrivee',
      'heureDepart',
      'nombreFacings',
      'nombreFacingsTotal',
      'prixNormal',
      'niveauStock',
    ];

    // Vérifier si tous les champs obligatoires sont remplis
    for (const field of requiredFields) {
      if (
        !visit[field] ||
        visit[field] === '' ||
        (field !== 'niveauStock' && visit[field] === 0)
      ) {
        return false;
      }
    }

    // Vérifier si au moins une image a été prise (optionnel)
    if (!visit.images || visit.images.length === 0) {
      return false;
    }

    // Vérifier si au moins un produit a été visité (optionnel)
    if (!visit.produits || visit.produits.length === 0) {
      return false;
    }

    return true;
  }

  updatePlanificationsChart(planifications: Planification[]): void {
    const planned = planifications.filter(
      (p) => p.statut === 'PLANIFIEE'
    ).length;
    const inProgress = planifications.filter(
      (p) => p.statut === 'EN_COURS'
    ).length;
    const completed = planifications.filter(
      (p) => p.statut === 'EFFECTUEE'
    ).length;
    const rescheduled = planifications.filter(
      (p) => p.statut === 'REPROGRAMMEE'
    ).length;
    const notCompleted = planifications.filter(
      (p) => p.statut === 'NON_ACCOMPLIE'
    ).length;

    this.translate
      .get([
        'DASHBOARD.PLANNED',
        'DASHBOARD.IN_PROGRESS',
        'DASHBOARD.COMPLETED',
        'DASHBOARD.RESCHEDULED',
        'DASHBOARD.NOT_COMPLETED',
      ])
      .subscribe((translations) => {
        this.planificationsChartData = {
          labels: [
            translations['DASHBOARD.PLANNED'],
            translations['DASHBOARD.IN_PROGRESS'],
            translations['DASHBOARD.COMPLETED'],
            translations['DASHBOARD.RESCHEDULED'],
            translations['DASHBOARD.NOT_COMPLETED'],
          ],
          datasets: [
            {
              data: [planned, inProgress, completed, rescheduled, notCompleted],
              backgroundColor: [
                '#1f1f5e',
                '#ff9800',
                '#4caf50',
                '#beab71',
                '#f44336',
              ],
              borderWidth: 2,
            },
          ],
        };
      });

    // Mettre à jour le graphique des planifications
    this.updatePlanificationsChartDisplay();
  }

  getCalendarDateCellContent(date: Date): string {
    const dateKey = date.toISOString().split('T')[0];
    const events = this.calendarEvents[dateKey] || [];

    return events
      .map((event) => `${event.magasin.nom} (${event.statut})`)
      .join('<br>');
  }

  previousMonth(): void {
    const newDate = new Date(this.calendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.calendarDate = newDate;
  }

  nextMonth(): void {
    const newDate = new Date(this.calendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.calendarDate = newDate;
  }
  getStatusClass(statut: StatutVisite): string {
    switch (statut) {
      case StatutVisite.EFFECTUEE:
        return 'status-done';
      case StatutVisite.EN_COURS:
        return 'status-in-progress';
      case StatutVisite.PLANIFIEE:
        return 'status-planned';
      case StatutVisite.REPROGRAMMEE:
        return 'status-rescheduled';
      case StatutVisite.NON_ACCOMPLIE:
        return 'status-not-done';
      default:
        return 'status-default';
    }
  }

  onEventClick(event: Planification): void {
    // Implémentez la logique lorsque l'utilisateur clique sur un événement
    console.log('Événement cliqué:', event);
    // Vous pouvez par exemple ouvrir un dialogue avec les détails
    // this.openPlanificationDetails(event);
  }
  hasEvents(date: Date): boolean {
    const dateKey = date.toISOString().split('T')[0];
    return this.planifications.some(
      (p) => new Date(p.dateVisite).toISOString().split('T')[0] === dateKey
    );
  }

  hasEventsWithStatus(date: Date, status: StatutVisite): boolean {
    const dateKey = date.toISOString().split('T')[0];
    return this.planifications.some(
      (p) =>
        new Date(p.dateVisite).toISOString().split('T')[0] === dateKey &&
        p.statut === status
    );
  }
  getFirstEventName(date: Date): string {
    const events = this.getEventsForDate(date);
    return events.length > 0 ? events[0].magasin.nom : '';
  }

  getEventsForDate(date: Date): Planification[] {
    if (!date) return [];

    const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd');
    const uniqueEvents = new Map<string, Planification>();

    this.planifications.forEach((planif) => {
      if (!planif?.dateVisite) return;

      const planifDate = new Date(planif.dateVisite);
      if (
        planifDate.getFullYear() === date.getFullYear() &&
        planifDate.getMonth() === date.getMonth() &&
        planifDate.getDate() === date.getDate()
      ) {
        uniqueEvents.set(planif.id, planif);
      }
    });

    return Array.from(uniqueEvents.values());
  }
  prepareCalendarEvents(): void {
    this.calendarEvents = {};
    const uniquePlanifs = new Map<string, Planification>();

    this.planifications.forEach((planif) => {
      uniquePlanifs.set(planif.id, planif);
    });

    uniquePlanifs.forEach((planif) => {
      const dateKey = new Date(planif.dateVisite).toISOString().split('T')[0];
      if (!this.calendarEvents[dateKey]) {
        this.calendarEvents[dateKey] = [];
      }
      this.calendarEvents[dateKey].push(planif);
    });
  }
  userMenuOpen = false;
  hasPlanif(date: Date): boolean {
    return this.getPlanificationsForDate(date).length > 0;
  }
  planificationsParJour: { [date: string]: Planification[] } = {};

  // loadPlanifications(): void {
  //   this.planificationService.getAllPlanifications().subscribe(planifs => {
  //     this.planificationsParJour = {};
  //     planifs.forEach(p => {
  //       const k = formatDate(p.dateVisite, 'yyyy-MM-dd', 'fr');
  //       (this.planificationsParJour[k] ??= []).push(p);
  //     });
  //     this.cdr.detectChanges();          // ← si OnPush
  //   });
  // }

  // getPlanificationsForDate(d: Date): Planification[] {
  //   const k = formatDate(d, 'yyyy-MM-dd', 'fr');
  //   return this.planificationsParJour[k] ?? [];
  // }

  // getColorByStatut(statut: StatutVisite): string {
  //   switch (statut) {
  //     case 'PLANIFIEE':
  //       return 'primary';
  //     case 'EN_COURS':
  //       return 'accent';
  //     case 'EFFECTUEE':
  //       return 'success';
  //     case 'REPROGRAMMEE':
  //       return 'warn';
  //     case 'NON_ACCOMPLIE':
  //       return 'warn';
  //     default:
  //       return '';
  //   }
  // }
  goToMerchandiseur() {
    this.router.navigate(['/merchendiseur']);
  }
  goToPlabification() {
    this.router.navigate(['/planification']);
  }
  goToMagasins() {
    this.router.navigate(['/magasins']);
  }
  goToUsers() {
    this.router.navigate(['/users']);
  }
  loadPlanifications(): void {}

  getPlanificationsForDate(d: Date): Planification[] {
    const k = formatDate(d, 'yyyy-MM-dd', 'fr');
    return this.planificationsParJour[k] ?? [];
  }

  // Méthodes pour les graphiques Chart.js
  private initializeCharts(): void {
    this.createVisitsChart();
    this.createPlanificationsChart();
    this.createUsersIntegrationChart();
  }

  private createVisitsChart(): void {
    const ctx = document.getElementById('visitsChart') as HTMLCanvasElement;
    if (ctx && !this.visitsChart) {
      this.visitsChart = new Chart(ctx, {
        type: 'bar',
        data: this.visitsChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
              },
            },
            title: {
              display: true,
              text: 'Progrès des Visites',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  private createPlanificationsChart(): void {
    const ctx = document.getElementById(
      'planificationsChart'
    ) as HTMLCanvasElement;
    if (ctx && !this.planificationsChart) {
      this.translate.get('DASHBOARD.PLANNING_BY_STATUS').subscribe((title) => {
        this.planificationsChart = new Chart(ctx, {
          type: 'doughnut',
          data: this.planificationsChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              title: {
                display: true,
                text: title,
              },
            },
          },
        });
      });
    }
  }

  private createUsersIntegrationChart(): void {
    const ctx = document.getElementById(
      'usersIntegrationChart'
    ) as HTMLCanvasElement;
    if (ctx && !this.usersIntegrationChart) {
      this.usersIntegrationChart = new Chart(ctx, {
        type: 'bar',
        data: this.usersIntegrationChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
              },
            },
            title: {
              display: true,
              text: 'Intégration des Utilisateurs par Mois',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  private updateVisitsChart(): void {
    if (this.visitsChart) {
      this.visitsChart.data = this.visitsChartData;
      this.visitsChart.update();
    }
  }

  private updateUsersIntegrationChart(): void {
    if (this.usersIntegrationChart) {
      this.usersIntegrationChart.data = this.usersIntegrationChartData;
      this.usersIntegrationChart.update();
    }
  }

  private updatePlanificationsChartDisplay(): void {
    if (this.planificationsChart) {
      // Mettre à jour les labels traduits
      this.translate
        .get([
          'DASHBOARD.PLANNED',
          'DASHBOARD.IN_PROGRESS',
          'DASHBOARD.COMPLETED',
          'DASHBOARD.RESCHEDULED',
          'DASHBOARD.NOT_COMPLETED',
        ])
        .subscribe((translations) => {
          this.planificationsChartData.labels = [
            translations['DASHBOARD.PLANNED'],
            translations['DASHBOARD.IN_PROGRESS'],
            translations['DASHBOARD.COMPLETED'],
            translations['DASHBOARD.RESCHEDULED'],
            translations['DASHBOARD.NOT_COMPLETED'],
          ];

          // Mettre à jour aussi les couleurs pour qu'elles correspondent au calendrier
          this.planificationsChartData.datasets[0].backgroundColor = [
            '#1f1f5e',
            '#ff9800',
            '#4caf50',
            '#beab71',
            '#f44336',
          ];

          if (this.planificationsChart) {
            this.planificationsChart.data = this.planificationsChartData;
            this.planificationsChart.update();
          }
        });
    }
  }

  // Méthodes KPI
  loadKpiData(): void {
    console.log('🔄 Chargement des données KPI...');
    this.kpiLoading = true;

    // Utiliser les filtres si définis, sinon charger toutes les données
    const kpiObservable = this.hasActiveFilters()
      ? this.kpiService.getAllKpiDataWithFilters(this.kpiFilters)
      : this.kpiService.getAllKpiData();

    kpiObservable.subscribe({
      next: (data) => {
        console.log('✅ Données KPI reçues:', data);

        this.kpiAssignmentData = data.assignmentTracking;
        this.kpiAppUsageData = data.appUsageStats;
        this.kpiReportData = data.reportCompletion;

        // DEBUG: Vérifier les données reçues
        console.log('🔍 DEBUG - Données reçues:', {
          assignmentData: this.kpiAssignmentData,
          appUsageData: this.kpiAppUsageData,
          reportData: this.kpiReportData,
        });

        // Mettre à jour les data sources
        this.updateKpiDataSources();

        // Détecter si on utilise des données mock (basé sur la taille des données)
        this.kpiDataMode =
          this.kpiAssignmentData.length <= 2 && this.kpiReportData.length <= 2
            ? 'mock'
            : 'real';

        if (this.kpiDataMode === 'mock') {
          console.warn(
            '⚠️ Mode données mock détecté - API backend non disponible'
          );
          // Créer des données de test si aucune donnée n'est disponible
          this.createMockKpiData();
        }

        // Logs de vérification
        console.log('📊 KPI 1 - Affectations:', {
          nombreMerchandisers: this.kpiAssignmentData.length,
          totalAssignations: this.getTotalCompletedAssignments(),
          premierMerchandiser: this.kpiAssignmentData[0],
        });

        console.log('📱 KPI 2 - Utilisation App:', {
          totalUsers: this.kpiAppUsageData?.totalUsers,
          activeUsers: this.kpiAppUsageData?.activeUsers,
          dailyActiveUsers: this.kpiAppUsageData?.dailyActiveUsers,
        });

        console.log('📋 KPI 3 - Rapports:', {
          nombreMerchandisers: this.kpiReportData.length,
          totalRapports: this.getTotalCompletedReports(),
          tauxMoyen: this.getAverageCompletionRate(),
        });

        this.kpiLoading = false;

        // Créer les graphiques KPI après un délai pour s'assurer que les éléments DOM sont prêts
        setTimeout(() => {
          this.createKpiChartsWithRetry();
        }, 500);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des KPIs:', error);
        // En cas d'erreur, passer en mode mock
        this.kpiDataMode = 'mock';
        this.kpiLoading = false;
        this.createMockKpiData();
      },
    });
  }

  // Mettre à jour les data sources KPI
  updateKpiDataSources(): void {
    // Filtrer les données selon les critères sélectionnés
    let filteredAssignments = this.kpiAssignmentData;
    let filteredReports = this.kpiReportData;

    if (this.selectedKpiRegion && this.selectedKpiRegion !== 'Toutes') {
      filteredAssignments = this.kpiAssignmentData.filter(
        (item) => item.region === this.selectedKpiRegion
      );
      filteredReports = this.kpiReportData.filter(
        (item) => item.region === this.selectedKpiRegion
      );
    }

    this.assignmentDataSource.data = filteredAssignments;
    this.reportDataSource.data = filteredReports;
  }

  // Méthodes pour les filtres KPI
  hasActiveFilters(): boolean {
    return !!(
      this.kpiFilters.dateRange.startDate ||
      this.kpiFilters.dateRange.endDate ||
      this.kpiFilters.region ||
      this.kpiFilters.merchandiserId ||
      this.kpiFilters.status
    );
  }

  applyKpiFilters(): void {
    console.log('🔍 Application des filtres KPI:', this.kpiFilters);
    this.loadKpiData();
  }

  clearKpiFilters(): void {
    this.kpiFilters = {
      dateRange: { startDate: '', endDate: '' },
      region: '',
      merchandiserId: 0,
      status: '',
    };
    this.selectedKpiRegion = '';
    this.selectedKpiPeriod = 'month';
    this.kpiDateRange = {
      start: new Date(),
      end: new Date(),
    };
    console.log('🗑️ Filtres KPI effacés');
    this.loadKpiData();
  }

  // Méthodes de filtrage KPI étendues
  onKpiRegionChange(): void {
    this.updateKpiDataSources();
    this.refreshKpiCharts();
  }

  onKpiPeriodChange(): void {
    // Ici vous pourriez filtrer par période si nécessaire
    this.refreshKpiCharts();
  }

  refreshKpiData(): void {
    console.log('🔄 Actualisation des données KPI...');
    this.kpiService.refreshKpiData().subscribe({
      next: (data) => {
        this.kpiAssignmentData = data.assignmentTracking;
        this.kpiAppUsageData = data.appUsageStats;
        this.kpiReportData = data.reportCompletion;
        this.updateKpiDataSources();
        setTimeout(() => this.createKpiCharts(), 500);
      },
    });
  }

  refreshKpiCharts(): void {
    this.destroyKpiCharts();
    setTimeout(() => {
      this.createKpiChartsSelectively();
    }, 100);
  }

  private destroyKpiCharts(): void {
    if (this.kpiAssignmentChart) {
      this.kpiAssignmentChart.destroy();
      this.kpiAssignmentChart = null;
    }
    if (this.kpiUsageChart) {
      this.kpiUsageChart.destroy();
      this.kpiUsageChart = null;
    }
    if (this.kpiReportChart) {
      this.kpiReportChart.destroy();
      this.kpiReportChart = null;
    }
    if (this.completionTrendChart) {
      this.completionTrendChart.destroy();
      this.completionTrendChart = null;
    }
  }

  // Utilitaires KPI
  getCompletionStatus(rate: number): string {
    if (rate >= 90) return 'excellent';
    if (rate >= 80) return 'good';
    if (rate >= 70) return 'average';
    return 'poor';
  }

  getCompletionRate(rate: number): string {
    if (rate >= 90) return 'primary';
    if (rate >= 80) return 'accent';
    if (rate >= 70) return 'warn';
    return 'warn';
  }

  getCompletionColor(rate: number): string {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 80) return '#FF9800';
    if (rate >= 70) return '#FFC107';
    return '#F44336';
  }

  getAssignmentStatus(assignments: MerchandiserAssignmentTracking): string {
    const completionRate = assignments.completionRate;
    if (completionRate >= 90) return 'Excellente';
    if (completionRate >= 80) return 'Bonne';
    if (completionRate >= 70) return 'Moyenne';
    return 'À améliorer';
  }

  createKpiCharts(): void {
    this.createKpiAssignmentChart();
    this.createKpiUsageChart();
    this.createKpiReportChart();
    this.createCompletionTrendChart();
  }

  createKpiChartsWithRetry(): void {
    // Vérifier si les éléments DOM sont disponibles
    const canvasElements = [
      'kpiAssignmentChart',
      'kpiUsageChart',
      'kpiReportChart',
      'kpiTrendChart',
    ];

    const missingElements = canvasElements.filter(
      (id) => !document.getElementById(id)
    );

    if (missingElements.length > 0) {
      console.warn('⏳ Canvas elements not ready yet:', missingElements);

      // Limiter le nombre de tentatives pour éviter une boucle infinie
      if (!this.retryCount) {
        this.retryCount = 0;
      }

      if (this.retryCount < 10) {
        this.retryCount++;
        // Réessayer après 200ms
        setTimeout(() => {
          this.createKpiChartsWithRetry();
        }, 200);
        return;
      } else {
        console.warn(
          '⚠️ Max retry attempts reached, creating available charts only'
        );
      }
    }

    console.log('🎯 Creating available charts...');
    this.createKpiChartsSelectively();
  }

  private retryCount = 0;

  createKpiChartsSelectively(): void {
    // Créer seulement les graphiques dont les éléments DOM sont disponibles
    if (document.getElementById('kpiAssignmentChart')) {
      this.createKpiAssignmentChart();
    }

    if (document.getElementById('kpiUsageChart')) {
      this.createKpiUsageChart();
    }

    if (document.getElementById('kpiReportChart')) {
      this.createKpiReportChart();
    }

    if (document.getElementById('kpiTrendChart')) {
      this.createCompletionTrendChart();
    }
  }

  // Gestionnaire pour les changements d'onglets
  onTabChange(event: any): void {
    console.log('📑 Tab changed to:', event.index);

    // Attendre que l'onglet soit complètement rendu
    setTimeout(() => {
      this.createChartsForActiveTab(event.index);
    }, 100);
  }

  private createChartsForActiveTab(tabIndex: number): void {
    switch (tabIndex) {
      case 0: // Onglet des affectations
        if (document.getElementById('kpiAssignmentChart')) {
          this.createKpiAssignmentChart();
        }
        break;

      case 1: // Onglet d'utilisation
        if (document.getElementById('kpiUsageChart')) {
          this.createKpiUsageChart();
        }
        break;

      case 2: // Onglet des rapports
        if (document.getElementById('kpiReportChart')) {
          this.createKpiReportChart();
        }
        if (document.getElementById('kpiTrendChart')) {
          this.createCompletionTrendChart();
        }
        break;
    }
  }

  // Créer des données de test pour les graphiques KPI
  createMockKpiData(): void {
    console.log('🎭 Création de données de test pour les graphiques KPI...');

    // Données de test pour les assignations
    if (this.kpiAssignmentData.length === 0) {
      this.kpiAssignmentData = [
        {
          merchandiserId: 1,
          merchandiserName: 'Ahmed Benali',
          region: 'Casablanca-Settat',
          totalAssignments: 15,
          completedAssignments: 12,
          pendingAssignments: 3,
          inProgressAssignments: 2,
          completionRate: 80,
          averageCompletionTime: '2h 30m',
          lastActivityDate: '2024-01-15',
        },
        {
          merchandiserId: 2,
          merchandiserName: 'Fatima Alami',
          region: 'Rabat-Salé-Kénitra',
          totalAssignments: 20,
          completedAssignments: 18,
          pendingAssignments: 2,
          inProgressAssignments: 1,
          completionRate: 90,
          averageCompletionTime: '2h 15m',
          lastActivityDate: '2024-01-14',
        },
        {
          merchandiserId: 3,
          merchandiserName: 'Omar Tazi',
          region: 'Marrakech-Safi',
          totalAssignments: 12,
          completedAssignments: 8,
          pendingAssignments: 4,
          inProgressAssignments: 3,
          completionRate: 67,
          averageCompletionTime: '3h 00m',
          lastActivityDate: '2024-01-13',
        },
      ];
    }

    // Données de test pour l'utilisation de l'app
    if (!this.kpiAppUsageData) {
      this.kpiAppUsageData = {
        totalUsers: 25,
        activeUsers: 18,
        dailyActiveUsers: 12,
        weeklyActiveUsers: 20,
        averageSessionDuration: '2h 45m',
        mostUsedFeatures: [
          { feature: 'Planification', usageCount: 150, percentage: 35 },
          { feature: 'Visites', usageCount: 120, percentage: 28 },
          { feature: 'Rapports', usageCount: 100, percentage: 23 },
          { feature: 'Gestion Stock', usageCount: 60, percentage: 14 },
        ],
        loginStats: {
          today: 12,
          thisWeek: 85,
          thisMonth: 320,
        },
      };
    }

    // Données de test pour les rapports
    if (this.kpiReportData.length === 0) {
      this.kpiReportData = [
        {
          merchandiserId: 1,
          merchandiserName: 'Ahmed Benali',
          region: 'Casablanca-Settat',
          totalReports: 15,
          completedReports: 12,
          incompleteReports: 3,
          completionRate: 80,
          averageReportTime: '2h 30m',
          reportsByStatus: {
            completed: 12,
            inProgress: 2,
            pending: 1,
            overdue: 0,
          },
          reportsByMonth: [
            { month: 'Oct 2023', completed: 8, total: 10 },
            { month: 'Nov 2023', completed: 12, total: 15 },
            { month: 'Déc 2023', completed: 15, total: 18 },
            { month: 'Jan 2024', completed: 12, total: 15 },
          ],
        },
        {
          merchandiserId: 2,
          merchandiserName: 'Fatima Alami',
          region: 'Rabat-Salé-Kénitra',
          totalReports: 20,
          completedReports: 18,
          incompleteReports: 2,
          completionRate: 90,
          averageReportTime: '2h 15m',
          reportsByStatus: {
            completed: 18,
            inProgress: 1,
            pending: 1,
            overdue: 0,
          },
          reportsByMonth: [
            { month: 'Oct 2023', completed: 10, total: 12 },
            { month: 'Nov 2023', completed: 15, total: 16 },
            { month: 'Déc 2023', completed: 18, total: 20 },
            { month: 'Jan 2024', completed: 18, total: 20 },
          ],
        },
      ];
    }

    console.log('✅ Données de test créées:', {
      assignments: this.kpiAssignmentData.length,
      appUsage: this.kpiAppUsageData ? 'OK' : 'MANQUANT',
      reports: this.kpiReportData.length,
    });

    // Mettre à jour les data sources
    this.updateKpiDataSources();
  }

  // Méthode de debug pour diagnostiquer les problèmes de graphiques
  debugKpiCharts(): void {
    console.log('🔍 === DIAGNOSTIC DES GRAPHIQUES KPI ===');

    // 1. Vérifier Chart.js
    console.log(
      '1️⃣ Chart.js disponible?',
      typeof Chart !== 'undefined' ? '✅ OUI' : '❌ NON'
    );

    // 2. Vérifier les données
    console.log('2️⃣ Données KPI:', {
      assignmentData: this.kpiAssignmentData.length,
      appUsageData: this.kpiAppUsageData ? 'OK' : 'MANQUANT',
      reportData: this.kpiReportData.length,
      loadingState: this.kpiLoading,
    });

    // 3. Vérifier les éléments DOM
    const canvasIds = [
      'kpiAssignmentChart',
      'kpiUsageChart',
      'kpiReportChart',
      'kpiTrendChart',
    ];
    console.log('3️⃣ Éléments Canvas dans le DOM:');
    canvasIds.forEach((id) => {
      const element = document.getElementById(id);
      console.log(`   ${id}:`, element ? '✅ TROUVÉ' : '❌ MANQUANT');
      if (element) {
        console.log(
          `      - Visible: ${
            element.offsetWidth > 0 && element.offsetHeight > 0 ? 'OUI' : 'NON'
          }`
        );
        console.log(
          `      - Dimensions: ${element.offsetWidth}x${element.offsetHeight}`
        );
      }
    });

    // 4. Vérifier les graphiques existants
    console.log('4️⃣ Graphiques Chart.js existants:', {
      assignmentChart: this.kpiAssignmentChart ? 'EXISTANT' : 'NULL',
      usageChart: this.kpiUsageChart ? 'EXISTANT' : 'NULL',
      reportChart: this.kpiReportChart ? 'EXISTANT' : 'NULL',
      trendChart: this.completionTrendChart ? 'EXISTANT' : 'NULL',
    });

    // 5. Tester le service KPI directement
    console.log('5️⃣ Test du service KPI...');
    this.kpiService.getAllKpiData().subscribe({
      next: (data) => {
        console.log('✅ Service KPI répond:', data);
      },
      error: (error) => {
        console.error('❌ Erreur service KPI:', error);
      },
    });

    // 6. Créer des données de test si nécessaire
    if (
      this.kpiAssignmentData.length === 0 ||
      !this.kpiAppUsageData ||
      this.kpiReportData.length === 0
    ) {
      console.log('6️⃣ Création de données de test...');
      this.createMockKpiData();
    }

    // 7. Forcer la création des graphiques
    console.log('7️⃣ Tentative de création des graphiques...');
    this.createKpiChartsSelectively();

    console.log('🔍 === FIN DU DIAGNOSTIC ===');
  }

  // Forcer le rechargement complet des données KPI
  forceReloadKpiData(): void {
    console.log('🔄 Rechargement forcé des données KPI...');

    // Réinitialiser toutes les données
    this.kpiAssignmentData = [];
    this.kpiAppUsageData = null;
    this.kpiReportData = [];
    this.kpiLoading = true;

    // Détruire tous les graphiques existants
    this.destroyKpiCharts();

    // Attendre un peu puis recharger
    setTimeout(() => {
      console.log('📊 Rechargement des données KPI...');
      this.loadKpiData();
    }, 500);

    // En parallèle, créer des données de test immédiatement
    console.log('🎭 Création de données de test immédiates...');
    this.createMockKpiData();

    // Forcer la création des graphiques après 1 seconde
    setTimeout(() => {
      console.log('🎨 Création forcée des graphiques...');
      this.createKpiChartsSelectively();
    }, 1000);
  }

  // Export des données KPI
  exportKpiToExcel(): void {
    // Implémentation de l'export Excel
    console.log('Export Excel KPI - À implémenter');
  }

  exportKpiToPDF(): void {
    // Implémentation de l'export PDF
    console.log('Export PDF KPI - À implémenter');
  }

  private createKpiAssignmentChart(): void {
    console.log("🎯 Tentative de création du graphique d'assignations...");

    const ctx = document.getElementById(
      'kpiAssignmentChart'
    ) as HTMLCanvasElement;
    if (!ctx) {
      console.error('❌ Canvas kpiAssignmentChart not found in DOM');
      return;
    }

    console.log('✅ Canvas kpiAssignmentChart trouvé:', ctx);

    if (this.kpiAssignmentData.length === 0) {
      console.error('❌ No assignment data available for chart');
      return;
    }

    console.log(
      "✅ Données d'assignations disponibles:",
      this.kpiAssignmentData.length,
      'éléments'
    );

    // Nettoyer le graphique existant
    if (this.kpiAssignmentChart) {
      this.kpiAssignmentChart.destroy();
      console.log("🧹 Ancien graphique d'assignations détruit");
    }

    try {
      // Préparer les données pour Chart.js
      const labels = this.kpiAssignmentData.map(
        (item) => item.merchandiserName
      );
      const completedData = this.kpiAssignmentData.map(
        (item) => item.completedAssignments
      );
      const pendingData = this.kpiAssignmentData.map(
        (item) => item.pendingAssignments
      );

      console.log('📊 Données préparées pour le graphique:', {
        labels: labels,
        completedData: completedData,
        pendingData: pendingData,
      });

      this.kpiAssignmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Assignations Complétées',
              data: completedData,
              backgroundColor: '#4CAF50',
              borderColor: '#4CAF50',
              borderWidth: 1,
            },
            {
              label: 'Assignations en Attente',
              data: pendingData,
              backgroundColor: '#FF9800',
              borderColor: '#FF9800',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Suivi des Affectations par Merchandiser',
            },
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });

      console.log('✅ KPI Assignment Chart created successfully!');
    } catch (error) {
      console.error('❌ Error creating KPI Assignment Chart:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
      } else {
        console.error('❌ Unknown error type:', typeof error);
      }
    }
  }

  private createKpiUsageChart(): void {
    const ctx = document.getElementById('kpiUsageChart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Canvas kpiUsageChart not found');
      return;
    }

    if (!this.kpiAppUsageData) {
      console.warn('No app usage data available for chart');
      return;
    }

    // Nettoyer le graphique existant
    if (this.kpiUsageChart) {
      this.kpiUsageChart.destroy();
    }

    try {
      this.kpiUsageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Utilisateurs Actifs', 'Utilisateurs Inactifs'],
          datasets: [
            {
              data: [
                this.kpiAppUsageData.activeUsers,
                this.kpiAppUsageData.totalUsers -
                  this.kpiAppUsageData.activeUsers,
              ],
              backgroundColor: ['#2196F3', '#E0E0E0'],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Taux d'Utilisation Globale",
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      });

      console.log('✅ KPI Usage Chart created successfully');
    } catch (error) {
      console.error('❌ Error creating KPI Usage Chart:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
    }
  }

  private createKpiReportChart(): void {
    const ctx = document.getElementById('kpiReportChart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Canvas kpiReportChart not found');
      return;
    }

    if (this.kpiReportData.length === 0) {
      console.warn('No report data available for chart');
      return;
    }

    // Nettoyer le graphique existant
    if (this.kpiReportChart) {
      this.kpiReportChart.destroy();
    }

    try {
      this.kpiReportChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.kpiReportData.map((item) => item.merchandiserName),
          datasets: [
            {
              label: 'Taux de Completion (%)',
              data: this.kpiReportData.map((item) => item.completionRate),
              backgroundColor: this.kpiReportData.map((item) =>
                item.completionRate >= 90
                  ? '#4CAF50'
                  : item.completionRate >= 80
                  ? '#FF9800'
                  : '#F44336'
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Finalisation des Rapports par Merchandiser',
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + '%';
                },
              },
            },
          },
        },
      });

      console.log('✅ KPI Report Chart created successfully');
    } catch (error) {
      console.error('❌ Error creating KPI Report Chart:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
    }
  }

  private createCompletionTrendChart(): void {
    const ctx = document.getElementById('kpiTrendChart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Canvas kpiTrendChart not found');
      return;
    }

    if (this.kpiReportData.length === 0) {
      console.warn('No report data available for trend chart');
      return;
    }

    // Nettoyer le graphique existant
    if (this.completionTrendChart) {
      this.completionTrendChart.destroy();
    }

    try {
      // Calculer la moyenne des taux de completion par mois
      const months = ['Oct 2023', 'Nov 2023', 'Déc 2023', 'Jan 2024'];
      const avgCompletionRates = months.map((month) => {
        const rates = this.kpiReportData.map((report) => {
          const monthData = report.reportsByMonth?.find(
            (m) => m.month === month
          );
          return monthData ? (monthData.completed / monthData.total) * 100 : 0;
        });
        return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      });

      this.completionTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Taux de Completion Moyen (%)',
              data: avgCompletionRates,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Évolution du Taux de Completion',
            },
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + '%';
                },
              },
            },
          },
        },
      });

      console.log('✅ KPI Trend Chart created successfully');
    } catch (error) {
      console.error('❌ Error creating KPI Trend Chart:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
    }
  }

  // Nettoyer les graphiques lors de la destruction du composant
  ngOnDestroy(): void {
    this.destroyCharts();
    this.destroyKpiCharts();
  }

  private destroyCharts(): void {
    if (this.visitsChart) {
      this.visitsChart.destroy();
      this.visitsChart = null;
    }
    if (this.planificationsChart) {
      this.planificationsChart.destroy();
      this.planificationsChart = null;
    }
    if (this.usersIntegrationChart) {
      this.usersIntegrationChart.destroy();
      this.usersIntegrationChart = null;
    }
  }
}
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
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
import { MatProgressBarModule, MatProgressBar } from '@angular/material/progress-bar';
import { MatSpinner } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AdduserComponent } from '../adduser/adduser.component';
import { LoginHistoryComponent } from '../login-history/login-history.component';
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
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatFormFieldModule, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelectModule, MatSelect, MatOption } from '@angular/material/select';
import { Component, CUSTOM_ELEMENTS_SCHEMA, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule, MatInput } from '@angular/material/input';
import { Magasin, MagasinService } from '../../services/magasin.service';
import { Merchendiseur, MerchendiseurService } from '../../services/merchendiseur.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { Planification, PlanificationService, StatutVisite,  } from '../../services/planification.service';
import { VisitService } from '../../services/visit.service';
import { UserService } from '../../services/user.service';
import { KpiService, MerchandiserAssignmentTracking, AppUsageStats, ReportCompletionStats } from '../../services/kpi.service';
import { NzCalendarMode } from 'ng-zorro-antd/calendar';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
// import { MatTooltip } from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

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
    TranslateModule,MatTooltipModule,
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
    MatCheckbox,
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
    LoginHistoryComponent,
   
  ],
providers: [TranslateService,
  // { provide: LOCALE_ID, useValue: 'fr' },
  DatePipe
],
  
  templateUrl: './dachboard.component.html',
  styleUrl: './dachboard.component.css'
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

  // Graphiques Chart.js
  visitsChart: Chart | null = null;
  planificationsChart: Chart | null = null;
  usersIntegrationChart: Chart | null = null;
  
  // Graphiques KPI
  kpiAssignmentChart: Chart | null = null;
  kpiUsageChart: Chart | null = null;
  kpiReportChart: Chart | null = null;

  // Graphiques
  public usersChartData: ChartData<'doughnut'> = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderWidth: 2
    }]
  };

  public visitsChartData: ChartData<'bar'> = {
    labels: ['Visites Complètes', 'Visites Incomplètes'],
    datasets: [{
      label: 'Nombre de Visites',
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#FF9800'],
      borderColor: ['#4CAF50', '#FF9800'],
      borderWidth: 1
    }]
  };

  public planificationsChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#1f1f5e', '#ff9800', '#4caf50', '#beab71', '#f44336'],
      borderWidth: 2
    }]
  };

  public usersIntegrationChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Utilisateurs intégrés',
      data: [],
      backgroundColor: '#2196F3',
      borderColor: '#1976D2',
      borderWidth: 1
    }]
  };

  // Données KPI
  kpiAssignmentData: MerchandiserAssignmentTracking[] = [];
  kpiAppUsageData: AppUsageStats | null = null;
  kpiReportData: ReportCompletionStats[] = [];

  // Filtres KPI
  kpiFilters = {
    dateRange: {
      startDate: '',
      endDate: ''
    },
    region: '',
    merchandiserId: 0,
    status: ''
  };

  // État des données KPI
  kpiDataMode: 'real' | 'mock' = 'real';

  // Méthodes utilitaires pour les calculs KPI
  getTotalAssignments(): number {
    return this.kpiAssignmentData.reduce((sum, item) => sum + item.totalAssignments, 0);
  }

  getCompletedAssignments(): number {
    return this.kpiAssignmentData.reduce((sum, item) => sum + item.completedAssignments, 0);
  }

  getPendingAssignments(): number {
    return this.kpiAssignmentData.reduce((sum, item) => sum + item.pendingAssignments, 0);
  }

  getTotalCompletedAssignments(): number {
    return this.getCompletedAssignments();
  }

  getAverageCompletionRate(): number {
    if (this.kpiReportData.length === 0) return 0;
    const total = this.kpiReportData.reduce((sum, item) => sum + item.completionRate, 0);
    return Math.round((total / this.kpiReportData.length) * 10) / 10;
  }

  getTotalCompletedReports(): number {
    return this.kpiReportData.reduce((sum, item) => sum + item.completedReports, 0);
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
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
        : 'assets/default-avatar.png';
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
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
}

dataSource = new MatTableDataSource<any>();
displayedColumns: string[] = ['select', 'nomComplet', 'progress', 'status', 'dateIntegration'];
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
      magasin => magasin.region === this.selectedRegion
    );
  }
  this.dataSourceMagasins.paginator?.firstPage();
}
filterMerchandiseurs(): void {
  if (!this.selectedMerchandiseur) {
    this.dataSource.data = [...this.marchandiseurs];
  } else {
    this.dataSource.data = this.marchandiseurs.filter(m => m.id === this.selectedMerchandiseur);
  }
  this.dataSource.paginator?.firstPage();
}
marques = ['Richbond', 'Simmons', 'Révey', 'Atlas', 'Total Rayons'];
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
  this.translate.get([
    'DASHBOARD.PLANNED',
    'DASHBOARD.IN_PROGRESS', 
    'DASHBOARD.COMPLETED',
    'DASHBOARD.RESCHEDULED',
    'DASHBOARD.NOT_COMPLETED'
  ]).subscribe(translations => {
    this.planificationsChartData.labels = [
      translations['DASHBOARD.PLANNED'],
      translations['DASHBOARD.IN_PROGRESS'],
      translations['DASHBOARD.COMPLETED'],
      translations['DASHBOARD.RESCHEDULED'],
      translations['DASHBOARD.NOT_COMPLETED']
    ];
    
    // S'assurer que les couleurs correspondent au calendrier
    this.planificationsChartData.datasets[0].backgroundColor = ['#1f1f5e', '#ff9800', '#4caf50', '#beab71', '#f44336'];
  });
}

private updateChartLabelsOnLanguageChange(): void {
  // Mettre à jour les labels et le titre du graphique existant
  this.updatePlanificationsChartDisplay();
  this.updateChartTitle();
}

private updateChartTitle(): void {
  if (this.planificationsChart) {
    this.translate.get('DASHBOARD.PLANNING_BY_STATUS').subscribe(title => {
      if (this.planificationsChart && this.planificationsChart.options && this.planificationsChart.options.plugins) {
        this.planificationsChart.options.plugins.title = {
          display: true,
          text: title
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
  switch(status) {
    case StatutVisite.PLANIFIEE: return 'event-planned';
    case StatutVisite.EN_COURS: return 'event-in-progress';
    case StatutVisite.EFFECTUEE: return 'event-done';
    case StatutVisite.REPROGRAMMEE: return 'event-rescheduled';
    case StatutVisite.NON_ACCOMPLIE: return 'event-not-done';
    default: return '';
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
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si l'utilisateur confirme, rediriger vers la page de login
        this.logout();
      }
    });
  }

  marchandiseurs: Merchendiseur[] = [

  ];

filterByMagasin(): void {
  if (!this.selectedMagasin) {
    this.dataSourceMagasins.data = this.allMagasins;
  } else {
    this.dataSourceMagasins.data = this.allMagasins.filter(
      magasin => magasin.id === this.selectedMagasin
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
    this.calendarDate = new Date(year, this.selectedMonth , 1);

    const filtered = this.planifications.filter(p => {
      const date = new Date(p.datePlanification || p.dateVisite); // s'assurer d'avoir la bonne propriété
      return date.getMonth() === (this.selectedMonth - 1) && date.getFullYear() === year;
    });

    this.updateStatistics(filtered);
  }
}

  getMerchendiseurs(): void {
  
    this.merchendiseurService.getAllMerchendiseurs().subscribe({
    next: (merch) => {
          this.dataSource.data = merch;
          
      this.marchandiseurs = merch.map(m => ({
        ...m,
        nomComplet: `${m.nom} ${m.prenom}`,
        progress: this.calculateProgress(m),
        
        days: this.getWeeklyData(m) 
      }));
    },
    error: (err) => console.error('Erreur chargement merchandiseurs:', err)
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
  'PLANNING.FILTERS.DECEMBER'
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

 displayedColumnsusers: string[] = [ 'nom','status','region', 'role', ];
  toggleStatus(row: any): void {
    const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (row.type === 'SUPERVISEUR') {
      this.superviseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
      });
    } else if (row.type === 'MERCHANDISEUR_MONO' || row.type === 'MERCHANDISEUR_MULTI') {
      this.merchendiseurService.updateStatus(row.id, newStatus).subscribe(() => {
        row.status = newStatus;
      });
    }
  }
    stats: { [key: string]: number } = {};
allMagasins: Magasin[] = [];
isCurrentMonth(date: Date): boolean {
  return date.getMonth() === this.calendarDate.getMonth() &&
         date.getFullYear() === this.calendarDate.getFullYear();
}
isDateInCurrentMonth(date: Date): boolean {
  return (
    date.getMonth() === this.calendarDate.getMonth() &&
    date.getFullYear() === this.calendarDate.getFullYear()
  );
}


ngOnInit(): void {
 this.loadPlanifications()
  this.selectedMonth = new Date().getMonth() ;
  this.loadStatistics();
  this.magasinService.getAllMagasins().subscribe(data => {
    this.allMagasins = data;
    this.dataSourceMagasins.data = data;
    this.magasinsOptions = data.map(m => ({ 
      value: m.id, 
      label: m.nom 
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
  this.loadKpiData();

  const currentYear = new Date().getFullYear();
  this.years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  this.updateCalendarDate();
  
  this.superviseurService.getAll().subscribe(data => {
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
    this.superviseurService.getAll().subscribe(superviseurs => {
      const formattedSuperviseurs = superviseurs.map(s => ({ ...s, type: 'SUPERVISEUR' }));
      this.merchendiseurService.getAllMerchendiseurs().subscribe(merchandiseurs => {
        const formattedMerch = merchandiseurs.map(m => ({ ...m, type: 'MERCHENDISEUR' }));
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
    'Carrefour', 'Marjane', 'Aswak Assalam', 'Acima', 'Label\'Vie', 'BIM',
    'Atacadao', 'Carrefour Market', 'Metro', 'Super U', 'Uniprix', 'Hanouty',
    'Miniprix', 'Decathlon', 'IKEA', 'Electroplanet', 'Virgin Megastore', 'LC Waikiki'
  ];

  semaines = ['DASHBOARD.WEEK_CURRENT', 'DASHBOARD.WEEK_PREVIOUS', 'DASHBOARD.WEEK_NEXT'];
dashboardView: boolean = false;

merchandiseursOptions: any[] = []; 
private loadMerchandiseurs(): void {
  this.merchendiseurService.getAllMerchendiseurs().subscribe({
    next: (merch) => {
      this.marchandiseurs = merch.map(m => ({
        ...m,
        nomComplet: `${m.nom} ${m.prenom}`,
        progress: this.calculateProgress(m),
        days: this.getWeeklyData(m)
      }));

      this.merchandiseursOptions = merch.map(m => ({
        value: m.id, 
        label: `${m.nom} ${m.prenom}`
      }));
    },
    error: (err) => console.error('Erreur chargement merchandiseurs:', err)
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

  displayedColumnsMarchandiseurs: string[] = ['nomComplet', 'progress', 'status', 'dateIntegration'];
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
        this.dataSource.data.forEach(row => this.selection.select(row));
      }
    }

currentMonth = 'Juin'; 
currentYear = 2025;   

isOtherMonth(day: number, weekIndex: number, dayIndex: number): boolean {
  return (day < 7 && weekIndex > 3) || (day > 20 && weekIndex < 2);
}

dataSourceMagasins = new MatTableDataSource<Magasin>();

isSameDate(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

planifications: any[] = []; 
updateCalendarDate(): void {
  // Ici, selectedMonth doit être index JS 0-11
  this.calendarDate = new Date(this.selectedYear, this.selectedMonth , 1);
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
  this.totalEffectuees = filteredPlanifications.filter(p => p.statut === 'EFFECTUEE').length;
  this.totalRestantes = filteredPlanifications.filter(p =>
    p.statut === 'REPROGRAMMEE' || p.statut === 'EN_COURS'
  ).length;
}


calendarEvents: { [date: string]: Planification[] } = {};

loadStatistics(): void {
  this.planificationService.getAllPlanifications().subscribe(planifications => {
    this.planifications = planifications;
    this.prepareCalendarEvents();
 
    this.totalPlanifiees = planifications.length;
    this.totalEffectuees = planifications.filter(p => p.statut === 'EFFECTUEE').length;
    this.totalRestantes = planifications.filter(p => 
      p.statut === 'REPROGRAMMEE' || p.statut === 'EN_COURS'
    ).length;
    
    // Mettre à jour le graphique des planifications
    this.updatePlanificationsChart(planifications);
  });
}

// Méthodes pour les graphiques
loadUsersChartData(): void {
  this.userService.getUsers().subscribe(users => {
    const activeUsers = users.filter(user => user.status === 'ACTIVE').length;
    const inactiveUsers = users.filter(user => user.status === 'INACTIVE').length;
    
    this.usersChartData = {
      labels: ['Actifs', 'Inactifs'],
      datasets: [{
        data: [activeUsers, inactiveUsers],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 2
      }]
    };
  });
}

loadVisitsChartData(): void {
  this.visitService.getAllVisits().subscribe(visits => {
    // Grouper les visites par magasin
    const visitsByStore = new Map<string, { complete: number, incomplete: number }>();
    
    visits.forEach(visit => {
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
    const completeData = storeNames.map(store => visitsByStore.get(store)!.complete);
    const incompleteData = storeNames.map(store => visitsByStore.get(store)!.incomplete);
    
    this.visitsChartData = {
      labels: storeNames,
      datasets: [{
        label: 'Visites Complètes',
        data: completeData,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 1
      }, {
        label: 'Visites Incomplètes',
        data: incompleteData,
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
        borderWidth: 1
      }]
    };
    
    // Mettre à jour le graphique des visites
    this.updateVisitsChart();
  });
}

loadUsersIntegrationChartData(): void {
  // Charger tous les utilisateurs (superviseurs et merchandisers)
  forkJoin([
    this.superviseurService.getAll(),
    this.merchendiseurService.getAllMerchendiseurs()
  ]).subscribe(([superviseurs, merchandisers]) => {
    // Combiner tous les utilisateurs
    const allUsers = [
      ...superviseurs.map(s => ({ ...s, type: 'Superviseur' })),
      ...merchandisers.map(m => ({ ...m, type: 'Merchandiser' }))
    ];

    // Grouper par mois d'intégration
    const usersByMonth = new Map<string, number>();
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Initialiser tous les mois avec 0
    monthNames.forEach(month => {
      usersByMonth.set(month, 0);
    });

    allUsers.forEach(user => {
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
      datasets: [{
        label: 'Utilisateurs intégrés',
        data: data,
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 1
      }]
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
    'niveauStock'
  ];
  
  // Vérifier si tous les champs obligatoires sont remplis
  for (const field of requiredFields) {
    if (!visit[field] || visit[field] === '' || (field !== 'niveauStock' && visit[field] === 0)) {
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
  const planned = planifications.filter(p => p.statut === 'PLANIFIEE').length;
  const inProgress = planifications.filter(p => p.statut === 'EN_COURS').length;
  const completed = planifications.filter(p => p.statut === 'EFFECTUEE').length;
  const rescheduled = planifications.filter(p => p.statut === 'REPROGRAMMEE').length;
  const notCompleted = planifications.filter(p => p.statut === 'NON_ACCOMPLIE').length;
  
    this.translate.get([
      'DASHBOARD.PLANNED',
      'DASHBOARD.IN_PROGRESS', 
      'DASHBOARD.COMPLETED',
      'DASHBOARD.RESCHEDULED',
      'DASHBOARD.NOT_COMPLETED'
    ]).subscribe(translations => {
      this.planificationsChartData = {
        labels: [
          translations['DASHBOARD.PLANNED'],
          translations['DASHBOARD.IN_PROGRESS'],
          translations['DASHBOARD.COMPLETED'],
          translations['DASHBOARD.RESCHEDULED'],
          translations['DASHBOARD.NOT_COMPLETED']
        ],
        datasets: [{
          data: [planned, inProgress, completed, rescheduled, notCompleted],
          backgroundColor: ['#1f1f5e', '#ff9800', '#4caf50', '#beab71', '#f44336'],
          borderWidth: 2
        }]
      };
    });
  
  // Mettre à jour le graphique des planifications
  this.updatePlanificationsChartDisplay();
}



getCalendarDateCellContent(date: Date): string {
  const dateKey = date.toISOString().split('T')[0];
  const events = this.calendarEvents[dateKey] || [];
  
  return events.map(event => 
    `${event.magasin.nom} (${event.statut})`
  ).join('<br>');
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
  switch(statut) {
    case StatutVisite.EFFECTUEE: return 'status-done';
    case StatutVisite.EN_COURS: return 'status-in-progress';
    case StatutVisite.PLANIFIEE: return 'status-planned';
    case StatutVisite.REPROGRAMMEE: return 'status-rescheduled';
    case StatutVisite.NON_ACCOMPLIE: return 'status-not-done';
    default: return 'status-default';
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
  return this.planifications.some(p => 
    new Date(p.dateVisite).toISOString().split('T')[0] === dateKey
  );
}

hasEventsWithStatus(date: Date, status: StatutVisite): boolean {
  const dateKey = date.toISOString().split('T')[0];
  return this.planifications.some(p => 
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
  
  this.planifications.forEach(planif => {
    if (!planif?.dateVisite) return;
    
    const planifDate = new Date(planif.dateVisite);
    if (planifDate.getFullYear() === date.getFullYear() &&
        planifDate.getMonth() === date.getMonth() &&
        planifDate.getDate() === date.getDate()) {
      uniqueEvents.set(planif.id, planif);
    }
  });
  
  return Array.from(uniqueEvents.values());
}
prepareCalendarEvents(): void {
  this.calendarEvents = {};
  const uniquePlanifs = new Map<string, Planification>();
  
  this.planifications.forEach(planif => {
    uniquePlanifs.set(planif.id, planif);
  });
  
  uniquePlanifs.forEach(planif => {
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
loadPlanifications(): void {
}

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
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Progrès des Visites'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

private createPlanificationsChart(): void {
  const ctx = document.getElementById('planificationsChart') as HTMLCanvasElement;
  if (ctx && !this.planificationsChart) {
    this.translate.get('DASHBOARD.PLANNING_BY_STATUS').subscribe(title => {
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
                padding: 20
              }
            },
            title: {
              display: true,
              text: title
            }
          }
        }
      });
    });
  }
}

private createUsersIntegrationChart(): void {
  const ctx = document.getElementById('usersIntegrationChart') as HTMLCanvasElement;
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
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Intégration des Utilisateurs par Mois'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
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
    this.translate.get([
      'DASHBOARD.PLANNED',
      'DASHBOARD.IN_PROGRESS', 
      'DASHBOARD.COMPLETED',
      'DASHBOARD.RESCHEDULED',
      'DASHBOARD.NOT_COMPLETED'
    ]).subscribe(translations => {
      this.planificationsChartData.labels = [
        translations['DASHBOARD.PLANNED'],
        translations['DASHBOARD.IN_PROGRESS'],
        translations['DASHBOARD.COMPLETED'],
        translations['DASHBOARD.RESCHEDULED'],
        translations['DASHBOARD.NOT_COMPLETED']
      ];
      
      // Mettre à jour aussi les couleurs pour qu'elles correspondent au calendrier
      this.planificationsChartData.datasets[0].backgroundColor = ['#1f1f5e', '#ff9800', '#4caf50', '#beab71', '#f44336'];
      
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
  
  // Utiliser les filtres si définis, sinon charger toutes les données
  const kpiObservable = this.hasActiveFilters() ? 
    this.kpiService.getAllKpiDataWithFilters(this.kpiFilters) : 
    this.kpiService.getAllKpiData();
  
  kpiObservable.subscribe({
    next: (data) => {
      console.log('✅ Données KPI reçues:', data);
      
      this.kpiAssignmentData = data.assignmentTracking;
      this.kpiAppUsageData = data.appUsageStats;
      this.kpiReportData = data.reportCompletion;
      
      // Détecter si on utilise des données mock (basé sur la taille des données)
      this.kpiDataMode = (this.kpiAssignmentData.length <= 2 && this.kpiReportData.length <= 2) ? 'mock' : 'real';
      
      if (this.kpiDataMode === 'mock') {
        console.warn('⚠️ Mode données mock détecté - API backend non disponible');
      }
      
      // Logs de vérification
      console.log('📊 KPI 1 - Affectations:', {
        nombreMerchandisers: this.kpiAssignmentData.length,
        totalAssignations: this.getTotalCompletedAssignments(),
        premierMerchandiser: this.kpiAssignmentData[0]
      });
      
      console.log('📱 KPI 2 - Utilisation App:', {
        totalUsers: this.kpiAppUsageData?.totalUsers,
        activeUsers: this.kpiAppUsageData?.activeUsers,
        dailyActiveUsers: this.kpiAppUsageData?.dailyActiveUsers
      });
      
      console.log('📋 KPI 3 - Rapports:', {
        nombreMerchandisers: this.kpiReportData.length,
        totalRapports: this.getTotalCompletedReports(),
        tauxMoyen: this.getAverageCompletionRate()
      });
      
      // Créer les graphiques KPI après un délai pour s'assurer que les éléments DOM sont prêts
      setTimeout(() => {
        this.createKpiCharts();
      }, 500);
    },
    error: (error) => {
      console.error('❌ Erreur lors du chargement des KPIs:', error);
      // En cas d'erreur, passer en mode mock
      this.kpiDataMode = 'mock';
    }
  });
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
    status: ''
  };
  console.log('🗑️ Filtres KPI effacés');
  this.loadKpiData();
}

refreshKpiData(): void {
  console.log('🔄 Actualisation des données KPI...');
  this.kpiService.refreshKpiData().subscribe({
    next: (data) => {
      this.kpiAssignmentData = data.assignmentTracking;
      this.kpiAppUsageData = data.appUsageStats;
      this.kpiReportData = data.reportCompletion;
      setTimeout(() => this.createKpiCharts(), 500);
    }
  });
}

createKpiCharts(): void {
  this.createKpiAssignmentChart();
  this.createKpiUsageChart();
  this.createKpiReportChart();
}

private createKpiAssignmentChart(): void {
  const ctx = document.getElementById('kpiAssignmentChart') as HTMLCanvasElement;
  if (!ctx || this.kpiAssignmentData.length === 0) return;

  // Nettoyer le graphique existant
  if (this.kpiAssignmentChart) {
    this.kpiAssignmentChart.destroy();
  }

  // Préparer les données pour Chart.js - maintenant par statut
  const labels = this.kpiAssignmentData.map(item => item.merchandiserName);
  const data = this.kpiAssignmentData.map(item => item.totalAssignments);
  const colors = this.kpiAssignmentData.map(item => item.region); // Utilise la couleur stockée dans region

  this.kpiAssignmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Nombre de Planifications',
          data: data,
          backgroundColor: colors.map(color => color + '80'), // Ajouter transparence
          borderColor: colors,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Graphique horizontal
      plugins: {
        legend: {
          display: false // Pas besoin de légende pour un seul dataset
        },
        title: {
          display: true,
          text: 'Répartition des Planifications par Statut'
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        y: {
          ticks: {
            maxRotation: 0,
            minRotation: 0
          }
        }
      }
    }
  });
}

private createKpiUsageChart(): void {
  const ctx = document.getElementById('kpiUsageChart') as HTMLCanvasElement;
  if (!ctx || !this.kpiAppUsageData) return;

  this.kpiUsageChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Utilisateurs Actifs', 'Utilisateurs Inactifs'],
      datasets: [{
        data: [
          this.kpiAppUsageData.activeUsers, 
          this.kpiAppUsageData.totalUsers - this.kpiAppUsageData.activeUsers
        ],
        backgroundColor: ['#2196F3', '#E0E0E0'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Taux d\'Utilisation Globale'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

private createKpiReportChart(): void {
  const ctx = document.getElementById('kpiReportChart') as HTMLCanvasElement;
  if (!ctx || this.kpiReportData.length === 0) return;

  this.kpiReportChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.kpiReportData.map(item => item.merchandiserName),
      datasets: [{
        label: 'Taux de Completion (%)',
        data: this.kpiReportData.map(item => item.completionRate),
        backgroundColor: this.kpiReportData.map(item => 
          item.completionRate >= 90 ? '#4CAF50' : 
          item.completionRate >= 80 ? '#FF9800' : '#F44336'
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Finalisation des Rapports par Merchandiser'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Nettoyer les graphiques lors de la destruction du composant
ngOnDestroy(): void {
  if (this.visitsChart) {
    this.visitsChart.destroy();
  }
  if (this.planificationsChart) {
    this.planificationsChart.destroy();
  }
  if (this.usersIntegrationChart) {
    this.usersIntegrationChart.destroy();
  }
  
  // Nettoyer les graphiques KPI
  if (this.kpiAssignmentChart) {
    this.kpiAssignmentChart.destroy();
  }
  if (this.kpiUsageChart) {
    this.kpiUsageChart.destroy();
  }
  if (this.kpiReportChart) {
    this.kpiReportChart.destroy();
  }
}


}

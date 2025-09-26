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
import { Merchendiseur, MerchendiseurService } from '../../services/merchendiseur.service';
import { AddPlanificationComponent } from '../../dialogs/add-planification/add-planification.component';
import { Planification, PlanificationService, StatutVisite } from '../../services/planification.service';
import { Magasin, MagasinService } from '../../services/magasin.service';
import { Region } from '../../enum/Region';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take, forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Add this before initializing your map
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon-2x.png', // Utiliser la même image pour les deux
  shadowUrl: 'assets/marker-shadow.png'
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
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' }))
      ]),
      transition(':decrement', [
        style({ color: '#F44336', transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('countUp', [
      transition(':increment', [
        style({ color: '#4CAF50', transform: 'scale(1.1)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' }))
      ]),
      transition(':decrement', [
        style({ color: '#F44336', transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' }))
      ])
    ])
  ],
  imports: [
    CommonModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,TranslateModule,
    MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, FullCalendarModule,
    MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule,
    MatChipsModule, MatSlideToggleModule, MatMenuModule, MatListModule, MatIconModule,
    RouterModule, HttpClientModule,MatTooltipModule,MatPaginatorModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './planification.component.html',
  styleUrls: ['./planification.component.css', './stat-icons.css']
})
export class PlanificationComponent {
  currentLanguage = 'fr';
  nom: any;
  prenom: any;
  telephone: any;
  status: any;
  imagePath: string | undefined;
  avatarUrl: any;
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

  this.planificationService.getAllPlanifications().pipe(take(1)).subscribe({
    next: (planifs) => {
      // 1. Filtrage initial
      let filteredPlanifs = this.applyAllFilters(planifs);

      // 2. Calcul des statistiques
      this.calculateStatistics(filteredPlanifs, planifs);

      // 3. Mise à jour du calendrier
      this.updateCalendar(filteredPlanifs);

             // 4. Mise à jour de la carte si on est sur l'onglet map
       if (this.selectedTab === 'map' && this.map) {
         // Utiliser la logique de testShowMagasinsWithRealCoords par défaut
         this.testShowMagasinsWithRealCoords();
       }

      // 5. Navigation dans le calendrier si semaine sélectionnée
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
        panelClass: ['error-snackbar']
      });
    }
  });
}

 userMenuOpen = false;
 planningMenuOpen = false;
private applyAllFilters(planifs: Planification[]): Planification[] {
  let filtered = [...planifs];

  // Filtre par terme de recherche
  if (this.searchTerm && this.searchTerm.trim()) {
    const searchLower = this.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.magasin?.nom?.toLowerCase().includes(searchLower) ||
      p.merchandiser?.nom?.toLowerCase().includes(searchLower) ||
      p.commentaire?.toLowerCase().includes(searchLower) ||
      p.statut?.toLowerCase().includes(searchLower)
    );
  }

  if (this.selectedRegion) {
    filtered = filtered.filter(p => p.magasin?.region === this.selectedRegion);
  }

  if (this.selectedMagasin) {
    filtered = filtered.filter(p => p.magasin?.id === this.selectedMagasin);
  }

  if (this.selectedMerchandiseur) {
    filtered = filtered.filter(p => p.merchandiser?.id === this.selectedMerchandiseur);
  }

  if (this.selectedEnseigne) {
    filtered = filtered.filter(p => p.magasin?.enseigne === this.selectedEnseigne);
  }

  if (this.selectedMarque) {
    filtered = filtered.filter(p => 
      p.magasin?.marques?.some((m: string) => m.toLowerCase() === this.selectedMarque?.toLowerCase())
    );
  }

  if (this.selectedStatut) {
    filtered = filtered.filter(p => p.statut === this.selectedStatut);
  }

  if (this.selectedSemaine) {
    filtered = this.filterByWeek(filtered, this.selectedSemaine);
  }

  // Filtre par plage de dates personnalisée
  if (this.selectedDateRange.start && this.selectedDateRange.end) {
    filtered = filtered.filter(p => {
      const visitDate = new Date(p.dateVisite);
      return visitDate >= this.selectedDateRange.start! && visitDate <= this.selectedDateRange.end!;
    });
  }

  return filtered;
}



private updateCalendar(filteredPlanifs: Planification[]): void {
  this.currentEvents = filteredPlanifs.map(p => this.mapPlanificationToEvent(p));
  
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



filterByRegion(): void {
  this.applyFilters();
}

filterBySemaine(): void {
  this.applyFilters();
  this.applyTableFilters();
}

// Nouvelle méthode pour gérer la sélection de date de semaine
onWeekDateChange(): void {
  if (this.selectedWeekDate) {
    // Calculer la semaine à partir de la date sélectionnée
    const selectedDate = new Date(this.selectedWeekDate);
    const dayOfWeek = selectedDate.getDay();
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Déterminer si c'est la semaine actuelle, précédente ou prochaine
    const today = new Date();
    const currentWeekStart = new Date(today);
    const currentDayOfWeek = today.getDay();
    currentWeekStart.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    
    const diffInDays = Math.floor((monday.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
    
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
    this.applyFilters();
    this.applyTableFilters();
  } else {
    this.selectedSemaine = null;
    this.applyFilters();
    this.applyTableFilters();
  }
}

filterByEnseigne(): void {
  this.applyFilters();
  this.applyTableFilters();
}

filterByMagasin(): void {
  this.applyFilters();
  this.applyTableFilters();
}

filterMerchandiseurs(): void {
  this.applyFilters();
  this.applyTableFilters();
}

filterByMarque(): void {
  this.applyFilters();
  this.applyTableFilters();
}

filterByStatut(): void {
  this.applyFilters();
  this.applyTableFilters();
}

// Méthodes pour le filtre de date
onDateRangeChange(): void {
  this.applyFilters();
  this.applyTableFilters();
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
    monday.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Déterminer si c'est la semaine actuelle, précédente ou prochaine
    const today = new Date();
    const currentWeekStart = new Date(today);
    const currentDayOfWeek = today.getDay();
    currentWeekStart.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    
    const diffInDays = Math.floor((monday.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
    
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
    this.applyFilters();
    this.applyTableFilters();
  }
}

clearDateFilter(): void {
  this.selectedDateRange = { start: null, end: null };
  this.selectedSemaine = null;
  this.showDatePicker = false;
  this.applyFilters();
  this.applyTableFilters();
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
  monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const mondayStr = monday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  const sundayStr = sunday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  return `${mondayStr} - ${sundayStr}`;
}

private filterByWeek(planifs: Planification[], semaine: string): Planification[] {
  const now = new Date();

  // Si on a une date de semaine sélectionnée, l'utiliser
  if (this.selectedWeekDate) {
    const selectedDate = new Date(this.selectedWeekDate);
    const dayOfWeek = selectedDate.getDay();
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return planifs.filter(p => {
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

  return planifs.filter(p => {
    const date = new Date(p.dateVisite);
    return date >= targetStart && date <= targetEnd;
  });
}


// Méthode pour réinitialiser tous les filtres
resetFilters(): void {
  this.selectedRegion = null;
  this.selectedSemaine = null;
  this.selectedEnseigne = null;
  this.selectedMarque = null;
  this.selectedMagasin = null;
  this.selectedMerchandiseur = null;
  this.selectedStatut = null;
  this.selectedWeekDate = null;
  this.selectedDateRange = { start: null, end: null };
  this.showDatePicker = false;
  this.searchTerm = '';
  this.showAdvancedFilters = false;
  this.applyFilters();
  this.applyTableFilters();
}

// Méthode pour basculer l'affichage des filtres avancés
toggleAdvancedFilters(): void {
  this.showAdvancedFilters = !this.showAdvancedFilters;
}

// Méthode pour gérer la recherche
onSearchChange(): void {
  this.applyFilters();
  this.applyTableFilters();
}

// Méthode pour charger les options des filtres
loadFilterOptions(): void {
  forkJoin([
    this.merchService.getAllMerchendiseurs(),
    this.magasinService.getAllMagasins()
  ]).subscribe({
    next: ([merchs, mags]) => {
      this.marchandiseurs = merchs;
      this.magasins = mags;
      
      // Options pour le filtre des merchandiseurs
      this.merchandiseursOptions = [
        { value: null, label: 'Tous les merchandiseurs' },
        ...merchs.map(m => ({
          value: m.id,
          label: `${m.nom} ${m.prenom}`
        }))
      ];
      
      // Options pour le filtre des magasins (si besoin)
      // this.magasinsOptions = [...];
    },
    error: (err) => {
      console.error('Erreur lors du chargement des options de filtre:', err);
    }
  });
}
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  @ViewChild('calendar') calendarComponent: any;
 progressGlobal = 0;
progressParMerch: number | null = null;
  // Données pour les filtres
  regions = Object.entries(Region);
  enseignes = [
    'Carrefour', 'Marjane', 'Aswak Assalam', 'Acima', 'Label\'Vie', 'BIM',
    'Atacadao', 'Carrefour Market', 'Metro', 'Super U', 'Uniprix', 'Hanouty',
    'Miniprix', 'Decathlon', 'IKEA', 'Electroplanet', 'Virgin Megastore', 'LC Waikiki'
  ];
  marques = ['Richbond', 'Simmons', 'Révey', 'Atlas', 'Total Rayons'];
  semaines = ['Semaine actuelle', 'Semaine précédente', 'Semaine prochaine'];
  
  // Options pour le filtre de statut
  statutOptions = [
    { value: null, label: 'Tous les statuts' },
    { value: StatutVisite.PLANIFIEE, label: 'Planifiée' },
    { value: StatutVisite.EN_COURS, label: 'En cours' },
    { value: StatutVisite.EFFECTUEE, label: 'Effectuée' },
    { value: StatutVisite.REPROGRAMMEE, label: 'Reprogrammée' },
    { value: StatutVisite.NON_ACCOMPLIE, label: 'Non accomplie' }
  ];

  selectedRegion: string | null = null;
  selectedSemaine: string | null = null;
  selectedEnseigne: string | null = null;
  selectedMarque: string | null = null;
  selectedMagasin: number | null = null;
  selectedMerchandiseur: number | null = null;
  selectedStatut: StatutVisite | null = null;
  
  // Filtre par semaine avec calendrier
  selectedWeekDate: Date | null = null;
  today = new Date();
  
  // Filtres de date pour le calendrier de plage
  selectedDateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
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
  
  // Données pour le tableau
  allPlanifications: Planification[] = [];
  filteredPlanifications: Planification[] = [];
  displayedColumns: string[] = ['dateVisite', 'magasin', 'merchandiser', 'statut', 'dureeVisite', 'commentaire', 'actions'];

  // UI
  menuOpen = true;
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
      right: ''
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventContent: this.renderEventContent.bind(this),
    // dayCellDidMount: this.markWeekendsAsDisabled.bind(this),
    dayCellDidMount: this.highlightWeekends.bind(this)
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
    private dialog: MatDialog,
    private planificationService: PlanificationService,
    private merchService: MerchendiseurService,
    private magasinService: MagasinService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
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
    
         // Forcer le chargement des magasins après un délai pour s'assurer que tout est initialisé
     setTimeout(() => {
       console.log('🔄 Chargement forcé des magasins après initialisation...');
       this.loadMagasins();
       // Si on est sur l'onglet carte, utiliser la logique de testShowMagasinsWithRealCoords
       if (this.selectedTab === 'map' && this.map) {
         this.testShowMagasinsWithRealCoords();
       }
     }, 1000);
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
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
        : 'assets/default-avatar.png';
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
}


loadInitialData(): void {
  if (this.loadingPlanifications) return;
  this.loadingPlanifications = true;

  forkJoin([
    this.planificationService.getAllPlanifications().pipe(take(1)),
    this.merchService.getAllMerchendiseurs().pipe(take(1)),
    this.magasinService.getAllMagasins().pipe(take(1))
  ]).subscribe({
    next: ([planifs, merchs, mags]) => {
      this.marchandiseurs = merchs;
      this.magasins = mags;
      this.currentEvents = planifs.map(p => this.mapPlanificationToEvent(p));
      
      // Ajoutez ceci pour calculer les stats initiales
      this.calculateStatistics(planifs, planifs);
      
      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...this.currentEvents]
      };
      this.loadingPlanifications = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement initial:', err);
      this.loadingPlanifications = false;
      this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
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
      ? new Date(normalizedStart.getTime() + planif.dureeVisite * 60 * 60 * 1000)
      : new Date(normalizedStart.getTime() + 2 * 60 * 60 * 1000);

    return {
      id: planif.id?.toString(),
      title: `${planif.magasin?.nom || 'Magasin'} - ${planif.merchandiser?.nom || 'Merchandiseur'}`,
      start: normalizedStart,
      end: endDate,
      extendedProps: {
        magasin: planif.magasin,
        merchandiser: planif.merchandiser,
        commentaire: planif.commentaire,
        duree: planif.dureeVisite,
        statut: planif.statut,
        heureDebut: normalizedStart.toISOString(),
        heureFin: endDate.toISOString()
      },
      className: `status-${planif.statut?.toLowerCase() || 'planifiee'}`
    };
  }

renderEventContent(arg: any): any {
  const start = arg.event.start ? new Date(arg.event.start) : null;
  const end = arg.event.end ? new Date(arg.event.end) : null;
  const timeText = start
    ? start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const duration =
    start && end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)) : 2;

  const statut = arg.event.extendedProps['statut'] ?? 'NON_DEFINI';
  const magasin = arg.event.extendedProps['magasin'];
  const merch = arg.event.extendedProps['merchandiser'];

  const badgeColors: { [key: string]: string } = {
    PLANIFIEE: '#4e9af1',
    EN_COURS: '#ff9800',
    EFFECTUEE: '#4caf50',
    REPROGRAMMEE: '#ffca28',
    NON_ACCOMPLIE: '#f44336'
  };
  const badgeColor = badgeColors[statut.toUpperCase()] || 'gray';

  const magasinNom = magasin?.nom ?? `Magasin #${magasin?.id ?? '?'}`;
  const merchNom = merch?.nom ?? `Merchandiseur #${merch?.id ?? '?'}`;
  
  // Gestion de l'image du merchandiseur
  const merchImage = merch?.imagePath
    ? (merch.imagePath.startsWith('data:image') ? merch.imagePath : 'http://localhost:8080/uploads/' + merch.imagePath)
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
          color: #dc3545; 
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
       // Utiliser la logique de testShowMagasinsWithRealCoords après initialisation
       setTimeout(() => {
         if (this.map) {
           this.testShowMagasinsWithRealCoords();
         }
       }, 1000);
    }
  }


   private initMap(): void {
   
    if (this.map) {
      console.log('🗑️ Suppression de l\'ancienne carte');
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
      zoom: 6
    });
    
    console.log('✅ Carte Leaflet créée');
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    console.log('✅ Couche de tuiles ajoutée');
    
         // Attendre un peu avant de mettre à jour les marqueurs
    setTimeout(() => {
       console.log('🔄 Mise à jour des marqueurs après initialisation...');
       // Utiliser la logique de testShowMagasinsWithRealCoords par défaut
       this.testShowMagasinsWithRealCoords();
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
        allDay: arg.allDay
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
        merchandiser: props.merchandiser
      }
    };

    const dialogRef = this.dialog.open(AddPlanificationComponent, {
      width: '700px',
      data
    });

    dialogRef.afterClosed().subscribe(updatedPlanif => {
      if (updatedPlanif) {
        const index = this.currentEvents.findIndex(e => e.id === updatedPlanif.id);
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
      this.snackBar.open('Le déplacement vers le week-end est interdit', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
 onTabChange(tab: 'planification' | 'map' | 'table') {
    this.selectedTab = tab;
    if (tab === 'map') {
       console.log('🗺️ Changement vers l\'onglet carte...');
       
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
        if (!this.map || (this.map.getContainer() !== mapContainer)) {
           console.log('🔄 Réinitialisation de la carte...');
          if (this.map) {
            this.map.remove();
            this.map = null;
          }
          this.initMap();
        } else {
           console.log('🔄 Mise à jour de la carte existante...');
          this.map.invalidateSize();
           // Utiliser la logique de testShowMagasinsWithRealCoords par défaut
           this.testShowMagasinsWithRealCoords();
        }
       }, 500); // Augmenté le délai pour s'assurer que le DOM est prêt
    } else if (tab === 'table') {
      console.log('📊 Changement vers l\'onglet tableau...');
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
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
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

    dialogRef.afterClosed().subscribe(result => {
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
  
  console.log('=== DÉBOGAGE MAP ===');
  console.log('Magasins chargés:', this.magasins);
  console.log('Nombre de magasins:', this.magasins.length);
  
  // Supprimer tous les marqueurs existants de manière plus sûre
  this.map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      this.map!.removeLayer(layer);
    }
  });
  
  // Vérifier si on a des magasins à afficher
  if (this.magasins.length === 0) {
    console.log('⚠️ Aucun magasin à afficher');
    this.snackBar.open('Aucun magasin trouvé. Veuillez d\'abord ajouter des magasins.', 'Fermer', {
      duration: 3000,
      panelClass: ['warning-snackbar']
    });
    return;
  }
  
  let magasinsToShow = this.magasins;
  if (this.selectedMagasin) {
    magasinsToShow = this.magasins.filter(m => m.id === this.selectedMagasin);
  } else if (this.selectedMerchandiseur) {
    magasinsToShow = this.magasins.filter(m => m.merchandiseur && m.merchandiseur.id === this.selectedMerchandiseur);
  }
  
  console.log('Magasins à afficher:', magasinsToShow);
  
           // Coordonnées par défaut pour les principales villes du Maroc
    const defaultCoords: { [key: string]: [number, number] } = {
      'Casablanca': [33.5731, -7.5898],
      'Rabat': [34.0209, -6.8416],
      'Marrakech': [31.6295, -7.9811],
      'Fès': [34.0181, -5.0078],
      'Agadir': [30.4278, -9.5981],
      'Tanger': [35.7595, -5.8340],
      'Meknès': [33.8935, -5.5473],
      'Oujda': [34.6814, -1.9086],
      'Kénitra': [34.2610, -6.5802],
      'Tétouan': [35.5711, -5.3644],
      'Safi': [32.2988, -9.2377],
      'El Jadida': [33.2316, -8.5007],
      'Mohammedia': [33.6871, -7.3828],
      'Béni Mellal': [32.3373, -6.3498],
      'Nador': [35.1681, -2.9273],
      'Taza': [34.2139, -4.0088],
      'Settat': [33.0011, -7.6167],
      'Larache': [35.1933, -6.1557],
      'Khouribga': [32.8848, -6.9064],
      'Ouarzazate': [30.9333, -6.9000],
      'Essaouira': [31.5085, -9.7595],
      'Ifrane': [33.5731, -5.3650],
      'Chefchaouen': [35.1681, -5.2636],
      'Dakhla': [23.6847, -15.9579],
      'Laayoune': [27.1536, -13.2033]
    };
  
  let markersAdded = 0;
  
  magasinsToShow.forEach((magasin, index) => {
    console.log(`Magasin ${index + 1}:`, magasin);
    console.log(`- Nom: ${magasin.nom}`);
    console.log(`- Ville: ${magasin.ville}`);
    console.log(`- Latitude: ${magasin.latitude}`);
    console.log(`- Longitude: ${magasin.longitude}`);
    console.log(`- Localisation: ${magasin.localisation}`);
    
         let lat: number = 0, lng: number = 0;
     let hasCoords = false;
    
    // 1. Utiliser les coordonnées GPS si disponibles
    if (magasin.latitude && magasin.longitude) {
      lat = magasin.latitude;
      lng = magasin.longitude;
      hasCoords = true;
      console.log(`✅ Coordonnées GPS trouvées: ${lat}, ${lng}`);
    }
    // 2. Fallback: essayer de parser localisation si pas de coordonnées GPS
    else if (magasin.localisation && magasin.localisation.includes(',')) {
      const coords = magasin.localisation.split(',').map(Number);
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
         console.log(`📋 Villes disponibles:`, Object.keys(defaultCoords));
         
                   // Recherche insensible à la casse et plus flexible
          const villeKey = Object.keys(defaultCoords).find(key => {
            const normalizedKey = key.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a');
            const normalizedVille = magasin.ville.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a');
            
            console.log(`🔍 Comparaison: "${normalizedKey}" vs "${normalizedVille}"`);
            
            const match = normalizedKey === normalizedVille || 
                   normalizedKey.includes(normalizedVille) || 
                   normalizedVille.includes(normalizedKey);
            
            if (match) {
              console.log(`✅ Match trouvé: "${key}" correspond à "${magasin.ville}"`);
            }
            
            return match;
          });
          
          // Si pas de match avec la recherche flexible, essayer une correspondance exacte
          if (!villeKey) {
            const exactMatch = Object.keys(defaultCoords).find(key => 
              key.toLowerCase() === magasin.ville.toLowerCase()
            );
            if (exactMatch) {
              console.log(`✅ Correspondance exacte trouvée: "${exactMatch}"`);
              [lat, lng] = defaultCoords[exactMatch];
              hasCoords = true;
              console.log(`✅ Coordonnées par défaut pour ${magasin.ville} (correspondance exacte): ${lat}, ${lng}`);
            }
          }
         
         if (villeKey) {
           [lat, lng] = defaultCoords[villeKey];
           hasCoords = true;
           console.log(`✅ Coordonnées par défaut pour ${magasin.ville} (trouvé via ${villeKey}): ${lat}, ${lng}`);
         } else {
           console.log(`❌ Aucune coordonnée trouvée pour la ville: "${magasin.ville}"`);
           // Ajouter des coordonnées pour Essaouira
           if (magasin.ville.toLowerCase().includes('essaouira')) {
             lat = 31.5085;
             lng = -9.7595;
             hasCoords = true;
             console.log(`✅ Coordonnées ajoutées pour Essaouira: ${lat}, ${lng}`);
           }
         }
       }
         // 4. Fallback: coordonnées par défaut du Maroc (Casablanca)
     else {
       lat = 33.5731;
       lng = -7.5898;
       hasCoords = true;
       console.log(`⚠️ Coordonnées par défaut (Casablanca): ${lat}, ${lng}`);
     }
     
     // 5. Si toujours pas de coordonnées, utiliser Casablanca pour ce magasin
     if (!hasCoords) {
       lat = 33.5731;
       lng = -7.5898;
       hasCoords = true;
       console.log(`⚠️ Coordonnées de secours (Casablanca) pour ${magasin.nom}: ${lat}, ${lng}`);
     }
    
         if (hasCoords) {
               try {
          // Créer un marqueur simple sans icône personnalisée
          const marker = L.marker([lat, lng])
          .addTo(this.map!)
           .bindPopup(`
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
               ${(!magasin.latitude || !magasin.longitude) ? 
                 '<p style="margin: 5px 0; color: #ff9800; font-weight: bold;">⚠️ Coordonnées estimées</p>' : 
                 '<p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">✅ Coordonnées GPS précises</p>'
               }
             </div>
           `);
         
         markersAdded++;
         console.log(`✅ Marqueur ajouté pour ${magasin.nom} à [${lat}, ${lng}]`);
       } catch (error) {
         console.error(`❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`, error);
      }
    }
  });
  
  console.log(`Total marqueurs ajoutés: ${markersAdded}`);
  
  // Afficher un message si aucun magasin n'a de coordonnées GPS
  const magasinsWithCoords = magasinsToShow.filter(m => 
    (m.latitude && m.longitude) || 
    (m.localisation && m.localisation.includes(','))
  );
  
  if (magasinsToShow.length > 0 && magasinsWithCoords.length === 0) {
    this.snackBar.open(
      'Aucun magasin n\'a de coordonnées GPS précises. Des coordonnées estimées ont été utilisées. Utilisez la carte lors de la création/modification des magasins pour ajouter des coordonnées précises.',
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
          enseigne: magasin.enseigne
        });
      });
      
      this.magasins = magasins;
      this.magasinsOptions = magasins.map(magasin => ({
        value: magasin.id,
        label: `${magasin.nom} - ${magasin.ville}`
      }));
      
      console.log('Options des magasins:', this.magasinsOptions);
      
      // Vérifier si des magasins ont des coordonnées GPS
      const magasinsWithCoords = magasins.filter(m => m.latitude && m.longitude);
      const magasinsWithLocation = magasins.filter(m => m.localisation && m.localisation.includes(','));
      const magasinsWithVille = magasins.filter(m => m.ville);
      
      console.log(`📊 Statistiques des magasins:`);
      console.log(`- Avec coordonnées GPS: ${magasinsWithCoords.length}`);
      console.log(`- Avec localisation parsable: ${magasinsWithLocation.length}`);
      console.log(`- Avec ville: ${magasinsWithVille.length}`);
      console.log(`- Total: ${magasins.length}`);
      
             // Si on est sur l'onglet carte, forcer la mise à jour
       if (this.selectedTab === 'map') {
      if (this.map) {
           console.log('🗺️ Carte disponible, mise à jour des marqueurs...');
           // Utiliser la logique de testShowMagasinsWithRealCoords par défaut
           this.testShowMagasinsWithRealCoords();
         } else {
           console.log('⚠️ Carte non disponible, initialisation...');
           setTimeout(() => {
             this.initMap();
           }, 100);
         }
       }
      
      // Afficher un message informatif
      if (magasins.length > 0) {
        if (magasinsWithCoords.length === 0) {
          this.snackBar.open(
            `${magasins.length} magasin(s) trouvé(s). Aucun n'a de coordonnées GPS précises. Des coordonnées estimées seront utilisées.`,
            'Fermer',
            { duration: 5000, panelClass: ['info-snackbar'] }
          );
        } else {
          this.snackBar.open(
            `${magasins.length} magasin(s) chargé(s) avec succès ! ${magasinsWithCoords.length} avec coordonnées GPS précises.`,
            'Fermer',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        }
      }
    },
    error: (err) => {
      console.error('❌ Erreur lors du chargement des magasins', err);
      this.snackBar.open('Erreur lors du chargement des magasins', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
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
       // Charger les magasins et utiliser la logique de testShowMagasinsWithRealCoords
       this.loadMagasins();
       if (this.map) {
         this.testShowMagasinsWithRealCoords();
       }
     }, 100);
   }

  // Méthode pour forcer l'affichage de tous les magasins
  forceShowAllMagasins(): void {
    console.log('🔄 Affichage forcé de tous les magasins...');
    
    if (this.magasins.length === 0) {
      this.snackBar.open('Aucun magasin disponible. Veuillez d\'abord ajouter des magasins.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
         // Forcer la mise à jour des marqueurs
     if (this.map) {
       // Utiliser la logique de testShowMagasinsWithRealCoords par défaut
       this.testShowMagasinsWithRealCoords();
     } else {
       this.initMap();
     }
    
    this.snackBar.open(`${this.magasins.length} magasin(s) affiché(s) sur la carte !`, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Méthode pour afficher les magasins avec des coordonnées espacées
  showMagasinsWithSpacedCoords(): void {
    console.log('🔄 Affichage des magasins avec coordonnées espacées...');
    
    if (this.magasins.length === 0) {
      this.snackBar.open('Aucun magasin disponible.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
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
      const lat = baseLat + (index * spacing);
      const lng = baseLng + (index * spacing * 0.5);
      
             try {
         // Utiliser un marqueur simple sans icône personnalisée
         const marker = L.marker([lat, lng])
          .addTo(this.map!)
          .bindPopup(`
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
              <p style="margin: 5px 0; color: #ff9800; font-weight: bold;">📍 Position temporaire pour test</p>
            </div>
          `);
        
        console.log(`✅ Marqueur espacé ajouté pour ${magasin.nom} à [${lat}, ${lng}]`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`, error);
      }
    });
    
    // Centrer la carte sur les marqueurs
    if (this.magasins.length > 0) {
      const centerLat = baseLat + ((this.magasins.length - 1) * spacing / 2);
      const centerLng = baseLng + ((this.magasins.length - 1) * spacing * 0.5 / 2);
      this.map.setView([centerLat, centerLng], 8);
    }
    
    this.snackBar.open(`${this.magasins.length} magasin(s) affiché(s) avec coordonnées espacées !`, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Méthode de test pour afficher les magasins avec leurs vraies coordonnées
  testShowMagasinsWithRealCoords(): void {
    console.log('🧪 Test d\'affichage avec coordonnées réelles...');
    
    if (this.magasins.length === 0) {
      this.snackBar.open('Aucun magasin disponible.', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
    // S'assurer que la carte est initialisée
    if (!this.map) {
      console.log('🗺️ Carte non initialisée, initialisation...');
      this.initMap();
      setTimeout(() => {
        this.testShowMagasinsWithRealCoords();
      }, 500);
      return;
    }
    
    // Supprimer tous les marqueurs existants
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map!.removeLayer(layer);
      }
    });
    
    console.log(`🧪 Test avec ${this.magasins.length} magasins...`);
    
    this.magasins.forEach((magasin, index) => {
      console.log(`🧪 Magasin ${index + 1}: ${magasin.nom}`);
      console.log(`   - Ville: ${magasin.ville}`);
      console.log(`   - Latitude: ${magasin.latitude}`);
      console.log(`   - Longitude: ${magasin.longitude}`);
      console.log(`   - Localisation: ${magasin.localisation}`);
      
      // Utiliser les coordonnées réelles si disponibles, sinon utiliser des coordonnées par défaut
      let lat: number = 0, lng: number = 0;
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
          console.log(`   ✅ Coordonnées parsées depuis localisation: ${lat}, ${lng}`);
        } else {
          console.log(`   ❌ Impossible de parser les coordonnées depuis: "${magasin.localisation}"`);
        }
      }
      
      // Si les coordonnées n'ont pas encore été assignées, utiliser les coordonnées par défaut
      if (!coordsAssigned) {
        // Coordonnées par défaut pour les principales villes
        const defaultCoords: { [key: string]: [number, number] } = {
          'Casablanca': [33.5731, -7.5898],
          'Rabat': [34.0209, -6.8416],
          'Marrakech': [31.6295, -7.9811],
          'Fès': [34.0181, -5.0078],
          'Agadir': [30.4278, -9.5981],
          'Tanger': [35.7595, -5.8340],
          'Meknès': [33.8935, -5.5473],
          'Oujda': [34.6814, -1.9086],
          'Kénitra': [34.2610, -6.5802],
          'Tétouan': [35.5711, -5.3644],
          'Safi': [32.2988, -9.2377],
          'El Jadida': [33.2316, -8.5007],
          'Mohammedia': [33.6871, -7.3828],
          'Béni Mellal': [32.3373, -6.3498],
          'Nador': [35.1681, -2.9273],
          'Taza': [34.2139, -4.0088],
          'Settat': [33.0011, -7.6167],
          'Larache': [35.1933, -6.1557],
          'Khouribga': [32.8848, -6.9064],
          'Ouarzazate': [30.9333, -6.9000],
          'Essaouira': [31.5085, -9.7595],
          'Berkane': [34.9167, -2.3167],
          'Assa': [28.6167, -9.4333],
          'Al Hoceïma': [35.2500, -3.9333],
          'Témara': [33.9333, -6.9167],
          'Skhirate': [33.8500, -7.0333],
          'Aïn Harrouda': [33.6333, -7.4500],
          'Bouskoura': [33.4500, -7.6500],
          'Fquih Ben Salah': [32.5000, -6.7000],
          'Sidi Slimane': [34.2667, -5.9333],
          'Sidi Kacem': [34.2167, -5.7000],
          'Youssoufia': [32.2500, -8.5333],
          'Tan-Tan': [28.4333, -11.1000],
          'Sidi Ifni': [29.3833, -10.1833],
          'Guelmim': [28.9833, -10.0667],
          'Errachidia': [31.9333, -4.4167],
          'Midelt': [32.6833, -4.7333],
          'Azrou': [33.4333, -5.2167],
          'Ifrane': [33.5731, -5.3650],
          'Chefchaouen': [35.1681, -5.2636],
          'Dakhla': [23.6847, -15.9579],
          'Laayoune': [27.1536, -13.2033]
        };
        
        const villeKey = Object.keys(defaultCoords).find(key => 
          key.toLowerCase() === magasin.ville?.toLowerCase()
        );
        
        if (villeKey) {
          [lat, lng] = defaultCoords[villeKey];
          console.log(`   📍 Coordonnées par défaut pour ${magasin.ville}: ${lat}, ${lng}`);
        } else {
          // Si la ville n'est pas trouvée, utiliser des coordonnées espacées
          lat = 31.7917 + (index * 0.3);
          lng = -7.0926 + (index * 0.3);
          console.log(`   ⚠️ Coordonnées espacées pour ${magasin.ville}: ${lat}, ${lng}`);
        }
      }
      
      try {
        // Utiliser un marqueur simple sans icône personnalisée
        const marker = L.marker([lat, lng])
         .addTo(this.map!)
         .bindPopup(`
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
             ${(magasin.latitude && magasin.longitude) ? 
               '<p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">✅ Coordonnées GPS précises</p>' : 
               '<p style="margin: 5px 0; color: #ff9800; font-weight: bold;">⚠️ Coordonnées estimées</p>'
             }
           </div>
         `);
       
       console.log(`✅ Marqueur ajouté pour ${magasin.nom} à [${lat}, ${lng}]`);
     } catch (error) {
       console.error(`❌ Erreur lors de l'ajout du marqueur pour ${magasin.nom}:`, error);
     }
   });
    
    this.snackBar.open(`${this.magasins.length} magasin(s) affiché(s) avec coordonnées réelles !`, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
  });
}
  private calculateStatistics(filteredPlanifs: Planification[], allPlanifs: Planification[]): void {
    this.totalVisites = filteredPlanifs.length;
    this.totalMagasins = new Set(filteredPlanifs.map(p => p.magasin?.id)).size;
    this.totalMerch = new Set(filteredPlanifs.map(p => p.merchandiser?.id)).size;

    // Progression globale sur la période affichée (tous les statuts)
    let planifsSemaine = allPlanifs;
    if (this.selectedSemaine) {
      planifsSemaine = this.filterByWeek(allPlanifs, this.selectedSemaine);
    } else {
      planifsSemaine = this.filterByWeek(allPlanifs, 'Semaine actuelle');
    }
    const total = planifsSemaine.length;
    const score = planifsSemaine.reduce((acc, p) => acc + this.getScoreByStatut(p.statut), 0);
    this.progressGlobal = total > 0 ? Math.round((score / total) * 100) : 0;

    // Progression par merchandiser si filtre actif
    if (this.selectedMerchandiseur) {
      const planifsMerch = planifsSemaine.filter(p => p.merchandiser?.id === this.selectedMerchandiseur);
      const totalMerch = planifsMerch.length;
      const scoreMerch = planifsMerch.reduce((acc, p) => acc + this.getScoreByStatut(p.statut), 0);
      this.progressParMerch = totalMerch > 0 ? Math.round((scoreMerch / totalMerch) * 100) : 0;
    } else {
      this.progressParMerch = null;
    }

    // Différence de visites
    let referenceWeekPlanifs: Planification[] = [];
    if (this.selectedSemaine === 'Semaine actuelle' || !this.selectedSemaine) {
      referenceWeekPlanifs = this.filterByWeek(allPlanifs, 'Semaine précédente');
    } else {
      referenceWeekPlanifs = this.filterByWeek(allPlanifs, 'Semaine actuelle');
    }
    this.differenceVisites = this.totalVisites - referenceWeekPlanifs.length;
  }

  private getScoreByStatut(statut: StatutVisite): number {
  switch (statut) {
    case StatutVisite.EFFECTUEE:
      return 1;        // 100%
    case StatutVisite.EN_COURS:
      return 0.5;      // 50%
    case StatutVisite.PLANIFIEE:
      return 0.2;      // 20% (exemple, adapte selon ton besoin)
    case StatutVisite.REPROGRAMMEE:
      return 0.1;      // 10% (exemple, adapte selon ton besoin)
    case StatutVisite.NON_ACCOMPLIE:
      return 0;        // 0%
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
      this.snackBar.open('Erreur lors du chargement des planifications', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

applyTableFilters(): void {
  let filtered = [...this.allPlanifications];

  // Filtre par terme de recherche
  if (this.searchTerm && this.searchTerm.trim()) {
    const searchLower = this.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.magasin?.nom?.toLowerCase().includes(searchLower) ||
      p.merchandiser?.nom?.toLowerCase().includes(searchLower) ||
      p.commentaire?.toLowerCase().includes(searchLower) ||
      p.statut?.toLowerCase().includes(searchLower)
    );
  }

  // Appliquer les filtres
  if (this.selectedSemaine) {
    filtered = this.filterByWeek(filtered, this.selectedSemaine);
  }
  if (this.selectedMagasin) {
    filtered = filtered.filter(p => p.magasin?.id === this.selectedMagasin);
  }
  if (this.selectedMerchandiseur) {
    filtered = filtered.filter(p => p.merchandiser?.id === this.selectedMerchandiseur);
  }
  if (this.selectedStatut) {
    filtered = filtered.filter(p => p.statut === this.selectedStatut);
  }
  
  // Filtre par plage de dates personnalisée
  if (this.selectedDateRange.start && this.selectedDateRange.end) {
    filtered = filtered.filter(p => {
      const visitDate = new Date(p.dateVisite);
      return visitDate >= this.selectedDateRange.start! && visitDate <= this.selectedDateRange.end!;
    });
  }

  this.filteredPlanifications = filtered;
  
  // Mettre à jour le dataSource pour la pagination
  this.dataSource.data = filtered;
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
      dureeVisite: planification.dureeVisite
    }
  };

  const dialogRef = this.dialog.open(AddPlanificationComponent, {
    width: '700px',
    data
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadPlanificationsForTable();
      this.loadInitialData(); // Recharger aussi le calendrier
    }
  });
}

deletePlanificationFromTable(planification: Planification): void {
  if (confirm('Voulez-vous vraiment supprimer cette planification ?')) {
    this.planificationService.deletePlanification(planification.id!).subscribe({
      next: () => {
        this.snackBar.open('Planification supprimée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadPlanificationsForTable();
        this.loadInitialData(); // Recharger aussi le calendrier
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
}}
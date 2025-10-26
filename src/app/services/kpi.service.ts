import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of, forkJoin, map, combineLatest, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PlanificationService, Planification, StatutVisite } from './planification.service';
import { environment } from '../../environments/environment';
import { MerchendiseurService, Merchendiseur } from './merchendiseur.service';
import { environment } from '../../environments/environment';
import { VisitService, VisitDTO } from './visit.service';
import { environment } from '../../environments/environment';
import { UserService, User } from './user.service';
import { environment } from '../../environments/environment';
import { SuperveseurService, Superviseur } from './superveseur.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Region } from '../enum/Region';
import { environment } from '../../environments/environment';

export interface MerchandiserAssignmentTracking {
  merchandiserId: number;
  merchandiserName: string;
  region: string;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  inProgressAssignments: number;
  completionRate: number;
  averageCompletionTime: string;
  lastActivityDate: string;
}

export interface AppUsageStats {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  averageSessionDuration: string;
  mostUsedFeatures: Array<{
    feature: string;
    usageCount: number;
    percentage: number;
  }>;
  loginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface ReportCompletionStats {
  merchandiserId: number;
  merchandiserName: string;
  region: string;
  totalReports: number;
  completedReports: number;
  incompleteReports: number;
  completionRate: number;
  averageReportTime: string;
  reportsByStatus: {
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
  reportsByMonth: Array<{
    month: string;
    completed: number;
    total: number;
  }>;
}

export interface KPIData {
  assignmentTracking: MerchandiserAssignmentTracking[];
  appUsageStats: AppUsageStats;
  reportCompletion: ReportCompletionStats[];
}

export interface KPIFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  region?: string;
  merchandiserId?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  
  private apiUrl = 'http://68.183.71.119:8080/api/api';
  
  // Cache pour optimiser les performances
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private planificationService: PlanificationService,
    private merchendiseurService: MerchendiseurService,
    private visitService: VisitService,
    private userService: UserService,
    private superviseurService: SuperveseurService,
    private authService: AuthService
  ) { }

  // MÃ©thode utilitaire pour le cache
  private getCachedData<T>(key: string, ttl: number = this.CACHE_TTL): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`ðŸ’¾ Cache hit pour ${key}`);
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`ðŸ’¾ Cache mis Ã  jour pour ${key}`);
  }

  private clearCache(): void {
    this.cache.clear();
    console.log('ðŸ—‘ï¸ Cache vidÃ©');
  }

  // âœ… KPI 1: Suivi des Affectations par Merchandiser (OPTIMISÃ‰ AVEC CACHE)
  getAssignmentTracking(): Observable<MerchandiserAssignmentTracking[]> {
    const cacheKey = 'assignmentTracking';
    const cached = this.getCachedData<MerchandiserAssignmentTracking[]>(cacheKey);
    
    if (cached) {
      return of(cached);
    }
    
    console.log('ðŸ”„ RÃ©cupÃ©ration des donnÃ©es pour KPI 1...');
    
    return forkJoin({
      planifications: this.getCachedPlanifications(),
      merchandisers: this.getCachedMerchandisers()
    }).pipe(
      map(({ planifications, merchandisers }) => {
        console.log('ðŸ“Š DonnÃ©es sources KPI 1:', {
          planifications: planifications.length,
          merchandisers: merchandisers.length
        });
        
        const result = this.calculateAssignmentTracking(planifications, merchandisers);
        this.setCachedData(cacheKey, result);
        console.log('âœ… Calcul KPI 1 terminÃ©:', result);
        return result;
      })
    );
  }

  // MÃ©thodes de cache pour les donnÃ©es sources avec gestion d'erreur
  private getCachedPlanifications(): Observable<Planification[]> {
    const cached = this.getCachedData<Planification[]>('planifications', 10 * 60 * 1000); // 10 minutes
    if (cached) return of(cached);
    
    return this.planificationService.getAllPlanifications().pipe(
      tap(data => this.setCachedData('planifications', data, 10 * 60 * 1000)),
      catchError(error => {
        console.warn('âš ï¸ Erreur API planifications, utilisation des donnÃ©es mock:', error);
        const mockData = this.getMockPlanifications();
        this.setCachedData('planifications', mockData, 10 * 60 * 1000);
        return of(mockData);
      })
    );
  }

  private getCachedMerchandisers(): Observable<Merchendiseur[]> {
    const cached = this.getCachedData<Merchendiseur[]>('merchandisers', 30 * 60 * 1000); // 30 minutes
    if (cached) return of(cached);
    
    return this.merchendiseurService.getAllMerchendiseurs().pipe(
      tap(data => this.setCachedData('merchandisers', data, 30 * 60 * 1000)),
      catchError(error => {
        console.warn('âš ï¸ Erreur API merchandisers, utilisation des donnÃ©es mock:', error);
        const mockData = this.getMockMerchandisers();
        this.setCachedData('merchandisers', mockData, 30 * 60 * 1000);
        return of(mockData);
      })
    );
  }

  private getCachedVisits(): Observable<VisitDTO[]> {
    const cached = this.getCachedData<VisitDTO[]>('visits', 5 * 60 * 1000); // 5 minutes
    if (cached) return of(cached);
    
    return this.visitService.getAllVisits().pipe(
      tap(data => this.setCachedData('visits', data, 5 * 60 * 1000)),
      catchError(error => {
        console.warn('âš ï¸ Erreur API visits, utilisation des donnÃ©es mock:', error);
        const mockData = this.getMockVisits();
        this.setCachedData('visits', mockData, 5 * 60 * 1000);
        return of(mockData);
      })
    );
  }

  private getCachedUsers(): Observable<User[]> {
    const cached = this.getCachedData<User[]>('users', 30 * 60 * 1000); // 30 minutes
    if (cached) return of(cached);
    
    return this.userService.getUsers().pipe(
      tap(data => this.setCachedData('users', data, 30 * 60 * 1000)),
      catchError(error => {
        console.warn('âš ï¸ Erreur API users, utilisation des donnÃ©es mock:', error);
        const mockData = this.getMockUsers();
        this.setCachedData('users', mockData, 30 * 60 * 1000);
        return of(mockData);
      })
    );
  }

  private calculateAssignmentTracking(planifications: Planification[], merchandisers: Merchendiseur[]): MerchandiserAssignmentTracking[] {
    const merchandiserStats = new Map<number, {
      total: number;
      completed: number;
      pending: number;
      inProgress: number;
      lastActivity: string;
    }>();

    // Calculer les statistiques par merchandiser
    planifications.forEach(planification => {
      const merchId = planification.merchandiser.id;
      
      if (!merchandiserStats.has(merchId)) {
        merchandiserStats.set(merchId, {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          lastActivity: planification.dateVisite
        });
      }

      const stats = merchandiserStats.get(merchId)!;
      stats.total++;

      switch (planification.statut) {
        case StatutVisite.EFFECTUEE:
          stats.completed++;
          break;
        case StatutVisite.PLANIFIEE:
        case StatutVisite.REPROGRAMMEE:
          stats.pending++;
          break;
        case StatutVisite.EN_COURS:
          stats.inProgress++;
          break;
      }

      // Mettre Ã  jour la derniÃ¨re activitÃ©
      if (new Date(planification.dateVisite) > new Date(stats.lastActivity)) {
        stats.lastActivity = planification.dateVisite;
      }
    });

    // Calculer les statistiques par statut de planification au lieu de par merchandiser
    const statusStats = new Map<string, {
      count: number;
      label: string;
      color: string;
    }>();

    // Initialiser les statuts avec les libellÃ©s franÃ§ais
    statusStats.set('PLANIFIEE', { count: 0, label: 'PlanifiÃ©', color: '#3498db' });
    statusStats.set('EN_COURS', { count: 0, label: 'En cours', color: '#f39c12' });
    statusStats.set('EFFECTUEE', { count: 0, label: 'TerminÃ©', color: '#27ae60' });
    statusStats.set('REPLANIFIEE', { count: 0, label: 'ReplanifiÃ©', color: '#9b59b6' });
    statusStats.set('NON_ACCOMPLIE', { count: 0, label: 'Non rÃ©alisÃ©', color: '#e74c3c' });

    // Compter les planifications par statut
    planifications.forEach(planification => {
      const statut = planification.statut.toString();
      const stats = statusStats.get(statut);
      if (stats) {
        stats.count++;
      }
    });

    // Convertir en array de rÃ©sultats pour l'affichage
    const result: MerchandiserAssignmentTracking[] = [];
    statusStats.forEach((stats, statusKey) => {
      result.push({
        merchandiserId: this.getStatusId(statusKey),
        merchandiserName: stats.label,
        region: stats.color,
        totalAssignments: stats.count,
        completedAssignments: statusKey === 'EFFECTUEE' ? stats.count : 0,
        pendingAssignments: ['PLANIFIEE', 'EN_COURS', 'REPLANIFIEE'].includes(statusKey) ? stats.count : 0,
        inProgressAssignments: statusKey === 'EN_COURS' ? stats.count : 0,
        completionRate: statusKey === 'EFFECTUEE' ? 100 : 0,
        averageCompletionTime: this.calculateAverageCompletionTime(statusKey === 'EFFECTUEE' ? stats.count : 0),
        lastActivityDate: this.getLastActivityDate(planifications, this.getStatusId(statusKey))
      });
    });

    // Trier par ordre logique : En cours, PlanifiÃ©, TerminÃ©, ReplanifiÃ©, Non rÃ©alisÃ©
    const order = ['EN_COURS', 'PLANIFIEE', 'EFFECTUEE', 'REPLANIFIEE', 'NON_ACCOMPLIE'];
    return result.sort((a, b) => {
      const aOrder = order.indexOf(this.getStatusKeyById(a.merchandiserId));
      const bOrder = order.indexOf(this.getStatusKeyById(b.merchandiserId));
      return aOrder - bOrder;
    });
  }

  private getStatusId(statusKey: string): number {
    const statusMap: { [key: string]: number } = {
      'PLANIFIEE': 1,
      'EN_COURS': 2,
      'EFFECTUEE': 3,
      'REPLANIFIEE': 4,
      'NON_ACCOMPLIE': 5
    };
    return statusMap[statusKey] || 0;
  }

  private getStatusKeyById(id: number): string {
    const idMap: { [key: number]: string } = {
      1: 'PLANIFIEE',
      2: 'EN_COURS',
      3: 'EFFECTUEE',
      4: 'REPLANIFIEE',
      5: 'NON_ACCOMPLIE'
    };
    return idMap[id] || '';
  }

  private getLastActivityDate(planifications: Planification[], statusId: number): string {
    const statusKey = this.getStatusKeyById(statusId);
    const relevantPlanifications = planifications.filter(p => p.statut.toString() === statusKey);
    
    if (relevantPlanifications.length === 0) {
      return new Date().toISOString().split('T')[0];
    }
    
    const latestDate = relevantPlanifications.reduce((latest, current) => {
      return new Date(current.dateVisite) > new Date(latest) ? current.dateVisite : latest;
    }, relevantPlanifications[0].dateVisite);
    
    return latestDate.split('T')[0];
  }

  private calculateAverageCompletionTime(completedCount: number): string {
    // Simulation d'un temps moyen basÃ© sur le nombre de tÃ¢ches complÃ©tÃ©es
    const baseTime = 2.5; // 2h30 de base
    const variation = Math.min(completedCount * 0.1, 1); // Variation jusqu'Ã  1h
    const totalMinutes = Math.round((baseTime + variation) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  // âœ… KPI 2: Taux d'Utilisation Globale (OPTIMISÃ‰ AVEC CACHE)
  getAppUsageStats(): Observable<AppUsageStats> {
    const cacheKey = 'appUsageStats';
    const cached = this.getCachedData<AppUsageStats>(cacheKey);
    
    if (cached) {
      return of(cached);
    }
    
    return forkJoin({
      users: this.getCachedUsers(),
      superviseurs: this.getCachedSuperviseurs(),
      merchandisers: this.getCachedMerchandisers(),
      planifications: this.getCachedPlanifications(),
      visits: this.getCachedVisits()
    }).pipe(
      map(({ users, superviseurs, merchandisers, planifications, visits }) => {
        const result = this.calculateAppUsageStats(users, superviseurs, merchandisers, planifications, visits);
        this.setCachedData(cacheKey, result);
        return result;
      })
    );
  }

  private getCachedSuperviseurs(): Observable<Superviseur[]> {
    const cached = this.getCachedData<Superviseur[]>('superviseurs', 30 * 60 * 1000); // 30 minutes
    if (cached) return of(cached);
    
    return this.superviseurService.getAll().pipe(
      tap(data => this.setCachedData('superviseurs', data, 30 * 60 * 1000)),
      catchError(error => {
        console.warn('âš ï¸ Erreur API superviseurs, utilisation des donnÃ©es mock:', error);
        const mockData = this.getMockSuperviseurs();
        this.setCachedData('superviseurs', mockData, 30 * 60 * 1000);
        return of(mockData);
      })
    );
  }

  private calculateAppUsageStats(users: User[], superviseurs: Superviseur[], merchandisers: Merchendiseur[], planifications: Planification[], visits: VisitDTO[]): AppUsageStats {
    const totalUsers = users.length + superviseurs.length + merchandisers.length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length + 
                       superviseurs.filter(s => s.status === 'ACTIVE').length + 
                       merchandisers.filter(m => m.status === 'ACTIVE').length;

    // Calculer les fonctionnalitÃ©s les plus utilisÃ©es
    const featureUsage = this.calculateFeatureUsage(planifications, visits);
    
    // Calculer les statistiques de connexion (simulation basÃ©e sur l'activitÃ©)
    const loginStats = this.calculateLoginStats(planifications, visits);

    return {
      totalUsers,
      activeUsers,
      dailyActiveUsers: Math.floor(activeUsers * 0.7), // 70% des actifs sont actifs quotidiennement
      weeklyActiveUsers: Math.floor(activeUsers * 0.9), // 90% des actifs sont actifs hebdomadairement
      averageSessionDuration: this.calculateAverageSessionDuration(visits),
      mostUsedFeatures: featureUsage,
      loginStats
    };
  }

  private calculateFeatureUsage(planifications: Planification[], visits: VisitDTO[]): Array<{feature: string, usageCount: number, percentage: number}> {
    const features = [
      { name: "Planification", count: planifications.length },
      { name: "Visites", count: visits.length },
      { name: "Rapports", count: visits.filter(v => v.images && v.images.length > 0).length },
      { name: "Gestion Stock", count: visits.filter(v => v.niveauStock !== undefined).length }
    ];

    const totalUsage = features.reduce((sum, feature) => sum + feature.count, 0);

    return features.map(feature => ({
      feature: feature.name,
      usageCount: feature.count,
      percentage: totalUsage > 0 ? Math.round((feature.count / totalUsage) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.usageCount - a.usageCount);
  }

  private calculateLoginStats(planifications: Planification[], visits: VisitDTO[]): {today: number, thisWeek: number, thisMonth: number} {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Estimation basÃ©e sur l'activitÃ© rÃ©cente
    const recentActivity = [
      ...planifications.map(p => ({ date: p.dateVisite })),
      ...visits.map(v => ({ date: v.heureArrivee }))
    ].filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekAgo;
    }).length;

    return {
      today: Math.floor(recentActivity * 0.2), // 20% de l'activitÃ© rÃ©cente
      thisWeek: Math.floor(recentActivity * 0.6), // 60% de l'activitÃ© rÃ©cente
      thisMonth: Math.floor(recentActivity * 1.2) // 120% de l'activitÃ© rÃ©cente
    };
  }

  private calculateAverageSessionDuration(visits: VisitDTO[]): string {
    if (visits.length === 0) return "0m";

    const totalMinutes = visits.reduce((sum, visit) => {
      const start = new Date(visit.heureArrivee);
      const end = new Date(visit.heureDepart);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // en minutes
      return sum + (duration > 0 ? duration : 30); // minimum 30 minutes
    }, 0);

    const avgMinutes = Math.round(totalMinutes / visits.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  // âœ… KPI 3: Finalisation des Rapports par Merchandiser (OPTIMISÃ‰ AVEC CACHE)
  getReportCompletionStats(): Observable<ReportCompletionStats[]> {
    const cacheKey = 'reportCompletionStats';
    const cached = this.getCachedData<ReportCompletionStats[]>(cacheKey);
    
    if (cached) {
      return of(cached);
    }
    
    return forkJoin({
      visits: this.getCachedVisits(),
      merchandisers: this.getCachedMerchandisers(),
      planifications: this.getCachedPlanifications()
    }).pipe(
      map(({ visits, merchandisers, planifications }) => {
        const result = this.calculateReportCompletionStats(visits, merchandisers, planifications);
        this.setCachedData(cacheKey, result);
        return result;
      })
    );
  }

  private calculateReportCompletionStats(visits: VisitDTO[], merchandisers: Merchendiseur[], planifications: Planification[]): ReportCompletionStats[] {
    const merchandiserStats = new Map<number, {
      totalReports: number;
      completedReports: number;
      incompleteReports: number;
      reportsByStatus: { completed: number; inProgress: number; pending: number; overdue: number };
      reportsByMonth: Array<{month: string; completed: number; total: number}>;
      totalReportTime: number;
      reportCount: number;
    }>();

    // Calculer les statistiques par merchandiser basÃ©es sur les visites
    visits.forEach(visit => {
      if (!visit.planning?.merchandiser?.id) return;
      
      const merchId = visit.planning.merchandiser.id;
      
      if (!merchandiserStats.has(merchId)) {
        merchandiserStats.set(merchId, {
          totalReports: 0,
          completedReports: 0,
          incompleteReports: 0,
          reportsByStatus: { completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          reportsByMonth: this.initializeMonthlyStats(),
          totalReportTime: 0,
          reportCount: 0
        });
      }

      const stats = merchandiserStats.get(merchId)!;
      stats.totalReports++;

      // DÃ©terminer si le rapport est complet
      const isComplete = this.isVisitComplete(visit);
      if (isComplete) {
        stats.completedReports++;
        stats.reportsByStatus.completed++;
        
        // Calculer le temps de rapport
        const reportTime = this.calculateReportTime(visit);
        stats.totalReportTime += reportTime;
        stats.reportCount++;
      } else {
        stats.incompleteReports++;
        
        // DÃ©terminer le statut selon la date
        const visitDate = new Date(visit.heureArrivee);
        const today = new Date();
        const daysDiff = (today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 7) {
          stats.reportsByStatus.overdue++;
        } else if (daysDiff > 3) {
          stats.reportsByStatus.inProgress++;
        } else {
          stats.reportsByStatus.pending++;
        }
      }

      // Mettre Ã  jour les statistiques mensuelles
      this.updateMonthlyStats(stats.reportsByMonth, visit, isComplete);
    });

    // Convertir en format ReportCompletionStats
    return merchandisers.filter(merchandiser => merchandiser.id !== undefined).map(merchandiser => {
      const stats = merchandiserStats.get(merchandiser.id!) || {
        totalReports: 0,
        completedReports: 0,
        incompleteReports: 0,
        reportsByStatus: { completed: 0, inProgress: 0, pending: 0, overdue: 0 },
        reportsByMonth: this.initializeMonthlyStats(),
        totalReportTime: 0,
        reportCount: 0
      };

      const completionRate = stats.totalReports > 0 ? (stats.completedReports / stats.totalReports) * 100 : 0;
      const averageReportTime = stats.reportCount > 0 ? 
        this.formatReportTime(stats.totalReportTime / stats.reportCount) : "0m";

      return {
        merchandiserId: merchandiser.id!,
        merchandiserName: `${merchandiser.nom} ${merchandiser.prenom}`,
        region: merchandiser.region || 'Non spÃ©cifiÃ©e',
        totalReports: stats.totalReports,
        completedReports: stats.completedReports,
        incompleteReports: stats.incompleteReports,
        completionRate: Math.round(completionRate * 10) / 10,
        averageReportTime,
        reportsByStatus: stats.reportsByStatus,
        reportsByMonth: stats.reportsByMonth
      };
    });
  }

  private isVisitComplete(visit: VisitDTO): boolean {
    // VÃ©rifier les champs obligatoires pour considÃ©rer un rapport comme complet
    const hasRequiredFields = visit.heureArrivee && 
                             visit.heureDepart && 
                             visit.nombreFacings !== undefined && 
                             visit.nombreFacingsTotal !== undefined && 
                             visit.prixNormal !== undefined && 
                             visit.niveauStock !== undefined;
    
    if (!hasRequiredFields) {
      return false;
    }
    
    // VÃ©rifier si au moins une image a Ã©tÃ© prise
    if (!visit.images || visit.images.length === 0) {
      return false;
    }
    
    return true;
  }

  private calculateReportTime(visit: VisitDTO): number {
    const start = new Date(visit.heureArrivee);
    const end = new Date(visit.heureDepart);
    return (end.getTime() - start.getTime()) / (1000 * 60); // en minutes
  }

  private formatReportTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  private initializeMonthlyStats(): Array<{month: string; completed: number; total: number}> {
    const months = ['Oct 2023', 'Nov 2023', 'DÃ©c 2023', 'Jan 2024'];
    return months.map(month => ({ month, completed: 0, total: 0 }));
  }

  private updateMonthlyStats(monthlyStats: Array<{month: string; completed: number; total: number}>, visit: VisitDTO, isComplete: boolean) {
    const visitDate = new Date(visit.heureArrivee);
    const monthNames = ['Jan', 'FÃ©v', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'AoÃ»', 'Sep', 'Oct', 'Nov', 'DÃ©c'];
    const monthKey = `${monthNames[visitDate.getMonth()]} ${visitDate.getFullYear()}`;
    
    const monthStat = monthlyStats.find(m => m.month === monthKey);
    if (monthStat) {
      monthStat.total++;
      if (isComplete) {
        monthStat.completed++;
      }
    }
  }

  // âœ… MÃ©thode principale pour rÃ©cupÃ©rer toutes les donnÃ©es KPI depuis le backend
  getAllKpiData(): Observable<KPIData> {
    const cacheKey = 'allKpiData';
    const cached = this.getCachedData<KPIData>(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    // Essayer d'abord l'API backend
    return this.http.get<KPIData>(`${this.apiUrl}/kpis`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es KPI reÃ§ues du backend:', data);
        this.setCachedData(cacheKey, data);
      }),
      catchError(error => {
        console.warn('âš ï¸ API KPI backend non disponible, calcul local...', error);
        // Fallback sur le calcul local
        return forkJoin({
          assignmentTracking: this.getAssignmentTracking(),
          appUsageStats: this.getAppUsageStats(),
          reportCompletion: this.getReportCompletionStats()
        }).pipe(
          map(({ assignmentTracking, appUsageStats, reportCompletion }) => {
            const result = {
              assignmentTracking,
              appUsageStats,
              reportCompletion
            };
            this.setCachedData(cacheKey, result);
            return result;
          })
        );
      })
    );
  }

  // âœ… MÃ©thode pour rÃ©cupÃ©rer les KPIs avec filtres depuis le backend
  getAllKpiDataWithFilters(filters: KPIFilters = {}): Observable<KPIData> {
    const cacheKey = `kpiData_${JSON.stringify(filters)}`;
    const cached = this.getCachedData<KPIData>(cacheKey, 2 * 60 * 1000);
    
    if (cached) {
      return of(cached);
    }

    // Construire les paramÃ¨tres de requÃªte
    const params = new URLSearchParams();
    if (filters.dateRange?.startDate) {
      params.append('startDate', filters.dateRange.startDate);
    }
    if (filters.dateRange?.endDate) {
      params.append('endDate', filters.dateRange.endDate);
    }
    if (filters.region) {
      params.append('region', filters.region);
    }
    if (filters.merchandiserId) {
      params.append('merchandiserId', filters.merchandiserId.toString());
    }
    if (filters.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/kpis?${queryString}` : `${this.apiUrl}/kpis`;

    return this.http.get<KPIData>(url).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es KPI filtrÃ©es reÃ§ues du backend:', data);
        this.setCachedData(cacheKey, data, 2 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ API KPI backend avec filtres non disponible, calcul local...', error);
        // Fallback sur le calcul local avec filtres
        return forkJoin({
          assignmentTracking: this.getAssignmentTrackingWithFilters(filters),
          appUsageStats: this.getAppUsageStatsWithFilters(filters),
          reportCompletion: this.getReportCompletionStatsWithFilters(filters)
        }).pipe(
          map(({ assignmentTracking, appUsageStats, reportCompletion }) => {
            const result = {
              assignmentTracking,
              appUsageStats,
              reportCompletion
            };
            this.setCachedData(cacheKey, result, 2 * 60 * 1000);
            return result;
          })
        );
      })
    );
  }

  // MÃ©thode pour rafraÃ®chir les donnÃ©es KPI (vide le cache)
  refreshKpiData(): Observable<KPIData> {
    console.log('ðŸ”„ RafraÃ®chissement des donnÃ©es KPI...');
    this.clearCache();
    return this.getAllKpiData();
  }

  // âœ… MÃ©thodes avec filtres temporels
  // getAllKpiDataWithFilters(filters: KPIFilters = {}): Observable<KPIData> {
  //   const cacheKey = `kpiData_${JSON.stringify(filters)}`;
  //   const cached = this.getCachedData<KPIData>(cacheKey, 2 * 60 * 1000); // 2 minutes pour les filtres
    
  //   if (cached) {
  //     return of(cached);
  //   }

  //   return forkJoin({
  //     assignmentTracking: this.getAssignmentTrackingWithFilters(filters),
  //     appUsageStats: this.getAppUsageStatsWithFilters(filters),
  //     reportCompletion: this.getReportCompletionStatsWithFilters(filters)
  //   }).pipe(
  //     map(({ assignmentTracking, appUsageStats, reportCompletion }) => {
  //       const result = {
  //         assignmentTracking,
  //         appUsageStats,
  //         reportCompletion
  //       };
  //       this.setCachedData(cacheKey, result, 2 * 60 * 1000);
  //       return result;
  //     })
  //   );
  // }

  private getAssignmentTrackingWithFilters(filters: KPIFilters): Observable<MerchandiserAssignmentTracking[]> {
    return forkJoin({
      planifications: this.getCachedPlanifications(),
      merchandisers: this.getCachedMerchandisers()
    }).pipe(
      map(({ planifications, merchandisers }) => {
        // Appliquer les filtres
        let filteredPlanifications = this.applyDateFilter(planifications, filters.dateRange);
        filteredPlanifications = this.applyRegionFilterToPlanifications(filteredPlanifications, filters.region);
        filteredPlanifications = this.applyMerchandiserFilterToPlanifications(filteredPlanifications, filters.merchandiserId);
        filteredPlanifications = this.applyStatusFilterToPlanifications(filteredPlanifications, filters.status);

        return this.calculateAssignmentTracking(filteredPlanifications, merchandisers);
      })
    );
  }

  private getAppUsageStatsWithFilters(filters: KPIFilters): Observable<AppUsageStats> {
    return forkJoin({
      users: this.getCachedUsers(),
      superviseurs: this.getCachedSuperviseurs(),
      merchandisers: this.getCachedMerchandisers(),
      planifications: this.getCachedPlanifications(),
      visits: this.getCachedVisits()
    }).pipe(
      map(({ users, superviseurs, merchandisers, planifications, visits }) => {
        // Appliquer les filtres temporels
        let filteredPlanifications = this.applyDateFilter(planifications, filters.dateRange);
        let filteredVisits = this.applyDateFilter(visits, filters.dateRange);
        
        // Filtrer par rÃ©gion si spÃ©cifiÃ©e
        if (filters.region) {
          filteredPlanifications = this.applyRegionFilterToPlanifications(filteredPlanifications, filters.region);
          filteredVisits = this.applyRegionFilterToVisits(filteredVisits, filters.region);
        }

        return this.calculateAppUsageStats(users, superviseurs, merchandisers, filteredPlanifications, filteredVisits);
      })
    );
  }

  private getReportCompletionStatsWithFilters(filters: KPIFilters): Observable<ReportCompletionStats[]> {
    return forkJoin({
      visits: this.getCachedVisits(),
      merchandisers: this.getCachedMerchandisers(),
      planifications: this.getCachedPlanifications()
    }).pipe(
      map(({ visits, merchandisers, planifications }) => {
        // Appliquer les filtres
        let filteredVisits = this.applyDateFilter(visits, filters.dateRange);
        filteredVisits = this.applyRegionFilterToVisits(filteredVisits, filters.region);
        filteredVisits = this.applyMerchandiserFilterToVisits(filteredVisits, filters.merchandiserId);

        return this.calculateReportCompletionStats(filteredVisits, merchandisers, planifications);
      })
    );
  }

  // âœ… MÃ©thodes de filtrage spÃ©cialisÃ©es
  private applyDateFilter<T extends { dateVisite?: string; heureArrivee?: string }>(items: T[], dateRange?: { startDate: string; endDate: string }): T[] {
    if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return items;
    
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date('1900-01-01');
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999); // Fin de journÃ©e
    
    return items.filter(item => {
      const itemDate = new Date(item.dateVisite || item.heureArrivee || '');
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  private applyRegionFilterToPlanifications(planifications: Planification[], region?: string): Planification[] {
    if (!region) return planifications;
    
    return planifications.filter(planification => {
      return planification.magasin?.region === region;
    });
  }

  private applyRegionFilterToVisits(visits: VisitDTO[], region?: string): VisitDTO[] {
    if (!region) return visits;
    
    return visits.filter(visit => {
      return visit.planning?.magasin?.region === region;
    });
  }

  private applyMerchandiserFilterToPlanifications(planifications: Planification[], merchandiserId?: number): Planification[] {
    if (!merchandiserId) return planifications;
    
    return planifications.filter(planification => {
      return planification.merchandiser?.id === merchandiserId;
    });
  }

  private applyMerchandiserFilterToVisits(visits: VisitDTO[], merchandiserId?: number): VisitDTO[] {
    if (!merchandiserId) return visits;
    
    return visits.filter(visit => {
      return visit.planning?.merchandiser?.id === merchandiserId;
    });
  }

  private applyStatusFilterToPlanifications(planifications: Planification[], status?: string): Planification[] {
    if (!status) return planifications;
    
    return planifications.filter(planification => planification.statut === status);
  }

  // âœ… MÃ©thodes mock simplifiÃ©es pour fallback quand l'API n'est pas disponible
  private getMockPlanifications(): Planification[] {
    return [];
  }

  private getMockMerchandisers(): Merchendiseur[] {
    return [];
  }

  private getMockVisits(): VisitDTO[] {
    return [];
  }

  private getMockUsers(): User[] {
    return [];
  }

  private getMockSuperviseurs(): Superviseur[] {
    return [];
  }

  // MÃ©thodes publiques pour les filtres par rÃ©gion (maintenues pour compatibilitÃ©)
  getAssignmentTrackingByRegion(region: string): Observable<MerchandiserAssignmentTracking[]> {
    return this.getAllKpiDataWithFilters({ region }).pipe(
      map(data => data.assignmentTracking)
    );
  }

  getReportCompletionByRegion(region: string): Observable<ReportCompletionStats[]> {
    return this.getAllKpiDataWithFilters({ region }).pipe(
      map(data => data.reportCompletion)
    );
  }

  // âœ… MÃ©thodes pour rÃ©cupÃ©rer les donnÃ©es rÃ©elles depuis le backend
  getRealMagasinsData(): Observable<any[]> {
    const cacheKey = 'realMagasinsData';
    const cached = this.getCachedData<any[]>(cacheKey, 10 * 60 * 1000); // 10 minutes
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<any[]>(`${this.apiUrl}/magasins`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es magasins rÃ©elles reÃ§ues:', data);
        this.setCachedData(cacheKey, data, 10 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ Erreur rÃ©cupÃ©ration magasins:', error);
        return of([]);
      })
    );
  }

  getRealPlanificationsData(): Observable<Planification[]> {
    const cacheKey = 'realPlanificationsData';
    const cached = this.getCachedData<Planification[]>(cacheKey, 5 * 60 * 1000); // 5 minutes
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<Planification[]>(`${this.apiUrl}/planifications`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es planifications rÃ©elles reÃ§ues:', data);
        this.setCachedData(cacheKey, data, 5 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ Erreur rÃ©cupÃ©ration planifications:', error);
        return of([]);
      })
    );
  }

  getRealVisitsData(): Observable<VisitDTO[]> {
    const cacheKey = 'realVisitsData';
    const cached = this.getCachedData<VisitDTO[]>(cacheKey, 5 * 60 * 1000); // 5 minutes
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<VisitDTO[]>(`${this.apiUrl}/visits`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es visites rÃ©elles reÃ§ues:', data);
        this.setCachedData(cacheKey, data, 5 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ Erreur rÃ©cupÃ©ration visites:', error);
        return of([]);
      })
    );
  }

  getRealMerchandisersData(): Observable<Merchendiseur[]> {
    const cacheKey = 'realMerchandisersData';
    const cached = this.getCachedData<Merchendiseur[]>(cacheKey, 30 * 60 * 1000); // 30 minutes
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/merchendiseurs`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es merchandisers rÃ©elles reÃ§ues:', data);
        this.setCachedData(cacheKey, data, 30 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ Erreur rÃ©cupÃ©ration merchandisers:', error);
        return of([]);
      })
    );
  }

  getRealUsersData(): Observable<User[]> {
    const cacheKey = 'realUsersData';
    const cached = this.getCachedData<User[]>(cacheKey, 30 * 60 * 1000); // 30 minutes
    
    if (cached) {
      return of(cached);
    }

    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(data => {
        console.log('âœ… DonnÃ©es utilisateurs rÃ©elles reÃ§ues:', data);
        this.setCachedData(cacheKey, data, 30 * 60 * 1000);
      }),
      catchError(error => {
        console.warn('âš ï¸ Erreur rÃ©cupÃ©ration utilisateurs:', error);
        return of([]);
      })
    );
  }

  // âœ… MÃ©thode pour calculer les KPIs avec des donnÃ©es rÃ©elles
  calculateRealKpis(): Observable<KPIData> {
    console.log('ðŸ”„ Calcul des KPIs avec donnÃ©es rÃ©elles...');
    
    return forkJoin({
      planifications: this.getRealPlanificationsData(),
      visits: this.getRealVisitsData(),
      merchandisers: this.getRealMerchandisersData(),
      users: this.getRealUsersData()
    }).pipe(
      map(({ planifications, visits, merchandisers, users }) => {
        console.log('ðŸ“Š DonnÃ©es rÃ©elles reÃ§ues:', {
          planifications: planifications.length,
          visits: visits.length,
          merchandisers: merchandisers.length,
          users: users.length
        });

        // Calculer les KPIs avec les vraies donnÃ©es
        const assignmentTracking = this.calculateAssignmentTracking(planifications, merchandisers);
        const appUsageStats = this.calculateAppUsageStats(users, [], merchandisers, planifications, visits);
        const reportCompletion = this.calculateReportCompletionStats(visits, merchandisers, planifications);

        return {
          assignmentTracking,
          appUsageStats,
          reportCompletion
        };
      })
    );
  }
}




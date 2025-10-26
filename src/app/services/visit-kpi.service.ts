import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { VisitService, VisitDTO } from './visit.service';
import { environment } from '../../environments/environment';
import { PlanificationService, Planification } from './planification.service';
import { environment } from '../../environments/environment';

// Interface pour les KPIs des visites
export interface VisitKpiData {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  completionRate: number;
  averageFacingCount: number;
  totalFacingCount: number;
  priceAccuracyRate: number;
  stockAccuracyRate: number;
  visitsByEnseigne: { [enseigne: string]: number };
  visitsByMarque: { [marque: string]: number };
  visitsByMerchandiser: VisitMerchandiserKpi[];
  visitsByRegion: { [region: string]: number };
  visitsByStatus: { [status: string]: number };
  averageVisitDuration: number;
  mostVisitedStores: StoreVisitStats[];
  recentVisits: RecentVisitStats[];
}

export interface VisitMerchandiserKpi {
  merchandiserId: number;
  merchandiserName: string;
  region: string;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  completionRate: number;
  averageFacingCount: number;
  priceAccuracyRate: number;
  stockAccuracyRate: number;
  averageVisitDuration: number;
  lastVisitDate: string;
  visitsThisWeek: number;
  visitsThisMonth: number;
}

export interface StoreVisitStats {
  storeId: number;
  storeName: string;
  enseigne: string;
  region: string;
  totalVisits: number;
  completedVisits: number;
  completionRate: number;
  averageFacingCount: number;
  lastVisitDate: string;
}

export interface RecentVisitStats {
  visitId: number;
  storeName: string;
  merchandiserName: string;
  visitDate: string;
  status: string;
  facingCount: number;
  priceAccuracy: number;
  stockLevel: number;
  duration: string;
}

export interface VisitKpiFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  enseigne?: string;
  marque?: string;
  region?: string;
  merchandiserId?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitKpiService {
  private apiUrl = `/api/visit-kpis`;

  constructor(
    private http: HttpClient,
    private visitService: VisitService,
    private planificationService: PlanificationService
  ) {}

  // RÃ©cupÃ©rer tous les KPIs des visites
  getAllVisitKpis(filters?: VisitKpiFilters): Observable<VisitKpiData> {
    const params = this.buildFilterParams(filters);
    return this.http.get<VisitKpiData>(`${this.apiUrl}`, { params });
  }

  // RÃ©cupÃ©rer les KPIs par merchandiser
  getVisitKpisByMerchandiser(merchandiserId: number, filters?: VisitKpiFilters): Observable<VisitMerchandiserKpi> {
    const params = this.buildFilterParams(filters);
    return this.http.get<VisitMerchandiserKpi>(`${this.apiUrl}/merchandiser/${merchandiserId}`, { params });
  }

  // RÃ©cupÃ©rer les KPIs par enseigne
  getVisitKpisByEnseigne(enseigne: string, filters?: VisitKpiFilters): Observable<VisitKpiData> {
    const params = this.buildFilterParams({ ...filters, enseigne });
    return this.http.get<VisitKpiData>(`${this.apiUrl}/enseigne/${enseigne}`, { params });
  }

  // RÃ©cupÃ©rer les KPIs par marque
  getVisitKpisByMarque(marque: string, filters?: VisitKpiFilters): Observable<VisitKpiData> {
    const params = this.buildFilterParams({ ...filters, marque });
    return this.http.get<VisitKpiData>(`${this.apiUrl}/marque/${marque}`, { params });
  }

  // RÃ©cupÃ©rer les KPIs par rÃ©gion
  getVisitKpisByRegion(region: string, filters?: VisitKpiFilters): Observable<VisitKpiData> {
    const params = this.buildFilterParams({ ...filters, region });
    return this.http.get<VisitKpiData>(`${this.apiUrl}/region/${region}`, { params });
  }

  // Calculer les KPIs localement (fallback si API non disponible)
  calculateVisitKpisLocally(filters?: VisitKpiFilters): Observable<VisitKpiData> {
    return forkJoin({
      visits: this.visitService.getAllVisits(),
      planifications: this.planificationService.getAllPlanifications()
    }).pipe(
      map(({ visits, planifications }) => this.processVisitData(visits, planifications, filters))
    );
  }

  // RÃ©cupÃ©rer les enseignes disponibles
  getAvailableEnseignes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/enseignes`);
  }

  // RÃ©cupÃ©rer les marques disponibles
  getAvailableMarques(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/marques`);
  }

  // RÃ©cupÃ©rer les rÃ©gions disponibles
  getAvailableRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/regions`);
  }

  // Exporter les KPIs en Excel
  exportVisitKpisToExcel(filters?: VisitKpiFilters): Observable<Blob> {
    const params = this.buildFilterParams(filters);
    return this.http.get(`${this.apiUrl}/export/excel`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Exporter les KPIs en PDF
  exportVisitKpisToPDF(filters?: VisitKpiFilters): Observable<Blob> {
    const params = this.buildFilterParams(filters);
    return this.http.get(`${this.apiUrl}/export/pdf`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Construire les paramÃ¨tres de filtre
  private buildFilterParams(filters?: VisitKpiFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.dateRange?.startDate) {
        params = params.set('startDate', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        params = params.set('endDate', filters.dateRange.endDate);
      }
      if (filters.enseigne) {
        params = params.set('enseigne', filters.enseigne);
      }
      if (filters.marque) {
        params = params.set('marque', filters.marque);
      }
      if (filters.region) {
        params = params.set('region', filters.region);
      }
      if (filters.merchandiserId) {
        params = params.set('merchandiserId', filters.merchandiserId.toString());
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
    }
    
    return params;
  }

  // Traiter les donnÃ©es des visites localement
  private processVisitData(visits: VisitDTO[], planifications: Planification[], filters?: VisitKpiFilters): VisitKpiData {
    // Appliquer les filtres
    let filteredVisits = this.applyFilters(visits, planifications, filters);
    let filteredPlanifications = this.applyPlanificationFilters(planifications, filters);

    // Calculer les mÃ©triques de base
    const totalVisits = filteredVisits.length;
    const completedVisits = filteredVisits.filter(v => this.isVisitComplete(v)).length;
    const pendingVisits = totalVisits - completedVisits;
    const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

    // Calculer les mÃ©triques de facing
    const facingData = this.calculateFacingMetrics(filteredVisits);
    
    // Calculer les mÃ©triques de prix et stock
    const priceStockData = this.calculatePriceStockMetrics(filteredVisits);

    // Calculer les mÃ©triques par enseigne
    const visitsByEnseigne = this.calculateVisitsByEnseigne(filteredVisits, filteredPlanifications);
    
    // Calculer les mÃ©triques par marque
    const visitsByMarque = this.calculateVisitsByMarque(filteredVisits, filteredPlanifications);

    // Calculer les mÃ©triques par merchandiser
    const visitsByMerchandiser = this.calculateVisitsByMerchandiser(filteredVisits, filteredPlanifications);

    // Calculer les mÃ©triques par rÃ©gion
    const visitsByRegion = this.calculateVisitsByRegion(filteredVisits, filteredPlanifications);

    // Calculer les mÃ©triques par statut
    const visitsByStatus = this.calculateVisitsByStatus(filteredVisits, filteredPlanifications);

    // Calculer la durÃ©e moyenne des visites
    const averageVisitDuration = this.calculateAverageVisitDuration(filteredVisits);

    // Calculer les magasins les plus visitÃ©s
    const mostVisitedStores = this.calculateMostVisitedStores(filteredVisits, filteredPlanifications);

    // Calculer les visites rÃ©centes
    const recentVisits = this.calculateRecentVisits(filteredVisits, filteredPlanifications);

    return {
      totalVisits,
      completedVisits,
      pendingVisits,
      completionRate: Math.round(completionRate * 10) / 10,
      averageFacingCount: facingData.average,
      totalFacingCount: facingData.total,
      priceAccuracyRate: priceStockData.priceAccuracy,
      stockAccuracyRate: priceStockData.stockAccuracy,
      visitsByEnseigne,
      visitsByMarque,
      visitsByMerchandiser,
      visitsByRegion,
      visitsByStatus,
      averageVisitDuration,
      mostVisitedStores,
      recentVisits
    };
  }

  // Appliquer les filtres aux visites
  private applyFilters(visits: VisitDTO[], planifications: Planification[], filters?: VisitKpiFilters): VisitDTO[] {
    if (!filters) return visits;

    return visits.filter(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (!planning) return false;

      // Filtre par date
      if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
        const visitDate = new Date(visit.heureArrivee);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (visitDate < startDate || visitDate > endDate) return false;
      }

      // Filtre par enseigne
      if (filters.enseigne && planning.magasin.enseigne !== filters.enseigne) {
        return false;
      }

      // Filtre par marque
      if (filters.marque && !this.visitHasMarque(visit, filters.marque)) {
        return false;
      }

      // Filtre par rÃ©gion
      if (filters.region && planning.magasin.region !== filters.region) {
        return false;
      }

      // Filtre par merchandiser
      if (filters.merchandiserId && planning.merchandiser.id !== filters.merchandiserId) {
        return false;
      }

      return true;
    });
  }

  // Appliquer les filtres aux planifications
  private applyPlanificationFilters(planifications: Planification[], filters?: VisitKpiFilters): Planification[] {
    if (!filters) return planifications;

    return planifications.filter(planning => {
      // Filtre par enseigne
      if (filters.enseigne && planning.magasin.enseigne !== filters.enseigne) {
        return false;
      }

      // Filtre par marque
      if (filters.marque && !this.planningHasMarque(planning, filters.marque)) {
        return false;
      }

      // Filtre par rÃ©gion
      if (filters.region && planning.magasin.region !== filters.region) {
        return false;
      }

      // Filtre par merchandiser
      if (filters.merchandiserId && planning.merchandiser.id !== filters.merchandiserId) {
        return false;
      }

      return true;
    });
  }

  // VÃ©rifier si une visite contient une marque spÃ©cifique
  private visitHasMarque(visit: VisitDTO, marque: string): boolean {
    return visit.produits.some(produit => 
      produit.categorie?.toLowerCase().includes(marque.toLowerCase()) ||
      produit.nom.toLowerCase().includes(marque.toLowerCase())
    );
  }

  // VÃ©rifier si une planification contient une marque spÃ©cifique
  private planningHasMarque(planning: Planification, marque: string): boolean {
    return planning.magasin.marques && 
           Object.keys(planning.magasin.marques).some(key => 
             key.toLowerCase().includes(marque.toLowerCase())
           );
  }

  // Calculer les mÃ©triques de facing
  private calculateFacingMetrics(visits: VisitDTO[]): { average: number; total: number } {
    const totalFacing = visits.reduce((sum, visit) => sum + visit.nombreFacings, 0);
    const averageFacing = visits.length > 0 ? totalFacing / visits.length : 0;
    
    return {
      average: Math.round(averageFacing * 10) / 10,
      total: totalFacing
    };
  }

  // Calculer les mÃ©triques de prix et stock
  private calculatePriceStockMetrics(visits: VisitDTO[]): { priceAccuracy: number; stockAccuracy: number } {
    let priceAccuracySum = 0;
    let stockAccuracySum = 0;
    let validVisits = 0;

    visits.forEach(visit => {
      if (visit.prixNormal > 0 && visit.prixPromotionnel >= 0) {
        // Calculer la prÃ©cision des prix (basÃ© sur la cohÃ©rence des donnÃ©es)
        const priceAccuracy = visit.prixPromotionnel > 0 ? 
          (visit.prixPromotionnel / visit.prixNormal) * 100 : 100;
        priceAccuracySum += Math.min(priceAccuracy, 100);
        validVisits++;
      }

      if (visit.niveauStock >= 0) {
        // Calculer la prÃ©cision du stock (basÃ© sur la cohÃ©rence des donnÃ©es)
        const stockAccuracy = visit.niveauStock > 0 ? 100 : 0;
        stockAccuracySum += stockAccuracy;
      }
    });

    return {
      priceAccuracy: validVisits > 0 ? Math.round((priceAccuracySum / validVisits) * 10) / 10 : 0,
      stockAccuracy: visits.length > 0 ? Math.round((stockAccuracySum / visits.length) * 10) / 10 : 0
    };
  }

  // Calculer les visites par enseigne
  private calculateVisitsByEnseigne(visits: VisitDTO[], planifications: Planification[]): { [enseigne: string]: number } {
    const enseigneCount: { [enseigne: string]: number } = {};
    
    visits.forEach(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (planning && planning.magasin.enseigne) {
        const enseigne = planning.magasin.enseigne;
        enseigneCount[enseigne] = (enseigneCount[enseigne] || 0) + 1;
      }
    });

    return enseigneCount;
  }

  // Calculer les visites par marque
  private calculateVisitsByMarque(visits: VisitDTO[], planifications: Planification[]): { [marque: string]: number } {
    const marqueCount: { [marque: string]: number } = {};
    
    visits.forEach(visit => {
      visit.produits.forEach(produit => {
        if (produit.categorie) {
          const marque = produit.categorie;
          marqueCount[marque] = (marqueCount[marque] || 0) + 1;
        }
      });
    });

    return marqueCount;
  }

  // Calculer les visites par merchandiser
  private calculateVisitsByMerchandiser(visits: VisitDTO[], planifications: Planification[]): VisitMerchandiserKpi[] {
    const merchandiserMap = new Map<number, VisitMerchandiserKpi>();

    visits.forEach(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (!planning) return;

      const merchandiserId = planning.merchandiser.id;
      const merchandiserName = `${planning.merchandiser.nom} ${planning.merchandiser.prenom || ''}`.trim();
      const region = planning.magasin.region || 'Non dÃ©finie';

      if (!merchandiserMap.has(merchandiserId)) {
        merchandiserMap.set(merchandiserId, {
          merchandiserId,
          merchandiserName,
          region,
          totalVisits: 0,
          completedVisits: 0,
          pendingVisits: 0,
          completionRate: 0,
          averageFacingCount: 0,
          priceAccuracyRate: 0,
          stockAccuracyRate: 0,
          averageVisitDuration: 0,
          lastVisitDate: '',
          visitsThisWeek: 0,
          visitsThisMonth: 0
        });
      }

      const kpi = merchandiserMap.get(merchandiserId)!;
      kpi.totalVisits++;
      
      if (this.isVisitComplete(visit)) {
        kpi.completedVisits++;
      } else {
        kpi.pendingVisits++;
      }

      kpi.averageFacingCount += visit.nombreFacings;
    });

    // Finaliser les calculs
    merchandiserMap.forEach(kpi => {
      kpi.completionRate = kpi.totalVisits > 0 ? 
        Math.round((kpi.completedVisits / kpi.totalVisits) * 100 * 10) / 10 : 0;
      kpi.averageFacingCount = kpi.totalVisits > 0 ? 
        Math.round((kpi.averageFacingCount / kpi.totalVisits) * 10) / 10 : 0;
    });

    return Array.from(merchandiserMap.values());
  }

  // Calculer les visites par rÃ©gion
  private calculateVisitsByRegion(visits: VisitDTO[], planifications: Planification[]): { [region: string]: number } {
    const regionCount: { [region: string]: number } = {};
    
    visits.forEach(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (planning && planning.magasin.region) {
        const region = planning.magasin.region;
        regionCount[region] = (regionCount[region] || 0) + 1;
      }
    });

    return regionCount;
  }

  // Calculer les visites par statut
  private calculateVisitsByStatus(visits: VisitDTO[], planifications: Planification[]): { [status: string]: number } {
    const statusCount: { [status: string]: number } = {};
    
    visits.forEach(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (planning) {
        const status = planning.statut;
        statusCount[status] = (statusCount[status] || 0) + 1;
      }
    });

    return statusCount;
  }

  // Calculer la durÃ©e moyenne des visites
  private calculateAverageVisitDuration(visits: VisitDTO[]): number {
    let totalDuration = 0;
    let validVisits = 0;

    visits.forEach(visit => {
      if (visit.heureArrivee && visit.heureDepart) {
        const start = new Date(visit.heureArrivee);
        const end = new Date(visit.heureDepart);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // en heures
        if (duration > 0) {
          totalDuration += duration;
          validVisits++;
        }
      }
    });

    return validVisits > 0 ? Math.round((totalDuration / validVisits) * 10) / 10 : 0;
  }

  // Calculer les magasins les plus visitÃ©s
  private calculateMostVisitedStores(visits: VisitDTO[], planifications: Planification[]): StoreVisitStats[] {
    const storeMap = new Map<number, StoreVisitStats>();

    visits.forEach(visit => {
      const planning = planifications.find(p => p.id === visit.planningId);
      if (!planning) return;

      const storeId = planning.magasin.id;
      const storeName = planning.magasin.nom;
      const enseigne = planning.magasin.enseigne || 'Non dÃ©finie';
      const region = planning.magasin.region || 'Non dÃ©finie';

      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, {
          storeId,
          storeName,
          enseigne,
          region,
          totalVisits: 0,
          completedVisits: 0,
          completionRate: 0,
          averageFacingCount: 0,
          lastVisitDate: ''
        });
      }

      const store = storeMap.get(storeId)!;
      store.totalVisits++;
      
      if (this.isVisitComplete(visit)) {
        store.completedVisits++;
      }

      store.averageFacingCount += visit.nombreFacings;
      
      // Mettre Ã  jour la derniÃ¨re visite
      const visitDate = new Date(visit.heureArrivee);
      if (!store.lastVisitDate || visitDate > new Date(store.lastVisitDate)) {
        store.lastVisitDate = visitDate.toISOString().split('T')[0];
      }
    });

    // Finaliser les calculs
    storeMap.forEach(store => {
      store.completionRate = store.totalVisits > 0 ? 
        Math.round((store.completedVisits / store.totalVisits) * 100 * 10) / 10 : 0;
      store.averageFacingCount = store.totalVisits > 0 ? 
        Math.round((store.averageFacingCount / store.totalVisits) * 10) / 10 : 0;
    });

    return Array.from(storeMap.values())
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, 10); // Top 10
  }

  // Calculer les visites rÃ©centes
  private calculateRecentVisits(visits: VisitDTO[], planifications: Planification[]): RecentVisitStats[] {
    return visits
      .map(visit => {
        const planning = planifications.find(p => p.id === visit.planningId);
        if (!planning) return null;

        const merchandiserName = `${planning.merchandiser.nom} ${planning.merchandiser.prenom || ''}`.trim();
        const visitDate = new Date(visit.heureArrivee);
        const duration = this.calculateVisitDuration(visit);

        return {
          visitId: visit.id || 0,
          storeName: planning.magasin.nom,
          merchandiserName,
          visitDate: visitDate.toISOString().split('T')[0],
          status: planning.statut,
          facingCount: visit.nombreFacings,
          priceAccuracy: visit.prixNormal > 0 ? 
            Math.round((visit.prixPromotionnel / visit.prixNormal) * 100 * 10) / 10 : 0,
          stockLevel: visit.niveauStock,
          duration: duration
        };
      })
      .filter(visit => visit !== null)
      .sort((a, b) => new Date(b!.visitDate).getTime() - new Date(a!.visitDate).getTime())
      .slice(0, 20) as RecentVisitStats[]; // 20 visites rÃ©centes
  }

  // Calculer la durÃ©e d'une visite
  private calculateVisitDuration(visit: VisitDTO): string {
    if (!visit.heureArrivee || !visit.heureDepart) return '0h 0m';
    
    const start = new Date(visit.heureArrivee);
    const end = new Date(visit.heureDepart);
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs <= 0) return '0h 0m';
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  // VÃ©rifier si une visite est complÃ¨te
  private isVisitComplete(visit: VisitDTO): boolean {
    return !!(
      visit.heureArrivee &&
      visit.heureDepart &&
      visit.nombreFacings > 0 &&
      visit.nombreFacingsTotal > 0 &&
      visit.prixNormal > 0 &&
      visit.niveauStock >= 0 &&
      visit.images && visit.images.length > 0 &&
      visit.produits && visit.produits.length > 0
    );
  }
}



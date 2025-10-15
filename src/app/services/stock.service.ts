import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces pour les DTOs
export interface StockMagasinDTO {
  id: number;
  produitId: number;
  magasinId: number;
  quantite: number;
  seuilMinimum: number;
  seuilMaximum: number;
  prixUnitaire: number;
  prixPromotionnel?: number;
  enPromotion: boolean;
  dateDerniereMiseAJour: string;
  produit?: {
    id: number;
    nom: string;
    marque: string;
    categorie: string;
  };
  magasin?: {
    id: number;
    nom: string;
    ville: string;
    region: string;
  };
}

export interface StockStatistiquesDTO {
  magasinId: number;
  totalProduits: number;
  totalStock: number;
  produitsEnRupture: number;
  produitsStocksBas: number;
  produitsEnPromotion: number;
  valeurStockTotal: number;
  valeurStockPromotion: number;
}

export interface ProduitStockInfoDTO {
  produitId: number;
  nomProduit: string;
  marque: string;
  categorie: string;
  totalStock: number;
  nombreMagasins: number;
  prixMoyen: number;
  prixMinimum: number;
  prixMaximum: number;
  enPromotion: boolean;
}

export interface HistoriqueStockDTO {
  id: number;
  produitId: number;
  magasinId: number;
  quantiteAvant: number;
  quantiteApres: number;
  typeOperation: string;
  dateOperation: string;
  visitId?: number;
  utilisateurId?: number;
  commentaire?: string;
  produit?: {
    id: number;
    nom: string;
    marque: string;
  };
  magasin?: {
    id: number;
    nom: string;
    ville: string;
  };
}

export interface RapportStockDTO {
  magasinId: number;
  periodeDebut: string;
  periodeFin: string;
  totalOperations: number;
  totalProduitsAffectes: number;
  operationsParType: { [key: string]: number };
  produitsLesPlusModifies: Array<{
    produitId: number;
    nomProduit: string;
    nombreModifications: number;
  }>;
  evolutionStock: Array<{
    date: string;
    stockTotal: number;
    produitsEnRupture: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = `${environment.apiUrl}/api/stocks`;
  private rapportApiUrl = `${environment.apiUrl}/api/rapports-stock`;

  constructor(private http: HttpClient) {}

  // ========== STOCKS ==========

  /**
   * Obtenir tous les stocks
   */
  getAllStocks(): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(this.apiUrl);
  }

  /**
   * Obtenir le stock d'un produit dans un magasin
   */
  getStockByProduitAndMagasin(produitId: number, magasinId: number): Observable<StockMagasinDTO> {
    return this.http.get<StockMagasinDTO>(`${this.apiUrl}/produit/${produitId}/magasin/${magasinId}`);
  }

  /**
   * Obtenir tous les stocks d'un magasin
   */
  getStocksByMagasin(magasinId: number): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/magasin/${magasinId}`);
  }

  /**
   * Obtenir tous les stocks d'un produit
   */
  getStocksByProduit(produitId: number): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/produit/${produitId}`);
  }

  /**
   * Obtenir les statistiques de stock d'un magasin
   */
  getStatistiquesByMagasin(magasinId: number): Observable<StockStatistiquesDTO> {
    return this.http.get<StockStatistiquesDTO>(`${this.apiUrl}/magasin/${magasinId}/statistiques`);
  }

  /**
   * Obtenir tous les stocks en rupture
   */
  getStocksEnRupture(): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/ruptures`);
  }

  /**
   * Obtenir tous les stocks bas
   */
  getStocksBas(): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/stocks-bas`);
  }

  /**
   * Obtenir les stocks en rupture d'un magasin
   */
  getStocksEnRuptureByMagasin(magasinId: number): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/magasin/${magasinId}/ruptures`);
  }

  /**
   * Obtenir les stocks bas d'un magasin
   */
  getStocksBasByMagasin(magasinId: number): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/magasin/${magasinId}/stocks-bas`);
  }

  /**
   * Obtenir tous les produits en promotion
   */
  getProduitsEnPromotion(): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/promotions`);
  }

  /**
   * Obtenir les produits en promotion dans un magasin
   */
  getProduitsEnPromotionByMagasin(magasinId: number): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/magasin/${magasinId}/promotions`);
  }

  /**
   * Obtenir les stocks mis à jour après une date
   */
  getStocksMisAJourApres(date: string): Observable<StockMagasinDTO[]> {
    return this.http.get<StockMagasinDTO[]>(`${this.apiUrl}/mis-a-jour-apres?date=${date}`);
  }

  /**
   * Supprimer un stock
   */
  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calculer le stock total d'un magasin
   */
  getStockTotalMagasin(magasinId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/magasin/${magasinId}/total`);
  }

  /**
   * Calculer le stock total global
   */
  getStockTotalGlobal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-global`);
  }

  /**
   * Obtenir les informations de stock d'un produit
   */
  getInfoStockProduit(produitId: number): Observable<ProduitStockInfoDTO> {
    return this.http.get<ProduitStockInfoDTO>(`${this.apiUrl}/produit/${produitId}/info`);
  }

  /**
   * Calculer le stock total d'un produit
   */
  getStockTotalProduit(produitId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/produit/${produitId}/total`);
  }

  /**
   * Compter le nombre de magasins qui ont un produit en stock
   */
  getNombreMagasinsAvecProduit(produitId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/produit/${produitId}/nombre-magasins`);
  }

  // ========== RAPPORTS ==========

  /**
   * Générer un rapport hebdomadaire pour un magasin
   */
  genererRapportHebdomadaire(magasinId: number): Observable<RapportStockDTO> {
    return this.http.get<RapportStockDTO>(`${this.rapportApiUrl}/magasin/${magasinId}/hebdomadaire`);
  }

  /**
   * Générer un rapport mensuel pour un magasin
   */
  genererRapportMensuel(magasinId: number): Observable<RapportStockDTO> {
    return this.http.get<RapportStockDTO>(`${this.rapportApiUrl}/magasin/${magasinId}/mensuel`);
  }

  /**
   * Générer un rapport personnalisé pour un magasin
   */
  genererRapportPersonnalise(magasinId: number, debut: string, fin: string): Observable<RapportStockDTO> {
    return this.http.get<RapportStockDTO>(`${this.rapportApiUrl}/magasin/${magasinId}/personnalise?debut=${debut}&fin=${fin}`);
  }

  /**
   * Obtenir l'historique d'un produit dans un magasin
   */
  getHistoriqueProduitMagasin(produitId: number, magasinId: number): Observable<HistoriqueStockDTO[]> {
    return this.http.get<HistoriqueStockDTO[]>(`${this.rapportApiUrl}/historique/produit/${produitId}/magasin/${magasinId}`);
  }

  /**
   * Obtenir l'historique d'un magasin sur une période
   */
  getHistoriqueMagasinPeriode(magasinId: number, debut: string, fin: string): Observable<HistoriqueStockDTO[]> {
    return this.http.get<HistoriqueStockDTO[]>(`${this.rapportApiUrl}/historique/magasin/${magasinId}?debut=${debut}&fin=${fin}`);
  }

  /**
   * Obtenir l'historique de la semaine en cours pour un magasin
   */
  getHistoriqueSemaine(magasinId: number): Observable<HistoriqueStockDTO[]> {
    return this.http.get<HistoriqueStockDTO[]>(`${this.rapportApiUrl}/historique/magasin/${magasinId}/semaine`);
  }

  /**
   * Obtenir l'historique d'une visite
   */
  getHistoriqueVisite(visitId: number): Observable<HistoriqueStockDTO[]> {
    return this.http.get<HistoriqueStockDTO[]>(`${this.rapportApiUrl}/historique/visite/${visitId}`);
  }
}

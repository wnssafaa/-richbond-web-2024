import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Magasin } from './magasin.service';
import { Merchendiseur } from './merchendiseur.service';

export enum StatutVisite {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  EFFECTUEE = 'EFFECTUEE',
  REPROGRAMMEE = 'REPROGRAMMEE',
  NON_ACCOMPLIE = 'NON_ACCOMPLIE'
}

export interface Planification {
  id?: number;
  dateVisite: string; // Format ISO 8601 attendu, ex: "2025-06-20T10:30:00"
  statut: StatutVisite;
  commentaire?: string;
  dureeVisite?: number;
  valide?: boolean;
  dateCreation?: string; // Optionnel si tu veux afficher la date de création
  magasin: {
    region: string | null;
    type: string | null;
    enseigne: string | null;
    marques: any;
    nom: string;
    id: number;
    ville?: string; // Ajout de la propriété ville
  }; // Correspond à @ManyToOne magasin
  merchandiser: {
    nom: string;
    id: number;
    prenom?: string; // Ajout du prénom
    telephone?: string; // Ajout du téléphone
    imagePath?: string; // Ajout du chemin de l'image
    superviseur?: { // Ajout du superviseur
      id: number;
      nom: string;
      prenom: string;
    };
  }; // Correspond à @ManyToOne merchandiser
}


@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private apiUrl = 'http://68.183.71.119:8080/api/api/planifications';

  constructor(private http: HttpClient) {}

  addPlanification(planif: Planification): Observable<Planification> {
    // ✅ Pas de formatage supplémentaire - la date est déjà au bon format
    console.log('📅 Envoi planification avec date:', planif.dateVisite);
    return this.http.post<Planification>(this.apiUrl, planif);
  }

  private formatDate(dateString: string): string {
    // ✅ Retourner la date telle quelle si elle est déjà au format ISO
    if (dateString.includes('T') && !dateString.includes('Z')) {
      return dateString;
    }
    // Sinon, conversion simple sans décalage horaire
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // Récupérer toutes les planifications
  getAllPlanifications(): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.apiUrl}`);
  }

  // Récupérer une planification par ID
  getPlanificationById(id: number): Observable<Planification> {
    return this.http.get<Planification>(`${this.apiUrl}/${id}`);
  }

  // Supprimer une planification
  deletePlanification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Modifier une planification
  updatePlanification(id: number, planif: Planification): Observable<Planification> {
    // ✅ Pas de formatage supplémentaire - la date est déjà au bon format
    console.log('📅 Mise à jour planification avec date:', planif.dateVisite);
    return this.http.put<Planification>(`${this.apiUrl}/${id}`, planif);
  }

  // Rechercher les planifications par merchendiseur
  getPlanificationsByMerchendiseur(merchendiseurId: number): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.apiUrl}/merchendiseur/${merchendiseurId}`);
  }

  // Rechercher les planifications par magasin
  getPlanificationsByMagasin(magasinId: number): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.apiUrl}/magasin/${magasinId}`);
  }

  // Récupérer les statistiques des statuts
  getStatsParStatut(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/statistiques/statuts`);
  }
  getPlanificationsByDate(date: string): Observable<Planification[]> {
  return this.http.get<Planification[]>(`${this.apiUrl}/date/${date}`);
}
checkDisponibilite(merchId: number, dateDebut: string, dateFin: string): Observable<boolean> {
  const params = new HttpParams()
    .set('merchandiserId', merchId.toString())
    .set('dateDebutIso', dateDebut)
    .set('dateFinIso', dateFin);

  return this.http.get<boolean>(`${this.apiUrl}/check-disponibilite`, { params });
}


}

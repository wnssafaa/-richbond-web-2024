import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Magasin } from './magasin.service';
import { environment } from '../../environments/environment';
import { Merchendiseur } from './merchendiseur.service';
import { environment } from '../../environments/environment';

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
  dateCreation?: string; // Optionnel si tu veux afficher la date de crÃ©ation
  magasin: {
    region: string | null;
    type: string | null;
    enseigne: string | null;
    marques: any;
    nom: string;
    id: number;
    ville?: string; // Ajout de la propriÃ©tÃ© ville
  }; // Correspond Ã  @ManyToOne magasin
  merchandiser: {
    nom: string;
    id: number;
    prenom?: string; // Ajout du prÃ©nom
    telephone?: string; // Ajout du tÃ©lÃ©phone
    imagePath?: string; // Ajout du chemin de l'image
    superviseur?: { // Ajout du superviseur
      id: number;
      nom: string;
      prenom: string;
    };
  }; // Correspond Ã  @ManyToOne merchandiser
}


@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private apiUrl = `${environment.apiUrl}/planifications`;

  constructor(private http: HttpClient) {}

  addPlanification(planif: Planification): Observable<Planification> {
    // âœ… Pas de formatage supplÃ©mentaire - la date est dÃ©jÃ  au bon format
    console.log('ðŸ“… Envoi planification avec date:', planif.dateVisite);
    return this.http.post<Planification>(this.apiUrl, planif);
  }

  private formatDate(dateString: string): string {
    // âœ… Retourner la date telle quelle si elle est dÃ©jÃ  au format ISO
    if (dateString.includes('T') && !dateString.includes('Z')) {
      return dateString;
    }
    // Sinon, conversion simple sans dÃ©calage horaire
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // RÃ©cupÃ©rer toutes les planifications
  getAllPlanifications(): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.apiUrl}`);
  }

  // RÃ©cupÃ©rer une planification par ID
  getPlanificationById(id: number): Observable<Planification> {
    return this.http.get<Planification>(`${this.apiUrl}/${id}`);
  }

  // Supprimer une planification
  deletePlanification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Modifier une planification
  updatePlanification(id: number, planif: Planification): Observable<Planification> {
    // âœ… Pas de formatage supplÃ©mentaire - la date est dÃ©jÃ  au bon format
    console.log('ðŸ“… Mise Ã  jour planification avec date:', planif.dateVisite);
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

  // RÃ©cupÃ©rer les statistiques des statuts
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


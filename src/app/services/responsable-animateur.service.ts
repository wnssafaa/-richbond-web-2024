import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Region } from '../enum/Region';
import { environment } from '../../environments/environment';
import { Role } from '../enum/Role';
import { environment } from '../../environments/environment';

export interface ResponsableAnimateur {
  id?: number;
  username?: string;
  email: string;
  password?: string;
  nom: string;
  prenom: string;
  region: Region;
  ville: string;
  marqueCouverte: string;
  localisation: string;
  type: string;
  telephone: string;
  status: string;
  role: Role;
  magasinIds: number[];
  superviseurId?: number | null;
  superviseur?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  dateDebutIntegration?: string;
  dateSortie?: string;
  inviteStatus?: string;
  dateInvitation?: string;
  marques: string[];
  enseignes: string[];
  planifications?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ResponsableAnimateurService {
  private apiUrl = `${environment.apiUrl}/responsable-animateur`;

  constructor(private http: HttpClient) {}

  // CRUD Operations
  createResponsableAnimateur(responsable: ResponsableAnimateur): Observable<ResponsableAnimateur> {
    return this.http.post<ResponsableAnimateur>(`${this.apiUrl}`, responsable);
  }

  getAllResponsableAnimateurs(): Observable<ResponsableAnimateur[]> {
    return this.http.get<ResponsableAnimateur[]>(`${this.apiUrl}`);
  }

  getResponsableAnimateurById(id: number): Observable<ResponsableAnimateur> {
    return this.http.get<ResponsableAnimateur>(`${this.apiUrl}/${id}`);
  }

  updateResponsableAnimateur(id: number, responsable: ResponsableAnimateur): Observable<ResponsableAnimateur> {
    return this.http.put<ResponsableAnimateur>(`${this.apiUrl}/${id}`, responsable);
  }

  deleteResponsableAnimateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Recherche et filtrage
  searchResponsableAnimateurs(searchTerm: string): Observable<ResponsableAnimateur[]> {
    return this.http.get<ResponsableAnimateur[]>(`${this.apiUrl}/search?searchTerm=${searchTerm}`);
  }

  getResponsableAnimateursByRegion(region: string): Observable<ResponsableAnimateur[]> {
    return this.http.get<ResponsableAnimateur[]>(`${this.apiUrl}/region/${region}`);
  }

  getResponsableAnimateursByVille(ville: string): Observable<ResponsableAnimateur[]> {
    return this.http.get<ResponsableAnimateur[]>(`${this.apiUrl}/ville/${ville}`);
  }

  getResponsableAnimateursByStatus(status: string): Observable<ResponsableAnimateur[]> {
    return this.http.get<ResponsableAnimateur[]>(`${this.apiUrl}/status/${status}`);
  }

  // Gestion des planifications
  getPlanificationsByResponsableAnimateur(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/planifications`);
  }

  getPlanificationsAujourdhui(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/planifications/aujourdhui`);
  }

  getPlanificationsByDate(id: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/planifications/date/${date}`);
  }

  getPlanificationsByStatut(id: number, statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/planifications/statut/${statut}`);
  }

  // Gestion des magasins
  getMagasinIds(id: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${id}/magasins`);
  }

  assignMagasins(id: number, magasinIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/magasins`, magasinIds);
  }

  // Gestion des marques et enseignes
  getMarques(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/marques`);
  }

  assignMarques(id: number, marques: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/marques`, marques);
  }

  getEnseignes(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/enseignes`);
  }

  assignEnseignes(id: number, enseignes: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/enseignes`, enseignes);
  }

  // Statistiques
  countResponsableAnimateurs(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  countByRegion(region: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/region/${region}`);
  }

  countByStatus(status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/status/${status}`);
  }
}


















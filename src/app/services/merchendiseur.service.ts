import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Region } from '../enum/Region';
import { environment } from '../../environments/environment';
import { Magasin } from './magasin.service';
import { environment } from '../../environments/environment';
import { Role } from '../enum/Role';
import { environment } from '../../environments/environment';

// âœ… Enum pour les statuts d'invitation
export enum InviteStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTE = 'ACCEPTE',
  REFUSE = 'REFUSE',
  EXPIRE = 'EXPIRE'
}

// âœ… Options pour le select d'invitation
export const INVITE_STATUS_OPTIONS = [
  { value: null, label: 'Aucune invitation', description: 'Merchandiseur actif normal' },
  { value: 'EN_ATTENTE', label: 'En attente', description: 'En attente d\'acceptation' },
  { value: 'ACCEPTE', label: 'AcceptÃ©', description: 'Invitation acceptÃ©e' },
  { value: 'REFUSE', label: 'RefusÃ©', description: 'Invitation refusÃ©e' },
  { value: 'EXPIRE', label: 'ExpirÃ©', description: 'Invitation expirÃ©e' }
];

export interface Merchendiseur {
  magasinNoms?: string[];
  superviseurPrenom?: string;
  superviseurNom?: string;
  username?: string; // Optionnel si diffÃ©rent de l'email
  password?: string;
  id?: number;
  nom: string;
  prenom: string;
  region: Region;
  ville: string;
  telephone: string;
  marqueCouverte: string;
  localisation: string;
  status: string;
  role: Role;
  email: string;
 magasinIds: number[];
  // marques: string[];
  superviseurId?: number | null;
 superviseur?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  enseignes: string[];
   dateDebutIntegration?: string; // ðŸ†• Date d'intÃ©gration du superviseur
  dateSortie?: string; 
  imagePath?: string;  // ou un type dÃ©taillÃ© si tu veux
  
  // âœ… Nouveaux champs pour les invitations
  inviteStatus?: InviteStatus | null;
  dateInvitation?: string;
}


@Injectable({
  providedIn: 'root'
})
export class MerchendiseurService {

  private apiUrl = `http://68.183.71.119:8080/api/api/merchendiseurs`; // L'URL de l'API

  constructor(private http: HttpClient) {}

  // Ajouter un merchandiseur
  addMerchendiseur(merchendiseur: Merchendiseur): Observable<Merchendiseur> {
    return this.http.post<Merchendiseur>(`${this.apiUrl}/add`, merchendiseur);
  }

  // RÃ©cupÃ©rer tous les merchandiseurs
  getAllMerchendiseurs(): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/all`);
  }

  // RÃ©cupÃ©rer un merchandiseur par ID
  getMerchendiseurById(id: number): Observable<Merchendiseur> {
    return this.http.get<Merchendiseur>(`${this.apiUrl}/${id}`);
  }

  // Supprimer un merchandiseur par ID
  deleteMerchendiseur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des merchandiseurs par nom
  getMerchendiseurByNom(nom: string): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/nom/${nom}`);
  }

  // Rechercher des merchandiseurs par rÃ©gion
  getMerchendiseurByRegion(region: string): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/region/${region}`);
  }

  // Rechercher des merchandiseurs par type
  getMerchendiseurByType(type: string): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/type/${type}`);
  }

  // Rechercher des merchandiseurs par superviseur
  getMerchendiseurBySuperviseur(superviseurId: number): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/superviseur/${superviseurId}`);
  }

  // Mettre Ã  jour le statut d'un merchandiseur
  updateStatus(id: number, status: string): Observable<Merchendiseur> {
    return this.http.put<Merchendiseur>(`${this.apiUrl}/status/${id}?status=${status}`, {});
  }
  updateMerchendiseur(id: number, merchendiseur: Merchendiseur): Observable<Merchendiseur> {
return this.http.put<Merchendiseur>(`${this.apiUrl}/update/${id}`, merchendiseur);
  }}



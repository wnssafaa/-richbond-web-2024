import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region } from '../enum/Region';
import { Magasin } from './magasin.service';
import { Role } from '../enum/Role';

export interface Merchendiseur {
  magasinNoms: never[];
  superviseurPrenom: string;
  superviseurNom: string;
  username?: string; // Optionnel si différent de l'email
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
  marques: string[];
  superviseurId?: number | null;
 superviseur?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  enseignes: string[];
   dateDebutIntegration?: string; // 🆕 Date d'intégration du superviseur
  dateSortie?: string; 
  imagePath?: string;  // ou un type détaillé si tu veux
}


@Injectable({
  providedIn: 'root'
})
export class MerchendiseurService {

  private apiUrl = `http://localhost:8080/api/merchendiseurs`; // L'URL de l'API

  constructor(private http: HttpClient) {}

  // Ajouter un merchandiseur
  addMerchendiseur(merchendiseur: Merchendiseur): Observable<Merchendiseur> {
    return this.http.post<Merchendiseur>(`${this.apiUrl}/add`, merchendiseur);
  }

  // Récupérer tous les merchandiseurs
  getAllMerchendiseurs(): Observable<Merchendiseur[]> {
    return this.http.get<Merchendiseur[]>(`${this.apiUrl}/all`);
  }

  // Récupérer un merchandiseur par ID
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

  // Rechercher des merchandiseurs par région
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

  // Mettre à jour le statut d'un merchandiseur
  updateStatus(id: number, status: string): Observable<Merchendiseur> {
    return this.http.put<Merchendiseur>(`${this.apiUrl}/status/${id}?status=${status}`, {});
  }
  updateMerchendiseur(id: number, merchendiseur: Merchendiseur): Observable<Merchendiseur> {
return this.http.put<Merchendiseur>(`${this.apiUrl}/update/${id}`, merchendiseur);
  }}
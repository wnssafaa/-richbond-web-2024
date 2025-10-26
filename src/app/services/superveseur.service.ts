import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Region } from '../enum/Region';

import { Merchendiseur } from './merchendiseur.service';


export interface Superviseur {
  id?: number;
  nom: string;
   username?: string; // Optionnel si diffÃ©rent de l'email
  password?: string;
  prenom: string;
  ville: string;
  status: string;
  telephone: string;
  email: string;
  region: Region;
  merchendiseurIds: number[]; // Gardez comme number[] car JSON n'a pas de type Long
  merchendiseurs: Merchendiseur[];
  magasin: string;
  marquesCouvertes: string;
  dateIntegration?: string; // ðŸ†• Date d'intÃ©gration du superviseur
  dateSortie?: string;
  imagePath?: string;      // ðŸ†• Date de sortie du superviseur
}

@Injectable({
  providedIn: 'root'
})
export class SuperveseurService {

  private apiUrl = `/api/api/superviseur`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Superviseur[]> {
    return this.http.get<Superviseur[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<Superviseur> {
    return this.http.get<Superviseur>(`${this.apiUrl}/${id}`);
  }

  // create(superviseur: Superviseur): Observable<Superviseur> {
  //   return this.http.post<Superviseur>(`${this.apiUrl}/create`, superviseur);
  // }

  private static lastCreateCall = 0;
  private static createInProgress = false;

  create(superviseur: Superviseur): Observable<Superviseur> {
    const currentTime = Date.now();
    
    // VÃ©rification statique pour Ã©viter les appels multiples
    if (SuperveseurService.createInProgress) {
      console.log('ðŸš« APPEL API CREATE BLOQUÃ‰: Soumission dÃ©jÃ  en cours');
      return new Observable(observer => {
        observer.error(new Error('Soumission dÃ©jÃ  en cours'));
      });
    }
    
      // VÃ©rification du dÃ©lai minimum (30 secondes)
      if (currentTime - SuperveseurService.lastCreateCall < 30000) {
        console.log('ðŸš« APPEL API CREATE BLOQUÃ‰: DÃ©lai de protection (', currentTime - SuperveseurService.lastCreateCall, 'ms)');
        return new Observable(observer => {
          observer.error(new Error('DÃ©lai de protection non respectÃ©'));
        });
      }
    
    SuperveseurService.createInProgress = true;
    SuperveseurService.lastCreateCall = currentTime;
    
    console.log('ðŸ”„ APPEL API CREATE SUPERVISEUR AUTORISÃ‰:', new Date().toISOString(), superviseur);
    
    return new Observable(observer => {
      this.http.post<Superviseur>(`${this.apiUrl}/create`, superviseur).subscribe({
        next: (response) => {
          SuperveseurService.createInProgress = false;
          observer.next(response);
        },
        error: (err) => {
          SuperveseurService.createInProgress = false;
          observer.error(err);
        },
        complete: () => {
          SuperveseurService.createInProgress = false;
          observer.complete();
        }
      });
    });
  }
  update(id: number, superviseur: Superviseur): Observable<Superviseur> {
    return this.http.put<Superviseur>(`${this.apiUrl}/${id}`, superviseur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

   searchByName(nom: string): Observable<Superviseur[]> {
    return this.http.get<Superviseur[]>(`${this.apiUrl}/search?nom=${nom}`);
  }

  searchByEmail(email: string): Observable<Superviseur> {
    return this.http.get<Superviseur>(`${this.apiUrl}/search?email=${email}`);
  }

  searchByRegion(region: string): Observable<Superviseur[]> {
    return this.http.get<Superviseur[]>(`${this.apiUrl}/search?region=${region}`);
  }

  updateStatus(id: number, status: string): Observable<Superviseur> {
    // return this.http.put<Superviseur>(
    //   `${this.apiUrl}/${id}/status`,
    //   JSON.stringify(status),
    //   { headers: { 'Content-Type': 'application/json' } }
    // );
    return this.http.put<Superviseur>(`${this.apiUrl}/status/${id}?status=${status}`, {})
  }

  addMerchendiseur(superviseurId: number, merchendiseur: any): Observable<Superviseur> {
    return this.http.post<Superviseur>(`${this.apiUrl}/${superviseurId}/merchandiseurs`, merchendiseur);
  }

  removeMerchendiseur(superviseurId: number, merchendiseurId: number): Observable<Superviseur> {
    return this.http.delete<Superviseur>(`${this.apiUrl}/${superviseurId}/merchandiseurs/${merchendiseurId}`);
  }
}




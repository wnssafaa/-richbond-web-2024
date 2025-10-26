import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Magasin {
  id?: number;
  nom: string;
  localisation: string;
  latitude?: number;
  longitude?: number;
  region: string;
  ville: string;
  type: string;
  enseigne: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  status?: string;
  produits: any[]; // ou Produit[]
   merchandiseur?: {
    id: number;
    nom: string;
    prenom: string;
    superviseur?: {
      id: number;
      nom: string;
      prenom: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class MagasinService {
  private apiUrl = `/api/api/magasins`;

  constructor(private http: HttpClient) {}

  // CrÃ©er un magasin (POST /create)
  addMagasin(magasin: Magasin): Observable<Magasin> {
    return this.http.post<Magasin>(`${this.apiUrl}/create`, magasin);
  }

  // RÃ©cupÃ©rer tous les magasins (GET /all)
  getAllMagasins(): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`${this.apiUrl}/all`);
  }

  // RÃ©cupÃ©rer un magasin par ID (GET /{id})
  getMagasinById(id: number): Observable<Magasin> {
    return this.http.get<Magasin>(`${this.apiUrl}/${id}`);
  }

  // Mettre Ã  jour un magasin (PUT /update/{id})
  updateMagasin(id: number, magasin: Magasin): Observable<Magasin> {
    return this.http.put<Magasin>(`${this.apiUrl}/update/${id}`, magasin);
  }

  // Supprimer un magasin (DELETE /delete/{id})
  deleteMagasin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // RÃ©cupÃ©rer les magasins par ville (GET /ville/{ville})
  getMagasinsByVille(ville: string): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`${this.apiUrl}/ville/${ville}`);
  }

  // RÃ©cupÃ©rer les magasins par rÃ©gion (GET /region/{region})
  getMagasinsByRegion(region: string): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`${this.apiUrl}/region/${region}`);
  }
}




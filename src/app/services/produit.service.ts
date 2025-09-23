import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produit {
  id?: number;
  marque: string;
  reference: string;
  categorie: string;
  image: string;
  article: string;
  type: string;
  dimensions: string;
  disponible: boolean;
  prix: number;
  
  // Nouveaux attributs ajoutés
  famille: string;           // ex: "MATELAS"
  sousMarques: string;       // ex: "R VITAL"
  codeEAN: string;          // ex: "6111250526067"
  designationArticle: string; // ex: "R VITAL 190X090"
}

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://localhost:8080/api/produits';

  constructor(private http: HttpClient) { }

  // Ajouter un produit
  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/add`, produit);
  }

  // Obtenir tous les produits
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/all`);
  }

  // Obtenir un produit par ID
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

 updateProduit(id: number, produit: Produit): Observable<Produit> {
  console.log('Update produit payload:', produit);
  return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
}


  // Supprimer un produit
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des produits par marque
  getProduitsByMarque(marque: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/marque/${marque}`);
  }
}

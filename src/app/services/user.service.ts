import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../enum/Role';

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  username?: string;
  password?: string;
  role?: Role; // Enum côté front
  status: string;
  imagePath?: string; // chemin ou url de l'image côté back
  selected: boolean;
  marques?: string[]; // Liste des marques associées
  enseignes?: string[]; // Liste des enseignes associées
  derniereConnexion?: string; // Date de dernière connexion
  derniereSession?: string; // ID de la dernière session
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://68.183.71.119:8080/api/api/users';

  constructor(private http: HttpClient) {}

  // ✅ Créer un utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // ✅ Récupérer tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // ✅ Récupérer un utilisateur par ID
  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // ✅ Mettre à jour un utilisateur
  updateUser(id: number | undefined, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // ✅ Supprimer un utilisateur
  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Changer le rôle d’un utilisateur (assure-toi d’avoir cette route côté back si utilisée)
  changeUserRole(userId: string | number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role/${role}`, {});
  }

  // ✅ Rechercher des utilisateurs par nom (si tu ajoutes cette logique côté backend)
  searchUsersByName(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?name=${name}`);
  }

  // ✅ Filtrer les utilisateurs par statut
  filterUsersByStatus(status: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/filter?status=${status}`);
  }

  // ✅ Désactiver un utilisateur (requiert un endpoint backend)
  deactivateUser(userId: string | number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  // ✅ Activer un utilisateur
  activateUser(userId: string | number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/activate`, {});
  }

  // ✅ Compter les utilisateurs actifs
  countActiveUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/active`);
  }

  // ✅ Récupérer l'utilisateur connecté
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // ✅ Upload d'avatar (image de profil)
  uploadAvatar(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.put<User>(`${this.apiUrl}/${userId}/avatar`, formData);
  }

  // ✅ Récupérer les marques d'un utilisateur
  getUserBrands(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/brands`);
  }

  // ✅ Récupérer les enseignes d'un utilisateur
  getUserStores(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/stores`);
  }

  // ✅ Récupérer l'historique de connexion d'un utilisateur
  getUserLoginHistory(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/login-history`);
  }

  // ✅ Récupérer toutes les marques disponibles
  getAllBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  // ✅ Récupérer toutes les enseignes disponibles
  getAllStores(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/stores`);
  }
}

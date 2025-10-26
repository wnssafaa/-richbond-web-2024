import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../enum/Role';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  username?: string;
  password?: string;
  role?: Role; // Enum cÃ´tÃ© front
  status: string;
  imagePath?: string; // chemin ou url de l'image cÃ´tÃ© back
  selected: boolean;
  marques?: string[]; // Liste des marques associÃ©es
  enseignes?: string[]; // Liste des enseignes associÃ©es
  derniereConnexion?: string; // Date de derniÃ¨re connexion
  derniereSession?: string; // ID de la derniÃ¨re session
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `/api/users`;

  constructor(private http: HttpClient) {}

  // âœ… CrÃ©er un utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // âœ… RÃ©cupÃ©rer tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // âœ… RÃ©cupÃ©rer un utilisateur par ID
  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // âœ… Mettre Ã  jour un utilisateur
  updateUser(id: number | undefined, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // âœ… Supprimer un utilisateur
  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // âœ… Changer le rÃ´le dâ€™un utilisateur (assure-toi dâ€™avoir cette route cÃ´tÃ© back si utilisÃ©e)
  changeUserRole(userId: string | number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role/${role}`, {});
  }

  // âœ… Rechercher des utilisateurs par nom (si tu ajoutes cette logique cÃ´tÃ© backend)
  searchUsersByName(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?name=${name}`);
  }

  // âœ… Filtrer les utilisateurs par statut
  filterUsersByStatus(status: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/filter?status=${status}`);
  }

  // âœ… DÃ©sactiver un utilisateur (requiert un endpoint backend)
  deactivateUser(userId: string | number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  // âœ… Activer un utilisateur
  activateUser(userId: string | number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/activate`, {});
  }

  // âœ… Compter les utilisateurs actifs
  countActiveUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/active`);
  }

  // âœ… RÃ©cupÃ©rer l'utilisateur connectÃ©
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // âœ… Upload d'avatar (image de profil)
  uploadAvatar(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.put<User>(`${this.apiUrl}/${userId}/avatar`, formData);
  }

  // âœ… RÃ©cupÃ©rer les marques d'un utilisateur
  getUserBrands(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/brands`);
  }

  // âœ… RÃ©cupÃ©rer les enseignes d'un utilisateur
  getUserStores(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/stores`);
  }

  // âœ… RÃ©cupÃ©rer l'historique de connexion d'un utilisateur
  getUserLoginHistory(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/login-history`);
  }

  // âœ… RÃ©cupÃ©rer toutes les marques disponibles
  getAllBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  // âœ… RÃ©cupÃ©rer toutes les enseignes disponibles
  getAllStores(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/stores`);
  }
}


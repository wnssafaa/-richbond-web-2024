import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `http://localhost:8080/api/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  // Ajoutez cette méthode
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, 
      { email },
      { 
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      }
    ).pipe(
      tap(response => {
        console.log('Réponse complète:', response);
      }),
      catchError(error => {
        console.error('Erreur technique:', error);
        return throwError(() => new Error(
          error.error?.message || 
          'Erreur lors de la demande. Vérifiez votre connexion.'
        ));
      })
    );
  }

  resetPassword(token: string, newPassword: string) {
    const payload = {
      token: token,
      newPassword: newPassword
    };
    
    return this.http.post(`${this.apiUrl}/reset-password`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    const token = this.getToken();
    
    if (!token) {
      this.cleanUpAndRedirect();
      return;
    }

    this.http.post(`${this.apiUrl}/logout`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        console.log('Déconnexion réussie:', response);
        this.cleanUpAndRedirect();
      },
      error: (err) => {
        console.error('Erreur pendant la déconnexion :', err);
        this.cleanUpAndRedirect();
      }
    });
  }

  private cleanUpAndRedirect(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getCurrentUserInfo() {
    const token = this.getToken();
    return this.http.get<User>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  updateCurrentUser(data: Partial<User>) {
    const token = this.getToken();
    return this.http.put<User>(`${this.apiUrl}/me`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Corrigez cette méthode - retirez le /auth en double dans l'URL
  getLoginHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/login-history/all`, {
      headers: this.getHeaders()
    });
  }
  

  // Optionnel : Ajoutez des méthodes pour filtrer l'historique
  getLoginHistoryByDevice(deviceType: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/login-history/device/${deviceType}`, {
      headers: this.getHeaders()
    });
  }

  getLoginStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/login-history/stats`, {
      headers: this.getHeaders()
    });
  }
}
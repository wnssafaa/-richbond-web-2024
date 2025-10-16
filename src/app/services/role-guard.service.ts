import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Récupérer les informations de l'utilisateur connecté
    this.authService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        // Vérifier si l'utilisateur a le rôle requis pour accéder aux KPIs
        const allowedRoles = ['SUPER_ADMIN', 'SUPERVISEUR', 'Admin'];
        if (!allowedRoles.includes(userInfo.role)) {
          this.router.navigate(['/dashbord']); // Rediriger vers le dashboard si pas autorisé
          return false;
        }
        return true;
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du rôle:', error);
        this.router.navigate(['/login']);
        return false;
      }
    });

    return true;
  }
}

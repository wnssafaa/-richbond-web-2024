import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConsultantGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Récupérer le rôle de l'utilisateur actuel
    return this.authService.getCurrentUserInfo().pipe(
      map((user) => {
        const role = user.role;
        
        // Si l'utilisateur est consultant, rediriger vers le dashboard
        if (role && this.permissionService.isConsultant(role)) {
          this.router.navigate(['/Dashbord']);
          return false;
        }
        
        return true;
      }),
      catchError((err) => {
        console.error('Erreur lors de la vérification des permissions:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}

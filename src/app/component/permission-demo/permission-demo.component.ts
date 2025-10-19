import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { PermissionDirectivesModule } from '../../directives/permission-directives.module';

@Component({
  selector: 'app-permission-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PermissionDirectivesModule
  ],
  templateUrl: './permission-demo.component.html',
  styleUrl: './permission-demo.component.css'
})
export class PermissionDemoComponent implements OnInit {
  currentUserRole = '';
  username = '';

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (data) => {
        this.username = data.username ?? '';
        this.currentUserRole = data.role ?? '';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  // Méthodes d'exemple pour les actions
  onAdd(): void {
    this.snackBar.open('Action d\'ajout exécutée', 'Fermer', { duration: 2000 });
  }

  onEdit(): void {
    this.snackBar.open('Action d\'édition exécutée', 'Fermer', { duration: 2000 });
  }

  onDelete(): void {
    this.snackBar.open('Action de suppression exécutée', 'Fermer', { duration: 2000 });
  }

  onView(): void {
    this.snackBar.open('Action de visualisation exécutée', 'Fermer', { duration: 2000 });
  }

  // Méthodes utilitaires pour les templates
  canAdd(): boolean {
    return this.permissionService.canAdd(this.currentUserRole);
  }

  canEdit(): boolean {
    return this.permissionService.canEdit(this.currentUserRole);
  }

  canDelete(): boolean {
    return this.permissionService.canDelete(this.currentUserRole);
  }

  canRead(): boolean {
    return this.permissionService.canRead(this.currentUserRole);
  }

  isConsultant(): boolean {
    return this.permissionService.isConsultant(this.currentUserRole);
  }

  getRoleDisplayName(): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'SUPERVISEUR': 'Superviseur',
      'MERCHANDISEUR_MONO': 'Merchandiseur Mono',
      'MERCHANDISEUR_MULTI': 'Merchandiseur Multi',
      'RESPONSABLE_ANIMATEUR': 'Responsable Animateur',
      'CONSULTANT': 'Consultant'
    };
    return roles[this.currentUserRole] || this.currentUserRole;
  }
}

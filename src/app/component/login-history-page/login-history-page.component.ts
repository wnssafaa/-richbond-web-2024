import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginHistoryComponent } from '../login-history/login-history.component';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';

@Component({
  selector: 'app-login-history-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
    RouterModule,
    TranslateModule,
    LoginHistoryComponent,
    MatDialogModule
  ],
  templateUrl: './login-history-page.component.html',
  styleUrl: './login-history-page.component.css'
})
export class LoginHistoryPageComponent {
  // Propriétés pour la sidebar
  menuOpen = false;
  username: string = '';
  role: string = '';
  email: string = '';
  nom: string = '';
  prenom: string = '';
  telephone: string = '';
  avatarUrl: string = '';
  imagePath: string = '';
  status: string = '';
  currentLanguage = 'fr';

  constructor(
    private authService: AuthService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.loadCurrentUser();
  }

  /**
   * Charge les informations de l'utilisateur actuel
   */
  loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (data) => {
        this.username = data.username ?? '';
        this.role = data.role ?? '';
        this.email = data.email ?? '';
        this.nom = data.nom ?? '';
        this.prenom = data.prenom ?? '';
        this.telephone = data.telephone ?? '';
        this.status = data.status ?? '';
        this.imagePath = data.imagePath ?? '';
        // Gestion de l'avatar : base64 ou URL
        this.avatarUrl = data.imagePath
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://68.183.71.119:8080/api/api/uploads/' + data.imagePath)
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  /**
   * Bascule l'état du menu sidebar
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Change la langue de l'application
   */
  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  /**
   * Ouvre le dialogue de confirmation de déconnexion
   */
  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.authService.logout();
  }
}


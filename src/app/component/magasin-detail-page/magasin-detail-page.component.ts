import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AddMagasinComponent } from '../../dialogs/add-magasin/add-magasin.component';
@Component({
  selector: 'app-magasin-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    RouterLink,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './magasin-detail-page.component.html',
  styleUrl: './magasin-detail-page.component.css'
})
export class MagasinDetailPageComponent implements OnInit {
  magasin: Magasin | null = null;
  loading = true;
  error: string | null = null;
  
  // Propriétés pour la sidebar et l'utilisateur
  menuOpen = false;
  username: string = '';
  role: string = '';
  email: string = '';
  nom: string = '';
  prenom: string = '';
  telephone: string = '';
  status: string = '';
  imagePath: string = '';
  avatarUrl: string = '';
  currentLanguage = 'fr';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private magasinService: MagasinService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.changeLanguage('fr');
    this.loadMagasin();
  }

  loadMagasin(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID du magasin non trouvé';
      this.loading = false;
      return;
    }

    this.magasinService.getMagasinById(+id).subscribe({
      next: (magasin) => {
        this.magasin = magasin;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du magasin:', err);
        this.error = 'Erreur lors du chargement des détails du magasin';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/magasins']);
  }

  editMagasin(): void {
    if (this.magasin?.id) {
      this.router.navigate(['/Addmagsin/edit', this.magasin.id]);
    }
  }

    editMagasin1(magasin: Magasin): void {
      if (!magasin.id) {
        console.error('ID du magasin non défini');
        return;
      }
  
      const dialogRef = this.dialog.open(AddMagasinComponent, {
        width: '700px',
        data: { mode: 'edit', magasin }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.magasinService.updateMagasin(magasin.id!, result).subscribe({
            next: () => {
              this.snackBar.open('Magasin modifié avec succès', 'Fermer', { duration: 3000 });
              
            },
            error: (error) => {
              console.error('Erreur lors de la modification', error);
              this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
            }
          });
        }
      });
    }
  // Méthodes pour la sidebar et l'utilisateur
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
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
          : 'assets/profil.webp';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
        // Valeurs par défaut en cas d'erreur
        this.avatarUrl = 'assets/profil.webp';
      }
    });
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si l'utilisateur confirme, rediriger vers la page de login
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  printPage(): void {
    window.print();
  }
}

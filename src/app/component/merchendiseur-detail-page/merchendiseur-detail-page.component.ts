import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MerchendiseurService,
  Merchendiseur,
} from '../../services/merchendiseur.service';
import { MagasinService, Magasin } from '../../services/magasin.service';
import { AuthService } from '../../services/auth.service';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';

@Component({
  selector: 'app-merchendiseur-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './merchendiseur-detail-page.component.html',
  styleUrl: './merchendiseur-detail-page.component.css',
})
export class MerchendiseurDetailPageComponent implements OnInit {
  merchendiseur: Merchendiseur | null = null;
  magasins: Magasin[] = [];
  loading = true;
  error: string | null = null;

  // User info
  username: string = '';
  role: string = '';
  email: string = '';
  avatarUrl: string = '';
  currentLanguage = 'fr';
  menuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private merchendiseurService: MerchendiseurService,
    private magasinService: MagasinService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMerchendiseur(+id);
    }
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (data) => {
        this.username = data.username ?? '';
        this.role = data.role ?? '';
        this.email = data.email ?? '';
        this.avatarUrl = data.imagePath
          ? data.imagePath.startsWith('data:image')
            ? data.imagePath
            : 'http://68.183.71.119:8080/api/api/uploads/' + data.imagePath
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération des infos utilisateur :',
          err
        );
      },
    });
  }

  loadMerchendiseur(id: number): void {
    this.loading = true;
    this.error = null;

    this.merchendiseurService.getMerchendiseurById(id).subscribe({
      next: (merchendiseur) => {
        this.merchendiseur = merchendiseur;
        this.loadMagasins(merchendiseur.magasinIds || []);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du merchandiseur:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      },
    });
  }

  loadMagasins(magasinIds: number[]): void {
    if (magasinIds.length === 0) {
      this.magasins = [];
      this.loading = false;
      return;
    }

    // Charger tous les magasins et filtrer ceux qui correspondent aux IDs
    this.magasinService.getAllMagasins().subscribe({
      next: (allMagasins) => {
        this.magasins = allMagasins.filter((magasin) =>
          magasinIds.includes(magasin.id!)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des magasins:', error);
        this.magasins = [];
        this.loading = false;
      },
    });
  }

  getMerchendiseurImageUrl(): string {
    if (!this.merchendiseur?.imagePath) {
      return '';
    }

    if (this.merchendiseur.imagePath.startsWith('data:image')) {
      return this.merchendiseur.imagePath;
    }

    if (this.merchendiseur.imagePath.startsWith('http')) {
      return this.merchendiseur.imagePath;
    }

    return 'data:image/jpeg;base64,' + this.merchendiseur.imagePath;
  }

  onImageError(event: any): void {
    console.error(
      "Erreur lors du chargement de l'image du merchandiseur:",
      event
    );
    event.target.style.display = 'none';
  }

  goBack(): void {
    this.router.navigate(['/merchendiseur']);
  }

  editMerchendiseur(): void {
    if (!this.merchendiseur) return;

    const dialogRef = this.dialog.open(AddMerchComponent, {
      width: '700px',
      data: { merchandiseur: this.merchendiseur },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.merchendiseurService
          .updateMerchendiseur(this.merchendiseur!.id!, result)
          .subscribe({
            next: (updatedMerchendiseur) => {
              this.merchendiseur = updatedMerchendiseur;
              this.snackBar.open(
                'Merchandiseur modifié avec succès',
                'Fermer',
                {
                  duration: 3000,
                }
              );
            },
            error: () => {
              this.snackBar.open('Erreur lors de la modification', 'Fermer', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  printPage(): void {
    window.print();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

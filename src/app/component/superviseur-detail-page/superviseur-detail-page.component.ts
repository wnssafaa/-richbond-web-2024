import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperveseurService, Superviseur } from '../../services/superveseur.service';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AddSupComponent } from '../../dialogs/add-sup/add-sup.component';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-superviseur-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatProgressSpinnerModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './superviseur-detail-page.component.html',
  styleUrl: './superviseur-detail-page.component.css'
})
export class SuperviseurDetailPageComponent implements OnInit {
  superviseur: Superviseur | null = null;
  merchandiseurs: Merchendiseur[] = [];
  loading = true;
  error: string | null = null;

  // Propriétés pour le header et sidebar
  menuOpen = false;
  currentLanguage = 'fr';
  username: any; email: any; role: any; nom: string | undefined; prenom: string | undefined;
  telephone: string | undefined; avatarUrl: string | undefined; imagePath: string | undefined;
  status: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superviseurService: SuperveseurService,
    private merchendiseurService: MerchendiseurService,
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
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadSuperviseur(id);
      } else {
        this.error = 'ID superviseur non fourni';
        this.loading = false;
      }
    });
  }

  loadSuperviseur(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.superviseurService.getById(id).subscribe({
      next: (superviseur) => {
        console.log('Superviseur chargé:', superviseur);
        console.log('Image path:', superviseur.imagePath);
        this.superviseur = superviseur;
        
        // Charger les merchandiseurs associés à ce superviseur
        this.loadMerchandiseurs(id);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du superviseur:', error);
        this.error = 'Erreur lors du chargement du superviseur';
        this.loading = false;
      }
    });
  }

  loadMerchandiseurs(superviseurId: number): void {
    this.merchendiseurService.getMerchendiseurBySuperviseur(superviseurId).subscribe({
      next: (merchandiseurs) => {
        console.log('Merchandiseurs chargés:', merchandiseurs);
        this.merchandiseurs = merchandiseurs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des merchandiseurs:', error);
        this.merchandiseurs = [];
        this.loading = false;
      }
    });
  }

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
        this.avatarUrl = data.imagePath
          ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://68.183.71.119:8080/api/api/uploads/' + data.imagePath)
          : 'assets/default-avatar.png';
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des infos utilisateur :', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/superviseur']);
  }

  editSuperviseur(): void {
    if (this.superviseur) {
      const dialogRef = this.dialog.open(AddSupComponent, {
        width: '700px',
        data: { mode: 'edit', superviseur: this.superviseur }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.superviseurService.update(this.superviseur!.id!, result).subscribe({
            next: () => {
              this.snackBar.open('Superviseur modifié avec succès', 'Fermer', { duration: 3000 });
              this.loadSuperviseur(this.superviseur!.id!);
            },
            error: () => {
              this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
            }
          });
        }
      });
    }
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getMerchandiseurNames(merchendiseurs: any[]): string {
    if (!merchendiseurs || merchendiseurs.length === 0) return 'Aucun merchandiseur assigné';
    return merchendiseurs.map(m => m.nom).join(', ');
  }

  getSuperviseurImageUrl(): string {
    if (!this.superviseur?.imagePath) {
      return '';
    }
    
    // Si l'image est déjà en base64
    if (this.superviseur.imagePath.startsWith('data:image')) {
      return this.superviseur.imagePath;
    }
    
    // Si l'image est un chemin de fichier, construire l'URL complète
    if (this.superviseur.imagePath.startsWith('http')) {
      return this.superviseur.imagePath;
    }
    
    // Si c'est un nom de fichier, ajouter le préfixe base64
    return 'data:image/jpeg;base64,' + this.superviseur.imagePath;
  }

  onImageError(event: any): void {
    console.error('Erreur lors du chargement de l\'image:', event);
    // Optionnel: masquer l'image en cas d'erreur
    event.target.style.display = 'none';
  }

  getMerchandiseurImageUrl(merchandiseur: Merchendiseur): string {
    if (!merchandiseur?.imagePath) {
      return '';
    }
    
    // Si l'image est déjà en base64
    if (merchandiseur.imagePath.startsWith('data:image')) {
      return merchandiseur.imagePath;
    }
    
    // Si l'image est un chemin de fichier, construire l'URL complète
    if (merchandiseur.imagePath.startsWith('http')) {
      return merchandiseur.imagePath;
    }
    
    // Si c'est un nom de fichier, ajouter le préfixe base64
    return 'data:image/jpeg;base64,' + merchandiseur.imagePath;
  }

  onMerchandiseurImageError(event: any): void {
    console.error('Erreur lors du chargement de l\'image du merchandiseur:', event);
    event.target.style.display = 'none';
  }
}



import {MatExpansionModule} from '@angular/material/expansion';
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdduserComponent } from '../adduser/adduser.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Magasin, MagasinService } from '../../services/magasin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddMagasinComponent } from '../../dialogs/add-magasin/add-magasin.component';
import { Region } from '../../enum/Region';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  standalone: true,
 imports: [
    CommonModule,
    MatIconModule,
    MatIconModule,
    MatListModule,MatListModule,MatTooltipModule,TranslateModule,
    MatExpansionModule,
  CommonModule,MatSortModule ,MatSidenavModule,MatSidenavModule,MatCardModule,FormsModule,MatDialogModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,MatListModule,RouterLink,HttpClientModule,MatPaginatorModule,RouterModule,
  ],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css'
})
export class HELPComponent {
   @ViewChild(MatDrawer) drawer!: MatDrawer;
   menuOpen = false;
  username: any;
  email: any;
  role: any;
  nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  imagePath: string | undefined;
  avatarUrl: string | undefined;
  status: string | undefined;

  // Propriétés de permissions
  isConsultant: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;
  ngOnInit() {
    this.loadCurrentUser();
    
  }
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
     userMenuOpen = false;
      constructor(
      private dialog: MatDialog,
        private translate: TranslateService,
      private router: Router,
      private authService: AuthService,
      private permissionService: PermissionService
    ) {}
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
      faqItems = [
  {
    icon: 'login',
    question: 'Comment puis-je me connecter à mon compte ?',
    description: 'Pour vous connecter à votre compte :',
    steps: [
      'Cliquez sur le bouton "Connexion" en haut à droite',
      'Entrez votre email et votre mot de passe',
      'Cliquez sur "Se connecter"'
    ],
    expanded: true
  },
  {
    icon: 'supervisor_account',
    question: 'Comment gérer les superviseurs ?',
    description: 'Pour gérer les superviseurs :',
    steps: [
      'Accédez à la section "Superviseurs" dans le menu',
      'Pour ajouter un superviseur, cliquez sur "Ajouter"',
      'Pour modifier, cliquez sur l’icône de modification',
      'Pour supprimer, utilisez l’icône de suppression'
    ],
     expanded: true
  },
  {
    icon: 'store',
    question: 'Comment gérer les marchandiseurs ?',
    description: 'Pour gérer les marchandiseurs :',
    steps: [
      'Accédez à la section "Marchandiseurs"',
      'Utilisez le bouton "Ajouter" pour créer un nouveau marchandiseur',
      'Vous pouvez modifier les informations via l’icône de modification',
      'La suppression se fait via l’icône de suppression'
    ],
      expanded: true
  },
  {
    icon: 'storefront',
    question: 'Comment gérer les magasins ?',
    description: 'Pour gérer les magasins :',
    steps: [
      'Accédez à la section "Magasins"',
      'Cliquez sur "Ajouter" pour créer un nouveau magasin',
      'Remplissez les informations requises (nom, adresse, etc.)',
      'Vous pouvez modifier ou supprimer un magasin via les icônes correspondantes'
    ],
     expanded: true
  },
  {
    icon: 'event',
    question: 'Comment planifier les visites ?',
    description: 'Pour planifier les visites :',
    steps: [
      'Accédez à la section "Planification"',
      'Cliquez sur "Nouvelle planification"',
      'Sélectionnez le magasin et le marchandiseur',
      'Définissez la date et l’heure de la visite',
      'Ajoutez des notes si nécessaire'
    ],
    expanded: false
  },
  {
    icon: 'inventory',
    question: 'Comment gérer les produits ?',
    description: 'Pour gérer les produits :',
    steps: [
      'Accédez à la section "Produits"',
      'Utilisez le bouton "Ajouter" pour créer un nouveau produit',
      'Remplissez les détails du produit (nom, prix, stock, etc.)',
      'Vous pouvez modifier ou supprimer un produit via les icônes correspondantes'
    ],
    expanded: false
  },
  {
    icon: 'dashboard',
    question: 'Comment consulter le tableau de bord ?',
    description: 'Le tableau de bord vous permet de :',
    steps: [
      'Voir un aperçu des activités récentes',
      'Consulter les statistiques importantes',
      'Suivre les performances des marchandiseurs',
      'Voir l’état des magasins'
    ],
    expanded: false
  }
];

// loadCurrentUser(): void {
//   this.athService.getCurrentUserInfo().subscribe({
//     next: (data) => {
//       console.log('Utilisateur connecté :', data);
//       this.username = data.username;
//       this.role = data.role;
//       this.email=data.email
//     },
//     error: (err) => {
//       console.error('Erreur lors de la récupération des infos utilisateur :', err);
//     }
//   });
// }
currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
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
      // Gestion de l'avatar : base64 ou URL
      this.avatarUrl = data.imagePath
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'environment.apiUrl.replace('/api', '')/uploads/' + data.imagePath)
        : 'assets/default-avatar.png';
      
      // Initialiser les permissions
      this.initializePermissions();
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
}

// Méthode pour initialiser les permissions
private initializePermissions(): void {
  this.isConsultant = this.permissionService.isConsultant(this.role);
  this.canEdit = this.permissionService.canEdit(this.role);
  this.canDelete = this.permissionService.canDelete(this.role);
  this.canAdd = this.permissionService.canAdd(this.role);
}

}

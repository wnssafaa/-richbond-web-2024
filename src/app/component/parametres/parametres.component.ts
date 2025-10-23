import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MerchendiseurService } from '../../services/merchendiseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';


import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';




import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfilComponent } from '../profil/profil.component';
import { MatTooltipModule } from '@angular/material/tooltip';
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface LanguageSettings {
  language: 'fr' | 'en' | 'ar';
}

export interface AppSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  language: LanguageSettings;
}
@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule,MatButtonModule,MatButtonModule,MatButtonToggleModule,TranslateModule,MatTooltipModule,
   CommonModule, MatSortModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,
       MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule,
       MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule, MatChipsModule,
       MatSlideToggleModule, MatMenuModule, MatListModule, HttpClientModule,RouterLink,MatPaginatorModule,RouterModule,
       ProfilComponent
     ],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css'
})
export class ParametresComponent implements OnInit {
  
username: any;
role: any;
email: any;

// Propriétés de permissions
isConsultant: boolean = false;
canEdit: boolean = false;
canDelete: boolean = false;
canAdd: boolean = false;
// loadCurrentUser(): void {
//   this.authService.getCurrentUserInfo().subscribe({
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
onLanguageChange() {
throw new Error('Method not implemented.');
}
// languages: any;
// changeLanguage(arg0: any) {
// throw new Error('Method not implemented.');
// }
onThemeChange() {
throw new Error('Method not implemented.');
}
menuItems: any;
onNotificationSettingChange() {
throw new Error('Method not implemented.');
}
 userMenuOpen = false;
  // Form controls
  emailNotifications: boolean = true;
  pushNotifications: boolean = true;
  selectedTheme: string = 'light';
  selectedLanguage: string = 'fr';

  // Current settings
  settings: AppSettings = {
    profile: {
      id: 1,
      username: 'Alaa BENNIS',
      email: 'alaa.bennis@example.com',
      role: 'Admin'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true
    },
    appearance: {
      theme: 'light'
    },
    language: {
      language: 'fr'
    }
  };
userProfile: any;
// currentLanguage = 'fr';
  constructor(private merchendiseurService: MerchendiseurService,
      private snackBar: MatSnackBar,
      private dialog: MatDialog,
      private authService: AuthService,
      private permissionService: PermissionService,
      private router: Router,
        private translate: TranslateService) {
       this.translate.setDefaultLang('fr');
  this.translate.use('fr');
  }
  
  @ViewChild(MatDrawer) drawer!: MatDrawer;
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
    isMobile: boolean = false;



  
    toggleDrawer(action: 'open' | 'close') {
      if (action === 'open') {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
  menuOpen = false;
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
      nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;
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
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://68.183.71.119:8080/uploads/' + data.imagePath)
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

  ngOnInit(): void {
     this.isMobile = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    this.isMobile = window.innerWidth <= 768;
  });
    this.loadSettings();
    this.loadCurrentUser();
  }

  loadSettings(): void {
    // Ici, vous pouvez charger les paramètres depuis un service
    this.emailNotifications = this.settings.notifications.emailNotifications;
    this.pushNotifications = this.settings.notifications.pushNotifications;
    this.selectedTheme = this.settings.appearance.theme;
    this.selectedLanguage = this.settings.language.language;
  }

  editProfile(): void {
    this.showProfile = true;
  }

  changePassword(): void {
    // Implémenter la logique de changement de mot de passe
    console.log('Changement de mot de passe');
  }

  saveSettings(): void {
    // Mise à jour des paramètres
    this.settings.notifications = {
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications
    };
    this.settings.appearance.theme = this.selectedTheme as 'light' | 'dark' | 'system';
    this.settings.language.language = this.selectedLanguage as 'fr' | 'en' | 'ar';

    // Ici, vous pouvez appeler un service pour sauvegarder les paramètres
    console.log('Paramètres sauvegardés:', this.settings);
  }
  showProfile: boolean = false;
     currentLanguage = 'fr';
  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
}
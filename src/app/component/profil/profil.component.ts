import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSortModule,
    MatSidenavModule,
    MatCardModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    TranslateModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatBadgeModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatListModule,
    RouterLink,
    HttpClientModule,
    MatPaginatorModule,
    RouterModule,
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms cubic-bezier(.35,0,.25,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      imagePath: [''],
      role: [{ value: '', disabled: true }] // <-- c'est correct, ne change rien ici
    });

    this.loadUser();
  }

  loadUser() {
    this.authService.getCurrentUserInfo().subscribe({
      next: user => {
        this.profileForm.patchValue({
          id: user.id,
          username: user.username,
          email: user.email,
          imagePath: user.imagePath,
          role: user.role
        });
        this.loading = false;
      },
      error: err => {
        this.errorMessage = "Erreur lors du chargement du profil.";
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.loading = true;
    const userData = this.profileForm.getRawValue();
    this.authService.updateCurrentUser(userData).subscribe({
      next: (updatedUser) => {
        this.snackBar.open('Profil mis à jour avec succès. Vous allez être redirigé vers la page de connexion.', 'Fermer', {
          duration: 2000,
          panelClass: ['snackbar-success']
        });
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // 2 secondes pour laisser le temps de lire le message
      },
      error: () => {
        this.errorMessage = "Erreur lors de la mise à jour.";
        this.loading = false;
      }
    });
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({ imagePath: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-form">
        <h2>Réinitialisation du mot de passe</h2>
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" formControlName="password" class="form-control">
            <div *ngIf="resetForm.get('password')?.errors?.['required'] && resetForm.get('password')?.touched" class="error-message">
              Le mot de passe est requis
            </div>
          </div>
          
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" formControlName="confirmPassword" class="form-control">
            <div *ngIf="resetForm.get('confirmPassword')?.errors?.['required'] && resetForm.get('confirmPassword')?.touched" class="error-message">
              La confirmation du mot de passe est requise
            </div>
            <div *ngIf="resetForm.hasError('passwordMismatch')" class="error-message">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <button type="submit" [disabled]="resetForm.invalid" class="submit-button">
            Réinitialiser le mot de passe
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .reset-password-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #071659;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #071659;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .submit-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

onSubmit() {
  if (this.resetForm.valid && this.token) {
    const newPassword = this.resetForm.get('password')?.value;
    
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        // Meilleure gestion de la notification
        this.showSuccessMessage();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.showErrorMessage(error);
      }
    });
  }
}

private showSuccessMessage() {
  // Utilisez un service de notification ou toast si disponible
  alert('Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.');
}

private showErrorMessage(error: any) {
  let message = 'Erreur lors de la réinitialisation';
  
  if (error.error?.message) {
    message += `: ${error.error.message}`;
  } else if (error.status === 400) {
    message = 'Token invalide ou expiré';
  }
  
  alert(message);
}
} 
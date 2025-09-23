import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  resetPasswordForm: FormGroup;

  hidePassword = true;
  errorMessage = '';
  showSuccessMessage = false;
  isLoading = true;

  // UI display states
  showForgotPasswordPopup = false;
  isMobileScreen = false;
  loginTitle = "S'identifier";
  connexionButton = "connexion";
  loginRightPanelVisible = false;
  showBack = true;
  showLabel = false;
  loginPlaceholder: string = 'Login';
  passwordPlaceholder: string = 'Password';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.checkScreenSize();
    setTimeout(() => {
      this.showBack = false;
      this.loginRightPanelVisible = true;
      this.isLoading = false;
    }, 1000);
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobileScreen = window.innerWidth <= 768;
    this.loginTitle = this.isMobileScreen ? ' Connectez-vous à votre compte' : "S'identifier";
    this.connexionButton = this.isMobileScreen ? 'SE CONNECTER' : "Connexion";
    this.loginPlaceholder = this.isMobileScreen ? 'ex:jon.smith@email.com' : 'Login';
    this.passwordPlaceholder = this.isMobileScreen ? '*********' : 'Password';
    this.showLabel = this.isMobileScreen;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;
    console.log('✅ Formulaire soumis avec :', this.loginForm.value);

    this.authService.login({ username, password }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/Dashbord']);
      },
      error: () => {
        this.errorMessage = 'Email ou mot de passe invalide';
      }
    });
  }

  forgotPassword() {
    this.showForgotPasswordPopup = true;
  }

  closePopup() {
    this.showForgotPasswordPopup = false;
    this.resetPasswordForm.reset();
    this.showSuccessMessage = false;
  }

onResetPassword() {
  if (this.resetPasswordForm.invalid) return;
  const email = this.resetPasswordForm.value.email;
  
  this.isLoading = true;
  this.showSuccessMessage = false;
  
  setTimeout(() => {
    this.isLoading = false;
    this.showSuccessMessage = true;
  }, 2000);

  this.authService.forgotPassword(email).subscribe({
    error: (error) => {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  });
}

}

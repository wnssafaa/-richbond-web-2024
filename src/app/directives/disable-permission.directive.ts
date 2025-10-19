import { Directive, Input, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appDisablePermission]'
})
export class DisablePermissionDirective implements OnInit, OnDestroy {
  @Input() appDisablePermission: string = '';
  private currentUserRole: string = '';
  private userSubscription?: Subscription;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer le rôle de l'utilisateur connecté
    this.userSubscription = this.authService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        this.currentUserRole = userInfo.role || '';
        this.updateElementState();
      },
      error: () => {
        this.currentUserRole = '';
        this.updateElementState();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateElementState(): void {
    let shouldDisable = false;

    switch (this.appDisablePermission) {
      case 'canRead':
        shouldDisable = !this.permissionService.canRead(this.currentUserRole);
        break;
      case 'canWrite':
        shouldDisable = !this.permissionService.canWrite(this.currentUserRole);
        break;
      case 'canAdd':
        shouldDisable = !this.permissionService.canAdd(this.currentUserRole);
        break;
      case 'canEdit':
        shouldDisable = !this.permissionService.canEdit(this.currentUserRole);
        break;
      case 'canDelete':
        shouldDisable = !this.permissionService.canDelete(this.currentUserRole);
        break;
      case 'isConsultant':
        shouldDisable = this.permissionService.isConsultant(this.currentUserRole);
        break;
      case 'isAdmin':
        shouldDisable = !this.permissionService.isAdmin(this.currentUserRole);
        break;
      case 'isSuperviseur':
        shouldDisable = !this.permissionService.isSuperviseur(this.currentUserRole);
        break;
      case 'isMerchandiseur':
        shouldDisable = !this.permissionService.isMerchandiseur(this.currentUserRole);
        break;
      case 'isResponsableAnimateur':
        shouldDisable = !this.permissionService.isResponsableAnimateur(this.currentUserRole);
        break;
      default:
        shouldDisable = false;
    }

    // Désactiver l'élément
    if (shouldDisable) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', true);
      this.renderer.addClass(this.elementRef.nativeElement, 'disabled-by-permission');
      
      // Ajouter un tooltip informatif si c'est un consultant
      if (this.appDisablePermission === 'isConsultant' || this.permissionService.isConsultant(this.currentUserRole)) {
        this.renderer.setAttribute(this.elementRef.nativeElement, 'title', 'Accès lecture seule - Action non autorisée');
        this.renderer.addClass(this.elementRef.nativeElement, 'consultant-disabled');
      }
    } else {
      this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', false);
      this.renderer.removeClass(this.elementRef.nativeElement, 'disabled-by-permission');
      this.renderer.removeClass(this.elementRef.nativeElement, 'consultant-disabled');
    }
  }
}

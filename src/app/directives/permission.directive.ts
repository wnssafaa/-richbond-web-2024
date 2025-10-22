import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appPermission]'
})
export class PermissionDirective implements OnInit {
  @Input() appPermission: string = '';
  @Input() appPermissionDisable: boolean = false; // Nouvelle option pour désactiver au lieu de masquer
  private currentUserRole: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer le rôle de l'utilisateur connecté
    this.authService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        this.currentUserRole = userInfo.role || '';
        this.updateView();
      },
      error: () => {
        this.currentUserRole = '';
        this.updateView();
      }
    });
  }

  private updateView(): void {
    let hasPermission = false;

    switch (this.appPermission) {
      case 'canRead':
        hasPermission = this.permissionService.canRead(this.currentUserRole);
        break;
      case 'canWrite':
        hasPermission = this.permissionService.canWrite(this.currentUserRole);
        break;
      case 'canAdd':
        hasPermission = this.permissionService.canAdd(this.currentUserRole);
        break;
      case 'canEdit':
        hasPermission = this.permissionService.canEdit(this.currentUserRole);
        break;
      case 'canDelete':
        hasPermission = this.permissionService.canDelete(this.currentUserRole);
        break;
      case 'isConsultant':
        hasPermission = this.permissionService.isConsultant(this.currentUserRole);
        break;
      case 'isAdmin':
        hasPermission = this.permissionService.isAdmin(this.currentUserRole);
        break;
      case 'isSuperviseur':
        hasPermission = this.permissionService.isSuperviseur(this.currentUserRole);
        break;
      case 'isMerchandiseur':
        hasPermission = this.permissionService.isMerchandiseur(this.currentUserRole);
        break;
      case 'isResponsableAnimateur':
        hasPermission = this.permissionService.isResponsableAnimateur(this.currentUserRole);
        break;
      default:
        hasPermission = false;
    }

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

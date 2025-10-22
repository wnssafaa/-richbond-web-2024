# Guide de mise à jour rapide des permissions

## 🚀 Étapes pour appliquer les permissions à un composant

### 1. **Imports à ajouter**
```typescript
import { PermissionService } from '../../services/permission.service';
import { PermissionDirectivesModule } from '../../directives/permission-directives.module';
```

### 2. **Ajouter au tableau imports du @Component**
```typescript
@Component({
  imports: [
    // ... autres imports
    PermissionDirectivesModule
  ]
})
```

### 3. **Ajouter au constructeur**
```typescript
constructor(
  // ... autres services
  private permissionService: PermissionService
) {}
```

### 4. **Ajouter les propriétés de permissions**
```typescript
export class MonComposant {
  // ... autres propriétés
  
  // Permissions de l'utilisateur
  canEdit = false;
  canDelete = false;
  canAdd = false;
  isConsultant = false;
}
```

### 5. **Ajouter la méthode d'initialisation**
```typescript
private initializePermissions(userRole: string): void {
  this.canEdit = this.permissionService.canEdit(userRole);
  this.canDelete = this.permissionService.canDelete(userRole);
  this.canAdd = this.permissionService.canAdd(userRole);
  this.isConsultant = this.permissionService.isConsultant(userRole);
}
```

### 6. **Appeler dans loadCurrentUser**
```typescript
loadCurrentUser(): void {
  this.authService.getCurrentUserInfo().subscribe({
    next: (data) => {
      // ... autres propriétés
      this.initializePermissions(data.role);
    }
  });
}
```

### 7. **Modifier le template HTML**
```html
<!-- Boutons d'ajout -->
<button mat-raised-button 
        (click)="ajouter()"
        appDisablePermission="canAdd">
  Ajouter
</button>

<!-- Boutons d'édition -->
<button mat-icon-button 
        (click)="edit(item)"
        appDisablePermission="canEdit">
  <mat-icon>edit</mat-icon>
</button>

<!-- Boutons de suppression -->
<button mat-icon-button 
        (click)="delete(item)"
        appDisablePermission="canDelete">
  <mat-icon>delete</mat-icon>
</button>

<!-- Message pour consultants -->
<div *ngIf="isConsultant" class="consultant-readonly-message">
  <mat-icon>info</mat-icon>
  <span>Mode lecture seule</span>
</div>
```

## 📋 Composants à mettre à jour

- [x] ✅ gestion-visites
- [x] ✅ produit  
- [ ] ⏳ superviseurs
- [ ] ⏳ merchandiseur
- [ ] ⏳ planification
- [ ] ⏳ users
- [ ] ⏳ magasins
- [ ] ⏳ gestion-stock
- [ ] ⏳ parametres














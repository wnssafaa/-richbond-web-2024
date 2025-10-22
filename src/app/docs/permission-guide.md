# Guide d'utilisation des Permissions - Rôle CONSULTANT

## 🎯 Objectif
Ce guide explique comment implémenter les permissions pour le rôle CONSULTANT avec désactivation des boutons CRUD au lieu de les masquer.

## 📋 Résumé des modifications

### ✅ Rôles disponibles
```typescript
export enum Role {
    ADMIN = 'ADMIN',
    SUPERVISEUR = 'SUPERVISEUR', 
    MERCHANDISEUR_MONO = 'MERCHANDISEUR_MONO',
    MERCHANDISEUR_MULTI = 'MERCHANDISEUR_MULTI',
    RESPONSABLE_ANIMATEUR = 'RESPONSABLE_ANIMATEUR',
    CONSULTANT = 'CONSULTANT'  // Accès lecture seule
}
```

### 🔧 Services créés

#### 1. PermissionService (`src/app/services/permission.service.ts`)
Service centralisé pour gérer toutes les permissions :
```typescript
// Méthodes principales
canRead(userRole: string): boolean     // Lecture (tous les rôles)
canWrite(userRole: string): boolean    // Écriture (sauf CONSULTANT)
canAdd(userRole: string): boolean      // Ajouter (sauf CONSULTANT)
canEdit(userRole: string): boolean     // Modifier (sauf CONSULTANT)
canDelete(userRole: string): boolean   // Supprimer (sauf CONSULTANT)
isConsultant(userRole: string): boolean // Vérifier si consultant
```

#### 2. DisablePermissionDirective (`src/app/directives/disable-permission.directive.ts`)
Directive pour désactiver les éléments selon les permissions :
```html
<button appDisablePermission="canEdit">Modifier</button>
<button appDisablePermission="canDelete">Supprimer</button>
<button appDisablePermission="isConsultant">Action consultant</button>
```

## 🚀 Comment utiliser dans vos composants

### 1. **Importer les dépendances**
```typescript
import { PermissionService } from '../../services/permission.service';
import { DisablePermissionDirective } from '../../directives/disable-permission.directive';

@Component({
  imports: [
    // ... autres imports
    DisablePermissionDirective
  ]
})
```

### 2. **Injecter le service dans le constructeur**
```typescript
constructor(
  // ... autres services
  private permissionService: PermissionService
) {}
```

### 3. **Ajouter les propriétés de permissions**
```typescript
export class MonComposant implements OnInit {
  // Permissions de l'utilisateur
  canEdit = false;
  canDelete = false;
  canAdd = false;
  isConsultant = false;
  
  ngOnInit(): void {
    this.loadCurrentUser();
  }
  
  private loadCurrentUser(): void {
    this.authService.getCurrentUserInfo().subscribe({
      next: (data) => {
        this.role = data.role ?? '';
        this.initializePermissions(this.role);
      }
    });
  }
  
  private initializePermissions(userRole: string): void {
    this.canEdit = this.permissionService.canEdit(userRole);
    this.canDelete = this.permissionService.canDelete(userRole);
    this.canAdd = this.permissionService.canAdd(userRole);
    this.isConsultant = this.permissionService.isConsultant(userRole);
  }
}
```

### 4. **Utiliser dans les templates HTML**

#### **Approche 1: Directive de désactivation (Recommandée)**
```html
<!-- Boutons CRUD désactivés pour les consultants -->
<button mat-raised-button 
        (click)="ajouterProduit()"
        appDisablePermission="canAdd">
  Ajouter
</button>

<button mat-icon-button 
        (click)="editProduit(item)"
        appDisablePermission="canEdit">
  <mat-icon>edit</mat-icon>
</button>

<button mat-icon-button 
        (click)="deleteProduit(item)"
        appDisablePermission="canDelete">
  <mat-icon>delete</mat-icon>
</button>

<!-- Bouton d'import/export désactivé -->
<button mat-raised-button 
        (click)="openImportDialog()"
        appDisablePermission="canAdd">
  Importer
</button>
```

#### **Approche 2: Vérification conditionnelle**
```html
<!-- Boutons conditionnels -->
<button mat-raised-button 
        (click)="ajouterProduit()"
        [disabled]="!canAdd">
  Ajouter
</button>

<!-- Message informatif pour consultants -->
<div *ngIf="isConsultant" class="consultant-readonly-message">
  <mat-icon>info</mat-icon>
  <span>Mode lecture seule - Actions désactivées</span>
</div>
```

## 🎨 Styles CSS

### **Fichier de styles globaux** (`src/app/styles/permission-styles.css`)
```css
/* Éléments désactivés par permissions */
.disabled-by-permission {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.consultant-disabled::after {
  content: "🔒";
  /* Indicateur visuel de cadenas */
}
```

### **Message informatif consultant**
```css
.consultant-readonly-message {
  background-color: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef6c00;
}
```

## 📝 Exemples d'implémentation

### **Composant Produit**
```html
<!-- Bouton d'ajout -->
<button mat-raised-button 
        (click)="ajouterProduit()"
        appDisablePermission="canAdd">
  Ajouter
</button>

<!-- Boutons d'action dans le tableau -->
<button mat-icon-button 
        (click)="editProduit(produit)"
        appDisablePermission="canEdit">
  <mat-icon>edit</mat-icon>
</button>

<button mat-icon-button 
        (click)="deleteProduit(produit)"
        appDisablePermission="canDelete">
  <mat-icon>delete</mat-icon>
</button>
```

### **Composant Gestion Visites**
```html
<!-- Boutons d'action -->
<button mat-icon-button 
        (click)="editVisit(visit)"
        appDisablePermission="canEdit">
  <mat-icon>edit</mat-icon>
</button>

<button mat-icon-button 
        (click)="deleteVisit(visit)"
        appDisablePermission="canDelete">
  <mat-icon>delete</mat-icon>
</button>

<!-- Boutons d'import/export -->
<button mat-raised-button 
        (click)="openImportDialog()"
        appDisablePermission="canAdd">
  Importer
</button>

<button mat-raised-button 
        (click)="exportToExcel()"
        appDisablePermission="canWrite">
  Exporter
</button>
```

## 🔍 Comportement attendu

### **Pour les CONSULTANTS :**
- ✅ **Peuvent voir** tous les dashboards et composants
- ✅ **Peuvent lire** toutes les données
- ❌ **Ne peuvent pas** cliquer sur les boutons CRUD (désactivés)
- ❌ **Ne peuvent pas** importer/exporter des données
- 🔒 **Indicateur visuel** : boutons grisés avec icône de cadenas

### **Pour les autres rôles :**
- ✅ **Accès complet** à toutes les fonctionnalités
- ✅ **Tous les boutons** fonctionnels
- ✅ **Toutes les actions** disponibles

## 🧪 Composant de test

Utilisez le composant `PermissionDemoComponent` (`src/app/component/permission-demo/`) pour tester les permissions avec différents rôles.

## 📋 Checklist d'implémentation

Pour chaque composant CRUD :

- [ ] Importer `PermissionService` et `DisablePermissionDirective`
- [ ] Ajouter les propriétés de permissions (`canEdit`, `canDelete`, etc.)
- [ ] Initialiser les permissions dans `loadCurrentUser()`
- [ ] Ajouter `appDisablePermission` aux boutons d'action
- [ ] Ajouter un message informatif pour les consultants
- [ ] Tester avec un utilisateur consultant
- [ ] Vérifier que les boutons sont désactivés et non masqués

## 🚨 Points d'attention

1. **Import du fichier CSS** : Assurez-vous d'importer `permission-styles.css` dans votre `angular.json` ou `styles.css`
2. **Directive dans imports** : N'oubliez pas d'ajouter `DisablePermissionDirective` dans les imports du composant
3. **Test avec différents rôles** : Testez toujours avec un utilisateur consultant pour vérifier le comportement
4. **Cohérence** : Utilisez la même approche dans tous vos composants CRUD








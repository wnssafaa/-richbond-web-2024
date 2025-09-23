# Composant Login History

## Description
Le composant `LoginHistoryComponent` affiche l'historique des connexions et déconnexions des utilisateurs de l'application. Il a été extrait du dashboard pour être un composant réutilisable et indépendant.

## Fonctionnalités

### 🔍 Filtrage avancé
- **Recherche textuelle** : Par nom d'utilisateur, nom complet, ou adresse IP
- **Filtre par rôle** : ADMIN, SUPERVISEUR, MERCHANDISEUR_MONO, MERCHANDISEUR_MULTI
- **Filtre par statut** : ACTIVE, INACTIVE
- **Filtre par plage de dates** : Sélection de période personnalisée

### 📊 Affichage des données
- **Informations utilisateur** : Avatar, nom d'utilisateur, nom complet
- **Horodatage** : Date et heure de connexion/déconnexion
- **Durée de session** : Calcul automatique avec formatage (heures/minutes)
- **Adresse IP** : Affichage de l'adresse IP de connexion
- **Indicateurs visuels** : Chips colorés pour les rôles et statuts

### 🎨 Interface utilisateur
- **Design responsive** : Optimisé pour desktop, tablette et mobile
- **Pagination** : Options 5, 10, 20, 50 éléments par page
- **États de chargement** : Spinner et messages d'état
- **Gestion d'erreurs** : Messages d'erreur clairs
- **Export** : Bouton d'export (préparé pour implémentation future)

## Structure des fichiers

```
src/app/component/login-history/
├── login-history.component.ts          # Logique du composant
├── login-history.component.html        # Template HTML
├── login-history.component.css         # Styles CSS
├── login-history.component.spec.ts     # Tests unitaires
└── README.md                          # Documentation
```

## Utilisation

### Dans un template HTML
```html
<app-login-history></app-login-history>
```

### Import dans un composant
```typescript
import { LoginHistoryComponent } from './login-history/login-history.component';

@Component({
  imports: [LoginHistoryComponent],
  // ...
})
```

## API

### Méthodes publiques
- `loadLoginHistory()` : Charge les données depuis le service
- `applyFilters()` : Applique les filtres sélectionnés
- `resetFilters()` : Réinitialise tous les filtres
- `refresh()` : Rafraîchit les données
- `exportToExcel()` : Exporte les données (à implémenter)

### Propriétés
- `loginHistory: any[]` : Données d'historique
- `dataSource: MatTableDataSource` : Source de données pour le tableau
- `isLoading: boolean` : État de chargement
- `errorMessage: string` : Message d'erreur

## Dépendances

### Services
- `AuthService` : Pour récupérer l'historique de connexion
- `DatePipe` : Pour le formatage des dates

### Modules Angular Material
- `MatTableModule` : Tableau de données
- `MatPaginatorModule` : Pagination
- `MatCardModule` : Cartes
- `MatFormFieldModule` : Champs de formulaire
- `MatSelectModule` : Sélecteurs
- `MatChipsModule` : Chips
- `MatIconModule` : Icônes
- `MatButtonModule` : Boutons
- `MatTooltipModule` : Tooltips
- `MatProgressSpinnerModule` : Spinner de chargement

### Modules externes
- `TranslateModule` : Internationalisation
- `FormsModule` : Formulaires réactifs

## Traductions

Le composant utilise les clés de traduction suivantes :

```json
{
  "LOGIN_HISTORY": {
    "TITLE": "Historique des Connexions",
    "LOGIN_TIME": "Connexion",
    "LOGOUT_TIME": "Déconnexion",
    "SESSION_DURATION": "Durée de session",
    "IP_ADDRESS": "Adresse IP",
    "SEARCH_PLACEHOLDER": "Rechercher par nom, email ou IP...",
    "NO_DATA": "Aucun historique de connexion disponible"
  }
}
```

## Tests

Le composant inclut des tests unitaires complets couvrant :
- Création du composant
- Chargement des données
- Application des filtres
- Réinitialisation des filtres
- Formatage des dates
- Calcul de durée de session
- Gestion des sessions actives

## Responsive Design

Le composant s'adapte automatiquement aux différentes tailles d'écran :
- **Desktop** : Affichage complet avec sidebar
- **Tablette** : Layout adapté avec filtres empilés
- **Mobile** : Interface compacte avec navigation optimisée

## Accessibilité

- Support des lecteurs d'écran
- Navigation au clavier
- Contraste de couleurs approprié
- Labels et tooltips descriptifs


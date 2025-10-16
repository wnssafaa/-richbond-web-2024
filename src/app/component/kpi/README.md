# Module KPI - Indicateurs de Performance

## 📊 Vue d'ensemble

Le module KPI (Indicateurs de Performance) fournit une vue d'ensemble complète des performances de l'application Richbond. Il est accessible uniquement aux utilisateurs avec les rôles **Super Admin** et **Superviseur**.

## 🎯 KPIs Implémentés

### 1. Suivi des Affectations par Merchandiser
- **Objectif** : Suivre les affectations assignées à chaque merchandiser
- **Métriques** :
  - Total des assignations
  - Assignations complétées vs en attente
  - Taux de completion par merchandiser
  - Temps moyen de completion
  - Dernière activité

### 2. Taux d'Utilisation Globale de l'Application
- **Objectif** : Mesurer l'adoption et l'utilisation de l'application
- **Métriques** :
  - Nombre total d'utilisateurs
  - Utilisateurs actifs (quotidien, hebdomadaire, mensuel)
  - Durée moyenne des sessions
  - Fonctionnalités les plus utilisées
  - Statistiques de connexion

### 3. Finalisation des Rapports par Merchandiser
- **Objectif** : Suivre la progression des rapports de visite
- **Métriques** :
  - Total des rapports par merchandiser
  - Rapports complétés vs incomplets
  - Taux de completion
  - Temps moyen de finalisation
  - Évolution dans le temps

## 🛠️ Architecture Technique

### Composants
- **`KpiComponent`** : Composant principal avec onglets et graphiques
- **`KpiService`** : Service de gestion des données KPI
- **`RoleGuard`** : Guard de protection des routes par rôle

### Technologies Utilisées
- **Chart.js** : Graphiques interactifs
- **Angular Material** : Interface utilisateur
- **RxJS** : Gestion des données asynchrones
- **Angular i18n** : Internationalisation

### Structure des Données

```typescript
interface MerchandiserAssignmentTracking {
  merchandiserId: number;
  merchandiserName: string;
  region: string;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  completionRate: number;
  averageCompletionTime: string;
  lastActivityDate: string;
}
```

## 📈 Types de Graphiques

1. **Bar Chart** : Suivi des affectations
2. **Doughnut Chart** : Utilisation globale
3. **Bar Chart Horizontal** : Finalisation des rapports
4. **Line Chart** : Évolution des taux de completion

## 🔐 Sécurité et Permissions

### Rôles Autorisés
- `SUPER_ADMIN`
- `SUPERVISEUR`
- `Admin`

### Protection des Routes
```typescript
{ path: 'kpi', component: KpiComponent, canActivate: [AuthGuard] }
```

## 🎨 Interface Utilisateur

### Fonctionnalités
- **Filtres** : Par région et période
- **Export** : Excel et PDF (à implémenter)
- **Responsive Design** : Adaptation mobile/desktop
- **Thème Material** : Interface cohérente

### Navigation
- Lien dans la sidebar : "KPI" avec icône `analytics`
- Route : `/kpi`

## 📊 Mock Data

Le service utilise actuellement des données fictives pour le développement :

```typescript
// Exemple de données mock
const mockAssignmentData = [
  {
    merchandiserId: 1,
    merchandiserName: "Ahmed Benali",
    region: "Casablanca-Settat",
    totalAssignments: 45,
    completedAssignments: 38,
    completionRate: 84.4
  }
  // ... autres merchandisers
];
```

## 🚀 Prochaines Étapes

### Phase 1 - Intégration Backend
- [ ] Connecter aux APIs réelles
- [ ] Remplacer les mock data
- [ ] Implémenter la gestion d'erreurs

### Phase 2 - Fonctionnalités Avancées
- [ ] Export Excel/PDF
- [ ] Filtres avancés (dates, merchandisers)
- [ ] Notifications en temps réel
- [ ] Alertes de performance

### Phase 3 - Optimisations
- [ ] Mise en cache des données
- [ ] Pagination pour grandes volumes
- [ ] Tests unitaires
- [ ] Documentation API

## 🔧 Configuration

### Variables d'Environnement
```typescript
// Dans environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080/api',
  kpiEndpoint: '/kpi'
};
```

### Dépendances Requises
```json
{
  "chart.js": "^4.5.0",
  "ng2-charts": "^5.0.0",
  "@angular/material": "^17.3.10"
}
```

## 📝 Notes de Développement

- Les graphiques se mettent à jour automatiquement lors des changements de filtres
- Le composant gère la destruction propre des graphiques Chart.js
- Support multilingue avec ngx-translate
- Design responsive avec breakpoints Material

## 🐛 Débogage

### Problèmes Courants
1. **Graphiques non affichés** : Vérifier que Chart.js est bien enregistré
2. **Erreur de permissions** : Vérifier le rôle de l'utilisateur connecté
3. **Données manquantes** : Vérifier les appels API dans le service

### Logs Utiles
```typescript
// Activer les logs dans KpiService
console.log('KPI Data loaded:', data);
console.log('Chart created:', chartId);
```

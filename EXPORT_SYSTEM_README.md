# Système d'Exportation de Données - Richbond

## Vue d'ensemble

Le système d'exportation permet d'exporter les données de tous les composants de l'application vers des fichiers Excel (.xlsx). Il utilise un service centralisé `ExportService` qui gère l'exportation de différents types de données.

## Fonctionnalités

### Types de données exportables

1. **Utilisateurs** - Tous les utilisateurs (superviseurs et merchandisers)
2. **Merchandisers** - Merchandisers avec leurs informations détaillées
3. **Magasins** - Magasins avec leurs informations et assignations
4. **Visites** - Visites avec détails complets
5. **Produits** - Catalogue de produits
6. **Superviseurs** - Superviseurs avec leurs équipes
7. **Planifications** - Planifications des visites

### Formats d'exportation

- **Excel (.xlsx)** - Format principal avec feuilles multiples
- **Formatage automatique** - Dates, nombres, et textes formatés
- **Noms de fichiers dynamiques** - Incluent la date et l'heure d'exportation

## Utilisation

### Exportation simple

Chaque composant a un bouton "Exporter" qui permet d'exporter les données affichées :

```typescript
exportToExcel(): void {
  this.exportService.exportMerchandisers(this.dataSource.data, {
    filename: 'merchandisers',
    sheetName: 'Merchandisers'
  });
}
```

### Exportation multi-feuilles

Pour exporter plusieurs types de données dans un seul fichier :

```typescript
this.exportService.exportAllData({
  users: usersData,
  merchandisers: merchandisersData,
  magasins: magasinsData,
  visits: visitsData,
  produits: produitsData,
  superviseurs: superviseursData,
  planifications: planificationsData
}, {
  filename: 'export_complet',
  sheetName: 'Données'
});
```

## Configuration

### Options d'exportation

```typescript
interface ExportOptions {
  filename?: string;           // Nom du fichier (sans extension)
  sheetName?: string;          // Nom de la feuille Excel
  includeHeaders?: boolean;    // Inclure les en-têtes (défaut: true)
  dateFormat?: string;         // Format des dates (défaut: 'DD/MM/YYYY')
}
```

### Personnalisation des colonnes

Chaque type d'exportation peut être personnalisé en modifiant les méthodes correspondantes dans `ExportService` :

```typescript
exportMerchandisers(merchandisers: Merchendiseur[], options: ExportOptions = {}): void {
  const exportData = merchandisers.map(merch => ({
    'ID': merch.id,
    'Nom': merch.nom,
    'Prénom': merch.prenom,
    // ... autres colonnes
  }));
  
  this.exportToExcel(exportData, {
    filename: 'merchandisers',
    sheetName: 'Merchandisers',
    ...options
  });
}
```

## Composants avec exportation

### 1. Merchandisers (`/merchendiseur`)
- **Bouton** : "Exporter" (vert)
- **Données** : Liste complète des merchandisers
- **Colonnes** : ID, Nom, Prénom, Email, Téléphone, Région, Ville, Marques, Rôle, Statut, etc.

### 2. Utilisateurs (`/users`)
- **Bouton** : "Exporter" (vert)
- **Données** : Tous les utilisateurs (superviseurs + merchandisers)
- **Format** : Fichier multi-feuilles

### 3. Magasins (`/magasins`)
- **Bouton** : "Exporter" (vert)
- **Données** : Liste des magasins avec assignations
- **Colonnes** : ID, Nom, Localisation, Région, Ville, Type, Enseigne, Merchandiser, Superviseur, etc.

### 4. Superviseurs (`/superviseur`)
- **Bouton** : "Exporter" (vert)
- **Données** : Liste des superviseurs
- **Colonnes** : ID, Nom, Prénom, Email, Téléphone, Région, Ville, Statut, etc.

### 5. Produits (`/Produit`)
- **Bouton** : "Exporter" (vert)
- **Données** : Catalogue des produits
- **Colonnes** : ID, Marque, Référence, Catégorie, Article, Type, Dimensions, Prix, etc.

### 6. Visites (`/gestion-visites`)
- **Bouton** : "Exporter" (vert)
- **Données** : Historique des visites
- **Colonnes** : ID, Heure d'arrivée, Heure de départ, Magasin, Merchandiser, Date, Statut, etc.

### 7. Planifications (`/planification`)
- **Bouton** : "Exporter" (vert)
- **Données** : Planifications des visites
- **Colonnes** : ID, Date de visite, Statut, Magasin, Merchandiser, Commentaire, etc.

## Dépendances

Le système utilise les packages suivants :

```json
{
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5"
}
```

## Installation

```bash
npm install xlsx file-saver
```

## Structure des fichiers

```
src/app/services/
├── export.service.ts          # Service principal d'exportation
└── ...

src/app/component/
├── merchendiseur/
│   ├── merchendiseur.component.ts
│   └── merchendiseur.component.html
├── users/
│   ├── users.component.ts
│   └── users.component.html
└── ... (autres composants)
```

## Exemples d'utilisation

### Exportation basique

```typescript
// Dans un composant
constructor(private exportService: ExportService) {}

exportData() {
  this.exportService.exportUsers(this.users, {
    filename: 'mes_utilisateurs',
    sheetName: 'Utilisateurs'
  });
}
```

### Exportation avec formatage personnalisé

```typescript
exportData() {
  this.exportService.exportToExcel(this.data, {
    filename: 'rapport',
    sheetName: 'Données',
    dateFormat: 'DD/MM/YYYY HH:mm'
  });
}
```

## Notes techniques

- Les fichiers sont téléchargés automatiquement dans le dossier de téléchargements par défaut
- Les noms de fichiers incluent automatiquement la date et l'heure d'exportation
- Le formatage des dates est automatique selon les options spécifiées
- Les données sont exportées telles qu'elles sont affichées dans les tableaux (avec filtres appliqués)

## Support

Pour toute question ou problème avec le système d'exportation, consultez les logs de la console ou contactez l'équipe de développement.


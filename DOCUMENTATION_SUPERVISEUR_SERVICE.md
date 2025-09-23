# Documentation du Service Superviseur

## Vue d'ensemble
Le service `SuperveseurService` gère les opérations CRUD et de recherche pour les superviseurs dans l'application Richbond. Il communique avec l'API backend via HTTP.

## Interface Superviseur

### Structure des données exportées

```typescript
export interface Superviseur {
  id?: number;                    // Identifiant unique (optionnel)
  nom: string;                    // Nom de famille du superviseur
  username?: string;              // Nom d'utilisateur (optionnel)
  password?: string;              // Mot de passe (optionnel)
  prenom: string;                 // Prénom du superviseur
  ville: string;                  // Ville de résidence
  status: string;                 // Statut du superviseur
  telephone: string;              // Numéro de téléphone
  email: string;                  // Adresse email
  region: Region;                 // Région d'affectation (enum)
  merchendiseurIds: number[];     // IDs des merchandisers associés
  merchendiseurs: Merchendiseur[]; // Objets merchandisers complets
  magasin: string;                // Nom du magasin
  marquesCouvertes: string;       // Marques couvertes par le superviseur
  dateIntegration?: string;       // Date d'intégration (optionnel)
  dateSortie?: string;            // Date de sortie (optionnel)
  imagePath?: string;             // Chemin vers l'image de profil (optionnel)
}
```

### Champs obligatoires
- `nom`: Nom de famille
- `prenom`: Prénom
- `ville`: Ville de résidence
- `status`: Statut actuel
- `telephone`: Numéro de téléphone
- `email`: Adresse email
- `region`: Région d'affectation
- `merchendiseurIds`: Liste des IDs des merchandisers
- `merchendiseurs`: Liste des objets merchandisers
- `magasin`: Nom du magasin
- `marquesCouvertes`: Marques couvertes

### Champs optionnels
- `id`: Identifiant unique (généré par le backend)
- `username`: Nom d'utilisateur
- `password`: Mot de passe
- `dateIntegration`: Date d'intégration
- `dateSortie`: Date de sortie
- `imagePath`: Chemin de l'image de profil

## Enum Region

Les régions disponibles pour l'affectation des superviseurs :

```typescript
export enum Region {
  TANGER_TETOUAN_AL_HOCEIMA = 'Tanger-Tétouan-Al Hoceïma',
  ORIENTAL = "L'Oriental",
  FES_MEKNES = 'Fès-Meknès',
  RABAT_SALE_KENITRA = 'Rabat-Salé-Kénitra',
  BENI_MELLAL_KHENIFRA = 'Béni Mellal-Khénifra',
  CASABLANCA_SETTAT = 'Casablanca-Settat',
  MARRAKECH_SAFI = 'Marrakech-Safi',
  DRAA_TAFILALET = 'Drâa-Tafilalet',
  SOUSS_MASSA = 'Souss-Massa',
  GUELMIM_OUED_NOUN = 'Guelmim-Oued Noun',
  LAAYOUNE_SAKIA_EL_HAMRA = 'Laâyoune-Sakia El Hamra',
  DAKHLA_OUED_ED_DAHAB = 'Dakhla-Oued Ed Dahab',
  SUD = 'Sud',
  NORD = 'Nord',
  ORIENT = 'Orient',
  CENTRE = 'Centre'
}
```

## Interface Merchendiseur (référencée)

```typescript
export interface Merchendiseur {
  id?: number;
  nom: string;
  prenom: string;
  region: Region;
  ville: string;
  telephone: string;
  marqueCouverte: string;
  localisation: string;
  status: string;
  role: Role;
  email: string;
  magasinIds: number[];
  marques: string[];
  superviseurId?: number | null;
  superviseur?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  enseignes: string[];
  dateDebutIntegration?: string;
  dateSortie?: string;
  imagePath?: string;
}
```

## Méthodes du Service

### 1. Récupération des données

#### `getAll(): Observable<Superviseur[]>`
- **Description**: Récupère tous les superviseurs
- **Retour**: Observable contenant un tableau de superviseurs
- **Endpoint**: `GET /api/superviseur/all`

#### `getById(id: number): Observable<Superviseur>`
- **Description**: Récupère un superviseur par son ID
- **Paramètres**: `id` - Identifiant du superviseur
- **Retour**: Observable contenant le superviseur
- **Endpoint**: `GET /api/superviseur/{id}`

### 2. Recherche

#### `searchByName(nom: string): Observable<Superviseur[]>`
- **Description**: Recherche des superviseurs par nom
- **Paramètres**: `nom` - Nom à rechercher
- **Retour**: Observable contenant un tableau de superviseurs
- **Endpoint**: `GET /api/superviseur/search?nom={nom}`

#### `searchByEmail(email: string): Observable<Superviseur>`
- **Description**: Recherche un superviseur par email
- **Paramètres**: `email` - Email à rechercher
- **Retour**: Observable contenant le superviseur
- **Endpoint**: `GET /api/superviseur/search?email={email}`

#### `searchByRegion(region: string): Observable<Superviseur[]>`
- **Description**: Recherche des superviseurs par région
- **Paramètres**: `region` - Région à rechercher
- **Retour**: Observable contenant un tableau de superviseurs
- **Endpoint**: `GET /api/superviseur/search?region={region}`

### 3. Création et modification

#### `create(superviseur: Superviseur): Observable<Superviseur>`
- **Description**: Crée un nouveau superviseur avec protection contre les appels multiples
- **Paramètres**: `superviseur` - Objet superviseur à créer
- **Retour**: Observable contenant le superviseur créé
- **Endpoint**: `POST /api/superviseur/create`
- **Protection**: 
  - Délai minimum de 30 secondes entre les appels
  - Blocage des appels simultanés
  - Logs détaillés pour le debugging

#### `update(id: number, superviseur: Superviseur): Observable<Superviseur>`
- **Description**: Met à jour un superviseur existant
- **Paramètres**: 
  - `id` - Identifiant du superviseur
  - `superviseur` - Objet superviseur modifié
- **Retour**: Observable contenant le superviseur mis à jour
- **Endpoint**: `PUT /api/superviseur/{id}`

### 4. Suppression

#### `delete(id: number): Observable<void>`
- **Description**: Supprime un superviseur
- **Paramètres**: `id` - Identifiant du superviseur à supprimer
- **Retour**: Observable vide
- **Endpoint**: `DELETE /api/superviseur/{id}`

### 5. Gestion du statut

#### `updateStatus(id: number, status: string): Observable<Superviseur>`
- **Description**: Met à jour le statut d'un superviseur
- **Paramètres**: 
  - `id` - Identifiant du superviseur
  - `status` - Nouveau statut
- **Retour**: Observable contenant le superviseur mis à jour
- **Endpoint**: `PUT /api/superviseur/status/{id}?status={status}`

### 6. Gestion des merchandisers

#### `addMerchendiseur(superviseurId: number, merchendiseur: any): Observable<Superviseur>`
- **Description**: Ajoute un merchandiser à un superviseur
- **Paramètres**: 
  - `superviseurId` - ID du superviseur
  - `merchendiseur` - Objet merchandiser à ajouter
- **Retour**: Observable contenant le superviseur mis à jour
- **Endpoint**: `POST /api/superviseur/{superviseurId}/merchandiseurs`

#### `removeMerchendiseur(superviseurId: number, merchendiseurId: number): Observable<Superviseur>`
- **Description**: Retire un merchandiser d'un superviseur
- **Paramètres**: 
  - `superviseurId` - ID du superviseur
  - `merchendiseurId` - ID du merchandiser à retirer
- **Retour**: Observable contenant le superviseur mis à jour
- **Endpoint**: `DELETE /api/superviseur/{superviseurId}/merchandiseurs/{merchendiseurId}`

## Configuration

- **URL de base**: `http://localhost:8080/api/superviseur`
- **Injection**: Service injectable au niveau racine (`providedIn: 'root'`)
- **Dépendances**: `HttpClient` pour les appels API

## Gestion des erreurs

Le service implémente une protection contre les appels multiples dans la méthode `create()` :
- Vérification du délai minimum (30 secondes)
- Blocage des appels simultanés
- Messages de log détaillés
- Gestion des erreurs avec des Observables personnalisés

## Exemple d'utilisation

```typescript
// Injection du service
constructor(private superviseurService: SuperveseurService) {}

// Récupération de tous les superviseurs
this.superviseurService.getAll().subscribe(superviseurs => {
  console.log('Superviseurs:', superviseurs);
});

// Création d'un nouveau superviseur
const nouveauSuperviseur: Superviseur = {
  nom: 'Dupont',
  prenom: 'Jean',
  ville: 'Casablanca',
  status: 'ACTIF',
  telephone: '0123456789',
  email: 'jean.dupont@example.com',
  region: Region.CASABLANCA_SETTAT,
  merchendiseurIds: [],
  merchendiseurs: [],
  magasin: 'Magasin Central',
  marquesCouvertes: 'Nike, Adidas'
};

this.superviseurService.create(nouveauSuperviseur).subscribe(
  superviseur => console.log('Superviseur créé:', superviseur),
  error => console.error('Erreur:', error)
);
```

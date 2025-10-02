# 🧪 Guide de Test - Intégration des Cartes

## ✅ Tests à effectuer

### 1. Test OpenStreetMap (Gratuit)

#### Prérequis

- Aucune configuration requise
- Connexion internet

#### Étapes de test

1. **Ouvrir l'application**
2. **Aller à "Ajouter un magasin"**
3. **Cliquer sur "Choisir sur la carte (Gratuit)"**
4. **Tester les fonctionnalités :**

   **a) Recherche d'adresse :**

   - Saisir "Casablanca" dans la barre de recherche
   - Cliquer sur "Rechercher"
   - Vérifier que la carte se centre sur Casablanca
   - Vérifier qu'un marqueur apparaît

   **b) Position GPS :**

   - Cliquer sur "Ma position"
   - Autoriser l'accès à la position dans le navigateur
   - Vérifier que la carte se centre sur votre position
   - Vérifier qu'un marqueur apparaît

   **c) Sélection manuelle :**

   - Cliquer sur la carte à différents endroits
   - Vérifier que le marqueur se déplace
   - Vérifier que l'adresse s'affiche dans les informations

   **d) Glisser-déposer :**

   - Glisser le marqueur vers une nouvelle position
   - Vérifier que l'adresse se met à jour

   **e) Confirmation :**

   - Cliquer sur "Confirmer"
   - Vérifier que l'adresse et les coordonnées sont remplies dans le formulaire

### 2. Test Google Maps (Premium)

#### Prérequis

- Clé API Google Maps valide configurée
- Voir `GOOGLE_MAPS_QUICK_SETUP.md`

#### Étapes de test

1. **Configurer la clé API** (si pas encore fait)
2. **Cliquer sur "Google Maps (Premium)"**
3. **Tester les mêmes fonctionnalités que OpenStreetMap**

## 🐛 Problèmes courants et solutions

### Erreur "Property 'Geocoder' does not exist"

- ✅ **Résolu** : Suppression du plugin leaflet-control-geocoder
- ✅ **Solution** : Utilisation directe de l'API Nominatim

### Erreur "InvalidKeyMapError"

- ❌ **Problème** : Clé API Google Maps invalide
- ✅ **Solution** : Utiliser OpenStreetMap ou configurer une vraie clé API

### Carte ne s'affiche pas

- ✅ **Vérifier** : Connexion internet
- ✅ **Vérifier** : Console du navigateur pour les erreurs
- ✅ **Solution** : Redémarrer l'application

### Géolocalisation ne fonctionne pas

- ✅ **Vérifier** : Permissions du navigateur
- ✅ **Vérifier** : Connexion HTTPS (requis pour la géolocalisation)
- ✅ **Solution** : Autoriser l'accès à la position

## 📊 Résultats attendus

### OpenStreetMap

- ✅ Carte s'affiche immédiatement
- ✅ Recherche d'adresses fonctionne
- ✅ Géolocalisation fonctionne
- ✅ Marqueur glissable
- ✅ Adresse et coordonnées remplies

### Google Maps

- ✅ Carte s'affiche (si clé API valide)
- ✅ Recherche avec autocomplétion
- ✅ Géolocalisation précise
- ✅ Marqueur avancé
- ✅ Adresse et coordonnées remplies

## 🎯 Recommandations

### Pour le développement

- Utilisez OpenStreetMap pour les tests
- Plus simple, pas de configuration

### Pour la production

- Commencez avec OpenStreetMap
- Passez à Google Maps si besoin de plus de précision

## 📝 Notes importantes

- OpenStreetMap fonctionne immédiatement
- Google Maps nécessite une clé API
- Les deux options offrent les mêmes fonctionnalités de base
- OpenStreetMap est suffisant pour la plupart des cas d'usage

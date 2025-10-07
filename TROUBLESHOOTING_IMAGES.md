# Guide de Dépannage - Images de Produits

## Problème Identifié

D'après les logs de la console, voici les problèmes détectés :

1. ❌ **404 Error** : `GET http://localhost:8080/api/produits/1/images 404 (Not Found)`
2. ❌ **Image manquante** : `GET http://localhost:4200/assets/default-avatar.png 404 (Not Found)`
3. ✅ **API Produits** : Fonctionne correctement (produit récupéré avec succès)

## Solutions Appliquées

### 1. ✅ Correction de l'image par défaut manquante
- **Problème** : `default-avatar.png` n'existait pas
- **Solution** : Utilisation de `profil.webp` qui existe dans les assets
- **Fichier modifié** : `src/app/component/produit/produit.component.ts`

### 2. ✅ Gestion gracieuse des erreurs 404 pour les images
- **Problème** : L'API d'images retourne 404, causant des erreurs
- **Solution** : Ajout de gestion d'erreur avec `catchError` dans le service
- **Fichiers modifiés** : `src/app/services/produit.service.ts`

## Problème Principal : Backend API Images

### Diagnostic
L'endpoint `/api/produits/{id}/images` n'existe pas ou ne fonctionne pas. Cela peut être dû à :

1. **Backend non démarré** : Le serveur Spring Boot n'est pas en cours d'exécution
2. **Endpoint non implémenté** : L'API d'images n'a pas encore été créée
3. **Configuration incorrecte** : Problème de mapping des routes

### Vérifications à Effectuer

#### 1. Vérifier que le Backend est Démarré
```bash
# Vérifier si le port 8080 est utilisé
netstat -an | findstr :8080

# Ou vérifier les processus Java
jps -l
```

#### 2. Tester l'API Produits (qui fonctionne)
```bash
curl http://localhost:8080/api/produits/all
```

#### 3. Tester l'API Images (qui ne fonctionne pas)
```bash
curl http://localhost:8080/api/produits/1/images
```

### Solutions Possibles

#### Option 1: Démarrer le Backend
Si le backend n'est pas démarré :
```bash
# Dans le dossier du backend Spring Boot
mvn spring-boot:run
# ou
./mvnw spring-boot:run
```

#### Option 2: Vérifier la Configuration Backend
Assurez-vous que le contrôleur `ProduitImageController` est bien configuré :

```java
@RestController
@RequestMapping("/api/produits/{produitId}/images")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8081"})
public class ProduitImageController {
    // ... méthodes
}
```

#### Option 3: Mode Développement Temporaire
En attendant que l'API d'images soit disponible, le frontend fonctionne en mode dégradé :
- ✅ Les produits s'affichent sans images
- ✅ L'ajout/modification de produits fonctionne
- ✅ Les images par défaut s'affichent

## Tests de Validation

### Test 1: Vérifier l'API Produits
```bash
curl -X GET http://localhost:8080/api/produits/all
```
**Résultat attendu** : Liste des produits en JSON

### Test 2: Vérifier l'API Images
```bash
curl -X GET http://localhost:8080/api/produits/1/images
```
**Résultat attendu** : 
- ✅ **200** : Métadonnées de l'image en JSON
- ❌ **404** : Endpoint non trouvé (problème actuel)

### Test 3: Test d'Upload d'Image
```bash
curl -X POST http://localhost:8080/api/produits/1/images \
  -F "file=@test-image.jpg" \
  -F "description=Image de test"
```
**Résultat attendu** : 
- ✅ **200** : Métadonnées de l'image uploadée
- ❌ **404** : Endpoint non trouvé

## Console Frontend - Messages Attendus

### ✅ Messages Normaux (Backend Fonctionnel)
```
🔄 Chargement des métadonnées d'images pour 1 produits
✅ Métadonnées d'images chargées pour 1 produits
✅ Thumbnail blob chargée pour le produit: 1
```

### ⚠️ Messages de Mode Dégradé (Backend Non Disponible)
```
🔄 Chargement des métadonnées d'images pour 1 produits
Aucune image trouvée pour le produit 1
✅ Métadonnées d'images chargées pour 1 produits
❌ Aucune image trouvée, utilisation du logo par défaut
```

## Prochaines Étapes

1. **Vérifier le Backend** : S'assurer que le serveur Spring Boot est démarré
2. **Tester l'API** : Vérifier que les endpoints d'images fonctionnent
3. **Ajouter une Image** : Tester l'upload d'une image sur un produit
4. **Vérifier l'Affichage** : Confirmer que les images s'affichent correctement

## Rollback en Cas de Problème

Si des problèmes surviennent, vous pouvez temporairement désactiver le chargement d'images en modifiant `produit.component.ts` :

```typescript
// Commenter cette ligne pour désactiver le chargement d'images
// this.loadImagesForAllProducts(produits);
```

Le système continuera de fonctionner avec les images par défaut.

# Guide de Test - Upload d'Images pour Produits

## Problème Résolu
L'erreur `JSON parse error: Cannot construct instance of ProduitImage (although at least one Creator exists): no String-argument constructor/factory method to deserialize from String value` était causée par l'utilisation de l'ancien système base64 au lieu du nouveau système d'upload de fichiers.

## Modifications Apportées

### 1. Composant Add-Produit (`src/app/dialogs/add-produit/add-produit.component.ts`)
- ✅ Remplacé la conversion base64 par l'upload de fichiers via l'API
- ✅ Utilisation de `produitService.uploadImage()` au lieu de `FileReader`
- ✅ Gestion des métadonnées d'image avec `ProduitImageDTO`
- ✅ Chargement des images existantes en mode édition

### 2. Composant Produit-Detail-Page (`src/app/component/produit-detail-page/produit-detail-page.component.ts`)
- ✅ Chargement automatique des métadonnées d'image
- ✅ Mise à jour des URLs d'image et thumbnail
- ✅ Compatibilité avec l'ancien système base64 (fallback)

### 3. Service Produit (`src/app/services/produit.service.ts`)
- ✅ Déjà configuré pour l'upload de fichiers
- ✅ Méthodes pour gérer les URLs d'images et thumbnails
- ✅ Gestion des blobs pour l'affichage

## Tests à Effectuer

### Test 1: Ajout d'un Nouveau Produit avec Image
1. Aller sur la page des produits
2. Cliquer sur "Ajouter un produit"
3. Remplir les champs obligatoires
4. Sélectionner une image (JPG, PNG, GIF, WebP - max 5MB)
5. Cliquer sur "Ajouter"
6. ✅ Vérifier que le produit est créé sans erreur
7. ✅ Vérifier que l'image s'affiche correctement

### Test 2: Modification d'un Produit avec Nouvelle Image
1. Aller sur la page de détail d'un produit
2. Cliquer sur "Modifier le produit"
3. Changer l'image
4. Sauvegarder
5. ✅ Vérifier que la modification fonctionne
6. ✅ Vérifier que la nouvelle image s'affiche

### Test 3: Modification d'un Produit sans Changer l'Image
1. Aller sur la page de détail d'un produit
2. Cliquer sur "Modifier le produit"
3. Modifier seulement les informations textuelles
4. Ne pas toucher à l'image
5. Sauvegarder
6. ✅ Vérifier que la modification fonctionne
7. ✅ Vérifier que l'image existante est conservée

### Test 4: Affichage des Images dans la Liste
1. Aller sur la page des produits
2. ✅ Vérifier que les images s'affichent dans la liste
3. ✅ Vérifier que les thumbnails se chargent correctement

### Test 5: Affichage des Images dans les Détails
1. Cliquer sur un produit dans la liste
2. ✅ Vérifier que l'image s'affiche correctement
3. ✅ Vérifier que l'image est de bonne qualité

## Vérifications Techniques

### Console du Navigateur
- ✅ Aucune erreur 400/500 lors de l'upload
- ✅ Messages de succès pour l'upload d'image
- ✅ Métadonnées d'image chargées correctement

### Console du Backend
- ✅ Pas d'erreur de désérialisation JSON
- ✅ Upload de fichier réussi
- ✅ Création/mise à jour de `ProduitImage` en base

### Base de Données
- ✅ Table `produit_image` mise à jour
- ✅ Fichiers stockés dans le dossier d'upload
- ✅ Métadonnées correctes (nom, taille, type MIME)

## Rollback en Cas de Problème

Si des problèmes surviennent, vous pouvez temporairement revenir à l'ancien système en modifiant la méthode `uploadImageForProduct` dans `add-produit.component.ts` :

```typescript
// Version de rollback (base64)
private uploadImageForProduct(produitId: number): void {
  if (!this.selectedFile) {
    this.isUploading = false;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result?.toString().split(',')[1];
    this.isUploading = false;
    this.snackBar.open('Produit ajouté avec succès (image en base64)', 'Fermer', { duration: 3000 });
    this.dialogRef.close({ 
      ...this.produitForm.value, 
      id: produitId, 
      image: base64String
    });
  };
  reader.readAsDataURL(this.selectedFile);
}
```

## Notes Importantes

- Les images sont maintenant stockées comme fichiers sur le serveur
- Les URLs d'images pointent vers les endpoints d'API
- Le système est compatible avec l'ancien format base64 (fallback)
- Les thumbnails sont générées automatiquement
- La taille maximale des images est de 5MB


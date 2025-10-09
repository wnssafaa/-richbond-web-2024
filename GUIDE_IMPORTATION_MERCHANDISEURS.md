# 📥 Guide d'Importation de Merchandiseurs

## ✅ Fonctionnalité Complète Implémentée !

Vous pouvez maintenant **importer plusieurs merchandiseurs en masse** via un fichier Excel ou CSV.

---

## 🎯 **Fonctionnalités**

### ✅ **Ce qui est implémenté :**
- **Bouton d'importation** dans le tableau merchandiseurs
- **Dialog d'importation** avec prévisualisation des données
- **Parser Excel/CSV** avec support de XLSX
- **Validation automatique** des données importées
- **Téléchargement du template** Excel pré-rempli
- **Affichage des erreurs** par ligne
- **Importation en masse** dans la base de données
- **Support multilingue** (FR/EN)

---

## 📋 **Comment Utiliser**

### **Étape 1 : Télécharger le Template**

1. **Ouvrez l'application** : http://localhost:4200
2. **Allez dans** : Gestion des Merchandiseurs
3. **Cliquez sur** : "Importer des merchandiseurs" (bouton vert)
4. **Dans le dialog**, cliquez sur : "Télécharger le Template"
5. **Un fichier Excel** `template_merchandiseurs.xlsx` sera téléchargé

### **Étape 2 : Remplir le Fichier Excel**

Ouvrez le fichier Excel et remplissez les colonnes suivantes :

#### **Colonnes Obligatoires :**
| Colonne | Description | Exemple | Validation |
|---------|-------------|---------|------------|
| **Prénom** | Prénom du merchandiseur | Ahmed | Requis |
| **Nom** | Nom du merchandiseur | Alami | Requis |
| **Email** | Email unique | ahmed.alami@example.com | Requis, format email |
| **Téléphone** | Numéro de téléphone | 0612345678 | Requis, format 06/07XXXXXXXX |
| **Région** | Région de travail | CASABLANCA_SETTAT | Requis, valeur valide |
| **Ville** | Ville de travail | Casablanca | Requis |
| **Marque Couverte** | Marque principale | Richbond | Requis |
| **Localisation** | Localisation précise | Casablanca Centre | Requis |

#### **Colonnes Optionnelles :**
| Colonne | Description | Exemple | Par défaut |
|---------|-------------|---------|------------|
| **Statut** | Statut du merchandiseur | ACTIF | ACTIF |
| **Type** | Type de merchandiseur | Mono | Mono |
| **Mot de passe** | Mot de passe initial | Password123 | Password123 |
| **Rôle** | Rôle du merchandiseur | MERCHANDISEUR_MONO | MERCHANDISEUR_MONO |
| **Superviseur ID** | ID du superviseur | 1 | null |
| **Magasin IDs** | IDs des magasins (séparés par ,) | 1,2,3 | [] |
| **Marques** | Marques couvertes (séparées par ,) | Richbond,Simmons | [] |
| **Enseignes** | Enseignes visitées (séparées par ,) | Carrefour,Marjane | [] |

#### **Valeurs Valides pour Région :**
```
- TANGER_TETOUAN_AL_HOCEIMA
- ORIENTAL
- FES_MEKNES
- RABAT_SALE_KENITRA
- BENI_MELLAL_KHENIFRA
- CASABLANCA_SETTAT
- MARRAKECH_SAFI
- DRAA_TAFILALET
- SOUSS_MASSA
- GUELMIM_OUED_NOUN
- LAAYOUNE_SAKIA_EL_HAMRA
- DAKHLA_OUED_ED_DAHAB
```

#### **Valeurs Valides pour Rôle :**
```
- MERCHANDISEUR_MONO
- MERCHANDISEUR_MULTI
```

### **Étape 3 : Importer le Fichier**

1. **Retournez dans l'application**
2. **Cliquez sur** : "Importer des merchandiseurs"
3. **Sélectionnez votre fichier** Excel rempli
4. **Attendez la prévisualisation** des données

### **Étape 4 : Vérifier les Données**

Le système affichera :
- ✅ **Nombre de merchandiseurs valides** (en vert)
- ❌ **Nombre de merchandiseurs invalides** (en rouge)
- **Tableau de prévisualisation** avec :
  - Toutes les données importées
  - Erreurs par ligne (si applicable)
  - Badge de statut (Valide/Invalide)

**Les erreurs possibles :**
- ❌ Prénom manquant
- ❌ Nom manquant
- ❌ Email manquant ou invalide
- ❌ Téléphone manquant ou invalide
- ❌ Région invalide
- ❌ Ville manquante

### **Étape 5 : Importer**

1. **Vérifiez les données** dans le tableau
2. **Si tout est correct**, cliquez sur : "Importer X merchandiseur(s)"
3. **Attendez la confirmation** : "X merchandiseurs importés avec succès"
4. **Les merchandiseurs** apparaîtront dans le tableau principal

---

## 📊 **Exemple de Fichier Excel**

Voici un exemple de données à importer :

| Prénom | Nom | Email | Téléphone | Région | Ville | Marque Couverte | Localisation | Statut | Type | Mot de passe | Rôle |
|--------|-----|-------|-----------|--------|-------|----------------|--------------|--------|------|--------------|------|
| Ahmed | Alami | ahmed.alami@example.com | 0612345678 | CASABLANCA_SETTAT | Casablanca | Richbond | Casablanca Centre | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO |
| Fatima | Bennani | fatima.bennani@example.com | 0623456789 | RABAT_SALE_KENITRA | Rabat | Simmons | Rabat Agdal | ACTIF | Multi | Password123 | MERCHANDISEUR_MULTI |
| Youssef | Idrissi | youssef.idrissi@example.com | 0634567890 | MARRAKECH_SAFI | Marrakech | Richbond | Marrakech Guéliz | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO |

---

## 🧪 **Tests à Effectuer**

### **Test 1 : Importation Réussie**
1. Téléchargez le template
2. Remplissez 3-5 merchandiseurs
3. Importez le fichier
4. Vérifiez que tous sont **valides**
5. Cliquez sur "Importer"
6. ✅ Vérifiez que les merchandiseurs apparaissent dans le tableau

### **Test 2 : Gestion des Erreurs**
1. Créez un fichier avec des données invalides :
   - Email sans @
   - Téléphone avec 9 chiffres
   - Région inexistante
2. Importez le fichier
3. ✅ Vérifiez que les erreurs sont affichées
4. ✅ Vérifiez que seuls les valides sont importés

### **Test 3 : Template**
1. Cliquez sur "Télécharger le Template"
2. ✅ Vérifiez qu'un fichier Excel est téléchargé
3. ✅ Vérifiez qu'il contient un exemple de données

### **Test 4 : Format CSV**
1. Créez un fichier CSV avec les mêmes données
2. Importez le fichier CSV
3. ✅ Vérifiez que les données sont correctement parsées

---

## 🎨 **Captures d'Écran**

### **1. Bouton d'Importation**
Le bouton vert "Importer des merchandiseurs" se trouve à côté du bouton "Ajouter un merchandiseur".

### **2. Dialog d'Importation**
- **Zone de téléchargement** : Glissez-déposez ou sélectionnez un fichier
- **Bouton Template** : Téléchargez le modèle Excel
- **Formats acceptés** : .xlsx, .xls, .csv

### **3. Prévisualisation**
- **Stats** : Nombre de valides vs invalides
- **Tableau** : Toutes les données avec erreurs
- **Badge de statut** : Vert (valide) ou Rouge (invalide)

### **4. Résultat**
- **Message de succès** : "X merchandiseurs importés avec succès"
- **Tableau mis à jour** : Les nouveaux merchandiseurs apparaissent

---

## 🔧 **Configuration Technique**

### **Fichiers Créés**
```
src/app/dialogs/import-merch-dialog/
  ├── import-merch-dialog.component.ts     # Logique du dialog
  ├── import-merch-dialog.component.html   # Template HTML
  └── import-merch-dialog.component.css    # Styles CSS
```

### **Bibliothèques Utilisées**
- **xlsx** : Parser Excel/CSV
- **@angular/material** : Interface utilisateur
- **RxJS** : Gestion asynchrone

### **Modifications Apportées**
- ✅ `merchendiseur.component.ts` : Ajout de `openImportDialog()`
- ✅ `merchendiseur.component.html` : Ajout du bouton d'importation
- ✅ `fr.json` / `en.json` : Ajout de la traduction "IMPORT_MERCH"

---

## 📝 **Notes Importantes**

### **Validation des Données**
- **Email** : Format standard (xxx@xxx.xxx)
- **Téléphone** : Format marocain (06/07XXXXXXXX)
- **Région** : Doit correspondre exactement aux valeurs de l'enum
- **Unicité** : L'email doit être unique (le backend vérifie)

### **Gestion des Erreurs**
- **Lignes invalides** : Ne sont PAS importées
- **Lignes valides** : Sont importées même s'il y a des invalides
- **Affichage** : Les erreurs sont affichées par ligne

### **Performance**
- **Importation séquentielle** : Un merchandiseur à la fois
- **Barre de progression** : Affichée pendant l'importation
- **Notification** : Affichée à la fin avec le nombre d'importations

---

## 🚨 **Problèmes Courants et Solutions**

### **Problème 1 : "Email invalide"**
- **Solution** : Vérifiez que l'email contient @ et un domaine

### **Problème 2 : "Téléphone invalide"**
- **Solution** : Utilisez le format 06XXXXXXXX ou 07XXXXXXXX

### **Problème 3 : "Région invalide"**
- **Solution** : Copiez-collez la région depuis la liste des valeurs valides

### **Problème 4 : "Fichier non reconnu"**
- **Solution** : Vérifiez que le fichier est au format .xlsx, .xls ou .csv

### **Problème 5 : "Aucun merchandiseur importé"**
- **Solution** : Vérifiez les erreurs dans le tableau de prévisualisation

---

## 🎉 **Résultat Final**

Avec cette fonctionnalité, vous pouvez maintenant :

- ✅ **Importer des dizaines** de merchandiseurs en quelques clics
- ✅ **Télécharger un template** pré-rempli pour faciliter la saisie
- ✅ **Prévisualiser les données** avant l'importation
- ✅ **Voir les erreurs** en temps réel
- ✅ **Importer uniquement les données valides**
- ✅ **Recevoir une confirmation** avec le nombre d'importations réussies

---

**🚀 La fonctionnalité d'importation est maintenant pleinement opérationnelle !**

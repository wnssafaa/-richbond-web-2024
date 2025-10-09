# 🚀 Quick Start : Importation de Merchandiseurs

## ⚡ Démarrage Rapide en 5 Étapes

### **Étape 1 : Accéder à la Fonctionnalité** ⏱️ 10 secondes
1. Ouvrez **http://localhost:4200**
2. Allez dans **"Gestion des Merchandiseurs"**
3. Repérez le **bouton vert** "Importer des merchandiseurs"

### **Étape 2 : Télécharger le Template** ⏱️ 15 secondes
1. Cliquez sur **"Importer des merchandiseurs"**
2. Dans le dialog, cliquez sur **"Télécharger le Template"**
3. Un fichier Excel **`template_merchandiseurs.xlsx`** sera téléchargé

### **Étape 3 : Remplir le Fichier Excel** ⏱️ 2-5 minutes
1. Ouvrez le fichier téléchargé dans **Excel ou Google Sheets**
2. Remplissez les lignes avec vos données
3. **Colonnes minimales requises** :
   - Prénom, Nom, Email, Téléphone
   - Région, Ville
   - Marque Couverte, Localisation

### **Étape 4 : Importer le Fichier** ⏱️ 20 secondes
1. Retournez dans le dialog d'importation
2. Cliquez sur **"Sélectionner un fichier"**
3. Choisissez votre fichier Excel rempli
4. **Attendez** la prévisualisation (2-3 secondes)

### **Étape 5 : Valider et Importer** ⏱️ 30 secondes
1. **Vérifiez** les stats : X valides, Y invalides
2. **Consultez** le tableau de prévisualisation
3. **Corrigez** les erreurs si nécessaire
4. Cliquez sur **"Importer X merchandiseur(s)"**
5. **Attendez** la confirmation
6. ✅ **Terminé !** Les merchandiseurs sont ajoutés

---

## 📋 Template Excel Simplifié

| Prénom* | Nom* | Email* | Téléphone* | Région* | Ville* | Marque Couverte* | Localisation* |
|---------|------|--------|------------|---------|--------|------------------|---------------|
| Ahmed | Alami | ahmed@example.com | 0612345678 | CASABLANCA_SETTAT | Casablanca | Richbond | Casa Centre |

**\* = Obligatoire**

---

## ⚠️ Règles de Validation

### ✅ **Email**
- ✅ Correct : `ahmed@example.com`
- ❌ Incorrect : `ahmed.example` (pas de @)

### ✅ **Téléphone**
- ✅ Correct : `0612345678` (06 ou 07 + 8 chiffres)
- ❌ Incorrect : `612345678` (manque le 0)

### ✅ **Région**
Utilisez **EXACTEMENT** ces valeurs :
```
CASABLANCA_SETTAT
RABAT_SALE_KENITRA
MARRAKECH_SAFI
FES_MEKNES
TANGER_TETOUAN_AL_HOCEIMA
ORIENTAL
SOUSS_MASSA
DRAA_TAFILALET
BENI_MELLAL_KHENIFRA
GUELMIM_OUED_NOUN
LAAYOUNE_SAKIA_EL_HAMRA
DAKHLA_OUED_ED_DAHAB
```

---

## 🎯 Exemple Rapide (Copier-Coller)

Pour tester rapidement, copiez ces 3 lignes dans votre Excel :

```
Prénom  Nom       Email                       Téléphone   Région              Ville      Marque Couverte  Localisation
Ahmed   Alami     ahmed.alami@test.com        0612345678  CASABLANCA_SETTAT   Casablanca Richbond        Casa Centre
Fatima  Bennani   fatima.bennani@test.com     0623456789  RABAT_SALE_KENITRA  Rabat      Simmons         Rabat Agdal
Youssef Idrissi   youssef.idrissi@test.com    0634567890  MARRAKECH_SAFI      Marrakech  Richbond        Marrakech Guéliz
```

---

## 💡 Astuces

### **1. Gagner du Temps**
- 📥 **Téléchargez le template** : Il contient déjà un exemple
- 📋 **Copiez-collez** vos données depuis un autre fichier
- 🔄 **Réutilisez** le template pour plusieurs imports

### **2. Éviter les Erreurs**
- ✅ Copiez-collez les **noms de régions** (pas de fautes de frappe)
- ✅ Vérifiez les **emails** (doivent être uniques)
- ✅ Testez avec **1-2 lignes** d'abord

### **3. Corriger les Erreurs**
- 🔍 Les erreurs sont **affichées par ligne** dans la prévisualisation
- 📝 **Corrigez** le fichier Excel et **ré-importez**
- ✅ Seules les lignes **valides** sont importées

---

## 🚨 Que Faire en Cas de Problème ?

### **Problème : "0 valides, X invalides"**
➡️ **Solution** : Vérifiez les colonnes obligatoires

### **Problème : "Email invalide"**
➡️ **Solution** : Format email : `xxx@xxx.xxx`

### **Problème : "Région invalide"**
➡️ **Solution** : Copiez-collez depuis la liste ci-dessus

### **Problème : "Téléphone invalide"**
➡️ **Solution** : Format : `06XXXXXXXX` ou `07XXXXXXXX`

---

## 📊 Résultat Attendu

Après l'importation :
- ✅ **Message de succès** : "X merchandiseurs importés avec succès"
- ✅ **Tableau mis à jour** : Les nouveaux merchandiseurs apparaissent
- ✅ **Dialog fermé** : Automatiquement après succès

---

## ⏱️ Temps Total Estimé

- **Première fois** : ~10 minutes
- **Utilisations suivantes** : ~2-3 minutes
- **Import de 10 merchandiseurs** : ~3-5 minutes
- **Import de 50 merchandiseurs** : ~10-15 minutes

---

## 🎉 C'est Tout !

Vous êtes maintenant prêt à importer des merchandiseurs en masse !

**Questions ?** Consultez le **GUIDE_IMPORTATION_MERCHANDISEURS.md** pour plus de détails.

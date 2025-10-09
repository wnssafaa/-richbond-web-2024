# 📊 Template de Démonstration - Importation Merchandiseurs

## 📥 Fichier Excel à Créer

Créez un fichier Excel avec les colonnes suivantes (en ligne 1) :

```
Prénom | Nom | Email | Téléphone | Région | Ville | Marque Couverte | Localisation | Statut | Type | Mot de passe | Rôle | Superviseur ID | Magasin IDs | Marques | Enseignes
```

## 📝 Données de Test (à copier dans Excel)

### **Ligne 2 (Merchandiseur 1) :**
```
Ahmed | Alami | ahmed.alami@richbond.ma | 0612345678 | CASABLANCA_SETTAT | Casablanca | Richbond | Casablanca Centre | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO | | 1,2,3 | Richbond,Simmons | Carrefour,Marjane
```

### **Ligne 3 (Merchandiseur 2) :**
```
Fatima | Bennani | fatima.bennani@richbond.ma | 0623456789 | RABAT_SALE_KENITRA | Rabat | Simmons | Rabat Agdal | ACTIF | Multi | Password123 | MERCHANDISEUR_MULTI | | 4,5,6 | Simmons,Révey | Aswak Assalam,Acima
```

### **Ligne 4 (Merchandiseur 3) :**
```
Youssef | Idrissi | youssef.idrissi@richbond.ma | 0634567890 | MARRAKECH_SAFI | Marrakech | Richbond | Marrakech Guéliz | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO | | 7,8 | Richbond | Label'Vie,Carrefour Market
```

### **Ligne 5 (Merchandiseur 4) :**
```
Sara | Tazi | sara.tazi@richbond.ma | 0645678901 | FES_MEKNES | Fès | Révey | Fès Médina | ACTIF | Multi | Password123 | MERCHANDISEUR_MULTI | | 9,10,11 | Révey,Atlas | Metro,Atacadao
```

### **Ligne 6 (Merchandiseur 5) :**
```
Karim | Filali | karim.filali@richbond.ma | 0656789012 | ORIENTAL | Oujda | Atlas | Oujda Centre | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO | | 12,13 | Atlas,Total Rayons | BIM,Carrefour
```

### **Ligne 7 (Merchandiseur 6) :**
```
Amina | Zahraoui | amina.zahraoui@richbond.ma | 0667890123 | TANGER_TETOUAN_AL_HOCEIMA | Tanger | Richbond | Tanger Ville | ACTIF | Multi | Password123 | MERCHANDISEUR_MULTI | | 14,15,16 | Richbond,Simmons | Marjane,Aswak Assalam
```

### **Ligne 8 (Merchandiseur 7 - AVEC ERREURS pour test) :**
```
Mohamed | | mohamed.erreur@richbond.ma | 061234 | INVALIDE_REGION | | | | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO | | | |
```
**Erreurs attendues :** Nom manquant, Téléphone invalide, Région invalide, Ville manquante

### **Ligne 9 (Merchandiseur 8 - AVEC ERREURS pour test) :**
```
Leila | Amrani | email-invalide | 0678901234 | SOUSS_MASSA | | Richbond | | ACTIF | Mono | Password123 | MERCHANDISEUR_MONO | | | |
```
**Erreurs attendues :** Email invalide, Ville manquante

---

## 🎯 Résultat Attendu après Importation

### **Merchandiseurs Valides (6) :**
- ✅ Ahmed Alami (Casablanca)
- ✅ Fatima Bennani (Rabat)
- ✅ Youssef Idrissi (Marrakech)
- ✅ Sara Tazi (Fès)
- ✅ Karim Filali (Oujda)
- ✅ Amina Zahraoui (Tanger)

### **Merchandiseurs Invalides (2) :**
- ❌ Mohamed (erreurs multiples)
- ❌ Leila Amrani (email et ville invalides)

---

## 📋 Étapes de Test

1. **Créez un fichier Excel** nommé `test_import_merchandiseurs.xlsx`
2. **Copiez-collez** les données ci-dessus
3. **Sauvegardez** le fichier
4. **Allez dans l'application** : http://localhost:4200
5. **Cliquez sur** : "Importer des merchandiseurs"
6. **Sélectionnez** le fichier créé
7. **Vérifiez** :
   - 6 merchandiseurs valides (en vert)
   - 2 merchandiseurs invalides (en rouge)
   - Erreurs affichées pour les lignes 8 et 9
8. **Cliquez sur** : "Importer 6 merchandiseur(s)"
9. **Vérifiez** : Message de succès "6 merchandiseurs importés avec succès"
10. **Vérifiez** : Les 6 merchandiseurs apparaissent dans le tableau

---

## 🔍 Vérifications Supplémentaires

### **Dans le Tableau des Merchandiseurs**
- ✅ Les 6 merchandiseurs sont affichés
- ✅ Les emails sont uniques
- ✅ Les régions sont correctes
- ✅ Les téléphones sont au bon format

### **En Base de Données (SQL)**
```sql
SELECT id, prenom, nom, email, telephone, region, ville 
FROM user 
WHERE discriminator = 'MERCHANDISEUR' 
ORDER BY id DESC 
LIMIT 10;
```

**Résultat attendu :** Les 6 merchandiseurs importés avec toutes les données correctes

---

## 🚀 Test Rapide avec CSV

Vous pouvez également créer un fichier CSV simple :

```csv
Prénom,Nom,Email,Téléphone,Région,Ville,Marque Couverte,Localisation,Statut,Type,Mot de passe,Rôle,Superviseur ID,Magasin IDs,Marques,Enseignes
Ahmed,Alami,ahmed.alami@richbond.ma,0612345678,CASABLANCA_SETTAT,Casablanca,Richbond,Casablanca Centre,ACTIF,Mono,Password123,MERCHANDISEUR_MONO,,1,Richbond,Carrefour
Fatima,Bennani,fatima.bennani@richbond.ma,0623456789,RABAT_SALE_KENITRA,Rabat,Simmons,Rabat Agdal,ACTIF,Multi,Password123,MERCHANDISEUR_MULTI,,2,Simmons,Marjane
```

Sauvegardez ce contenu dans `test_import.csv` et importez-le !

---

**🎉 Vous êtes prêt à tester l'importation de merchandiseurs !**

# 📍 Liste des Régions Valides pour l'Importation

## ✅ Régions Acceptées par le Backend

Utilisez **EXACTEMENT** ces valeurs dans vos fichiers Excel d'importation :

### **Liste Complète des Régions**

1. **Tanger-Tétouan-Al Hoceïma**
2. **L'Oriental**
3. **Fès-Meknès**
4. **Rabat-Salé-Kénitra**
5. **Béni Mellal-Khénifra**
6. **Casablanca-Settat**
7. **Marrakech-Safi**
8. **Drâa-Tafilalet**
9. **Souss-Massa**
10. **Guelmim-Oued Noun**
11. **Laâyoune-Sakia El Hamra**
12. **Dakhla-Oued Ed Dahab**
13. **Sud**
14. **Nord**
15. **Orient**
16. **Centre**

---

## 📊 Format Excel Correct

### **Exemple de Ligne Valide :**

| Prénom | Nom | Email | Téléphone | **Région** | Ville |
|--------|-----|-------|-----------|-----------|-------|
| Mohammed | Alaoui | mohammed@test.com | 0612345678 | **Casablanca-Settat** | Casablanca |

### **❌ Erreurs Courantes :**

| ❌ Incorrect | ✅ Correct |
|-------------|----------|
| CASABLANCA_SETTAT | Casablanca-Settat |
| casablanca-settat | Casablanca-Settat |
| Casablanca Settat | Casablanca-Settat |
| Casa-Settat | Casablanca-Settat |

---

## 🗺️ Régions avec Leurs Principales Villes

### **1. Tanger-Tétouan-Al Hoceïma**
- Tanger, Tétouan, Al Hoceïma, Larache, Chefchaouen, Ouezzane

### **2. L'Oriental**
- Oujda, Nador, Berkane, Taourirt, Jerada, Figuig

### **3. Fès-Meknès**
- Fès, Meknès, Ifrane, El Hajeb, Sefrou, Boulemane, Taza, Taounate

### **4. Rabat-Salé-Kénitra**
- Rabat, Salé, Kénitra, Skhirat, Témara, Sidi Kacem, Sidi Slimane, Khémisset

### **5. Béni Mellal-Khénifra**
- Béni Mellal, Khénifra, Khouribga, Fquih Ben Salah, Azilal

### **6. Casablanca-Settat**
- Casablanca, Mohammedia, Settat, El Jadida, Berrechid, Mediouna, Nouaceur, Benslimane

### **7. Marrakech-Safi**
- Marrakech, Safi, Essaouira, El Kelaâ des Sraghna, Youssoufia, Chichaoua

### **8. Drâa-Tafilalet**
- Errachidia, Ouarzazate, Midelt, Tinghir, Zagora

### **9. Souss-Massa**
- Agadir, Inezgane, Taroudant, Tiznit, Chtouka-Aït Baha

### **10. Guelmim-Oued Noun**
- Guelmim, Tan-Tan, Assa, Zag, Sidi Ifni

### **11. Laâyoune-Sakia El Hamra**
- Laâyoune, Smara, Tarfaya, Boujdour

### **12. Dakhla-Oued Ed Dahab**
- Dakhla, Aousserd

### **13. Sud**
- Régions du sud

### **14. Nord**
- Régions du nord

### **15. Orient**
- Régions de l'orient

### **16. Centre**
- Régions du centre

---

## 📝 Template Excel Mis à Jour

### **Pour Superviseurs :**

| Prénom | Nom | Email | Téléphone | Région | Ville | Mot de passe | Statut |
|--------|-----|-------|-----------|--------|-------|--------------|--------|
| Mohammed | Alaoui | mohammed@test.com | 0612345678 | Casablanca-Settat | Casablanca | Password123 | ACTIF |
| Fatima | Bennani | fatima@test.com | 0623456789 | Rabat-Salé-Kénitra | Rabat | Password123 | ACTIF |
| Ahmed | Tazi | ahmed@test.com | 0634567890 | Tanger-Tétouan-Al Hoceïma | Tanger | Password123 | ACTIF |

### **Pour Magasins :**

| Nom | Ville | Région | Adresse | Enseigne |
|-----|-------|--------|---------|----------|
| Marjane Californie | Casablanca | Casablanca-Settat | Bd de la Corniche | Marjane |
| Carrefour Rabat | Rabat | Rabat-Salé-Kénitra | Avenue Hassan II | Carrefour |
| Marjane Tanger | Tanger | Tanger-Tétouan-Al Hoceïma | Zone Commerciale | Marjane |

---

## 🎯 Comment Utiliser

### **Méthode 1 : Copier-Coller**
1. **Téléchargez** le template Excel depuis l'application
2. **Copiez** le nom de la région depuis ce guide
3. **Collez** directement dans Excel

### **Méthode 2 : Liste Déroulante Excel**
1. Sélectionnez la colonne "Région"
2. Données → Validation des données
3. Liste : Copiez-collez toutes les régions séparées par des virgules

```
Tanger-Tétouan-Al Hoceïma,L'Oriental,Fès-Meknès,Rabat-Salé-Kénitra,Béni Mellal-Khénifra,Casablanca-Settat,Marrakech-Safi,Drâa-Tafilalet,Souss-Massa,Guelmim-Oued Noun,Laâyoune-Sakia El Hamra,Dakhla-Oued Ed Dahab,Sud,Nord,Orient,Centre
```

---

## ⚠️ Points Importants

### **1. Respect de la Casse**
- ✅ **Casablanca-Settat** (C majuscule, S majuscule)
- ❌ **casablanca-settat** (tout en minuscules)

### **2. Respect des Tirets**
- ✅ **Casablanca-Settat** (tiret)
- ❌ **Casablanca_Settat** (underscore)

### **3. Respect des Accents**
- ✅ **Béni Mellal-Khénifra** (avec accents)
- ❌ **Beni Mellal-Khenifra** (sans accents)

### **4. Respect de l'Apostrophe**
- ✅ **L'Oriental** (avec apostrophe)
- ❌ **L Oriental** (sans apostrophe)

---

## 🧪 Test Rapide

Après avoir téléchargé le nouveau template :

1. **Ouvrez-le** dans Excel
2. **Vérifiez** la colonne "Région"
3. **Exemple** : "Casablanca-Settat" (et non "CASABLANCA_SETTAT")
4. **Importez** le fichier
5. **✅ Ça devrait fonctionner !**

---

## 🔧 Correction Appliquée

### **Avant :**
```json
'Région': 'CASABLANCA_SETTAT'  // ❌ Format ancien
```

### **Après :**
```json
'Région': 'Casablanca-Settat'  // ✅ Format backend
```

---

**🎉 Les templates Excel sont maintenant à jour avec les bonnes valeurs de régions !**

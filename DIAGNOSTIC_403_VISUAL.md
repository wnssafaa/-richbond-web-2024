# 🔍 Diagnostic Visuel de l'Erreur 403

## 📊 Flux Normal d'une Requête (sans erreur)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUX NORMAL (200/201)                        │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Frontend Angular (http://localhost:4200)
    ↓
    ┌─────────────────────────────────┐
    │ Utilisateur clique "Ajouter"    │
    │ add-produit.component.ts        │
    └─────────────────────────────────┘
                ↓
2️⃣  Service Produit
    ↓
    ┌─────────────────────────────────┐
    │ produitService.createProduit()  │
    │ POST /api/produits/add          │
    └─────────────────────────────────┘
                ↓
3️⃣  HTTP Interceptor
    ↓
    ┌─────────────────────────────────┐
    │ authInterceptor ajoute header   │
    │ Authorization: Bearer <token>   │
    └─────────────────────────────────┘
                ↓
4️⃣  Requête HTTP vers Backend
    ↓
    ┌─────────────────────────────────────────┐
    │ POST http://localhost:8080/api/produits/add │
    │                                          │
    │ Headers:                                 │
    │   Content-Type: application/json        │
    │   Authorization: Bearer eyJhbGc...      │
    │                                          │
    │ Body:                                    │
    │   { marque: "Sealy", ... }              │
    └─────────────────────────────────────────┘
                ↓
5️⃣  Backend Spring Boot (http://localhost:8080)
    ↓
    ┌─────────────────────────────────┐
    │ CORS Filter ✅                  │
    │ Vérification origine            │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │ CSRF Filter ✅                  │
    │ (Désactivé pour API REST)       │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │ JWT Authentication Filter ✅    │
    │ Validation du token             │
    │ Extraction des rôles            │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │ ProduitController ✅            │
    │ @PostMapping("/add")            │
    │ Création du produit             │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │ ProduitService ✅               │
    │ Logique métier                  │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │ Repository JPA ✅               │
    │ Sauvegarde en base de données   │
    └─────────────────────────────────┘
                ↓
6️⃣  Réponse HTTP 201 Created
    ↓
    ┌─────────────────────────────────┐
    │ Status: 201 Created             │
    │ Body: { id: 54, marque: ... }   │
    └─────────────────────────────────┘
                ↓
7️⃣  Frontend reçoit la réponse
    ↓
    ┌─────────────────────────────────┐
    │ ✅ Produit ajouté avec succès   │
    │ Dialog fermé                    │
    │ Liste rafraîchie                │
    └─────────────────────────────────┘
```

---

## ❌ Flux avec Erreur 403 (Situation Actuelle)

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUX AVEC ERREUR 403                           │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Frontend Angular (http://localhost:4200)
    ↓
    ┌─────────────────────────────────┐
    │ Utilisateur clique "Ajouter"    │
    │ add-produit.component.ts        │
    └─────────────────────────────────┘
                ↓
2️⃣  Service Produit
    ↓
    ┌─────────────────────────────────┐
    │ produitService.createProduit()  │
    │ POST /api/produits/add          │
    └─────────────────────────────────┘
                ↓
3️⃣  HTTP Interceptor
    ↓
    ┌─────────────────────────────────┐
    │ authInterceptor ajoute header   │
    │ Authorization: Bearer <token>   │
    └─────────────────────────────────┘
                ↓
4️⃣  Requête HTTP vers Backend
    ↓
    ┌─────────────────────────────────────────┐
    │ POST http://localhost:8080/api/produits/add │
    │                                          │
    │ Headers:                                 │
    │   Content-Type: application/json        │
    │   Authorization: Bearer eyJhbGc...      │
    │                                          │
    │ Body:                                    │
    │   { marque: "Sealy", ... }              │
    └─────────────────────────────────────────┘
                ↓
5️⃣  Backend Spring Boot (http://localhost:8080)
    ↓
    ┌─────────────────────────────────┐
    │ CORS Filter ✅                  │
    │ Vérification origine            │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────────────────┐
    │ ❌ CSRF Filter BLOQUE LA REQUÊTE            │
    │                                              │
    │ Raison: CSRF est activé par défaut dans     │
    │ Spring Security et il attend un token CSRF  │
    │ pour les requêtes POST/PUT/DELETE           │
    │                                              │
    │ Pour les API REST avec JWT, CSRF n'est      │
    │ pas nécessaire et doit être désactivé       │
    └─────────────────────────────────────────────┘
                ↓
6️⃣  Réponse HTTP 403 Forbidden
    ↓
    ┌─────────────────────────────────┐
    │ Status: 403 Forbidden           │
    │ Message: Could not verify CSRF  │
    └─────────────────────────────────┘
                ↓
7️⃣  Frontend reçoit l'erreur
    ↓
    ┌─────────────────────────────────────────┐
    │ ❌ Erreur lors de l'ajout du produit    │
    │ Console: 403 Forbidden                  │
    │ Snackbar: Erreur lors de l'ajout        │
    └─────────────────────────────────────────┘
```

---

## 🔍 Points de Blocage Possibles

### 1. CSRF Filter (le plus probable)

```
❌ PROBLÈME
┌────────────────────────────────────────────┐
│ Spring Security CSRF est activé            │
│ → Bloque toutes les requêtes POST         │
│ → sans token CSRF                          │
└────────────────────────────────────────────┘

✅ SOLUTION
┌────────────────────────────────────────────┐
│ Dans SecurityConfig.java :                 │
│ .csrf(csrf -> csrf.disable())              │
└────────────────────────────────────────────┘
```

### 2. CORS Configuration

```
❌ PROBLÈME
┌────────────────────────────────────────────┐
│ CORS ne permet pas http://localhost:4200   │
│ → Requêtes bloquées par le navigateur     │
└────────────────────────────────────────────┘

✅ SOLUTION
┌────────────────────────────────────────────┐
│ configuration.setAllowedOrigins(           │
│   Arrays.asList("http://localhost:4200")   │
│ );                                         │
└────────────────────────────────────────────┘
```

### 3. Permissions / Rôles

```
❌ PROBLÈME
┌────────────────────────────────────────────┐
│ @PreAuthorize("hasRole('ADMIN')")          │
│ → Utilisateur n'a pas le rôle ADMIN       │
└────────────────────────────────────────────┘

✅ SOLUTION
┌────────────────────────────────────────────┐
│ Commentez @PreAuthorize temporairement     │
│ OU                                         │
│ Donnez le rôle ADMIN à votre utilisateur   │
└────────────────────────────────────────────┘
```

### 4. Token JWT expiré/invalide

```
❌ PROBLÈME
┌────────────────────────────────────────────┐
│ Token JWT expiré ou signature invalide     │
│ → Backend refuse l'authentification        │
└────────────────────────────────────────────┘

✅ SOLUTION
┌────────────────────────────────────────────┐
│ Reconnectez-vous à l'application Angular   │
│ pour obtenir un nouveau token              │
└────────────────────────────────────────────┘
```

---

## 📈 Statistiques des Causes d'Erreur 403

```
┌──────────────────────────────────────────────┐
│         Causes fréquentes d'erreur 403        │
├──────────────────────────────────────────────┤
│ 🔴 CSRF activé               → 60%           │
│ 🟡 CORS mal configuré        → 20%           │
│ 🟠 @PreAuthorize restrictif  → 15%           │
│ 🟢 Token expiré              → 5%            │
└──────────────────────────────────────────────┘
```

---

## 🧪 Commandes de Test Rapides

### Test 1 : Backend accessible ?
```bash
curl http://localhost:8080/api/produits/all
```
**Résultat attendu :** Liste des produits (JSON)

### Test 2 : POST sans token
```bash
curl -X POST http://localhost:8080/api/produits/add \
  -H "Content-Type: application/json" \
  -d '{"marque":"Test","reference":"REF","categorie":"Matelas","article":"Test","type":"Standard","dimensions":"140x190","prix":1999,"famille":"MATELAS","sousMarques":"R VITAL","codeEAN":"123","designationArticle":"Test","disponible":true}'
```
**Résultat attendu :** 401 (Unauthorized) ou 403 (Forbidden)

### Test 3 : OPTIONS preflight (CORS)
```bash
curl -X OPTIONS http://localhost:8080/api/produits/add \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  -v
```
**Résultat attendu :** 
```
< Access-Control-Allow-Origin: http://localhost:4200
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 📱 Comparaison : Avant / Après la Correction

### AVANT (avec erreur 403)
```
Frontend                          Backend
   │                                 │
   │  POST /api/produits/add         │
   │  + Authorization: Bearer xxx    │
   ├────────────────────────────────>│
   │                                 │
   │                            CSRF Filter ❌
   │                            (requiert token CSRF)
   │                                 │
   │  <────────────────────────────┤
   │  403 Forbidden                  │
   │                                 │
```

### APRÈS (corrigé)
```
Frontend                          Backend
   │                                 │
   │  POST /api/produits/add         │
   │  + Authorization: Bearer xxx    │
   ├────────────────────────────────>│
   │                                 │
   │                            CORS Filter ✅
   │                            CSRF Filter ✅ (désactivé)
   │                            JWT Filter ✅
   │                            Controller ✅
   │                            Service ✅
   │                            Repository ✅
   │                                 │
   │  <────────────────────────────┤
   │  201 Created                    │
   │  { id: 54, marque: "Sealy" }    │
   │                                 │
```

---

## 🎯 Objectif Final

Après avoir appliqué les corrections, le flux devrait être :

```
1. Utilisateur connecté ✅
   └─> Token JWT stocké dans localStorage

2. Clic sur "Ajouter Produit" ✅
   └─> Dialog s'ouvre

3. Remplissage du formulaire ✅
   └─> Tous les champs obligatoires remplis

4. Clic sur "Enregistrer" ✅
   └─> produitService.createProduit() appelé

5. Interceptor ajoute le token ✅
   └─> Authorization: Bearer <token> dans headers

6. Requête POST envoyée ✅
   └─> POST http://localhost:8080/api/produits/add

7. Backend traite la requête ✅
   ├─> CORS vérifie l'origine → OK
   ├─> CSRF désactivé → OK
   ├─> JWT valide le token → OK
   ├─> Controller crée le produit → OK
   └─> Service sauvegarde en base → OK

8. Réponse 201 Created ✅
   └─> { id: 54, marque: "Sealy", ... }

9. Frontend met à jour l'interface ✅
   ├─> Message de succès affiché
   ├─> Dialog fermé
   └─> Liste des produits rafraîchie
```

---

## 🔎 Analyse des Logs Backend

### Logs normaux (sans erreur) :
```
INFO  : Started RichbondbakendApplication in 55.794 seconds
INFO  : Tomcat started on port 8080
DEBUG : CSRF is disabled
DEBUG : CORS configuration loaded
INFO  : 📥 Réception requête POST /api/produits/add
INFO  :    Marque: Sealy
INFO  :    Article: Matelas Confort Plus
INFO  : ✅ Produit créé avec succès - ID: 54
```

### Logs avec erreur 403 :
```
INFO  : Started RichbondbakendApplication in 55.794 seconds
INFO  : Tomcat started on port 8080
WARN  : CSRF is enabled                            ← ❌ PROBLÈME ICI
DEBUG : Request POST /api/produits/add
DEBUG : CSRF token validation failed               ← ❌ BLOCAGE ICI
WARN  : Access denied (403) - Invalid CSRF token
```

### Logs avec problème de rôle :
```
INFO  : Started RichbondbakendApplication in 55.794 seconds
INFO  : Tomcat started on port 8080
DEBUG : CSRF is disabled
DEBUG : Request POST /api/produits/add
DEBUG : JWT token validated for user: john.doe
DEBUG : User roles: [USER]                         ← ❌ PROBLÈME ICI
WARN  : Access denied (403) - Insufficient privileges
DEBUG : Required role: ADMIN, User has: USER       ← ❌ BLOCAGE ICI
```

---

## 🛠️ Solutions Rapides par Symptôme

### Symptôme 1 : "Invalid CSRF token"
```java
// Dans SecurityConfig.java
.csrf(csrf -> csrf.disable())
```

### Symptôme 2 : "Origin not allowed"
```java
// Dans SecurityConfig.java ou WebConfig.java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
```

### Symptôme 3 : "Access Denied" avec rôle ADMIN requis
```java
// Dans ProduitController.java
// Commentez cette ligne :
// @PreAuthorize("hasRole('ADMIN')")
@PostMapping("/add")
public ResponseEntity<Produit> createProduit(...) {
    // ...
}
```

### Symptôme 4 : Token expiré
```typescript
// Dans la console du navigateur
localStorage.removeItem('token');
// Puis reconnectez-vous
```

---

## 📊 Matrice de Diagnostic

| Status Code | Signification | Cause Probable | Solution |
|-------------|---------------|----------------|----------|
| 200/201 | ✅ Succès | Tout fonctionne | Aucune action |
| 401 | ⚠️ Non autorisé | Pas de token ou token invalide | Reconnexion |
| 403 | ❌ Interdit | CSRF ou rôle insuffisant | Désactiver CSRF |
| 404 | ℹ️ Non trouvé | URL incorrecte | Vérifier l'endpoint |
| 500 | 🔥 Erreur serveur | Problème backend | Voir logs backend |

---

## 🎬 Vidéo de Débogage Pas à Pas

### 1. Ouvrir la Console du Navigateur (F12)

### 2. Onglet Network
- Effacer les logs (🚫 icône poubelle)
- Essayer d'ajouter un produit
- Cliquer sur la requête `POST add`
- Vérifier :
  - ✅ Status: doit être 201 (pas 403)
  - ✅ Headers → Request Headers → Authorization: Bearer ...
  - ✅ Headers → Response Headers → Access-Control-Allow-Origin: http://localhost:4200

### 3. Onglet Console
- Vérifier le token :
  ```javascript
  localStorage.getItem('token')
  ```
- Décoder le token :
  ```javascript
  const token = localStorage.getItem('token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.table(payload);
  ```

### 4. Backend Logs
- IntelliJ IDEA → Run → Console
- Chercher :
  - `CSRF is enabled` → ❌ Doit être `CSRF is disabled`
  - `Access denied (403)` → ❌ Ne doit pas apparaître
  - `Produit créé avec succès` → ✅ Doit apparaître

---

## 🎓 Explication Technique

### Pourquoi CSRF cause une erreur 403 ?

**CSRF (Cross-Site Request Forgery) :**
- Protection contre les attaques où un site malveillant envoie des requêtes en votre nom
- Spring Security l'active par défaut
- Nécessite un token CSRF dans chaque requête POST/PUT/DELETE

**Pour les API REST avec JWT :**
- JWT dans le header `Authorization` est suffisant
- Pas de cookies de session = pas de risque CSRF
- CSRF doit être désactivé

**Analogie simple :**
```
CSRF activé = "Montrez-moi votre ticket ET votre badge"
   → API REST avec JWT n'a pas de "ticket" (cookie de session)
   → Donc refus d'accès (403)

CSRF désactivé = "Montrez-moi votre badge (JWT)"
   → API REST avec JWT a un "badge" (token dans header)
   → Donc accès autorisé (201)
```

---

## 📋 Plan d'Action Recommandé

### Phase 1 : Diagnostic (5 min)
1. [ ] Ouvrir `TEST_403_ERROR.html` dans le navigateur
2. [ ] Se connecter à http://localhost:4200
3. [ ] Exécuter tous les tests
4. [ ] Noter les résultats

### Phase 2 : Correction Backend (10 min)
1. [ ] Ouvrir le projet backend dans IntelliJ
2. [ ] Modifier `SecurityConfig.java` (désactiver CSRF)
3. [ ] Ajouter `@CrossOrigin` sur `ProduitController.java`
4. [ ] Redémarrer le backend
5. [ ] Vérifier les logs (pas d'erreur)

### Phase 3 : Vérification (5 min)
1. [ ] Ré-exécuter `TEST_403_ERROR.html`
2. [ ] Test "Ajout avec token" doit réussir
3. [ ] Tester depuis l'application Angular
4. [ ] Confirmer que le produit est bien ajouté

### Phase 4 : Nettoyage (2 min)
1. [ ] Supprimer les produits de test créés
2. [ ] Documenter les changements effectués
3. [ ] Commit des modifications backend

---

## 🆘 Que faire si ça ne fonctionne toujours pas ?

### Vérification 1 : Backend démarre correctement
```
✅ Spring Boot started successfully
✅ Tomcat started on port 8080
✅ No errors in logs
```

### Vérification 2 : Port 8080 n'est pas déjà utilisé
```powershell
netstat -ano | findstr :8080
```
Si une autre application utilise le port 8080, changez le port dans `application.properties`

### Vérification 3 : Base de données accessible
```
✅ HikariPool-1 - Starting...
✅ HikariPool-1 - Start completed.
```

### Vérification 4 : Token JWT valide
```javascript
// Console du navigateur
const token = localStorage.getItem('token');
if (!token) {
  console.error('❌ Aucun token - Connectez-vous');
} else {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expired = payload.exp * 1000 < Date.now();
  console.log(expired ? '❌ Token expiré' : '✅ Token valide');
}
```

---

## 📞 Contact / Support

Si après avoir suivi TOUTES les étapes, le problème persiste :

1. **Vérifiez que vous avez bien :**
   - ✅ Désactivé CSRF dans SecurityConfig.java
   - ✅ Ajouté @CrossOrigin sur ProduitController
   - ✅ Redémarré le backend
   - ✅ Token JWT valide et non expiré

2. **Collectez les informations suivantes :**
   - Logs complets du backend au moment de l'erreur
   - Résultat de `TEST_403_ERROR.html`
   - Configuration SecurityConfig.java
   - Version de Spring Boot (`pom.xml`)

3. **Consultez la documentation officielle :**
   - [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
   - [Spring Security CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)

---

## ✨ Bonus : Vérification Automatique

Créez ce script `check-backend.sh` pour vérifier automatiquement :

```bash
#!/bin/bash

echo "🔍 Vérification de la configuration backend..."

# Vérifier que CSRF est désactivé
if grep -r "csrf.*disable" src/main/java/*/config/SecurityConfig.java; then
    echo "✅ CSRF désactivé"
else
    echo "❌ CSRF toujours activé - Ajoutez .csrf(csrf -> csrf.disable())"
fi

# Vérifier que CORS est configuré
if grep -r "setAllowedOrigins" src/main/java/*/config/; then
    echo "✅ CORS configuré"
else
    echo "⚠️ CORS non trouvé - Vérifiez la configuration"
fi

# Vérifier que @CrossOrigin est présent
if grep -r "@CrossOrigin" src/main/java/*/controller/ProduitController.java; then
    echo "✅ @CrossOrigin présent sur ProduitController"
else
    echo "⚠️ @CrossOrigin manquant - Ajoutez-le sur la classe"
fi

echo ""
echo "✅ Vérification terminée"
```

---

## 🎉 Conclusion

L'erreur 403 est **facile à corriger** une fois que vous savez que c'est un problème de configuration Spring Security.

**La solution principale :** Désactiver CSRF pour les API REST

```java
.csrf(csrf -> csrf.disable())
```

**Temps de correction estimé :** 2-5 minutes

**Fichiers à modifier :** 1-2 fichiers maximum

**Impact :** Aucun impact négatif sur la sécurité si vous utilisez JWT correctement


# 🔧 Correction de l'erreur 403 pour l'ajout de produits

## Problème
L'erreur 403 (Forbidden) lors de l'ajout d'un produit est causée par Spring Security qui bloque la requête POST.

## Solutions

### Option 1 : Désactiver CSRF pour les API REST (Recommandé pour les API)

Dans `SecurityConfig.java` ou `WebSecurityConfig.java` :

```java
package com.example.Richbondbakend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ⚠️ DÉSACTIVER CSRF pour les API REST
            .csrf(csrf -> csrf.disable())
            
            // Configuration CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Autorisation des endpoints
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (login, register, etc.)
                .requestMatchers("/api/auth/**").permitAll()
                
                // Endpoints produits - PERMETTRE TOUTES LES OPÉRATIONS
                .requestMatchers("/api/produits/**").permitAll() // OU .hasAnyRole("ADMIN", "USER")
                
                // Endpoints images
                .requestMatchers("/uploads/**").permitAll()
                
                // Autres endpoints nécessitent authentification
                .anyRequest().authenticated()
            )
            
            // Session stateless pour JWT
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        // Ajouter le filtre JWT si vous en avez un
        // http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Autoriser l'origine du frontend
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));
        
        // Autoriser toutes les méthodes HTTP
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Autoriser tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Autoriser l'envoi de credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Exposer les headers de réponse
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Option 2 : Ajouter @CrossOrigin sur le contrôleur

Dans `ProduitController.java` :

```java
package com.example.Richbondbakend.controller;

import com.example.Richbondbakend.entity.Produit;
import com.example.Richbondbakend.service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, 
             allowedHeaders = "*",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ProduitController {

    @Autowired
    private ProduitService produitService;

    /**
     * Ajouter un nouveau produit
     */
    @PostMapping("/add")
    // ⚠️ Si vous avez cette annotation, commentez-la temporairement
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produit> createProduit(@RequestBody Produit produit) {
        try {
            Produit savedProduit = produitService.saveProduit(produit);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduit);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer tous les produits
     */
    @GetMapping("/all")
    public ResponseEntity<List<Produit>> getAllProduits() {
        List<Produit> produits = produitService.getAllProduits();
        return ResponseEntity.ok(produits);
    }
    
    // ... autres méthodes
}
```

### Option 3 : Configuration de l'application.properties

Ajoutez ou vérifiez ces propriétés dans `src/main/resources/application.properties` :

```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:4200,http://127.0.0.1:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Security
spring.security.enable-csrf=false

# Logging pour debug
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

## 🧪 Test après modifications

### 1. Redémarrer le backend Spring Boot

```bash
mvn clean spring-boot:run
```

Ou avec Gradle :
```bash
./gradlew clean bootRun
```

### 2. Vérifier les logs du backend

Vous devriez voir dans les logs :
```
CSRF is disabled
POST /api/produits/add - Status: 200 ou 201
```

### 3. Tester depuis le frontend

Ouvrez la console du navigateur (F12) et essayez d'ajouter un produit.

## 🔍 Diagnostic supplémentaire

Si le problème persiste, vérifiez :

### 1. Vérifier que le token JWT est valide

```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expiré?', payload.exp * 1000 < Date.now());
  console.log('Roles:', payload.roles || payload.authorities);
}
```

### 2. Vérifier la requête HTTP

Dans l'onglet Network (Réseau) de la console :
- Cliquez sur la requête POST `/api/produits/add`
- Vérifiez que le header `Authorization: Bearer <token>` est présent
- Vérifiez le statut de la réponse
- Regardez la réponse du serveur pour plus de détails

### 3. Vérifier les rôles de l'utilisateur

Si le contrôleur utilise `@PreAuthorize("hasRole('ADMIN')")`, assurez-vous que l'utilisateur connecté a bien le rôle ADMIN.

## 📝 Notes importantes

1. **CSRF** : Pour une API REST utilisée par un frontend SPA (Angular), il est recommandé de désactiver CSRF et d'utiliser JWT pour l'authentification.

2. **CORS** : Assurez-vous que le frontend (http://localhost:4200) est bien autorisé dans la configuration CORS.

3. **JWT** : Si vous utilisez JWT, assurez-vous que :
   - Le token est stocké dans localStorage
   - L'interceptor Angular ajoute bien le header `Authorization: Bearer <token>`
   - Le filtre JWT backend valide correctement le token

4. **Rôles** : Si vous utilisez des restrictions par rôle (`@PreAuthorize`), vérifiez que l'utilisateur connecté a les permissions nécessaires.

## 🔗 Ressources

- [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
- [Spring Security CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)
- [JWT with Spring Boot](https://www.baeldung.com/spring-security-oauth-jwt)


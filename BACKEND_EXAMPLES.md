# 📝 Exemples de Code Backend - Correction Erreur 403

## 🎯 Fichiers à créer/modifier dans le backend

### 1. SecurityConfig.java

**Chemin :** `src/main/java/com/example/Richbondbakend/config/SecurityConfig.java`

```java
package com.example.Richbondbakend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ⚠️ DÉSACTIVER CSRF pour les API REST (IMPORTANT !)
            .csrf(csrf -> csrf.disable())
            
            // Configuration CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Autorisation des endpoints
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (authentification)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/login/**").permitAll()
                .requestMatchers("/api/register/**").permitAll()
                
                // Endpoints produits - PERMETTRE TOUTES LES OPÉRATIONS
                .requestMatchers("/api/produits/**").permitAll()
                // OU si vous voulez restreindre par rôle :
                // .requestMatchers("/api/produits/**").hasAnyRole("ADMIN", "USER")
                
                // Endpoints images et uploads
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/produits/*/images/**").permitAll()
                
                // Swagger UI (si vous l'utilisez)
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Actuator (si vous l'utilisez)
                .requestMatchers("/actuator/**").permitAll()
                
                // WebSocket (si vous l'utilisez)
                .requestMatchers("/ws/**").permitAll()
                
                // Tous les autres endpoints nécessitent authentification
                .anyRequest().authenticated()
            )
            
            // Session stateless pour JWT
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        // ⚠️ Si vous avez un filtre JWT, décommentez cette ligne
        // http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Autoriser l'origine du frontend Angular
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "http://localhost:5173" // Au cas où vous utilisez Vite
        ));
        
        // Autoriser TOUTES les méthodes HTTP
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Autoriser TOUS les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Autoriser l'envoi de credentials (cookies, authorization headers, etc.)
        configuration.setAllowCredentials(true);
        
        // Exposer les headers de réponse
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Disposition",
            "X-Total-Count"
        ));
        
        // Durée de mise en cache de la réponse preflight (OPTIONS)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

### 2. ProduitController.java

**Chemin :** `src/main/java/com/example/Richbondbakend/controller/ProduitController.java`

```java
package com.example.Richbondbakend.controller;

import com.example.Richbondbakend.entity.Produit;
import com.example.Richbondbakend.entity.ProduitImage;
import com.example.Richbondbakend.service.ProduitService;
import com.example.Richbondbakend.service.ProduitImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
// ⚠️ IMPORTANT : Ajouter @CrossOrigin pour autoriser les requêtes depuis Angular
@CrossOrigin(
    origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, 
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class ProduitController {

    @Autowired
    private ProduitService produitService;
    
    @Autowired
    private ProduitImageService produitImageService;

    /**
     * Ajouter un nouveau produit
     * ⚠️ Si vous avez @PreAuthorize, commentez-le temporairement pour tester
     */
    @PostMapping("/add")
    // @PreAuthorize("hasRole('ADMIN')") // ⚠️ Commentez cette ligne si elle existe
    public ResponseEntity<Produit> createProduit(@RequestBody Produit produit) {
        try {
            System.out.println("📥 Réception requête POST /api/produits/add");
            System.out.println("   Marque: " + produit.getMarque());
            System.out.println("   Article: " + produit.getArticle());
            
            Produit savedProduit = produitService.saveProduit(produit);
            
            System.out.println("✅ Produit créé avec succès - ID: " + savedProduit.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduit);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création du produit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer tous les produits
     */
    @GetMapping("/all")
    public ResponseEntity<List<Produit>> getAllProduits() {
        try {
            System.out.println("📥 Réception requête GET /api/produits/all");
            List<Produit> produits = produitService.getAllProduits();
            System.out.println("✅ " + produits.size() + " produits trouvés");
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération des produits: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer un produit par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        try {
            Produit produit = produitService.getProduitById(id);
            if (produit != null) {
                return ResponseEntity.ok(produit);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mettre à jour un produit
     */
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // ⚠️ Commentez si nécessaire
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @RequestBody Produit produit) {
        try {
            produit.setId(id);
            Produit updatedProduit = produitService.updateProduit(produit);
            return ResponseEntity.ok(updatedProduit);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Supprimer un produit
     */
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // ⚠️ Commentez si nécessaire
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        try {
            produitService.deleteProduit(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS POUR LES IMAGES ==========
    
    /**
     * Uploader une image pour un produit
     */
    @PostMapping("/{produitId}/images/upload")
    public ResponseEntity<ProduitImage> uploadImage(
            @PathVariable Long produitId,
            @RequestParam("file") MultipartFile file) {
        try {
            ProduitImage image = produitImageService.saveImage(produitId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(image);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer une image (blob)
     */
    @GetMapping("/{produitId}/images/{imageId}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long produitId,
            @PathVariable Long imageId) {
        try {
            ProduitImage image = produitImageService.getImage(imageId);
            if (image != null && image.getImageData() != null) {
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getMimeType()))
                    .body(image.getImageData());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer la thumbnail d'une image
     */
    @GetMapping("/{produitId}/images/{imageId}/thumbnail")
    public ResponseEntity<byte[]> getThumbnail(
            @PathVariable Long produitId,
            @PathVariable Long imageId) {
        try {
            ProduitImage image = produitImageService.getImage(imageId);
            if (image != null && image.getThumbnailData() != null) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(image.getThumbnailData());
            } else if (image != null && image.getImageData() != null) {
                // Si pas de thumbnail, retourner l'image complète
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getMimeType()))
                    .body(image.getImageData());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

---

### 3. application.properties

**Chemin :** `src/main/resources/application.properties`

```properties
# ========== Configuration Serveur ==========
server.port=8080
server.servlet.context-path=/

# ========== Configuration Base de Données ==========
spring.datasource.url=jdbc:mysql://localhost:3306/richbond_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# ========== Configuration CORS ==========
spring.web.cors.allowed-origins=http://localhost:4200,http://127.0.0.1:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# ========== Configuration Sécurité ==========
# ⚠️ IMPORTANT : Désactiver CSRF pour les API REST
spring.security.enable-csrf=false

# ========== Configuration JWT ==========
jwt.secret=VotreClefSecreteTresLongueEtComplexePourLaSecuriteMaximale123456789
jwt.expiration=86400000

# ========== Configuration Upload de fichiers ==========
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Dossier de stockage des images
upload.path=uploads/

# ========== Configuration Logging ==========
# Niveau de log pour Spring Security (utile pour le debug)
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.com.example.Richbondbakend=DEBUG

# ========== Configuration JPA Open-in-View ==========
spring.jpa.open-in-view=false
```

---

### 4. WebConfig.java (Configuration CORS globale)

**Chemin :** `src/main/java/com/example/Richbondbakend/config/WebConfig.java`

```java
package com.example.Richbondbakend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:4200",
                    "http://127.0.0.1:4200"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

### 5. JwtAuthenticationFilter.java (si vous utilisez JWT)

**Chemin :** `src/main/java/com/example/Richbondbakend/security/JwtAuthenticationFilter.java`

```java
package com.example.Richbondbakend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret)
                        .parseClaimsJws(token)
                        .getBody();
                
                String username = claims.getSubject();
                
                // Extraire les rôles
                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);
                
                if (roles == null) {
                    roles = new ArrayList<>();
                    String role = claims.get("role", String.class);
                    if (role != null) {
                        roles.add(role);
                    }
                }
                
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                for (String role : roles) {
                    // Spring Security nécessite le préfixe ROLE_
                    if (!role.startsWith("ROLE_")) {
                        role = "ROLE_" + role;
                    }
                    authorities.add(new SimpleGrantedAuthority(role));
                }
                
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                System.out.println("✅ Token JWT valide pour l'utilisateur: " + username + " | Rôles: " + roles);
                
            } catch (Exception e) {
                System.err.println("❌ Erreur de validation du token JWT: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

### 6. Produit.java (Entity)

**Chemin :** `src/main/java/com/example/Richbondbakend/entity/Produit.java`

```java
package com.example.Richbondbakend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produits")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marque;

    private String reference;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false)
    private String article;

    @Column(nullable = false)
    private String type;

    private String dimensions;

    @Column(nullable = false)
    private Double prix;

    @Column(nullable = false)
    private String famille;

    private String sousMarques;

    private String codeEAN;

    private String designationArticle;

    @Column(nullable = false)
    private Boolean disponible = true;

    // Image en base64 (compatibilité ancienne version)
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    // Relation avec les images
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ProduitImage> images = new ArrayList<>();

    // Méthodes utilitaires
    public void addImage(ProduitImage image) {
        images.add(image);
        image.setProduit(this);
    }

    public void removeImage(ProduitImage image) {
        images.remove(image);
        image.setProduit(null);
    }
}
```

---

## 🚀 Étapes de déploiement

### 1. Arrêter le backend actuel

Dans IntelliJ IDEA ou votre IDE :
- Cliquez sur le bouton Stop (carré rouge)
- Ou appuyez sur Ctrl+F2

### 2. Nettoyer et recompiler le projet

#### Avec Maven :
```bash
cd path/to/backend/project
mvn clean install
```

#### Avec Gradle :
```bash
cd path/to/backend/project
./gradlew clean build
```

### 3. Redémarrer le backend

#### Avec Maven :
```bash
mvn spring-boot:run
```

#### Avec Gradle :
```bash
./gradlew bootRun
```

#### Avec IntelliJ IDEA :
- Clic droit sur `RichbondbakendApplication.java`
- "Run RichbondbakendApplication"

### 4. Vérifier les logs au démarrage

Vous devriez voir :
```
✅ Spring Boot started successfully
✅ Tomcat started on port 8080
⚠️  CSRF is disabled
✅ CORS configuration loaded
```

### 5. Tester depuis le frontend Angular

- Ouvrez http://localhost:4200
- Connectez-vous
- Essayez d'ajouter un produit
- Vérifiez que l'erreur 403 a disparu

---

## 🐛 Troubleshooting

### Si l'erreur 403 persiste après les modifications :

#### 1. Vérifiez que les modifications sont bien prises en compte

```bash
# Nettoyer complètement le projet
mvn clean
rm -rf target/

# Recompiler
mvn clean package

# Redémarrer
mvn spring-boot:run
```

#### 2. Vérifiez les logs du backend

Cherchez dans les logs :
```
CSRF is enabled: false  ✅
CORS configuration: ...  ✅
```

#### 3. Vérifiez que le contrôleur utilise bien les bonnes annotations

```java
@RestController  ✅
@RequestMapping("/api/produits")  ✅
@CrossOrigin(...)  ✅
```

#### 4. Testez avec Postman ou curl

```bash
# Test sans token
curl -X POST http://localhost:8080/api/produits/add \
  -H "Content-Type: application/json" \
  -d '{
    "marque": "Test",
    "reference": "REF123",
    "categorie": "Matelas",
    "article": "Test",
    "type": "Standard",
    "dimensions": "140x190",
    "prix": 1999,
    "famille": "MATELAS",
    "sousMarques": "R VITAL",
    "codeEAN": "123456",
    "designationArticle": "Test",
    "disponible": true
  }'
```

#### 5. Vérifiez les dépendances Maven

Dans `pom.xml`, assurez-vous d'avoir :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

---

## 📞 Support

Si le problème persiste après avoir appliqué toutes ces solutions :

1. Vérifiez les logs du backend pour des erreurs spécifiques
2. Vérifiez que le port 8080 n'est pas utilisé par une autre application
3. Essayez de désactiver complètement Spring Security temporairement pour tester
4. Vérifiez que les dépendances Maven/Gradle sont correctement installées

---

## ✅ Checklist finale

- [ ] CSRF désactivé dans SecurityConfig.java
- [ ] CORS configuré pour http://localhost:4200
- [ ] @CrossOrigin ajouté sur ProduitController
- [ ] @PreAuthorize commenté ou rôles corrects
- [ ] Backend redémarré après modifications
- [ ] Tests effectués avec test-403-error.ps1
- [ ] Logs du backend vérifiés
- [ ] Token JWT valide et non expiré
- [ ] Frontend peut ajouter des produits sans erreur 403


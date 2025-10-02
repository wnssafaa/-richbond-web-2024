# Guide d'Intégration Email - Partage de Rapports de Visite

## Vue d'ensemble

Ce guide explique comment intégrer la fonctionnalité de partage par email des rapports de visite avec votre API backend.

## Fonctionnalités Implémentées

### Frontend (Angular)
- ✅ Service d'email (`EmailService`)
- ✅ Dialog de partage par email (`ShareVisitEmailComponent`)
- ✅ Bouton "Partager par email" dans la page de détail de visite
- ✅ Template HTML pour les emails
- ✅ Traductions (français/anglais)
- ✅ Validation des emails
- ✅ Gestion des pièces jointes (CSV + images)

### Backend (À implémenter)
- ❌ Endpoint d'envoi d'emails
- ❌ Configuration SMTP
- ❌ Gestion des pièces jointes

## API Backend Requise

### Endpoint d'Envoi d'Email

**URL:** `POST /api/email/send`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "to": "destinataire@example.com",
  "subject": "Rapport de visite #123 - Magasin ABC",
  "body": "<html>...</html>",
  "attachments": [
    {
      "filename": "rapport_visite_123.csv",
      "content": "base64-encoded-content",
      "contentType": "text/csv"
    },
    {
      "filename": "image_visite_123_1.jpg",
      "content": "base64-encoded-image",
      "contentType": "image/jpeg"
    }
  ]
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "unique-message-id"
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Configuration Backend

### 1. Configuration SMTP

Ajoutez ces propriétés à votre `application.properties` ou `application.yml`:

```properties
# SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com

# Email Templates
email.from.address=noreply@richbond.com
email.from.name=Richbond System
```

### 2. Dépendances Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 3. Service Email (Java/Spring Boot)

```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${email.from.address}")
    private String fromAddress;
    
    @Value("${email.from.name}")
    private String fromName;
    
    public void sendEmail(EmailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Headers
            helper.setFrom(fromAddress, fromName);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getBody(), true); // HTML content
            
            // Attachments
            if (request.getAttachments() != null) {
                for (EmailAttachment attachment : request.getAttachments()) {
                    byte[] content = Base64.getDecoder().decode(attachment.getContent());
                    helper.addAttachment(
                        attachment.getFilename(),
                        new ByteArrayResource(content),
                        attachment.getContentType()
                    );
                }
            }
            
            mailSender.send(message);
            
        } catch (Exception e) {
            throw new EmailException("Failed to send email", e);
        }
    }
}
```

### 4. Controller

```java
@RestController
@RequestMapping("/api/email")
public class EmailController {
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/send")
    public ResponseEntity<EmailResponse> sendEmail(@RequestBody EmailRequest request) {
        try {
            emailService.sendEmail(request);
            return ResponseEntity.ok(new EmailResponse(true, "Email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new EmailResponse(false, e.getMessage()));
        }
    }
}
```

### 5. DTOs

```java
public class EmailRequest {
    private String to;
    private String subject;
    private String body;
    private List<EmailAttachment> attachments;
    
    // Getters and setters
}

public class EmailAttachment {
    private String filename;
    private String content; // Base64 encoded
    private String contentType;
    
    // Getters and setters
}

public class EmailResponse {
    private boolean success;
    private String message;
    
    // Constructors, getters and setters
}
```

## Sécurité

### 1. Validation des Emails
- Valider le format de l'email côté backend
- Limiter le nombre d'emails par utilisateur/minute
- Vérifier que l'utilisateur a le droit d'envoyer des emails

### 2. Limites de Taille
- Limiter la taille des pièces jointes (ex: 10MB max)
- Limiter le nombre d'images par email (ex: 5 max)

### 3. Rate Limiting
```java
@RateLimiter(name = "email", fallbackMethod = "emailRateLimitFallback")
public ResponseEntity<EmailResponse> sendEmail(@RequestBody EmailRequest request) {
    // Implementation
}
```

## Tests

### 1. Tests Unitaires
```java
@Test
public void testSendEmail() {
    EmailRequest request = new EmailRequest();
    request.setTo("test@example.com");
    request.setSubject("Test");
    request.setBody("<html>Test</html>");
    
    emailService.sendEmail(request);
    
    // Verify email was sent
}
```

### 2. Tests d'Intégration
- Tester avec différents fournisseurs SMTP
- Tester avec des pièces jointes volumineuses
- Tester la gestion des erreurs

## Monitoring

### 1. Logs
```java
@Slf4j
@Service
public class EmailService {
    
    public void sendEmail(EmailRequest request) {
        log.info("Sending email to: {}", request.getTo());
        try {
            // Send email
            log.info("Email sent successfully to: {}", request.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to: {}", request.getTo(), e);
            throw e;
        }
    }
}
```

### 2. Métriques
- Nombre d'emails envoyés par jour
- Taux de succès/échec
- Temps de traitement moyen

## Déploiement

### 1. Variables d'Environnement
```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
EMAIL_FROM_ADDRESS=noreply@richbond.com
EMAIL_FROM_NAME=Richbond System
```

### 2. Configuration Docker
```dockerfile
ENV SPRING_MAIL_HOST=smtp.gmail.com
ENV SPRING_MAIL_PORT=587
ENV SPRING_MAIL_USERNAME=${MAIL_USERNAME}
ENV SPRING_MAIL_PASSWORD=${MAIL_PASSWORD}
```

## Dépannage

### Problèmes Courants

1. **Erreur d'authentification SMTP**
   - Vérifier les identifiants
   - Activer l'authentification à 2 facteurs
   - Utiliser un mot de passe d'application

2. **Emails non reçus**
   - Vérifier le dossier spam
   - Vérifier les logs du serveur
   - Tester avec un autre fournisseur SMTP

3. **Pièces jointes trop volumineuses**
   - Réduire la qualité des images
   - Limiter le nombre d'images
   - Compresser les fichiers

## Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Note:** Ce guide est basé sur Spring Boot. Adaptez-le selon votre stack technologique backend.


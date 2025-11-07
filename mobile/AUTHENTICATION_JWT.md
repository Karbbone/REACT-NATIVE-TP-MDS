# Système d'authentification JWT - Documentation

## 📋 Résumé de l'implémentation

J'ai créé un système complet d'authentification JWT pour votre application Spring Boot avec :

### 1. Route Login (POST /users/login)
- Vérifie l'email et le mot de passe
- Retourne un token JWT + les infos de l'utilisateur
- Statut 401 si mauvais identifiants

### 2. Route Register (POST /users/register) - Mise à jour
- Crée un nouvel utilisateur
- Retourne automatiquement un token JWT + les infos de l'utilisateur
- Statut 201 en cas de succès

### 3. Middleware JWT (JwtAuthenticationFilter)
- Intercepte toutes les requêtes HTTP
- Vérifie le header `Authorization: Bearer <token>`
- Valide le token JWT
- Ajoute l'utilisateur dans le contexte de sécurité Spring

---

## 📁 Fichiers créés/modifiés

### Fichiers de sécurité (package `mds.mobile.security`)

1. **JwtService.java**
   - Génère des tokens JWT
   - Valide les tokens
   - Extrait les informations du token (userId, email)

2. **JwtAuthenticationFilter.java**
   - Filtre Spring qui intercepte les requêtes
   - Vérifie et valide les tokens JWT
   - Configure l'authentification dans le contexte

3. **SecurityConfig.java**
   - Configuration de Spring Security
   - Définit les routes publiques : `/users/register` et `/users/login`
   - Toutes les autres routes nécessitent un JWT valide
   - Désactive CSRF (car API stateless)
   - Mode session : STATELESS

4. **CurrentUserService.java**
   - Service utilitaire pour récupérer l'ID de l'utilisateur connecté
   - Utilisable dans tous les contrôleurs

### Fichiers utilisateur (package `mds.mobile.user`)

5. **UserController.java** - Mis à jour
   - Route `/login` complète avec validation JWT
   - Route `/register` retourne maintenant un token JWT

6. **UserLoginResponse.java** - Nouveau
   - DTO pour la réponse de login/register avec token

7. **UserProfileController.java** - Exemple
   - Route protégée `/users/me`
   - Retourne les infos de l'utilisateur connecté
   - Démontre l'utilisation du middleware

### Configuration

8. **pom.xml** - Mis à jour
   - Ajout des dépendances JWT (jjwt 0.12.3)
   - Ajout de Spring Security

9. **application.properties** - Mis à jour
   ```properties
   jwt.secret=myVerySecureSecretKeyThatIsAtLeast256BitsLongForHS256AlgorithmSecurity
   jwt.expiration=86400000  # 24 heures en millisecondes
   ```

---

## 🔐 Comment utiliser l'authentification

### 1. S'inscrire
```bash
POST http://localhost:8080/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Se connecter
```bash
POST http://localhost:8080/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 3. Accéder aux routes protégées
```bash
GET http://localhost:8080/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Réponse (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## 🛡️ Comment protéger une route

### Méthode 1 : Par défaut (Configuration actuelle)
Toutes les routes SAUF `/users/register` et `/users/login` sont automatiquement protégées.

### Méthode 2 : Dans un contrôleur
```java
@RestController
@RequestMapping("/api")
public class ProtectedController {
    
    private final CurrentUserService currentUserService;
    
    @GetMapping("/protected")
    public ResponseEntity<?> protectedRoute() {
        // Récupérer l'ID de l'utilisateur connecté
        UUID userId = currentUserService.getCurrentUserId();
        
        // Faire quelque chose avec userId...
        return ResponseEntity.ok("Protected data for user: " + userId);
    }
}
```

---

## 🔧 Configuration personnalisée

### Modifier la durée d'expiration du token
Dans `application.properties` :
```properties
jwt.expiration=3600000  # 1 heure en millisecondes
```

### Changer la clé secrète JWT
Dans `application.properties` :
```properties
jwt.secret=VotreCléSecrèteTrèsLongueEtSécurisée
```
⚠️ **Important** : La clé doit faire au moins 256 bits (32 caractères) pour HS256

### Ajouter des routes publiques
Dans `SecurityConfig.java` :
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/users/register", "/users/login", "/public/**").permitAll()
    .anyRequest().authenticated()
)
```

---

## 🧪 Test du système

1. Démarrez l'application Spring Boot
2. Inscrivez-vous via `/users/register`
3. Copiez le token retourné
4. Utilisez ce token dans le header `Authorization: Bearer <token>` pour accéder aux routes protégées

---

## 📝 Notes importantes

- Les tokens JWT sont valides pendant 24 heures par défaut
- Le mot de passe est hashé en SHA-256 avant stockage
- Le middleware vérifie automatiquement la validité du token
- Si le token est invalide/expiré, l'accès est refusé (401 Unauthorized)
- L'utilisateur connecté est accessible via `CurrentUserService.getCurrentUserId()`

---

## ⚠️ Sécurité en production

Pour la production, pensez à :
1. Utiliser une variable d'environnement pour `jwt.secret`
2. Utiliser bcrypt au lieu de SHA-256 pour les mots de passe
3. Activer HTTPS
4. Ajouter un système de refresh tokens
5. Implémenter une blacklist de tokens


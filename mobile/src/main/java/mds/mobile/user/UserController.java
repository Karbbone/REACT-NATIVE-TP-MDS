package mds.mobile.user;

import mds.mobile.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest req) {
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email: " + req.email());

        // Chercher l'utilisateur par email
        Optional<User> userOptional = userRepository.findByEmail(req.email());

        if (userOptional.isEmpty()) {
            System.out.println("User not found with email: " + req.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "bad_password_or_email", "message", "Bad email or password"));
        }

        User user = userOptional.get();
        System.out.println("User found: " + user.getId());

        // Vérifier le mot de passe
        try {
            String hashedPassword = hashPassword(req.password());
            System.out.println("Hashed password from request: " + hashedPassword);
            System.out.println("Stored password hash: " + user.getPassword());

            if (!hashedPassword.equals(user.getPassword())) {
                System.out.println("Password mismatch!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "bad_password_or_email", "message", "Bad email or password"));
            }
            System.out.println("Password matched!");
        } catch (NoSuchAlgorithmException e) {
            System.out.println("Hash algorithm error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "server_error", "message", "Unable to process password"));
        }

        // Générer le token JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail());

        // Créer la réponse
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );

        UserLoginResponse response = new UserLoginResponse(token, userResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "user_exists", "message", "Email already registered"));
        }

        User user = new User();
        user.setEmail(req.email());
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        try {
            user.setPassword(hashPassword(req.password()));
        } catch (NoSuchAlgorithmException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "server_error", "message", "Unable to process password"));
        }

        try {
            User saved = userRepository.save(user);

            // Générer le token JWT
            String token = jwtService.generateToken(saved.getId(), saved.getEmail());

            UserResponse userResponse = new UserResponse(
                    saved.getId(),
                    saved.getEmail(),
                    saved.getFirstName(),
                    saved.getLastName()
            );

            UserLoginResponse response = new UserLoginResponse(token, userResponse);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "user_exists", "message", "Email already registered"));
        }
    }

    private static String hashPassword(String plain) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(plain.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest);
    }
}


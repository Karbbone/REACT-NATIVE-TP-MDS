package mds.mobile.user;

import mds.mobile.security.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserProfileController(UserRepository userRepository, CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * Route protégée qui retourne les informations de l'utilisateur connecté
     * Nécessite un token JWT valide dans le header Authorization
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            UUID userId = currentUserService.getCurrentUserId();

            return userRepository.findById(userId)
                    .map(user -> {
                        UserResponse response = new UserResponse(
                                user.getId(),
                                user.getEmail(),
                                user.getFirstName(),
                                user.getLastName()
                        );
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());

        } catch (IllegalStateException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "unauthorized", "message", "No authenticated user found"));
        }
    }
}


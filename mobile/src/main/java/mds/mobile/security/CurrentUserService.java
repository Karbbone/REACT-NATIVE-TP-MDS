package mds.mobile.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserService {

    /**
     * Récupère l'ID de l'utilisateur actuellement connecté depuis le contexte de sécurité
     * @return L'UUID de l'utilisateur connecté
     * @throws IllegalStateException si aucun utilisateur n'est connecté
     */
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        String userId = (String) authentication.getPrincipal();
        return UUID.fromString(userId);
    }

    /**
     * Vérifie si un utilisateur est actuellement connecté
     * @return true si un utilisateur est connecté, false sinon
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}


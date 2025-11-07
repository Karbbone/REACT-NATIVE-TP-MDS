package mds.mobile.document;

import mds.mobile.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final CurrentUserService currentUserService;

    public DocumentController(DocumentRepository documentRepository, CurrentUserService currentUserService) {
        this.documentRepository = documentRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * GET /documents - Récupère tous les documents (ouvert à tous)
     */
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        return ResponseEntity.ok(documents);
    }

    /**
     * PUT /documents/{id} - Modifie un document (seulement le propriétaire)
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateDocument(@PathVariable UUID id, @RequestBody DocumentUpdateRequest request) {
        // Récupérer le document
        return documentRepository.findById(id)
                .map(document -> {
                    // Vérifier que l'utilisateur connecté est le propriétaire
                    UUID currentUserId = currentUserService.getCurrentUserId();
                    if (!document.getProprietaire().getId().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "forbidden", "message", "Vous n'êtes pas le propriétaire de ce document"));
                    }

                    // Mettre à jour les champs
                    if (request.titre() != null) {
                        document.setTitre(request.titre());
                    }
                    if (request.description() != null) {
                        document.setDescription(request.description());
                    }

                    document.setDateModification(LocalDateTime.now());

                    Document updatedDocument = documentRepository.save(document);
                    return ResponseEntity.ok(updatedDocument);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Document non trouvé")));
    }

    /**
     * DELETE /documents/{id} - Supprime un document (seulement le propriétaire)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteDocument(@PathVariable UUID id) {
        // Récupérer le document
        return documentRepository.findById(id)
                .map(document -> {
                    // Vérifier que l'utilisateur connecté est le propriétaire
                    UUID currentUserId = currentUserService.getCurrentUserId();
                    if (!document.getProprietaire().getId().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "forbidden", "message", "Vous n'êtes pas le propriétaire de ce document"));
                    }

                    // Supprimer le document
                    documentRepository.delete(document);
                    return ResponseEntity.ok(Map.of("message", "Document supprimé avec succès"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Document non trouvé")));
    }
}

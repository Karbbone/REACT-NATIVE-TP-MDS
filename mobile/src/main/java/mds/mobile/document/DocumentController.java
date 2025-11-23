package mds.mobile.document;

import mds.mobile.security.CurrentUserService;
import mds.mobile.category.CategoryRepository;
import mds.mobile.category.Category;
import mds.mobile.storage.MinioStorageService;
import mds.mobile.user.User;
import mds.mobile.user.UserRepository;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final CurrentUserService currentUserService;
    private final CategoryRepository categoryRepository;
    private final MinioStorageService storageService;
    private final UserRepository userRepository;

    public DocumentController(DocumentRepository documentRepository, CurrentUserService currentUserService, CategoryRepository categoryRepository, MinioStorageService storageService, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.currentUserService = currentUserService;
        this.categoryRepository = categoryRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
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
     * GET /documents/{id} - Récupère un document par id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable UUID id) {
        return documentRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Document non trouvé")));
    }

    /**
     * GET /documents/{id}/file - Récupère le fichier (stream) pour affichage/téléchargement
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<?> getFile(@PathVariable UUID id) {
        return documentRepository.findById(id)
                .map(doc -> {
                    try {
                        var stat = storageService.stat(doc.getCheminFichier());
                        var stream = storageService.getObject(doc.getCheminFichier());
                        var resource = new InputStreamResource(stream);

                        String contentType = stat.contentType();
                        if (contentType == null || contentType.isBlank()) {
                            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                        }

                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (doc.getTitre() != null ? doc.getTitre() : "fichier") + "\"")
                                .contentType(MediaType.parseMediaType(contentType))
                                .contentLength(stat.size())
                                .body(resource);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", "read_failed", "message", e.getMessage()));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Document non trouvé")));
    }

    /**
     * POST /documents - Crée un document avec upload du fichier vers MinIO (auth requis)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categorieId
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "invalid_file", "message", "Aucun fichier fourni ou fichier vide"));
        }

        UUID currentUserId = currentUserService.getCurrentUserId();
        User proprietaire = userRepository.findById(currentUserId).orElse(null);
        if (proprietaire == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "unauthorized", "message", "Utilisateur introuvable"));
        }

        Category categorie = null;
        if (categorieId != null) {
            categorie = categoryRepository.findById(categorieId).orElse(null);
            if (categorie == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "invalid_category", "message", "Catégorie introuvable"));
            }
        }

        try {
            String sanitizedOriginal = file.getOriginalFilename() != null ? file.getOriginalFilename().replace("\\", "_").replace("/", "_") : "file";
            String objectName = currentUserId + "/" + UUID.randomUUID() + "_" + sanitizedOriginal;
            String objectKey = storageService.upload(file, objectName);

            Document doc = Document.builder()
                    .titre(titre)
                    .description(description)
                    .cheminFichier(objectKey)
                    .typeFichier(file.getContentType())
                    .taille(file.getSize())
                    .proprietaire(proprietaire)
                    .categorie(categorie)
                    .dateDepot(LocalDateTime.now())
                    .dateModification(LocalDateTime.now())
                    .build();

            Document saved = documentRepository.save(doc);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "upload_failed", "message", e.getMessage()));
        }
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
                    if (request.categorieId() != null) {
                        Category categorie = categoryRepository.findById(request.categorieId()).orElse(null);
                        if (categorie == null) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "invalid_category", "message", "Catégorie introuvable"));
                        }
                        document.setCategorie(categorie);
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

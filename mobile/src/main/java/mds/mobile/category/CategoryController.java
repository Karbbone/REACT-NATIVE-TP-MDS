package mds.mobile.category;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * GET /categories - Liste toutes les catégories
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /**
     * GET /categories/{id} - Récupère une catégorie par son id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Catégorie non trouvée")));
    }

    /**
     * POST /categories - Crée une nouvelle catégorie
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody CategoryCreateRequest req) {
        if (req == null || req.nom() == null || req.nom().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "invalid_request", "message", "Nom de catégorie requis"));
        }

        Category category = Category.builder().nom(req.nom().trim()).build();
        try {
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "category_exists", "message", "Une catégorie avec ce nom existe déjà"));
        }
    }

    /**
     * PUT /categories/{id} - Met à jour le nom d'une catégorie
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CategoryUpdateRequest req) {
        return categoryRepository.findById(id)
                .map(category -> {
                    if (req == null || req.nom() == null || req.nom().isBlank()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "invalid_request", "message", "Nom de catégorie requis"));
                    }
                    category.setNom(req.nom().trim());
                    try {
                        Category saved = categoryRepository.save(category);
                        return ResponseEntity.ok(saved);
                    } catch (DataIntegrityViolationException e) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("error", "category_exists", "message", "Une catégorie avec ce nom existe déjà"));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Catégorie non trouvée")));
    }

    /**
     * DELETE /categories/{id} - Supprime une catégorie
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok(Map.of("message", "Catégorie supprimée avec succès"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Catégorie non trouvée")));
    }
}


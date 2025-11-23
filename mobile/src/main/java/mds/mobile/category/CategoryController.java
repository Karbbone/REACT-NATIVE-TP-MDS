package mds.mobile.category;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * GET /categories - Retrieve all categories
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    /**
     * POST /categories - Create a new category
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request) {
        // Check if category with the same name already exists
        if (categoryRepository.findByName(request.name()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "category_exists", "message", "A category with this name already exists"));
        }

        try {
            Category category = Category.builder()
                    .name(request.name())
                    .build();
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "category_exists", "message", "A category with this name already exists"));
        }
    }

    /**
     * PUT /categories/{id} - Update a category
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return categoryRepository.findById(id)
                .<ResponseEntity<?>>map(category -> {
                    // Check if another category with the same name exists
                    categoryRepository.findByName(request.name()).ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new IllegalStateException("Category name already exists");
                        }
                    });

                    category.setName(request.name());
                    Category updated = categoryRepository.save(category);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Category not found")));
    }

    /**
     * DELETE /categories/{id} - Delete a category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        return categoryRepository.findById(id)
                .<ResponseEntity<?>>map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "not_found", "message", "Category not found")));
    }
}

package com.rms.controller;

import com.rms.dto.ProductDTO;
import com.rms.dto.ProductRequestDTO;
import com.rms.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wholesalers/{wholesalerId}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * GET ALL PRODUCTS
     * @param wholesalerId
     * @param page
     * @param size
     * @param sortBy
     * @param sortDir
     * @return
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @PathVariable Long wholesalerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductDTO> productsPage = productService.getAllProducts(wholesalerId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("products", productsPage.getContent());
        response.put("currentPage", productsPage.getNumber());
        response.put("totalItems", productsPage.getTotalElements());
        response.put("totalPages", productsPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * GET CATEGORIES
     * @param wholesalerId
     * @return
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories(@PathVariable Long wholesalerId) {
        List<String> categories = productService.getAllCategories(wholesalerId);
        return ResponseEntity.ok(categories);
    }

    /**
     * GET PRODUCTS BY CATEGORY
     * @param wholesalerId
     * @param category
     * @param page
     * @param size
     * @return
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @PathVariable Long wholesalerId,
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByCategory(wholesalerId, category, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * SEARCH PRODUCTS
     * @param wholesalerId
     * @param query
     * @param page
     * @param size
     * @return
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @PathVariable Long wholesalerId,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.searchProducts(wholesalerId, query, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * CREATE PRODUCT
     * @param wholesalerId
     * @param productRequestDTO
     * @return
     */
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @PathVariable Long wholesalerId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        // Set wholesalerId from path
        productRequestDTO.setWholesalerId(wholesalerId);
        ProductDTO createdProduct = productService.createProduct(productRequestDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * GET SINGLE PRODUCT BY ID
     * @param wholesalerId
     * @param productId
     * @return
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId) {

        ProductDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    /**
     * UPDATE PRODUCT
     * @param wholesalerId
     * @param productId
     * @param productRequestDTO
     * @return
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        productRequestDTO.setWholesalerId(wholesalerId);
        ProductDTO updatedProduct = productService.updateProduct(productId, productRequestDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * DELETE PRODUCT
     * @param productId
     * @return
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId) {

        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * TOGGLE STATUS
     * @param productId
     * @param status
     * @return
     */
    @PatchMapping("/{productId}/status")
    public ResponseEntity<ProductDTO> toggleProductStatus(
            @PathVariable Long productId,
            @RequestParam Boolean status) {

        ProductDTO updatedProduct = productService.toggleProductStatus(productId, status);
        return ResponseEntity.ok(updatedProduct);
    }
}

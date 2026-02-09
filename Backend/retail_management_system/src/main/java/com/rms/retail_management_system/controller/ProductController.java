package com.rms.retail_management_system.controller;

import com.rms.retail_management_system.dto.ProductDTO;
import com.rms.retail_management_system.dto.ProductRequestDTO;
import com.rms.retail_management_system.service.ProductService;
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

    // GET ALL PRODUCTS
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

    // GET CATEGORIES
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories(@PathVariable Long wholesalerId) {
        List<String> categories = productService.getAllCategories(wholesalerId);
        return ResponseEntity.ok(categories);
    }

    // GET PRODUCTS BY CATEGORY
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

    // SEARCH PRODUCTS
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

    // CREATE PRODUCT
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @PathVariable Long wholesalerId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        // Set wholesalerId from path
        productRequestDTO.setWholesalerId(wholesalerId);
        ProductDTO createdProduct = productService.createProduct(productRequestDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    // GET SINGLE PRODUCT (now needs productId only)
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId) {

        ProductDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    // UPDATE PRODUCT
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        productRequestDTO.setWholesalerId(wholesalerId);
        ProductDTO updatedProduct = productService.updateProduct(productId, productRequestDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // DELETE PRODUCT
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId) {

        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // TOGGLE STATUS
    @PatchMapping("/{productId}/status")
    public ResponseEntity<ProductDTO> toggleProductStatus(
            @PathVariable Long wholesalerId,
            @PathVariable Long productId,
            @RequestParam Boolean status) {

        ProductDTO updatedProduct = productService.toggleProductStatus(productId, status);
        return ResponseEntity.ok(updatedProduct);
    }
}

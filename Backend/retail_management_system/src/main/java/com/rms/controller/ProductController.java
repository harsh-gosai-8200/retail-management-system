package com.rms.controller;

import com.rms.dto.ProductDTO;
import com.rms.dto.ProductRequestDTO;
import com.rms.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.rms.constants.Constants.*;
import static com.rms.constants.Messages.PRODUCT_REMOVE_SUCCESSFULLY;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * GET ALL PRODUCTS
     * @param wholesalerId
     * @param category
     * @param search
     * @param active
     * @param pageable
     * @return
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) Long wholesalerId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC)
            Pageable pageable) {

        Page<ProductDTO> productsPage = productService.getFilteredProducts(
                wholesalerId, category, search, active, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put(PRODUCTS, productsPage.getContent());
        response.put(CURRENT_PAGE, productsPage.getNumber());
        response.put(TOTAL_ITEMS, productsPage.getTotalElements());
        response.put(TOTAL_PAGES, productsPage.getTotalPages());
        response.put(PAGE_SIZE, productsPage.getSize());
        response.put(SORT, productsPage.getSort().toString());

        return ResponseEntity.ok(response);
    }

    /**
     * GET CATEGORIES
     * @param wholesalerId
     * @return
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(
            @RequestParam(required = false) Long wholesalerId) {

        if (wholesalerId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<String> categories = productService.getAllCategories(wholesalerId);
        return ResponseEntity.ok(categories);
    }


    /**
     * CREATE PRODUCT
     * @param wholesalerId
     * @param productRequestDTO
     * @return
     */
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @RequestParam(required = false) Long wholesalerId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        if (wholesalerId == null) {
            return ResponseEntity.badRequest().build();
        }
        productRequestDTO.setWholesalerId(wholesalerId);
        ProductDTO createdProduct = productService.createProduct(productRequestDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * GET SINGLE PRODUCT BY ID
     * @param productId
     * @return
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(
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
            @RequestParam(required = false) Long wholesalerId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequestDTO productRequestDTO) {

        if (wholesalerId == null) {
            return ResponseEntity.badRequest().build();
        }
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
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId) {

        productService.deleteProduct(productId);
        return ResponseEntity.ok(Map.of(MESSAGE,PRODUCT_REMOVE_SUCCESSFULLY));
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

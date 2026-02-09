package com.rms.retail_management_system.service;

import com.rms.retail_management_system.dto.ProductDTO;
import com.rms.retail_management_system.dto.ProductRequestDTO;
import com.rms.retail_management_system.exception.ResourceNotFoundException;
import com.rms.retail_management_system.model.Product;
import com.rms.retail_management_system.model.User;
import com.rms.retail_management_system.repository.ProductRepository;
import com.rms.retail_management_system.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProductDTO createProduct(ProductRequestDTO productRequestDTO) {
        log.info("Creating new product: {}", productRequestDTO.getName());

        // Validate required fields
        if (productRequestDTO.getWholesalerId() == null) {
            throw new IllegalArgumentException("Wholesaler ID is required");
        }

        // Validate wholesaler exists AND is actually a wholesaler
        User wholesaler = userRepository.findById(productRequestDTO.getWholesalerId())
                .orElseThrow(() -> new ResourceNotFoundException("Wholesaler not found with id: " + productRequestDTO.getWholesalerId()));

        // Check if user is actually a wholesaler
        if (wholesaler.getRole() != User.Role.WHOLESALER) {
            throw new IllegalArgumentException("User with ID " + productRequestDTO.getWholesalerId() + " is not a wholesaler");
        }

        // Check if wholesaler is active
        if (!wholesaler.getIsActive()) {
            throw new IllegalArgumentException("Wholesaler account is inactive");
        }

        // Check if SKU already exists
        if (productRequestDTO.getSkuCode() != null &&
                productRepository.existsBySkuCode(productRequestDTO.getSkuCode())) {
            throw new IllegalArgumentException("SKU code already exists: " + productRequestDTO.getSkuCode());
        }

        // Create new product
        Product product = new Product();
        mapRequestToEntity(productRequestDTO, product);
        product.setWholesaler(wholesaler);

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());

        return mapEntityToDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequestDTO productRequestDTO) {
        log.info("Updating product with ID: {}", id);

        // Find existing product
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Check if SKU is being changed and already exists
        if (productRequestDTO.getSkuCode() != null &&
                !productRequestDTO.getSkuCode().equals(product.getSkuCode())) {
            productRepository.findBySkuCodeAndIdNot(productRequestDTO.getSkuCode(), id)
                    .ifPresent(p -> {
                        throw new IllegalArgumentException("SKU code already exists: " + productRequestDTO.getSkuCode());
                    });
        }

        // Update product fields
        mapRequestToEntity(productRequestDTO, product);

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully: {}", id);

        return mapEntityToDTO(updatedProduct);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        return mapEntityToDTO(product);
    }

    @Override
    public Page<ProductDTO> getAllProducts(Long wholesalerId, Pageable pageable) {
        // Using the derived query method
        Page<Product> products = productRepository.findByWholesalerIdAndIsActive(wholesalerId, true, pageable);
        return products.map(this::mapEntityToDTO);
    }

    @Override
    public Page<ProductDTO> getProductsByCategory(Long wholesalerId, String category, Pageable pageable) {
        // Using the derived query method
        Page<Product> products = productRepository.findByWholesalerIdAndCategoryAndIsActive(wholesalerId, category, true, pageable);
        return products.map(this::mapEntityToDTO);
    }

    // The searchProducts method remains the same
    @Override
    public Page<ProductDTO> searchProducts(Long wholesalerId, String searchTerm, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(wholesalerId, searchTerm, pageable);
        return products.map(this::mapEntityToDTO);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Soft delete (set isActive to false)
        product.setIsActive(false);
        productRepository.save(product);

        log.info("Product soft-deleted: {}", id);
    }

    @Override
    public List<String> getAllCategories(Long wholesalerId) {
        return productRepository.findDistinctCategoriesByWholesalerId(wholesalerId);
    }

    @Override
    @Transactional
    public ProductDTO toggleProductStatus(Long id, Boolean status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setIsActive(status);
        Product updatedProduct = productRepository.save(product);

        log.info("Product status updated: {} -> {}", id, status);
        return mapEntityToDTO(updatedProduct);
    }

    // Helper methods for mapping
    private ProductDTO mapEntityToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setWholesalerId(product.getWholesaler().getId());
        dto.setWholesalerName(product.getWholesaler().getBusinessName());
        dto.setSkuCode(product.getSkuCode());
        dto.setUnit(product.getUnit());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsActive(product.getIsActive());

        return dto;
    }

    private void mapRequestToEntity(ProductRequestDTO requestDTO, Product product) {
        product.setName(requestDTO.getName());
        product.setDescription(requestDTO.getDescription());
        product.setCategory(requestDTO.getCategory());
        product.setPrice(requestDTO.getPrice());
        product.setStockQuantity(requestDTO.getStockQuantity());
        product.setSkuCode(requestDTO.getSkuCode());
        product.setUnit(requestDTO.getUnit());
        product.setImageUrl(requestDTO.getImageUrl());
    }
}
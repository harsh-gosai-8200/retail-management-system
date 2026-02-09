package com.rms.retail_management_system.service;

import com.rms.retail_management_system.dto.ProductDTO;
import com.rms.retail_management_system.dto.ProductRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(ProductRequestDTO productRequestDTO);

    ProductDTO updateProduct(Long id, ProductRequestDTO productRequestDTO);

    ProductDTO getProductById(Long id);

    Page<ProductDTO> getAllProducts(Long wholesalerId, Pageable pageable);

    Page<ProductDTO> getProductsByCategory(Long wholesalerId, String category, Pageable pageable);

    Page<ProductDTO> searchProducts(Long wholesalerId, String searchTerm, Pageable pageable);

    void deleteProduct(Long id);

    List<String> getAllCategories(Long wholesalerId);

    ProductDTO toggleProductStatus(Long id, Boolean status);
}

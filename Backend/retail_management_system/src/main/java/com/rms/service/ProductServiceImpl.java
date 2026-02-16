package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.ProductRequestDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.Product;
import com.rms.model.Role;
import com.rms.model.User;
import com.rms.model.Wholesaler;
import com.rms.repository.ProductRepository;
import com.rms.repository.UserRepository;
import com.rms.repository.WholesalerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Autowired
    private final WholesalerRepository wholesalerRepository;
    @Autowired
    private ModelMapper modelMapper;

    /**
     * creating product after checking basic edge case
     * @param productRequestDTO
     * @return
     */
    @Override
    @Transactional
    public ProductDTO createProduct(ProductRequestDTO productRequestDTO) {
        log.info("Creating new product: {}", productRequestDTO.getName());

        // validate required fields
        if (productRequestDTO.getWholesalerId() == null) {
            throw new IllegalArgumentException("Wholesaler ID is required");
        }

        // validate wholesaler exists AND is actually a wholesaler
        Wholesaler wholesaler = wholesalerRepository.findById(productRequestDTO.getWholesalerId())
                .orElseThrow(() -> new ResourceNotFoundException("Wholesaler", "id", productRequestDTO.getWholesalerId()));

        // check if user is actually a wholesaler
        if (wholesaler.getUser().getRole() != Role.WHOLESALER) {
            //throw new IllegalArgumentException("User with ID " + productRequestDTO.getWholesalerId() + " is not a wholesaler");
            throw new IllegalArgumentException("User with ID " + wholesaler.getUser().getId() + " is not a wholesaler");
        }

        // check if wholesaler is active
        if (!wholesaler.getUser().getIsActive()) {
            throw new IllegalArgumentException("Wholesaler account is inactive");
        }

        // check if SKU already exists
        if (productRequestDTO.getSkuCode() != null &&
                productRepository.existsBySkuCode(productRequestDTO.getSkuCode())) {
            throw new IllegalArgumentException("SKU code already exists: " + productRequestDTO.getSkuCode());
        }

        // create new product
        Product product = new Product();
        mapRequestToEntity(productRequestDTO, product);
        product.setWholesaler(wholesaler);

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());

        return mapEntityToDTO(savedProduct);
    }


    /**
     * update product
     * @param id
     * @param productRequestDTO
     * @return
     */
    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequestDTO productRequestDTO) {
        log.info("Updating product with ID: {}", id);

        // Find existing product
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

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


    /**
     * fetch product by its id
     * @param id
     * @return
     */
    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        return mapEntityToDTO(product);
    }


    /**
     * fetch all the products
     * @param wholesalerId
     * @param pageable
     * @return
     */
    @Override
    public Page<ProductDTO> getAllProducts(Long wholesalerId, Pageable pageable) {
        // Using the derived query method
        Page<Product> products = productRepository.findByWholesalerIdAndIsActive(wholesalerId, true, pageable);
        return products.map(this::mapEntityToDTO);
    }


    /**
     * fetch products have given category
     * @param wholesalerId
     * @param category
     * @param pageable
     * @return
     */
    @Override
    public Page<ProductDTO> getProductsByCategory(Long wholesalerId, String category, Pageable pageable) {
        // Using the derived query method
        Page<Product> products = productRepository.findByWholesalerIdAndCategoryAndIsActive(wholesalerId, category, true, pageable);
        return products.map(this::mapEntityToDTO);
    }


    /**
     * search product using custom query
     * @param wholesalerId
     * @param searchTerm
     * @param pageable
     * @return
     */
    // The searchProducts method remains the same
    @Override
    public Page<ProductDTO> searchProducts(Long wholesalerId, String searchTerm, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(wholesalerId, searchTerm, pageable);
        return products.map(this::mapEntityToDTO);
    }


    /**
     * delete product by id
     * @param id
     */
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Soft delete (set isActive to false)
        product.setIsActive(false);
        productRepository.save(product);

        log.info("Product soft-deleted: {}", id);
    }


    /**
     * get all the categories
     * @param wholesalerId
     * @return
     */
    @Override
    public List<String> getAllCategories(Long wholesalerId) {
        return productRepository.findDistinctCategoriesByWholesalerId(wholesalerId);
    }


    /**
     * toggling product status (active->deactivate/deactivate->activate)
     * @param id
     * @param status
     * @return
     */
    @Override
    @Transactional
    public ProductDTO toggleProductStatus(Long id, Boolean status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(status);
        Product updatedProduct = productRepository.save(product);

        log.info("Product status updated: {} -> {}", id, status);
        return mapEntityToDTO(updatedProduct);
    }

    /**
     * custom implimentation of model mapper
     * map entity object to dto object
     * @param product
     * @return
     */
    private ProductDTO mapEntityToDTO(Product product) {
        ProductDTO dto = modelMapper.map(product, ProductDTO.class);

        dto.setWholesalerId(product.getWholesaler().getId());
        dto.setWholesalerName(product.getWholesaler().getBusinessName());

        return dto;
    }

    /**
     * custom implimentation of model mapper
     * map dto object to entity object
     * @param requestDTO
     * @param product
     */
    private void mapRequestToEntity(ProductRequestDTO requestDTO, Product product) {
        modelMapper.map(requestDTO, product);
    }
}
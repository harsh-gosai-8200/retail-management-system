
package com.rms.service;

import com.rms.dto.AddToCartRequestDTO;
import com.rms.dto.CartItemDTO;
import com.rms.dto.CartSummaryDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.CartItem;
import com.rms.model.LocalSeller;
import com.rms.model.Product;
import com.rms.repository.CartItemRepository;
import com.rms.repository.LocalSellerRepository;
import com.rms.repository.ProductRepository;
import com.rms.repository.WholesalerRepository;
import com.rms.specification.CartItemSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final LocalSellerRepository localSellerRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

    /**
     * add to cart service
     * @param sellerId
     * @param request
     * @return
     */
    @Transactional
    public CartItemDTO addToCart(Long sellerId, AddToCartRequestDTO request) {
        log.info("Adding product {} to cart for seller {}", request.getProductId(), sellerId);

        LocalSeller seller = localSellerRepository.findByUserId(sellerId)
                .orElseGet(() -> localSellerRepository.findById(sellerId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Seller not found with ID: " + sellerId
                        )));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        Specification<CartItem> spec = Specification
                .where(CartItemSpecification.bySellerId(seller.getId()))
                .and(CartItemSpecification.byProductId(request.getProductId()));

        CartItem cartItem = cartItemRepository.findOne(spec).orElse(new CartItem());

        if (cartItem.getId() != null) {
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Cannot add more. Max available: " + product.getStockQuantity());
            }
            cartItem.setQuantity(newQuantity);
            cartItem.setTotal(product.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
        } else {
            cartItem.setSeller(seller);
            cartItem.setWholesaler(product.getWholesaler());
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(product.getPrice());
            cartItem.setTotal(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return mapToDTO(saved);
    }


    /**
     * get all cart item service
     * @param sellerId
     * @return
     */
    public CartSummaryDTO getCart(Long sellerId) {
        LocalSeller seller = localSellerRepository.findByUserId(sellerId)
                .orElseGet(() -> localSellerRepository.findById(sellerId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Seller not found with ID: " + sellerId
                        )));

        Specification<CartItem> spec = CartItemSpecification.bySellerId(seller.getId());
        List<CartItem> cartItems = cartItemRepository.findAll(spec);

        if (cartItems.isEmpty()) {
            return CartSummaryDTO.builder()
                    .items(List.of())
                    .totalItems(0)
                    .subtotal(BigDecimal.ZERO)
                    .taxAmount(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .wholesalerGroups(new HashMap<>())
                    .build();
        }

        Map<Long, String> wholesalerGroups = cartItems.stream()
                .collect(Collectors.toMap(
                        item -> item.getWholesaler().getId(),
                        item -> item.getWholesaler().getBusinessName(),
                        (existing, replacement) -> existing
                ));

        List<CartItemDTO> itemDTOs = cartItems.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        BigDecimal subtotal = cartItems.stream()
                .map(CartItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        return CartSummaryDTO.builder()
                .items(itemDTOs)
                .totalItems(cartItems.size())
                .subtotal(subtotal)
                .taxAmount(tax)
                .totalAmount(total)
                .wholesalerGroups(wholesalerGroups)
                .build();
    }

    /**
     * update cart item service
     * @param sellerId
     * @param cartItemId
     * @param quantity
     * @return
     */
    @Transactional
    public CartItemDTO updateCartItem(Long sellerId, Long cartItemId, Integer quantity) {
        log.info("Updating cart item {} to quantity {}", cartItemId, quantity);

        Specification<CartItem> spec = Specification
                .where(CartItemSpecification.bySellerId(sellerId))
                .and((root, query, cb) -> cb.equal(root.get("id"), cartItemId));

        CartItem cartItem = cartItemRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (cartItem.getProduct().getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + cartItem.getProduct().getStockQuantity());
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        } else {
            cartItem.setQuantity(quantity);
            cartItem.setTotal(cartItem.getPrice().multiply(BigDecimal.valueOf(quantity)));
            CartItem updated = cartItemRepository.save(cartItem);
            return mapToDTO(updated);
        }
    }


    /**
     * remove item from cart service
     * @param sellerId
     * @param cartItemId
     */
    @Transactional
    public void removeFromCart(Long sellerId, Long cartItemId) {
        Specification<CartItem> spec = Specification
                .where(CartItemSpecification.bySellerId(sellerId))
                .and((root, query, cb) -> cb.equal(root.get("id"), cartItemId));

        CartItem cartItem = cartItemRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }


    /**
     * clear all cart service
     * @param sellerId
     */
    @Transactional
    public void clearCart(Long sellerId) {
        LocalSeller seller = localSellerRepository.findByUserId(sellerId)
                .orElseGet(() -> {
                    // Try finding by direct ID
                    return localSellerRepository.findById(sellerId)
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Seller not found with ID: " + sellerId
                            ));
                });

        cartItemRepository.deleteBySellerId(seller.getId());
    }


    /**
     * get all cart item count service
     * @param sellerId
     * @return
     */
    public Long getCartItemCount(Long sellerId) {
        LocalSeller seller = localSellerRepository.findByUserId(sellerId)
                .orElseGet(() -> {
                    // Try finding by direct ID
                    return localSellerRepository.findById(sellerId)
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Seller not found with ID: " + sellerId
                            ));
                });

        return cartItemRepository.countBySellerId(seller.getId());
    }

    private CartItemDTO mapToDTO(CartItem item) {
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .total(item.getTotal())
                .availableStock(item.getProduct().getStockQuantity())
                .wholesalerId(item.getWholesaler().getId())
                .wholesalerName(item.getWholesaler().getBusinessName())
                .build();
    }
}
package com.rms.controller;

import com.rms.dto.AddToCartRequestDTO;
import com.rms.dto.CartItemDTO;
import com.rms.dto.CartSummaryDTO;
import com.rms.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * Add item to cart
     * @param sellerId
     * @param request
     * @return
     */
    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @RequestParam Long sellerId,
            @Valid @RequestBody AddToCartRequestDTO request) {

        CartItemDTO cartItem = cartService.addToCart(sellerId, request);
        return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
    }

    /**
     * View cart
     * @param sellerId
     * @return
     */
    @GetMapping
    public ResponseEntity<CartSummaryDTO> getCart(@RequestParam Long sellerId) {
        CartSummaryDTO cart = cartService.getCart(sellerId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Update cart item quantity
     * @param sellerId
     * @param cartItemId
     * @param quantity
     * @return
     */
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @RequestParam Long sellerId,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {

        CartItemDTO updated = cartService.updateCartItem(sellerId, cartItemId, quantity);

        if (updated == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(updated);
    }

    /**
     * Remove item from cart
     * @param sellerId
     * @param cartItemId
     * @return
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @RequestParam Long sellerId,
            @PathVariable Long cartItemId) {

        cartService.removeFromCart(sellerId, cartItemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Clear cart
     * @param sellerId
     * @return
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart(@RequestParam Long sellerId) {
        cartService.clearCart(sellerId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Cart cleared successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get cart item count
     * @param sellerId
     * @return
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCartCount(@RequestParam Long sellerId) {
        Long count = cartService.getCartItemCount(sellerId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
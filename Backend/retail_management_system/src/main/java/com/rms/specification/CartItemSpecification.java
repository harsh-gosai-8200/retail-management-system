
package com.rms.specification;

import com.rms.model.CartItem;
import org.springframework.data.jpa.domain.Specification;

public class CartItemSpecification {

    public static Specification<CartItem> bySellerId(Long sellerId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("seller").get("id"), sellerId);
    }

    public static Specification<CartItem> byProductId(Long productId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("product").get("id"), productId);
    }
}
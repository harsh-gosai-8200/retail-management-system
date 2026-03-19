
package com.rms.specification;

import com.rms.model.CartItem;
import org.springframework.data.jpa.domain.Specification;

import static com.rms.constants.Constants.*;

public class CartItemSpecification {

    public static Specification<CartItem> bySellerId(Long sellerId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(SELLER).get(ID), sellerId);
    }

    public static Specification<CartItem> byProductId(Long productId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(PRODUCT).get(ID), productId);
    }
}
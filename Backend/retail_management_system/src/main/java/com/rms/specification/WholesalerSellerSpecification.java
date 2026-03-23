package com.rms.specification;

import com.rms.model.enums.SubscriptionStatus;
import com.rms.model.WholesalerSellerMapping;
import org.springframework.data.jpa.domain.Specification;

public class WholesalerSellerSpecification {

    private WholesalerSellerSpecification() {}

    public static Specification<WholesalerSellerMapping> byLocalSellerId(Long localSellerId) {
        return (root, query, cb) ->
                cb.equal(root.get("localSeller").get("id"), localSellerId);
    }

    public static Specification<WholesalerSellerMapping> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) ->
                cb.equal(root.get("wholesaler").get("id"), wholesalerId);
    }

    public static Specification<WholesalerSellerMapping> byStatus(SubscriptionStatus status) {
        return (root, query, cb) ->
                cb.equal(root.get("status"), status);
    }
}


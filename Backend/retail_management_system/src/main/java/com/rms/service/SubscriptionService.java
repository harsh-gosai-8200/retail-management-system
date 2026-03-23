package com.rms.service;

import com.rms.dto.SubscriptionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface SubscriptionService {

    // whole saler side
    Page<SubscriptionDTO> getPendingRequests(Long wholesalerId,Pageable pageable);

    SubscriptionDTO approveSubscription(Long wholesalerId, Long localSellerId);

    SubscriptionDTO rejectSubscription(Long wholesalerId, Long localSellerId);

    SubscriptionDTO acceptSubscription(Long subscriptionId);

    SubscriptionDTO rejectSubscriptionById(Long subscriptionId);

    Page<SubscriptionDTO> getActiveSubscriptions(Long wholesalerId,Pageable pageable);

    //Local seller side

    Page<SubscriptionDTO> getSellerPendingSubscriptions(Long localSellerId, Pageable pageable);

    SubscriptionDTO getSubscriptionStatus(Long localSellerId, Long wholesalerId);

    void cancelSubscription(Long localSellerId, Long wholesalerId);

    // Utility
    boolean isSubscribed(Long localSellerId, Long wholesalerId);
}
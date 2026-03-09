package com.rms.service;

import com.rms.dto.SubscriptionDTO;
import java.util.List;

public interface SubscriptionService {

    List<SubscriptionDTO> getPendingRequests(Long wholesalerId);

    void approveSubscription(Long wholesalerId, Long localSellerId);

    void rejectSubscription(Long wholesalerId, Long localSellerId);

    List<SubscriptionDTO> getActiveLocalSellers(Long wholesalerId);
}
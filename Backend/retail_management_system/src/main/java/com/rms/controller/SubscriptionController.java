package com.rms.controller;

import com.rms.constants.MessageKeys;
import com.rms.dto.SubscriptionDTO;
import com.rms.service.MessageService;
import com.rms.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final MessageService messageService;


    /*
     * API: Get all pending subscription requests for a wholesaler
     * Used by wholesaler dashboard to see which local sellers requested subscription
     */
    @GetMapping("/pending/{wholesalerId}")
    public List<SubscriptionDTO> getPendingRequests(
            @PathVariable Long wholesalerId) {

        log.info("API Call: Fetching pending subscription requests for wholesaler ID: {}", wholesalerId);

        return subscriptionService.getPendingRequests(wholesalerId);
    }

    /*
     * API: Approve a subscription request
     * Wholesaler approves a local seller request
     */
    @PutMapping("/approve/{wholesalerId}/{sellerId}")
    public String approveSubscription(
            @PathVariable Long wholesalerId,
            @PathVariable Long sellerId) {

        log.info("API Call: Approving subscription for seller ID {} by wholesaler ID {}", sellerId, wholesalerId);

        subscriptionService.approveSubscription(wholesalerId, sellerId);

        return messageService.get(MessageKeys.SUBSCRIPTION_APPROVED);
    }

    /*
     * API: Reject a subscription request
     * Wholesaler rejects a local seller request
     */
    @PutMapping("/reject/{wholesalerId}/{sellerId}")
    public String rejectSubscription(
            @PathVariable Long wholesalerId,
            @PathVariable Long sellerId) {

        log.info("API Call: Rejecting subscription for seller ID {} by wholesaler ID {}", sellerId, wholesalerId);

        subscriptionService.rejectSubscription(wholesalerId, sellerId);

        return messageService.get(MessageKeys.SUBSCRIPTION_REJECTED);
    }

    /*
     * API: Get all active (approved) local sellers of a wholesaler
     * Used by wholesaler to see all connected local sellers
     */
    @GetMapping("/active/{wholesalerId}")
    public List<SubscriptionDTO> getActiveLocalSellers(
            @PathVariable Long wholesalerId) {

        log.info("API Call: Fetching active local sellers for wholesaler ID: {}", wholesalerId);

        return subscriptionService.getActiveLocalSellers(wholesalerId);
    }
}
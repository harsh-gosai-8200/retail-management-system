package com.rms.controller;

import com.rms.dto.SubscriptionDTO;
import com.rms.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * 1. Get pending subscription requests for a wholesaler
     */
    @GetMapping("/wholesaler/{wholesalerId}/pending")
    public ResponseEntity<Page<SubscriptionDTO>> getPendingRequests(
            @PathVariable Long wholesalerId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("API: GET /subscriptions/wholesaler/{}/pending", wholesalerId);
        Page<SubscriptionDTO> pending = subscriptionService.getPendingRequests(wholesalerId, pageable);
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/wholesaler/subscription-requests")
    public ResponseEntity<Page<SubscriptionDTO>> getSubscriptionRequestsForWholesaler(
            @RequestParam Long wholesalerId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("API: GET /wholesaler/subscription-requests for wholesaler {}", wholesalerId);
        Page<SubscriptionDTO> pending = subscriptionService.getPendingRequests(wholesalerId, pageable);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{subscriptionId}/accept")
    public ResponseEntity<SubscriptionDTO> acceptSubscriptionById(
            @PathVariable Long subscriptionId) {
        log.info("API: POST /subscriptions/{}/accept", subscriptionId);
        SubscriptionDTO subscription = subscriptionService.acceptSubscription(subscriptionId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/{subscriptionId}/reject")
    public ResponseEntity<SubscriptionDTO> rejectSubscriptionById(
            @PathVariable Long subscriptionId) {
        log.info("API: POST /subscriptions/{}/reject", subscriptionId);
        SubscriptionDTO subscription = subscriptionService.rejectSubscriptionById(subscriptionId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 2. Approve a subscription request
     */
    @PutMapping("/wholesaler/{wholesalerId}/approve/{localSellerId}")
    public ResponseEntity<SubscriptionDTO> approveSubscription(
            @PathVariable Long wholesalerId,
            @PathVariable Long localSellerId) {
        log.info("API: PUT /subscriptions/wholesaler/{}/approve/{}", wholesalerId, localSellerId);
        SubscriptionDTO subscription = subscriptionService.approveSubscription(wholesalerId, localSellerId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 3. Reject a subscription request
     */
    @PutMapping("/wholesaler/{wholesalerId}/reject/{localSellerId}")
    public ResponseEntity<SubscriptionDTO> rejectSubscription(
            @PathVariable Long wholesalerId,
            @PathVariable Long localSellerId) {
        log.info("API: PUT /subscriptions/wholesaler/{}/reject/{}", wholesalerId, localSellerId);
        SubscriptionDTO subscription = subscriptionService.rejectSubscription(wholesalerId, localSellerId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 4. Get all active local sellers for a wholesaler
     */
    @GetMapping("/wholesaler/{wholesalerId}/active")
    public ResponseEntity<Page<SubscriptionDTO>> getActiveSubscriptions(
            @PathVariable Long wholesalerId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable) {
        log.info("API: GET /subscriptions/wholesaler/{}/active", wholesalerId);
        Page<SubscriptionDTO> active = subscriptionService.getActiveSubscriptions(wholesalerId, pageable);
        return ResponseEntity.ok(active);
    }

    /**
     * 5. Get subscription status for a specific seller-wholesaler pair
     */
    @GetMapping("/status")
    public ResponseEntity<SubscriptionDTO> getSubscriptionStatus(
            @RequestParam Long localSellerId,
            @RequestParam Long wholesalerId) {
        log.info("API: GET /subscriptions/status?seller={}&wholesaler={}", localSellerId, wholesalerId);
        SubscriptionDTO status = subscriptionService.getSubscriptionStatus(localSellerId, wholesalerId);
        return ResponseEntity.ok(status);
    }

    /**
     * 6. Get all pending subscriptions for a local seller
     */
    @GetMapping("/seller/{localSellerId}/pending")
    public ResponseEntity<Page<SubscriptionDTO>> getSellerPendingSubscriptions(
            @PathVariable Long localSellerId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("API: GET /subscriptions/seller/{}/pending", localSellerId);
        Page<SubscriptionDTO> pending = subscriptionService.getSellerPendingSubscriptions(localSellerId, pageable);
        return ResponseEntity.ok(pending);
    }

    /**
     * 7. Cancel a pending subscription request (seller side)
     */
    @DeleteMapping("/seller/{localSellerId}/cancel/{wholesalerId}")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable Long localSellerId,
            @PathVariable Long wholesalerId) {
        log.info("API: DELETE /subscriptions/seller/{}/cancel/{}", localSellerId, wholesalerId);
        subscriptionService.cancelSubscription(localSellerId, wholesalerId);
        return ResponseEntity.noContent().build();
    }
}
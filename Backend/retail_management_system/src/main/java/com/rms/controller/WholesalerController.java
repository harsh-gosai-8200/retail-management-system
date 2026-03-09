package com.rms.controller;

import com.rms.dto.SubscriptionDTO;
import com.rms.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wholesaler")
@RequiredArgsConstructor
@Slf4j
public class WholesalerController {

    private final SubscriptionService subscriptionService;

    // Get pending subscription requests
    @GetMapping("/{wholesalerId}/pending-requests")
    public ResponseEntity<List<SubscriptionDTO>> getPendingRequests(@PathVariable Long wholesalerId) {
        List<SubscriptionDTO> pending = subscriptionService.getPendingRequests(wholesalerId);
        return ResponseEntity.ok(pending);
    }

    // Approve a subscription request
    @PutMapping("/{wholesalerId}/approve/{localSellerId}")
    public ResponseEntity<String> approveSubscription(@PathVariable Long wholesalerId,
                                                      @PathVariable Long localSellerId) {
        subscriptionService.approveSubscription(wholesalerId, localSellerId);
        return ResponseEntity.ok("Subscription approved");
    }

    // Reject a subscription request
    @PutMapping("/{wholesalerId}/reject/{localSellerId}")
    public ResponseEntity<String> rejectSubscription(@PathVariable Long wholesalerId,
                                                     @PathVariable Long localSellerId) {
        subscriptionService.rejectSubscription(wholesalerId, localSellerId);
        return ResponseEntity.ok("Subscription rejected");
    }

    // Get all active local sellers for this wholesaler
    @GetMapping("/{wholesalerId}/active-local-sellers")
    public ResponseEntity<List<SubscriptionDTO>> getActiveLocalSellers(@PathVariable Long wholesalerId) {
        List<SubscriptionDTO> active = subscriptionService.getActiveLocalSellers(wholesalerId);
        return ResponseEntity.ok(active);
    }
}
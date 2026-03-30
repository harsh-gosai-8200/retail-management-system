package com.rms.controller;

import com.rms.constants.MessageKeys;
import com.rms.dto.ProductDTO;
import com.rms.dto.SellerDTO;
import com.rms.dto.UpdateSellerDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.model.User;
import com.rms.repository.LocalSellerRepository;
import com.rms.repository.UserRepository;
import com.rms.service.LocalSellerService;
import com.rms.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/local-seller")
@RequiredArgsConstructor
@Slf4j
public class LocalSellerController {

    private final LocalSellerService localSellerService;
    private final MessageService messageService;
    private final UserRepository userRepository;

    /*  Get all active wholesalers */

    @GetMapping("/wholesalers")
    public ResponseEntity<List<WholesalerDTO>> getActiveWholesalers() {
        log.info("API call: GET /wholesalers");

        List<WholesalerDTO> wholesalers = localSellerService.getActiveWholesalers();
        return ResponseEntity.ok(wholesalers);
    }

    /*  Get all active products of a wholesaler */

    @GetMapping("/wholesalers/{wholesalerId}/products")
    public ResponseEntity<List<ProductDTO>> getProductsByWholesaler(@PathVariable Long wholesalerId) {
        log.info("API call: GET /wholesalers/{}/products", wholesalerId);

        List<ProductDTO> products = localSellerService.getActiveProductsByWholesaler(wholesalerId);
        return ResponseEntity.ok(products);
    }

    /* get all products*/
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProductsForSeller() {
        log.info("API call: GET /products");

        List<ProductDTO> products = localSellerService.getAllProductsForSeller();
        return ResponseEntity.ok(products);
    }

    /*  Get subscribed wholesalers with pagination */
    @GetMapping("/{localSellerId}/subscribed-wholesalers")
    public ResponseEntity<Page<WholesalerDTO>> getSubscribedWholesalers(
            @PathVariable Long localSellerId,
            @PageableDefault(size = 10, sort = "wholesaler.businessName", direction = Sort.Direction.ASC)
            Pageable pageable) {                                    // ADD Pageable
        log.info("API call: GET /{}/subscribed-wholesalers", localSellerId);
        Page<WholesalerDTO> mappedWholesalers = localSellerService.getSubscribedWholesalers(
                localSellerId, pageable);                               // Pass pageable
        return ResponseEntity.ok(mappedWholesalers);
    }

    /*  subscribe whole seller */

    @PostMapping("/{localSellerId}/subscribe/{wholesalerId}")
    public ResponseEntity<String> subscribeWholesaler(
            @PathVariable Long localSellerId,
            @PathVariable Long wholesalerId) {

        localSellerService.subscribeWholesaler(localSellerId, wholesalerId);
        return ResponseEntity.ok(messageService.get(MessageKeys.SUBSCRIPTION_REQUEST_SENT));
    }

    /* unsubscribe whole saller */
    @DeleteMapping("/{localSellerId}/unsubscribe/{wholesalerId}")
    public ResponseEntity<String> unsubscribeWholesaler(
            @PathVariable Long localSellerId,
            @PathVariable Long wholesalerId) {

        localSellerService.unsubscribeWholesaler(localSellerId, wholesalerId);
        return ResponseEntity.ok(messageService.get(MessageKeys.UNSUBSCRIBE_SUCCESS));
    }

    /*  Get products of a mapped wholesaler (paginated) */
    @GetMapping("/{localSellerId}/wholesalers/{wholesalerId}/products/paged")
    public ResponseEntity<Page<ProductDTO>> getProductsOfMappedWholesaler(
            @PathVariable Long localSellerId,
            @PathVariable Long wholesalerId,
            Pageable pageable) {
        log.info("API call: GET /{}/wholesalers/{}/products/paged", localSellerId, wholesalerId);
        Page<ProductDTO> productsPage = localSellerService.getProductsOfWholesaler(
                localSellerId, wholesalerId, pageable);
        return ResponseEntity.ok(productsPage);
    }

    // PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {

        String email = auth.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body((messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND)));
        }

        SellerDTO seller = localSellerService.getSellerProfile(userOpt.get().getId());

        return ResponseEntity.ok(seller);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody UpdateSellerDTO dto) {

        String email = auth.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND));
        }

        SellerDTO updatedSeller = localSellerService
                .updateSellerProfile(userOpt.get().getId(), dto);

        return ResponseEntity.ok(updatedSeller);
    }

}
package com.rms.controller;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.service.LocalSellerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local-seller")
@RequiredArgsConstructor
@Slf4j
public class LocalSellerController {

    private final LocalSellerService localSellerService;

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

    /*  Get only subscribed (mapped) wholesalers of a local seller */

    @GetMapping("/{localSellerId}/subscribed-wholesalers")
    public ResponseEntity<List<WholesalerDTO>> getSubscribedWholesalers(@PathVariable Long localSellerId) {
        log.info("API call: GET /{}/subscribed-wholesalers", localSellerId);

        List<WholesalerDTO> mappedWholesalers = localSellerService.getSubscriptedWholesalers(localSellerId);
        return ResponseEntity.ok(mappedWholesalers);
    }

    /*  Get products of a mapped wholesaler (paginated) */

    @GetMapping("/{localSellerId}/wholesalers/{wholesalerId}/products/paged")
    public ResponseEntity<Page<ProductDTO>> getProductsOfMappedWholesaler(
            @PathVariable Long localSellerId,
            @PathVariable Long wholesalerId,
            Pageable pageable) {

        log.info("API call: GET /{}/wholesalers/{}/products/paged", localSellerId, wholesalerId);

        Page<ProductDTO> productsPage = localSellerService.getProductsOfWholesaler(localSellerId, wholesalerId, pageable);
        return ResponseEntity.ok(productsPage);
    }
}
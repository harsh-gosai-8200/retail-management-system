package com.rms.controller;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.service.LocalSellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local-seller")
@RequiredArgsConstructor
public class LocalSellerController {

    private final LocalSellerService localSellerService;

    @GetMapping("/wholesalers")
    public ResponseEntity<List<WholesalerDTO>> getActiveWholesalers() {
        return ResponseEntity.ok(localSellerService.getActiveWholesalers());
    }

    @GetMapping("/wholesalers/{wholesalerId}/products")
    public ResponseEntity<List<ProductDTO>> getProductsByWholesaler(
            @PathVariable Long wholesalerId) {

        return ResponseEntity.ok(
                localSellerService.getActiveProductsByWholesaler(wholesalerId)
        );
    }

}
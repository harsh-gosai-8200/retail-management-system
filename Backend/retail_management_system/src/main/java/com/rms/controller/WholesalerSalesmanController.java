package com.rms.controller;

import com.rms.dto.*;
import com.rms.service.WholesalerSalesmanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.rms.constants.Constants.MESSAGE;
import static com.rms.constants.Messages.CART_ITEM_REMOVE_SUCCESSFULLY;
import static com.rms.constants.Messages.SELLER_REMOVE_SUCCESSFULLY;

@RestController
@RequestMapping("/api/wholesaler/salesmen")
@RequiredArgsConstructor
public class WholesalerSalesmanController {

    private final WholesalerSalesmanService salesmanService;

    /**
     * creating salesman for wholesaler
     * @param wholesalerId
     * @param request
     * @return
     */
    @PostMapping
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<SalesmanResponseDTO> createSalesman(
            @RequestParam Long wholesalerId,
            @Valid @RequestBody SalesmanRegistrationRequest request) {
        return new ResponseEntity<>(
                salesmanService.createSalesman(wholesalerId, request),
                HttpStatus.CREATED
        );
    }

    /**
     * get all salesman belongs to wholesaler
     * @param wholesalerId
     * @param search
     * @param isActive
     * @param region
     * @param pageable
     * @return
     */
    @GetMapping
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<PaginatedResponseDTO<SalesmanListDTO>> getSalesmen(
            @RequestParam Long wholesalerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String region,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
                salesmanService.getSalesmen(wholesalerId, search, isActive, region, pageable)
        );
    }

    /**
     * get all available seller which not assign to salesman
     * @param wholesalerId
     * @return
     */
    @GetMapping("/available-sellers")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<List<SellerDTO>> getAvailableSellers(
            @RequestParam Long wholesalerId) {
        return ResponseEntity.ok(
                salesmanService.getAvailableSellers(wholesalerId)
        );
    }

    /**
     * get perticuler salesman by id
     * @param wholesalerId
     * @param salesmanId
     * @return
     */
    @GetMapping("/{salesmanId}")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<SalesmanResponseDTO> getSalesman(
            @RequestParam Long wholesalerId,
            @PathVariable Long salesmanId) {
        return ResponseEntity.ok(
                salesmanService.getSalesmanById(wholesalerId, salesmanId)
        );
    }

    /**
     * update salesman data from wholesaler view
     * @param wholesalerId
     * @param salesmanId
     * @param updateDTO
     * @return
     */
    @PutMapping("/{salesmanId}")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<SalesmanResponseDTO> updateSalesman(
            @RequestParam Long wholesalerId,
            @PathVariable Long salesmanId,
            @Valid @RequestBody SalesmanUpdateDTO updateDTO) {
        return ResponseEntity.ok(
                salesmanService.updateSalesman(wholesalerId, salesmanId, updateDTO)
        );
    }

    /**
     * toggle status of salesman by wholesaler
     * @param wholesalerId
     * @param salesmanId
     * @param active
     * @return
     */
    @PatchMapping("/{salesmanId}/status")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<SalesmanResponseDTO> toggleStatus(
            @RequestParam Long wholesalerId,
            @PathVariable Long salesmanId,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(
                salesmanService.toggleSalesmanStatus(wholesalerId, salesmanId, active)
        );
    }

    /**
     * assign local seller to salesman
     * @param wholesalerId
     * @param assignmentDTO
     * @return
     */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<SalesmanAssignmentResponseDTO> assignSellers(
            @RequestParam Long wholesalerId,
            @Valid @RequestBody SalesmanAssignmentDTO assignmentDTO) {
        return ResponseEntity.ok(
                salesmanService.assignSellers(wholesalerId, assignmentDTO)
        );
    }

    /**
     * remove local seller assignment from perticuler salesman
     * @param wholesalerId
     * @param assignmentId
     * @return
     */
    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<?> removeAssignment(
            @RequestParam Long wholesalerId,
            @PathVariable Long assignmentId) {
        salesmanService.removeAssignment(wholesalerId, assignmentId);
        return ResponseEntity.ok(Map.of(MESSAGE, SELLER_REMOVE_SUCCESSFULLY));
    }

    /**
     * get all local seller assign to salesman
     * @param wholesalerId
     * @param salesmanId
     * @param pageable
     * @return
     */
    @GetMapping("/{salesmanId}/assigned-sellers")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<PaginatedResponseDTO<SalesmanAssignmentResponseDTO>> getAssignedSellers(
            @RequestParam Long wholesalerId,
            @PathVariable Long salesmanId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                salesmanService.getAssignedSellers(wholesalerId, salesmanId, pageable)
        );
    }
}
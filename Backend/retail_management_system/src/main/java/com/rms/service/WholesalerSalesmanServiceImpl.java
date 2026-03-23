package com.rms.service;

import com.rms.constants.Messages;
import com.rms.dto.*;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.*;
import com.rms.model.enums.Role;
import com.rms.repository.*;
import com.rms.specification.SalesmanAssignmentSpecification;
import com.rms.specification.SalesmanSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WholesalerSalesmanServiceImpl implements WholesalerSalesmanService {

    private final SalesmanRepository salesmanRepository;
    private final SalesmanAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final WholesalerRepository wholesalerRepository;
    private final LocalSellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalSellerRepository localSellerRepository;

    private static final String EMPLOYEE_ID_PREFIX = "EMP";

    /**
     * creating salesman for wholesaler
     * @param wholesalerId
     * @param request
     * @return
     */
    @Override
    public SalesmanResponseDTO createSalesman(Long wholesalerId, SalesmanRegistrationRequest request) {
        log.info("Creating salesman for wholesaler: {}", wholesalerId);

        boolean emailExists = salesmanRepository.exists(
                SalesmanSpecification.byWholesalerId(wholesalerId)
                        .and(SalesmanSpecification.byEmail(request.getEmail()))
        );

        if (emailExists) {
            throw new IllegalArgumentException(
                    String.format(Messages.EMAIL_ALREADY_EXISTS, request.getEmail())
            );
        }

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Messages.WHOLESALER_NOT_FOUND, wholesalerId)
                ));

        // Create User
        User user = new User();
        user.setUsername(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.SALESMAN);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Generate or validate employee ID
        String employeeId = request.getEmployeeId();
        if (employeeId == null || employeeId.trim().isEmpty()) {
            employeeId = generateEmployeeId(wholesalerId);
        } else {
            boolean empIdExists = salesmanRepository.exists(
                    SalesmanSpecification.byWholesalerId(wholesalerId)
                            .and(SalesmanSpecification.byEmployeeId(employeeId))
            );

            if (empIdExists) {
                throw new IllegalArgumentException(
                        String.format(Messages.EMPLOYEE_ID_EXISTS, employeeId)
                );
            }
        }

        // Create Salesman
        Salesman salesman = new Salesman();
        salesman.setUser(savedUser);
        salesman.setWholesaler(wholesaler);
        salesman.setFullName(request.getFullName());
        salesman.setEmployeeId(employeeId);
        salesman.setRegion(request.getRegion());
        salesman.setDepartment(request.getDepartment());
        salesman.setCommissionRate(request.getCommissionRate());
        salesman.setSalary(request.getSalary());
        salesman.setAadharNumber(request.getAadharNumber());
        salesman.setPanNumber(request.getPanNumber());
        salesman.setEmergencyContact(request.getEmergencyContact());
        salesman.setEmergencyContactName(request.getEmergencyContactName());
        salesman.setJoiningDate(request.getJoiningDate() != null ?
                request.getJoiningDate() : LocalDate.now());

        Salesman savedSalesman = salesmanRepository.save(salesman);
        log.info("Salesman created with ID: {}", savedSalesman.getId());

        return mapToResponseDTO(savedSalesman);
    }


    /**
     * Fetching all salesman belongs to wholesaler
     * @param wholesalerId
     * @param search
     * @param isActive
     * @param region
     * @param pageable
     * @return
     */
    @Override
    public PaginatedResponseDTO<SalesmanListDTO> getSalesmen(Long wholesalerId, String search,
                                                             Boolean isActive, String region,
                                                             Pageable pageable) {
        log.info("Fetching salesmen for wholesaler: {}", wholesalerId);

        Specification<Salesman> spec = SalesmanSpecification.withFilters(
                wholesalerId, search, isActive, region, null
        );

        Page<Salesman> page = salesmanRepository.findAll(spec, pageable);

        List<SalesmanListDTO> content = page.getContent().stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());

        return PaginatedResponseDTO.<SalesmanListDTO>builder()
                .content(content)
                .currentPage(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }

    /**
     * get individual salesman by id
     * @param wholesalerId
     * @param salesmanId
     * @return
     */
    @Override
    public SalesmanResponseDTO getSalesmanById(Long wholesalerId, Long salesmanId) {
        Salesman salesman = findSalesmanByIdAndWholesaler(wholesalerId, salesmanId);
        return mapToResponseDTO(salesman);
    }

    /**
     * update salesman data by wholesaler view side
     * @param wholesalerId
     * @param salesmanId
     * @param updateDTO
     * @return
     */
    @Override
    public SalesmanResponseDTO updateSalesman(Long wholesalerId, Long salesmanId,
                                              SalesmanUpdateDTO updateDTO) {
        Salesman salesman = findSalesmanByIdAndWholesaler(wholesalerId, salesmanId);

        if (updateDTO.getFullName() != null) {
            salesman.setFullName(updateDTO.getFullName());
            salesman.getUser().setUsername(updateDTO.getFullName());
        }

        if (updateDTO.getPhone() != null) {
            salesman.getUser().setPhone(updateDTO.getPhone());
        }

        if (updateDTO.getRegion() != null) {
            salesman.setRegion(updateDTO.getRegion());
        }

        if (updateDTO.getDepartment() != null) {
            salesman.setDepartment(updateDTO.getDepartment());
        }

        if (updateDTO.getCommissionRate() != null) {
            salesman.setCommissionRate(updateDTO.getCommissionRate());
        }

        if (updateDTO.getSalary() != null) {
            salesman.setSalary(updateDTO.getSalary());
        }

        if (updateDTO.getEmergencyContact() != null) {
            salesman.setEmergencyContact(updateDTO.getEmergencyContact());
        }

        if (updateDTO.getEmergencyContactName() != null) {
            salesman.setEmergencyContactName(updateDTO.getEmergencyContactName());
        }

        userRepository.save(salesman.getUser());
        Salesman updatedSalesman = salesmanRepository.save(salesman);

        return mapToResponseDTO(updatedSalesman);
    }

    /**
     * toggle salesman status for active/deactive
     * @param wholesalerId
     * @param salesmanId
     * @param isActive
     * @return
     */
    @Override
    public SalesmanResponseDTO toggleSalesmanStatus(Long wholesalerId, Long salesmanId,
                                                    Boolean isActive) {
        Salesman salesman = findSalesmanByIdAndWholesaler(wholesalerId, salesmanId);
        salesman.getUser().setIsActive(isActive);
        userRepository.save(salesman.getUser());
        return mapToResponseDTO(salesman);
    }

    /**
     * assign local saller to salesman
     * @param wholesalerId
     * @param assignmentDTO
     * @return
     */
    @Override
    public SalesmanAssignmentResponseDTO assignSellers(Long wholesalerId,
                                                       SalesmanAssignmentDTO assignmentDTO) {
        Salesman salesman = findSalesmanByIdAndWholesaler(wholesalerId, assignmentDTO.getSalesmanId());

        SalesmanAssignment assignment = null;

        for (Long sellerId : assignmentDTO.getSellerIds()) {
            LocalSeller seller = sellerRepository.findById(sellerId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            String.format(Messages.SELLER_NOT_FOUND, sellerId)
                    ));

            boolean alreadyAssigned = assignmentRepository.exists(
                    Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesman.getId()))
                            .and(SalesmanAssignmentSpecification.bySellerId(sellerId))
                            .and(SalesmanAssignmentSpecification.activeOnly())
            );

            if (!alreadyAssigned) {
                SalesmanAssignment newAssignment = new SalesmanAssignment();
                newAssignment.setSalesman(salesman);
                newAssignment.setSeller(seller);
                newAssignment.setWholesaler(salesman.getWholesaler());
                newAssignment.setStatus("ACTIVE");
                newAssignment.setAssignedBy("wholesaler_" + wholesalerId);

                assignment = assignmentRepository.save(newAssignment);
            }
        }

        if (assignment == null) {
            Specification<SalesmanAssignment> spec =
                    SalesmanAssignmentSpecification.bySalesmanId(salesman.getId());
            assignment = assignmentRepository.findAll(spec, Pageable.ofSize(1).withPage(0))
                    .stream().findFirst().orElse(null);
        }

        return mapToAssignmentResponseDTO(assignment);
    }

    /**
     * remove local seller assignment from salesman
     * @param wholesalerId
     * @param assignmentId
     */
    @Override
    public void removeAssignment(Long wholesalerId, Long assignmentId) {
        SalesmanAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Messages.ASSIGNMENT_NOT_FOUND, assignmentId)
                ));

        if (!assignment.getWholesaler().getId().equals(wholesalerId)) {
            throw new IllegalArgumentException(Messages.UNAUTHORIZED_ACCESS);
        }

        assignment.setStatus("INACTIVE");
        assignment.setDeactivatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    /**
     * get all localseller to salesman assignment details
     * @param wholesalerId
     * @param salesmanId
     * @param pageable
     * @return
     */
    @Override
    public PaginatedResponseDTO<SalesmanAssignmentResponseDTO> getAssignedSellers(
            Long wholesalerId, Long salesmanId, Pageable pageable) {

        Salesman salesman = findSalesmanByIdAndWholesaler(wholesalerId, salesmanId);

        Specification<SalesmanAssignment> spec =
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.activeOnly());

        Page<SalesmanAssignment> page = assignmentRepository.findAll(spec, pageable);

        List<SalesmanAssignmentResponseDTO> content = page.getContent().stream()
                .map(this::mapToAssignmentResponseDTO)
                .collect(Collectors.toList());

        return PaginatedResponseDTO.<SalesmanAssignmentResponseDTO>builder()
                .content(content)
                .currentPage(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }

    /**
     * Helper method for counting assignment count for salesman
     * @param salesmanId
     * @return
     */
    @Override
    public Long getAssignedSellersCount(Long salesmanId) {
        return assignmentRepository.count(
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.activeOnly())
        );
    }

    /**
     * getting all localseller which not assign to any salesman for assignment
     * @param wholesalerId
     * @return
     */
    @Override
    public List<SellerDTO> getAvailableSellers(Long wholesalerId) {
        log.info("Fetching all sellers for wholesaler: {} (Temporary - without subscription)", wholesalerId);

        if (!wholesalerRepository.existsById(wholesalerId)) {
            throw new ResourceNotFoundException(
                    String.format(Messages.WHOLESALER_NOT_FOUND, wholesalerId)
            );
        }

        List<LocalSeller> allSellers = localSellerRepository.getAllSellers();

        List<LocalSeller> availableSellers = allSellers.stream()
                .filter(seller -> {
                    Specification<SalesmanAssignment> assignmentSpec =
                            Specification.where(SalesmanAssignmentSpecification.bySellerId(seller.getId()))
                                    .and(SalesmanAssignmentSpecification.activeOnly());

                    return !assignmentRepository.exists(assignmentSpec);
                })
                .collect(Collectors.toList());

        log.info("Found {} available sellers (temporary - all sellers)", availableSellers.size());

        return availableSellers.stream()
                .map(this::mapToSellerDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to map LocalSeller to SellerDTO
     * @param seller
     * @return
     */
    private SellerDTO mapToSellerDTO(LocalSeller seller) {
        return SellerDTO.builder()
                .id(seller.getId())
                .shopName(seller.getShopName())
                .ownerName(seller.getUser().getUsername())
                .phone(seller.getUser().getPhone())
                .address(seller.getAddress())
                .isActive(seller.getUser().getIsActive())
                .build();
    }

    /**
     * helper method for find salesman belongs to wholesaler
     * @param wholesalerId
     * @param salesmanId
     * @return
     */
    private Salesman findSalesmanByIdAndWholesaler(Long wholesalerId, Long salesmanId) {
        Specification<Salesman> spec =
                Specification.where(SalesmanSpecification.byWholesalerId(wholesalerId))
                        .and((root, query, cb) -> cb.equal(root.get("id"), salesmanId));

        return salesmanRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(Messages.SALESMAN_NOT_FOUND, salesmanId)
                ));
    }

    /**
     * helper method for generate employee id/salesman id
     * @param wholesalerId
     * @return
     */
    private String generateEmployeeId(Long wholesalerId) {
        long count = salesmanRepository.count(
                SalesmanSpecification.byWholesalerId(wholesalerId)
        ) + 1;
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMM"));
        return String.format("%s-%s-%03d", EMPLOYEE_ID_PREFIX, datePart, count);
    }

    private SalesmanResponseDTO mapToResponseDTO(Salesman salesman) {
        return SalesmanResponseDTO.builder()
                .id(salesman.getId())
                .userId(salesman.getUser().getId())
                .fullName(salesman.getFullName())
                .email(salesman.getUser().getEmail())
                .phone(salesman.getUser().getPhone())
                .employeeId(salesman.getEmployeeId())
                .region(salesman.getRegion())
                .department(salesman.getDepartment())
                .commissionRate(salesman.getCommissionRate())
                .salary(salesman.getSalary())
                .status(salesman.getUser().getIsActive() ? "ACTIVE" : "INACTIVE")
                .assignedSellersCount(getAssignedSellersCount(salesman.getId()))
                .createdAt(salesman.getCreatedAt())
                .aadharNumber(salesman.getAadharNumber())
                .panNumber(salesman.getPanNumber())
                .emergencyContact(salesman.getEmergencyContact())
                .emergencyContactName(salesman.getEmergencyContactName())
                .joiningDate(salesman.getJoiningDate())
                .build();
    }

    private SalesmanListDTO mapToListDTO(Salesman salesman) {
        return SalesmanListDTO.builder()
                .id(salesman.getId())
                .fullName(salesman.getFullName())
                .email(salesman.getUser().getEmail())
                .phone(salesman.getUser().getPhone())
                .employeeId(salesman.getEmployeeId())
                .region(salesman.getRegion())
                .status(salesman.getUser().getIsActive() ? "ACTIVE" : "INACTIVE")
                .assignedSellersCount(getAssignedSellersCount(salesman.getId()))
                .build();
    }

    private SalesmanAssignmentResponseDTO mapToAssignmentResponseDTO(SalesmanAssignment assignment) {
        if (assignment == null) return null;

        return SalesmanAssignmentResponseDTO.builder()
                .id(assignment.getId())
                .salesmanId(assignment.getSalesman().getId())
                .salesmanName(assignment.getSalesman().getFullName())
                .sellerId(assignment.getSeller().getId())
                .sellerName(assignment.getSeller().getUser().getUsername())
                .sellerShop(assignment.getSeller().getShopName())
                .assignedAt(assignment.getAssignedAt())
                .status(assignment.getStatus())
                .build();
    }
}
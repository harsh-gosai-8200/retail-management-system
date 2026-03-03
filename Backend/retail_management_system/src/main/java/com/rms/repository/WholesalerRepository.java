// File: src/main/java/com/rms/repository/WholesalerRepository.java
package com.rms.repository;

import com.rms.model.Wholesaler;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WholesalerRepository extends JpaRepository<Wholesaler, Long> {

    List<Wholesaler> findByIsActiveTrue();

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WholesalerRepository extends
        JpaRepository<Wholesaler, Long>{

    Optional<Wholesaler> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    Optional<Wholesaler> findByGstNumber(String gstNumber);
}
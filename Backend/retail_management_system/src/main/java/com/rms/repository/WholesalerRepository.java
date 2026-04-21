
package com.rms.repository;

import com.rms.model.Wholesaler;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.ScopedValue;
import java.util.List;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WholesalerRepository extends
        JpaRepository<Wholesaler, Long>{

    Optional<Wholesaler> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    Optional<Wholesaler> findByGstNumber(String gstNumber);
    List<Wholesaler> findByIsActiveTrue();

    Optional<Wholesaler> findByUserEmail(String email);
}
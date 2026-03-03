// File: src/main/java/com/rms/repository/LocalSellerRepository.java
package com.rms.repository;

import com.rms.model.LocalSeller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocalSellerRepository extends
        JpaRepository<LocalSeller, Long>{

    Optional<LocalSeller> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
package com.rms.repository;

import com.rms.model.LocalSeller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocalSellerRepository extends JpaRepository<LocalSeller, Long> {
}

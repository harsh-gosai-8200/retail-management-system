package com.rms.repository;

import com.rms.model.Wholesaler;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WholesalerRepository extends JpaRepository<Wholesaler, Long> {

    List<Wholesaler> findByIsActiveTrue();

}
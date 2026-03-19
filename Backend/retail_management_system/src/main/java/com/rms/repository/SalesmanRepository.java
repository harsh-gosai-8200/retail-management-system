package com.rms.repository;

import com.rms.model.LocalSeller;
import com.rms.model.Salesman;
import org.springframework.data.domain.Range;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesmanRepository extends JpaRepository<Salesman, Long>,
        JpaSpecificationExecutor<Salesman> {
    Optional<Salesman> findByUserId(Long id);
}

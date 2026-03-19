package com.rms.repository;

import com.rms.model.SalesmanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesmanAssignmentRepository extends
        JpaRepository<SalesmanAssignment, Long>,
        JpaSpecificationExecutor<SalesmanAssignment> {

}

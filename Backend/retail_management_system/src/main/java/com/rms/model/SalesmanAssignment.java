package com.rms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "salesman_assignments")
@Data
@NoArgsConstructor
public class SalesmanAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salesman_id", nullable = false)
    private Salesman salesman;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private LocalSeller seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wholesaler_id", nullable = false)
    private Wholesaler wholesaler;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @CreationTimestamp
    private LocalDateTime assignedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deactivatedAt;

    private String assignedBy;
}


package com.rms.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "salesman")
@Data
public class Salesman {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "wholesaler_id", nullable = false)
    private Wholesaler wholesaler;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String region;

    private String department;

    private Double commissionRate;

    private Double salary;

    private String aadharNumber;

    private String panNumber;

    private String emergencyContact;

    private String emergencyContactName;

    private LocalDate joiningDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

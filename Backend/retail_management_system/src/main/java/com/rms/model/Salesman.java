package com.rms.model;

import jakarta.persistence.*;
import lombok.Data;

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

    private String region;
}

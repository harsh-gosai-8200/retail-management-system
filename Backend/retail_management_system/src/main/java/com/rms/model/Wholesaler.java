package com.rms.model;

import com.rms.model.Product;
import com.rms.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Entity
@Table(name = "wholesalers")
@Data
@RequiredArgsConstructor
public class Wholesaler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "wholesaler")
    private List<Product> products;

    private String businessName;
    private String address;
    private String gstNumber;

    @Column(nullable = false)
    private Boolean isActive = true;
}
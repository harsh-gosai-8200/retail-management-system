package com.rms.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

@Entity
@Table(name = "wholesaler_seller_mapping")
@Data

public class WholesalerSellerMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wholesaler_id")
    private Wholesaler wholesaler;

    @ManyToOne
    @JoinColumn(name = "local_seller_id")
    private  LocalSeller localSeller;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

}

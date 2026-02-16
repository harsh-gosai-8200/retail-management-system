package com.rms.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "local_sellers")
@Data
public class LocalSeller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String shopName;

    private String address;

    private Double latitude;

    private Double longitude;
}

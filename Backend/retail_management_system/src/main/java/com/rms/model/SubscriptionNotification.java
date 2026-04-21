package com.rms.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_notifications")
@Data
public class SubscriptionNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long wholesalerId;

    @Column(nullable = false)
    private String type; // ORDER_LIMIT_WARNING, ORDER_LIMIT_EXCEEDED, EXPIRY_WARNING, RENEWAL_REMINDER

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
package com.rms.repository;

import com.rms.model.SubscriptionNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionNotificationRepository extends JpaRepository<SubscriptionNotification, Long> {
}
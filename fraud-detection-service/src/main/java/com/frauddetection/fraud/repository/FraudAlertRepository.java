package com.frauddetection.fraud.repository;

import com.frauddetection.fraud.model.AlertStatus;
import com.frauddetection.fraud.model.FraudAlert;
import com.frauddetection.fraud.model.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {

    Optional<FraudAlert> findByPaymentId(String paymentId);

    List<FraudAlert> findByStatus(AlertStatus status);

    List<FraudAlert> findByRiskLevel(RiskLevel riskLevel);

    List<FraudAlert> findBySenderId(String senderId);

    // Dashboard statistics
    long countByStatus(AlertStatus status);

    long countByRiskLevel(RiskLevel riskLevel);

    // Fraud-engine queries
    @Query("SELECT COUNT(f) FROM FraudAlert f WHERE f.senderId = :senderId " +
            "AND f.createdAt >= :since AND f.riskLevel IN ('HIGH', 'CRITICAL')")
    long countHighRiskAlertsBySender(
            @Param("senderId") String senderId,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT COUNT(f) FROM FraudAlert f WHERE f.senderId = :senderId " +
            "AND f.createdAt >= :since")
    long countRecentTransactionsBySender(
            @Param("senderId") String senderId,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT AVG(f.amount) FROM FraudAlert f " +
            "WHERE f.senderId = :senderId")
    Double findAverageTransactionAmountBySender(
            @Param("senderId") String senderId
    );

    @Query("SELECT COUNT(f) FROM FraudAlert f WHERE f.senderId = :senderId")
    long countTransactionsBySender(
            @Param("senderId") String senderId
    );

    // Dashboard search and filtering
    @Query("""
        SELECT f FROM FraudAlert f
        WHERE (:status IS NULL OR f.status = :status)
          AND (:riskLevel IS NULL OR f.riskLevel = :riskLevel)
          AND (:senderId IS NULL OR f.senderId = :senderId)
        """)
    Page<FraudAlert> searchAlerts(
            @Param("status") AlertStatus status,
            @Param("riskLevel") RiskLevel riskLevel,
            @Param("senderId") String senderId,
            Pageable pageable
    );
}
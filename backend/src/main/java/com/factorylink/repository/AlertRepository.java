package com.factorylink.repository;

import com.factorylink.entity.Alert;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByEquipmentIdAndResolvedAtIsNull(long equipmentId);

    @EntityGraph(attributePaths = "equipment")
    @Query("""
        select a from Alert a
        where (:equipmentId is null or a.equipment.id = :equipmentId)
          and a.triggeredAt >= :from
          and a.triggeredAt < :until
          and (:state = 'ALL' or (:state = 'OPEN' and a.resolvedAt is null)
            or (:state = 'RESOLVED' and a.resolvedAt is not null)
            or (:state = 'UNACKNOWLEDGED' and a.acknowledgedAt is null))
        """)
    Page<Alert> search(
        @Param("equipmentId") Long equipmentId, @Param("state") String state,
        @Param("from") Instant from, @Param("until") Instant until, Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Alert a where a.id = :id")
    Optional<Alert> lockById(@Param("id") long id);
}

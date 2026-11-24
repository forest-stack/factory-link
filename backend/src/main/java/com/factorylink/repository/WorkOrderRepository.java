package com.factorylink.repository;

import com.factorylink.entity.WorkOrder;
import com.factorylink.entity.WorkOrderStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    @EntityGraph(attributePaths = "equipment")
    @Query("select w from WorkOrder w where (:status is null or w.status = :status)")
    Page<WorkOrder> search(@Param("status") WorkOrderStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from WorkOrder w where w.id = :id")
    Optional<WorkOrder> lockById(@Param("id") long id);
}

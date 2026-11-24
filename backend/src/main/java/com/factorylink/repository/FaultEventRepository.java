package com.factorylink.repository;

import com.factorylink.entity.FaultEvent;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaultEventRepository extends JpaRepository<FaultEvent, Long> {
    long countByStartedAtGreaterThanEqual(Instant from);
}

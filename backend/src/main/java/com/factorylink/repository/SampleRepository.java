package com.factorylink.repository;

import com.factorylink.entity.EquipmentSample;
import com.factorylink.entity.OperatingStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SampleRepository extends JpaRepository<EquipmentSample, Long> {
    List<EquipmentSample> findByEquipmentIdAndSampledAtGreaterThanEqualOrderBySampledAtDescIdDesc(
        long equipmentId, Instant from, Pageable pageable
    );

    long countBySampledAtGreaterThanEqual(Instant from);
    long countBySampledAtGreaterThanEqualAndStatus(Instant from, OperatingStatus status);
}

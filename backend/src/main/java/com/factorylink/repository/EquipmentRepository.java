package com.factorylink.repository;

import com.factorylink.entity.Equipment;
import com.factorylink.entity.OperatingStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    boolean existsByCodeAndIdNot(String code, Long id);
    boolean existsByCode(String code);

    @Query("""
        select e from Equipment e
        where e.archivedAt is null
          and (:status is null or e.status = :status)
          and (locate(lower(:keyword), lower(e.code)) > 0
            or locate(lower(:keyword), lower(e.name)) > 0
            or locate(lower(:keyword), lower(e.productionLine)) > 0)
        order by e.code
        """)
    List<Equipment> search(@Param("keyword") String keyword, @Param("status") OperatingStatus status);

    @Query("select e.id from Equipment e where e.archivedAt is null order by e.id")
    List<Long> findActiveIds();

    Optional<Equipment> findByIdAndArchivedAtIsNull(Long id);

    // 定时采样、故障按钮和归档共用行锁，避免并发覆盖设备状态或重复生成报警。
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Equipment e where e.id = :id and e.archivedAt is null")
    Optional<Equipment> lockActive(@Param("id") long id);

    long countByArchivedAtIsNull();
    long countByArchivedAtIsNullAndStatus(OperatingStatus status);
}

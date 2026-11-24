package com.factorylink.service;

import com.factorylink.dto.AnalyticsSummary;
import com.factorylink.entity.OperatingStatus;
import com.factorylink.repository.EquipmentRepository;
import com.factorylink.repository.FaultEventRepository;
import com.factorylink.repository.SampleRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {
    private final EquipmentRepository equipment;
    private final SampleRepository samples;
    private final FaultEventRepository faults;

    public AnalyticsService(EquipmentRepository equipment, SampleRepository samples, FaultEventRepository faults) {
        this.equipment = equipment;
        this.samples = samples;
        this.faults = faults;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummary summarize(int hours) {
        Instant from = Instant.now().minus(hours, ChronoUnit.HOURS);
        long total = equipment.countByArchivedAtIsNull();
        long running = equipment.countByArchivedAtIsNullAndStatus(OperatingStatus.RUNNING);
        long abnormal = equipment.countByArchivedAtIsNullAndStatus(OperatingStatus.FAULT);
        long stopped = total - running - abnormal;
        long sampleCount = samples.countBySampledAtGreaterThanEqual(from);
        long runningSamples = samples.countBySampledAtGreaterThanEqualAndStatus(from, OperatingStatus.RUNNING);
        // 定时采样间隔基本固定，用运行样本占比估算稼动率。没有样本时返回 null。
        Double utilization = sampleCount == 0 ? null : Math.round(1000.0 * runningSamples / sampleCount) / 10.0;
        return new AnalyticsSummary(
            total, running + stopped, running, stopped, abnormal,
            faults.countByStartedAtGreaterThanEqual(from), sampleCount, utilization, hours
        );
    }
}

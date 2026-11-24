package com.factorylink.service;

import com.factorylink.repository.EquipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** fixedDelay 从上轮结束后计时，避免在慢查询时积压采样任务。 */
@Component
public class SimulationScheduler {
    private static final Logger log = LoggerFactory.getLogger(SimulationScheduler.class);
    private final EquipmentRepository equipment;
    private final SimulationService simulation;

    public SimulationScheduler(EquipmentRepository equipment, SimulationService simulation) {
        this.equipment = equipment;
        this.simulation = simulation;
    }

    @Scheduled(initialDelayString = "${factory.simulation.interval-ms}",
        fixedDelayString = "${factory.simulation.interval-ms}")
    public void sampleDevices() {
        for (long id : equipment.findActiveIds()) {
            try {
                // 跨 Bean 调用经过 Spring 事务代理，每台设备独立提交，单台失败不妨碍下一台。
                simulation.sampleIfActive(id);
            } catch (RuntimeException error) {
                log.error("设备 {} 采样失败", id, error);
            }
        }
    }
}

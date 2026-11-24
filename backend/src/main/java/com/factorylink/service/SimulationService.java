package com.factorylink.service;

import com.factorylink.entity.Equipment;
import com.factorylink.entity.FaultEvent;
import com.factorylink.entity.EquipmentSample;
import com.factorylink.entity.OperatingStatus;
import com.factorylink.repository.EquipmentRepository;
import com.factorylink.repository.FaultEventRepository;
import com.factorylink.repository.SampleRepository;
import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SimulationService {
    private final EquipmentRepository equipmentRepository;
    private final SampleRepository samples;
    private final FaultEventRepository faults;
    private final AlertService alerts;

    // 构造器明确声明依赖，由 Spring 创建对象并注入 Repository 和 Service。
    public SimulationService(
        EquipmentRepository equipmentRepository, SampleRepository samples,
        FaultEventRepository faults, AlertService alerts
    ) {
        this.equipmentRepository = equipmentRepository;
        this.samples = samples;
        this.faults = faults;
        this.alerts = alerts;
    }

    @Transactional
    public void sampleIfActive(long id) {
        equipmentRepository.lockActive(id).ifPresent(equipment -> capture(equipment, false));
    }

    /**
     * 正常读数使用不同设备的基准并加入小幅波动。故障开关持续抬高读数直到恢复。
     * 常规采样会偶尔模拟停机。恢复按钮立即采一条运行样本，便于演示。
     */
    void capture(Equipment equipment, boolean forceRunning) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double baseTemperature;
        double baseCurrent;
        int baseRpm;
        switch (equipment.getType()) {
            case MOTOR -> {
                baseTemperature = 57;
                baseCurrent = 9.4;
                baseRpm = 1480;
            }
            case CONVEYOR -> {
                baseTemperature = 42;
                baseCurrent = 5.8;
                baseRpm = 310;
            }
            case ROBOT -> {
                baseTemperature = 50;
                baseCurrent = 7.4;
                baseRpm = 960;
            }
            default -> throw new IllegalStateException("未知的设备类型");
        }

        boolean forcedFault = equipment.isForcedFault();
        boolean stopped = !forcedFault && !forceRunning && random.nextInt(30) == 0;
        double temperature = rounded(baseTemperature + random.nextDouble(-4, 4));
        double current = rounded(baseCurrent + random.nextDouble(-0.9, 0.9));
        int rpm = baseRpm + random.nextInt(-25, 26);
        if (forcedFault) {
            temperature = rounded(Math.max(temperature, equipment.getTemperatureLimit() + 9 + random.nextDouble(4)));
            current = rounded(Math.max(current, equipment.getCurrentLimit() + 2 + random.nextDouble(2)));
            rpm /= 2;
        } else if (stopped) {
            temperature = rounded(24 + random.nextDouble(4));
            current = 0;
            rpm = 0;
        }

        boolean exceeded = temperature > equipment.getTemperatureLimit() || current > equipment.getCurrentLimit();
        OperatingStatus status = OperatingStatus.RUNNING;
        if (exceeded) {
            status = OperatingStatus.FAULT;
        } else if (stopped) {
            status = OperatingStatus.STOPPED;
        }

        Instant at = Instant.now();
        if (status == OperatingStatus.FAULT && equipment.getStatus() != OperatingStatus.FAULT) {
            faults.save(new FaultEvent(equipment, at));
        }
        equipment.sample(status, temperature, current, rpm, at);
        samples.save(new EquipmentSample(equipment));
        alerts.evaluate(equipment, at);
    }

    private double rounded(double value) {
        return Math.round(value * 10) / 10.0;
    }
}

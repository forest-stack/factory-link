package com.factorylink.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** 一条记录对应一台设备的一次采样，按设备和时间建立索引供图表查询。 */
@Entity
@Table(name = "equipment_sample", indexes = {
    @Index(name = "idx_sample_equipment_time", columnList = "equipment_id, sampled_at"),
    @Index(name = "idx_sample_time_status", columnList = "sampled_at, status")
})
public class EquipmentSample {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "sampled_at", nullable = false)
    private Instant sampledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OperatingStatus status;

    private double temperature;
    private double currentAmps;
    private int rpm;

    protected EquipmentSample() {
    }

    public EquipmentSample(Equipment equipment) {
        this.equipment = equipment;
        sampledAt = equipment.getSampledAt();
        status = equipment.getStatus();
        temperature = equipment.getTemperature();
        currentAmps = equipment.getCurrentAmps();
        rpm = equipment.getRpm();
    }

    public Instant getSampledAt() { return sampledAt; }
    public OperatingStatus getStatus() { return status; }
    public double getTemperature() { return temperature; }
    public double getCurrentAmps() { return currentAmps; }
    public int getRpm() { return rpm; }
}

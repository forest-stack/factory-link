package com.factorylink.entity;

import com.factorylink.dto.EquipmentInput;
import jakarta.persistence.*;
import java.time.Instant;

/** 设备表同时保存配置和最近一次读数，列表轮询无需扫描历史表。 */
@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EquipmentType type;

    @Column(nullable = false, length = 80)
    private String productionLine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OperatingStatus status = OperatingStatus.STOPPED;

    private double temperature;
    private double currentAmps;
    private int rpm;
    private double temperatureLimit;
    private double currentLimit;
    private boolean forcedFault;
    private Instant sampledAt;

    // 保留设备主键以便回查历史报警和工单，归档后不再采样。
    private Instant archivedAt;

    protected Equipment() {
    }

    public Equipment(EquipmentInput input) {
        update(input);
    }

    public void update(EquipmentInput input) {
        code = input.code().strip();
        name = input.name().strip();
        type = input.type();
        productionLine = input.productionLine().strip();
        temperatureLimit = input.temperatureLimit();
        currentLimit = input.currentLimit();
    }

    public void sample(OperatingStatus status, double temperature, double currentAmps, int rpm, Instant at) {
        this.status = status;
        this.temperature = temperature;
        this.currentAmps = currentAmps;
        this.rpm = rpm;
        this.sampledAt = at;
    }

    public void archive(Instant at) {
        archivedAt = at;
    }

    public void setForcedFault(boolean forcedFault) {
        this.forcedFault = forcedFault;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public EquipmentType getType() { return type; }
    public String getProductionLine() { return productionLine; }
    public OperatingStatus getStatus() { return status; }
    public double getTemperature() { return temperature; }
    public double getCurrentAmps() { return currentAmps; }
    public int getRpm() { return rpm; }
    public double getTemperatureLimit() { return temperatureLimit; }
    public double getCurrentLimit() { return currentLimit; }
    public boolean isForcedFault() { return forcedFault; }
    public Instant getSampledAt() { return sampledAt; }
    public Instant getArchivedAt() { return archivedAt; }
}

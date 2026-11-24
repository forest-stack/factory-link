package com.factorylink.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** 每次进入故障只存一次，温度和电流同时超限也只计为一次设备故障。 */
@Entity
@Table(name = "fault_event", indexes = @Index(name = "idx_fault_started", columnList = "started_at"))
public class FaultEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    protected FaultEvent() {
    }

    public FaultEvent(Equipment equipment, Instant startedAt) {
        this.equipment = equipment;
        this.startedAt = startedAt;
    }
}

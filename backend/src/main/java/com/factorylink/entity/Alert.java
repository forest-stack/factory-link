package com.factorylink.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** 报警的恢复时间和确认时间分别记录，操作员可以先确认仍在发生的异常。 */
@Entity
@org.hibernate.annotations.DynamicUpdate
@Table(name = "equipment_alert", indexes = {
    @Index(name = "idx_alert_equipment_open", columnList = "equipment_id, resolved_at"),
    @Index(name = "idx_alert_triggered", columnList = "triggered_at")
})
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertMetric metric;

    private double triggerValue;
    private double thresholdValue;

    @Column(name = "triggered_at", nullable = false)
    private Instant triggeredAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    private Instant acknowledgedAt;

    @Column(length = 80)
    private String acknowledgedBy;

    protected Alert() {
    }

    public Alert(Equipment equipment, AlertMetric metric, double value, double threshold, Instant at) {
        this.equipment = equipment;
        this.metric = metric;
        triggerValue = value;
        thresholdValue = threshold;
        triggeredAt = at;
    }

    public void resolve(Instant at) {
        resolvedAt = at;
    }

    public void acknowledge(String username, Instant at) {
        if (acknowledgedAt == null) {
            acknowledgedAt = at;
            acknowledgedBy = username;
        }
    }

    public Long getId() { return id; }
    public Equipment getEquipment() { return equipment; }
    public AlertMetric getMetric() { return metric; }
    public double getTriggerValue() { return triggerValue; }
    public double getThresholdValue() { return thresholdValue; }
    public Instant getTriggeredAt() { return triggeredAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
}

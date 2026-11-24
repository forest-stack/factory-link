package com.factorylink.entity;

import jakarta.persistence.*;
import java.time.Instant;

/** 工单进度与设备状态独立，维修结束仍需等待模拟设备恢复。 */
@Entity
@Table(name = "maintenance_order", indexes = @Index(name = "idx_order_created", columnList = "created_at"))
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 80)
    private String assignee;

    @Column(nullable = false, length = 1000)
    private String cause;

    @Column(nullable = false, length = 1000)
    private String result = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkOrderStatus status = WorkOrderStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    private Instant updatedAt;

    protected WorkOrder() {
    }

    public WorkOrder(Equipment equipment, String title, String assignee, String cause, Instant at) {
        this.equipment = equipment;
        this.title = title;
        this.assignee = assignee;
        this.cause = cause;
        createdAt = at;
        updatedAt = at;
    }

    public void update(WorkOrderStatus status, String assignee, String cause, String result, Instant at) {
        this.status = status;
        this.assignee = assignee;
        this.cause = cause;
        this.result = result;
        updatedAt = at;
    }

    public Long getId() { return id; }
    public Equipment getEquipment() { return equipment; }
    public String getTitle() { return title; }
    public String getAssignee() { return assignee; }
    public String getCause() { return cause; }
    public String getResult() { return result; }
    public WorkOrderStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

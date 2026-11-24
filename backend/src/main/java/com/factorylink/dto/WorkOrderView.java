package com.factorylink.dto;

import com.factorylink.entity.WorkOrder;
import com.factorylink.entity.WorkOrderStatus;
import java.time.Instant;

public record WorkOrderView(
    long id, long equipmentId, String equipmentCode, String equipmentName, String title,
    String assignee, String cause, String result, WorkOrderStatus status, Instant createdAt, Instant updatedAt
) {
    public static WorkOrderView from(WorkOrder order) {
        return new WorkOrderView(
            order.getId(), order.getEquipment().getId(), order.getEquipment().getCode(),
            order.getEquipment().getName(), order.getTitle(), order.getAssignee(), order.getCause(),
            order.getResult(), order.getStatus(), order.getCreatedAt(), order.getUpdatedAt()
        );
    }
}

package com.factorylink.dto;

import com.factorylink.entity.Alert;
import com.factorylink.entity.AlertMetric;
import java.time.Instant;

public record AlertView(
    long id, long equipmentId, String equipmentCode, String equipmentName, AlertMetric metric,
    double triggerValue, double thresholdValue, Instant triggeredAt, Instant resolvedAt,
    Instant acknowledgedAt, String acknowledgedBy
) {
    public static AlertView from(Alert alert) {
        return new AlertView(
            alert.getId(), alert.getEquipment().getId(), alert.getEquipment().getCode(),
            alert.getEquipment().getName(), alert.getMetric(), alert.getTriggerValue(),
            alert.getThresholdValue(), alert.getTriggeredAt(), alert.getResolvedAt(),
            alert.getAcknowledgedAt(), alert.getAcknowledgedBy()
        );
    }
}

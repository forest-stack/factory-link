package com.factorylink.dto;

import com.factorylink.entity.Equipment;
import com.factorylink.entity.EquipmentType;
import com.factorylink.entity.OperatingStatus;
import java.time.Instant;

public record EquipmentView(
    long id, String code, String name, EquipmentType type, String productionLine,
    OperatingStatus status, double temperature, double currentAmps, int rpm,
    double temperatureLimit, double currentLimit, boolean forcedFault, Instant sampledAt
) {
    public static EquipmentView from(Equipment equipment) {
        return new EquipmentView(
            equipment.getId(), equipment.getCode(), equipment.getName(), equipment.getType(),
            equipment.getProductionLine(), equipment.getStatus(), equipment.getTemperature(),
            equipment.getCurrentAmps(), equipment.getRpm(), equipment.getTemperatureLimit(),
            equipment.getCurrentLimit(), equipment.isForcedFault(), equipment.getSampledAt()
        );
    }
}

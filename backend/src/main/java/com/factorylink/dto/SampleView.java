package com.factorylink.dto;

import com.factorylink.entity.EquipmentSample;
import com.factorylink.entity.OperatingStatus;
import java.time.Instant;

public record SampleView(
    Instant sampledAt, OperatingStatus status, double temperature, double currentAmps, int rpm
) {
    public static SampleView from(EquipmentSample sample) {
        return new SampleView(
            sample.getSampledAt(), sample.getStatus(), sample.getTemperature(),
            sample.getCurrentAmps(), sample.getRpm()
        );
    }
}

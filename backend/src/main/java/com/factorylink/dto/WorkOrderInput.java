package com.factorylink.dto;

import jakarta.validation.constraints.*;

public record WorkOrderInput(
    @NotNull @Positive Long equipmentId,
    @NotBlank @Size(max = 120) String title,
    @NotBlank @Size(max = 80) String assignee,
    @NotBlank @Size(max = 1000) String cause
) {}

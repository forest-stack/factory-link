package com.factorylink.dto;

import com.factorylink.entity.WorkOrderStatus;
import jakarta.validation.constraints.*;

public record WorkOrderUpdate(
    @NotNull WorkOrderStatus status,
    @NotBlank @Size(max = 80) String assignee,
    @NotBlank @Size(max = 1000) String cause,
    @NotNull @Size(max = 1000) String result
) {}

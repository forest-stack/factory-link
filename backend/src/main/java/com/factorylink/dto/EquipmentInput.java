package com.factorylink.dto;

import com.factorylink.entity.EquipmentType;
import jakarta.validation.constraints.*;

// 用 record 明确允许编辑的字段。状态和读数只由后端模拟逻辑更新。
public record EquipmentInput(
    @NotBlank @Size(max = 40) String code,
    @NotBlank @Size(max = 100) String name,
    @NotNull EquipmentType type,
    @NotBlank @Size(max = 80) String productionLine,
    @NotNull @DecimalMin("1.0") @DecimalMax("300.0") Double temperatureLimit,
    @NotNull @DecimalMin("0.1") @DecimalMax("200.0") Double currentLimit
) {}

package com.factorylink.controller;

import com.factorylink.dto.EquipmentInput;
import com.factorylink.dto.EquipmentView;
import com.factorylink.dto.SampleView;
import com.factorylink.entity.OperatingStatus;
import com.factorylink.service.EquipmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// Controller 负责 HTTP 参数和响应。数据库事务和业务规则集中放到 Service。
@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {
    private final EquipmentService equipment;

    public EquipmentController(EquipmentService equipment) {
        this.equipment = equipment;
    }

    @GetMapping
    public List<EquipmentView> search(
        @RequestParam(defaultValue = "") String keyword, @RequestParam(required = false) OperatingStatus status
    ) {
        return equipment.search(keyword, status);
    }

    @GetMapping("/{id}")
    public EquipmentView find(@PathVariable long id) {
        return equipment.find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentView create(@Valid @RequestBody EquipmentInput input) {
        return equipment.create(input);
    }

    @PutMapping("/{id}")
    public EquipmentView update(@PathVariable long id, @Valid @RequestBody EquipmentInput input) {
        return equipment.update(id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@PathVariable long id) {
        equipment.archive(id);
    }

    @GetMapping("/{id}/history")
    public List<SampleView> history(
        @PathVariable long id,
        @RequestParam(defaultValue = "1") @Min(1) @Max(168) int hours,
        @RequestParam(defaultValue = "120") @Min(1) @Max(720) int limit
    ) {
        return equipment.history(id, Instant.now().minus(hours, ChronoUnit.HOURS), limit);
    }

    @PostMapping("/{id}/simulate-fault")
    public EquipmentView simulateFault(@PathVariable long id) {
        return equipment.setFault(id, true);
    }

    @PostMapping("/{id}/recover")
    public EquipmentView recover(@PathVariable long id) {
        return equipment.setFault(id, false);
    }
}

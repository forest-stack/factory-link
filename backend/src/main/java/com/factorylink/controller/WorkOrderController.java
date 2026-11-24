package com.factorylink.controller;

import com.factorylink.dto.PageResult;
import com.factorylink.dto.WorkOrderInput;
import com.factorylink.dto.WorkOrderUpdate;
import com.factorylink.dto.WorkOrderView;
import com.factorylink.entity.WorkOrderStatus;
import com.factorylink.service.WorkOrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {
    private final WorkOrderService orders;

    public WorkOrderController(WorkOrderService orders) {
        this.orders = orders;
    }

    @GetMapping
    public PageResult<WorkOrderView> search(
        @RequestParam(required = false) WorkOrderStatus status,
        @RequestParam(defaultValue = "0") @Min(0) @Max(10000) int page
    ) {
        return orders.search(status, page);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderView create(@Valid @RequestBody WorkOrderInput input) {
        return orders.create(input);
    }

    @PutMapping("/{id}")
    public WorkOrderView update(@PathVariable long id, @Valid @RequestBody WorkOrderUpdate input) {
        return orders.update(id, input);
    }
}

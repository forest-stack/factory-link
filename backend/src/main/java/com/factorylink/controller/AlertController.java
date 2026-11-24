package com.factorylink.controller;

import com.factorylink.dto.AlertView;
import com.factorylink.dto.PageResult;
import com.factorylink.service.AlertService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    public enum Filter {
        ALL,
        OPEN,
        RESOLVED,
        UNACKNOWLEDGED
    }

    private final AlertService alerts;

    public AlertController(AlertService alerts) {
        this.alerts = alerts;
    }

    // 时间条件采用 [from, until)，前端可直接传入一天的开始和次日的开始。
    @GetMapping
    public PageResult<AlertView> search(
        @RequestParam(required = false) Long equipmentId,
        @RequestParam(defaultValue = "ALL") Filter state,
        @RequestParam(required = false) Instant from,
        @RequestParam(required = false) Instant until,
        @RequestParam(defaultValue = "0") @Min(0) @Max(10000) int page
    ) {
        Instant now = Instant.now();
        Instant start = from == null ? now.minus(30, ChronoUnit.DAYS) : from;
        Instant end = until == null ? now : until;
        return alerts.search(equipmentId, state.name(), start, end, page);
    }

    @PostMapping("/{id}/acknowledge")
    public AlertView acknowledge(@PathVariable long id, Authentication authentication) {
        return alerts.acknowledge(id, authentication.getName());
    }
}

package com.factorylink.controller;

import com.factorylink.dto.AnalyticsSummary;
import com.factorylink.service.AnalyticsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analytics;

    public AnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary(@RequestParam(defaultValue = "24") @Min(1) @Max(168) int hours) {
        return analytics.summarize(hours);
    }
}

package com.factorylink.dto;

public record AnalyticsSummary(
    long total, long normal, long running, long stopped, long abnormal,
    long faults, long sampleCount, Double utilizationPercent, int hours
) {}

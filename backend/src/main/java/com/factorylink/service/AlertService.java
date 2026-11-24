package com.factorylink.service;

import com.factorylink.dto.AlertView;
import com.factorylink.dto.PageResult;
import com.factorylink.entity.Alert;
import com.factorylink.entity.AlertMetric;
import com.factorylink.entity.Equipment;
import com.factorylink.repository.AlertRepository;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlertService {
    private final AlertRepository alerts;

    public AlertService(AlertRepository alerts) {
        this.alerts = alerts;
    }

    /**
     * 调用方先锁设备行，并在同一事务里调用本方法。
     * 每个指标只保留一条未恢复报警。更新报警、读数或样本任一失败，整次采样会回滚。
     */
    void evaluate(Equipment equipment, Instant at) {
        Map<AlertMetric, Alert> openAlerts = new EnumMap<>(AlertMetric.class);
        for (Alert alert : alerts.findByEquipmentIdAndResolvedAtIsNull(equipment.getId())) {
            openAlerts.put(alert.getMetric(), alert);
        }
        evaluateMetric(equipment, AlertMetric.TEMPERATURE, equipment.getTemperature(),
            equipment.getTemperatureLimit(), openAlerts.get(AlertMetric.TEMPERATURE), at);
        evaluateMetric(equipment, AlertMetric.CURRENT, equipment.getCurrentAmps(),
            equipment.getCurrentLimit(), openAlerts.get(AlertMetric.CURRENT), at);
    }

    private void evaluateMetric(
        Equipment equipment, AlertMetric metric, double value, double threshold, Alert openAlert, Instant at
    ) {
        if (value > threshold && openAlert == null) {
            alerts.save(new Alert(equipment, metric, value, threshold, at));
        } else if (value <= threshold && openAlert != null) {
            // 查询得到的是托管实体，事务提交时 JPA 自动写回恢复时间。
            openAlert.resolve(at);
        }
    }

    void resolveForArchivedEquipment(long equipmentId, Instant at) {
        for (Alert alert : alerts.findByEquipmentIdAndResolvedAtIsNull(equipmentId)) {
            alert.resolve(at);
        }
    }

    @Transactional(readOnly = true)
    public PageResult<AlertView> search(Long equipmentId, String state, Instant from, Instant until, int page) {
        if (from.compareTo(until) >= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "検索期間を確認してください。");
        }
        PageRequest request = PageRequest.of(page, 25, Sort.by(
            Sort.Order.desc("triggeredAt"), Sort.Order.desc("id")
        ));
        return PageResult.from(alerts.search(equipmentId, state, from, until, request).map(AlertView::from));
    }

    @Transactional
    public AlertView acknowledge(long id, String username) {
        Alert alert = alerts.lockById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "アラートが見つかりません。"));
        alert.acknowledge(username, Instant.now());
        return AlertView.from(alert);
    }
}

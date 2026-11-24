package com.factorylink.service;

import com.factorylink.dto.EquipmentInput;
import com.factorylink.dto.EquipmentView;
import com.factorylink.dto.SampleView;
import com.factorylink.entity.Equipment;
import com.factorylink.entity.EquipmentSample;
import com.factorylink.entity.OperatingStatus;
import com.factorylink.repository.EquipmentRepository;
import com.factorylink.repository.SampleRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EquipmentService {
    private final EquipmentRepository equipment;
    private final SampleRepository samples;
    private final SimulationService simulation;
    private final AlertService alerts;

    public EquipmentService(
        EquipmentRepository equipment, SampleRepository samples, SimulationService simulation, AlertService alerts
    ) {
        this.equipment = equipment;
        this.samples = samples;
        this.simulation = simulation;
        this.alerts = alerts;
    }

    @Transactional(readOnly = true)
    public List<EquipmentView> search(String keyword, OperatingStatus status) {
        List<EquipmentView> result = new ArrayList<>();
        for (Equipment device : equipment.search(keyword.strip(), status)) {
            result.add(EquipmentView.from(device));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public EquipmentView find(long id) {
        return EquipmentView.from(equipment.findByIdAndArchivedAtIsNull(id).orElseThrow(this::notFound));
    }

    @Transactional
    public EquipmentView create(EquipmentInput input) {
        if (equipment.existsByCode(input.code().strip())) {
            throw duplicateCode();
        }
        // 先保存取得主键，再为新设备生成第一条读数，两个动作在同一事务中。
        Equipment device = equipment.save(new Equipment(input));
        simulation.capture(device, true);
        return EquipmentView.from(device);
    }

    @Transactional
    public EquipmentView update(long id, EquipmentInput input) {
        Equipment device = lockActive(id);
        if (equipment.existsByCodeAndIdNot(input.code().strip(), id)) {
            throw duplicateCode();
        }
        device.update(input);
        simulation.capture(device, true);
        return EquipmentView.from(device);
    }

    @Transactional
    public void archive(long id) {
        Equipment device = lockActive(id);
        Instant at = Instant.now();
        device.archive(at);
        alerts.resolveForArchivedEquipment(id, at);
    }

    @Transactional
    public EquipmentView setFault(long id, boolean enabled) {
        Equipment device = lockActive(id);
        device.setForcedFault(enabled);
        simulation.capture(device, true);
        return EquipmentView.from(device);
    }

    @Transactional(readOnly = true)
    public List<SampleView> history(long id, Instant from, int limit) {
        if (!equipment.existsById(id)) {
            throw notFound();
        }
        List<EquipmentSample> latest = samples.findByEquipmentIdAndSampledAtGreaterThanEqualOrderBySampledAtDescIdDesc(
            id, from, PageRequest.of(0, limit)
        );
        List<SampleView> result = new ArrayList<>(latest.size());
        // SQL 先取最近 N 笔，再按时间正序返回，让图表从左向右绘制。
        for (EquipmentSample sample : latest.reversed()) {
            result.add(SampleView.from(sample));
        }
        return result;
    }

    Equipment lockActive(long id) {
        return equipment.lockActive(id).orElseThrow(this::notFound);
    }

    private ResponseStatusException duplicateCode() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "設備番号はすでに使用されています。");
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "設備が見つかりません。");
    }
}

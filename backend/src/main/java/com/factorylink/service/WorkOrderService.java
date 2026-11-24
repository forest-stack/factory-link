package com.factorylink.service;

import com.factorylink.dto.PageResult;
import com.factorylink.dto.WorkOrderInput;
import com.factorylink.dto.WorkOrderUpdate;
import com.factorylink.dto.WorkOrderView;
import com.factorylink.entity.Equipment;
import com.factorylink.entity.WorkOrder;
import com.factorylink.entity.WorkOrderStatus;
import com.factorylink.repository.WorkOrderRepository;
import java.time.Instant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkOrderService {
    private final WorkOrderRepository orders;
    private final EquipmentService equipment;

    public WorkOrderService(WorkOrderRepository orders, EquipmentService equipment) {
        this.orders = orders;
        this.equipment = equipment;
    }

    @Transactional(readOnly = true)
    public PageResult<WorkOrderView> search(WorkOrderStatus status, int page) {
        PageRequest request = PageRequest.of(page, 25, Sort.by(
            Sort.Order.desc("createdAt"), Sort.Order.desc("id")
        ));
        return PageResult.from(orders.search(status, request).map(WorkOrderView::from));
    }

    @Transactional
    public WorkOrderView create(WorkOrderInput input) {
        Equipment device = equipment.lockActive(input.equipmentId());
        WorkOrder order = new WorkOrder(
            device, input.title().strip(), input.assignee().strip(), input.cause().strip(), Instant.now()
        );
        return WorkOrderView.from(orders.save(order));
    }

    @Transactional
    public WorkOrderView update(long id, WorkOrderUpdate input) {
        WorkOrder order = orders.lockById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "保全作業が見つかりません。"));
        WorkOrderStatus previous = order.getStatus();
        WorkOrderStatus next = input.status();

        // 后端独立校验，防止直接调用 API 跳过处理中或重新打开已完成工单。
        boolean allowed = switch (previous) {
            case PENDING -> next == WorkOrderStatus.PENDING || next == WorkOrderStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == WorkOrderStatus.IN_PROGRESS || next == WorkOrderStatus.COMPLETED;
            case COMPLETED -> false;
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "この作業ステータスには変更できません。");
        }
        if (next == WorkOrderStatus.COMPLETED && input.result().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "完了には作業結果の入力が必要です。");
        }
        order.update(next, input.assignee().strip(), input.cause().strip(), input.result().strip(), Instant.now());
        return WorkOrderView.from(order);
    }
}

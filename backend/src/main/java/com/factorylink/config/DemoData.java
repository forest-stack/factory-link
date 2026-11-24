package com.factorylink.config;

import com.factorylink.dto.EquipmentInput;
import com.factorylink.entity.EquipmentType;
import com.factorylink.entity.OperatorAccount;
import com.factorylink.repository.EquipmentRepository;
import com.factorylink.repository.OperatorRepository;
import com.factorylink.service.EquipmentService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoData implements ApplicationRunner {
    private final OperatorRepository operators;
    private final EquipmentRepository equipment;
    private final EquipmentService equipmentService;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public DemoData(
        OperatorRepository operators, EquipmentRepository equipment, EquipmentService equipmentService,
        PasswordEncoder passwordEncoder,
        @Value("${factory.demo.username}") String username, @Value("${factory.demo.password}") String password
    ) {
        this.operators = operators;
        this.equipment = equipment;
        this.equipmentService = equipmentService;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        // 已初始化的账号不在每次启动时覆盖。新增演示账号可配置不同的用户名。
        if (username.isBlank() || username.length() > 80 || !username.equals(username.strip())) {
            throw new IllegalArgumentException("DEMO_USERNAME must have 1 to 80 characters without surrounding spaces");
        }
        if (!operators.existsById(username)) {
            if (password.isBlank() || password.length() < 12 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new IllegalArgumentException("Set DEMO_PASSWORD to at least 12 characters and at most 72 UTF-8 bytes");
            }
            operators.save(new OperatorAccount(username, passwordEncoder.encode(password)));
        }

        for (EquipmentInput input : initialEquipment()) {
            // 归档设备依然占用原编号，重启时不会把用户已删除的演示设备重新创建。
            if (!equipment.existsByCode(input.code())) {
                equipmentService.create(input);
            }
        }
    }

    private List<EquipmentInput> initialEquipment() {
        return List.of(
            new EquipmentInput("MTR-001", "主駆動モーター", EquipmentType.MOTOR, "組立ライン A", 75.0, 14.0),
            new EquipmentInput("CVY-002", "搬送コンベヤ", EquipmentType.CONVEYOR, "搬送ライン B", 65.0, 10.0),
            new EquipmentInput("RBT-003", "溶接ロボット", EquipmentType.ROBOT, "溶接ライン C", 72.0, 13.0),
            new EquipmentInput("MTR-004", "排気ファン用モーター", EquipmentType.MOTOR, "加工ライン D", 76.0, 15.0),
            new EquipmentInput("CVY-005", "検査搬送コンベヤ", EquipmentType.CONVEYOR, "検査ライン E", 66.0, 11.0),
            new EquipmentInput("RBT-006", "組立ロボット", EquipmentType.ROBOT, "組立ライン A", 74.0, 13.5)
        );
    }
}

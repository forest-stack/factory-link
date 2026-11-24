# システム設計 / 系统设计

## アーキテクチャ

```mermaid
flowchart LR
  B["React・Ant Design・ECharts"] -->|"Axios / Cookie / CSRF"| V["Vite /api プロキシ"]
  V --> S["Spring Security"]
  S --> C["Controller · DTO"]
  C --> SV["Service · トランザクション"]
  J["Java 定期タスク"] --> SV
  SV --> R["Repository · JPA"]
  R --> M[("MySQL / factory_link")]
```

浏览器请求相对路径 `/api`，Vite 将它转发到本机 Spring Boot。Controller 解析请求和校验 DTO，Service 执行业务规则，Repository 通过 JPA 读写 MySQL。数据库事务在 Service 层结束，响应中只包含显式声明的字段。

## ER 図

```mermaid
erDiagram
  EQUIPMENT ||--o{ EQUIPMENT_SAMPLE : has
  EQUIPMENT ||--o{ EQUIPMENT_ALERT : triggers
  EQUIPMENT ||--o{ FAULT_EVENT : enters
  EQUIPMENT ||--o{ MAINTENANCE_ORDER : requires

  OPERATOR_ACCOUNT {
    string username PK
    string password_hash
  }
  EQUIPMENT {
    long id PK
    string code UK
    string type
    string status
    double temperature_limit
    double current_limit
    datetime archived_at
  }
  EQUIPMENT_SAMPLE {
    long id PK
    long equipment_id FK
    datetime sampled_at
    string status
    double temperature
    double current_amps
    int rpm
  }
  EQUIPMENT_ALERT {
    long id PK
    long equipment_id FK
    string metric
    double trigger_value
    double threshold_value
    datetime triggered_at
    datetime resolved_at
    datetime acknowledged_at
    string acknowledged_by
  }
  FAULT_EVENT {
    long id PK
    long equipment_id FK
    datetime started_at
  }
  MAINTENANCE_ORDER {
    long id PK
    long equipment_id FK
    string assignee
    string status
    string cause
    string result
  }
```

设备通过归档实现删除，设备编号继续保留。报警确认人记录登录用户名。工单的维修负责人是可输入的姓名字段，可分配给无需登录系统的人员。

## 計測・アラートの流れ

```mermaid
flowchart TD
  TR["定时任务 / 故障按钮"] --> LOCK["锁定当前设备"]
  LOCK --> GEN["生成读数并判断状态"]
  GEN --> SAMPLE["保存最近读数和历史样本"]
  GEN --> FAULT["进入异常时新增设备故障事件"]
  SAMPLE --> CHECK{"单项读数是否超过阈值？"}
  CHECK -->|"是，已有未恢复记录"| KEEP["保留原报警"]
  CHECK -->|"是，无未恢复记录"| OPEN["创建报警"]
  CHECK -->|"否，有未恢复记录"| CLOSE["记录恢复时间"]
  KEEP --> ACK["操作员可确认报警"]
  OPEN --> ACK
  CLOSE --> ACK
```

单台设备的读数、状态、样本、故障事件和报警在同一数据库事务内写入。温度和电流各维护一条持续中的报警。一台设备从正常或停止进入异常时，故障计数增加一次，即使两项指标同时超限。恢复以读数小于或等于阈值为条件，人工确认单独记录。

## 保全作業の流れ

```mermaid
stateDiagram-v2
  [*] --> Pending: 设备、作业名、负责人、故障原因
  Pending --> InProgress: 开始处理
  InProgress --> Completed: 填写结果并完成
  Completed --> [*]
```

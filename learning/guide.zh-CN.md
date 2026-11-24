# FactoryLink 中文学习指南

先按 [中文 README](../README.zh-CN.md) 启动项目。用浏览器向应用发起一次登录，在开发者工具的「网络」中观察请求，再到源码定位对应实现。可在 VS Code 中打开项目根目录。

## 第一遍阅读顺序

| 顺序 | 文件 | 建议关注 |
| --- | --- | --- |
| 1 | [vite.config.js](../frontend/vite.config.js)、[api.js](../frontend/src/api.js) | 相对路径、Vite 代理、Axios 拦截器、Cookie 和 CSRF 请求头 |
| 2 | [AuthController.java](../backend/src/main/java/com/factorylink/controller/AuthController.java)、[SecurityConfig.java](../backend/src/main/java/com/factorylink/config/SecurityConfig.java) | BCrypt 认证、Session ID 轮换、未登录接口如何返回 401 |
| 3 | [Equipment.jsx](../frontend/src/pages/Equipment.jsx)、[EquipmentController.java](../backend/src/main/java/com/factorylink/controller/EquipmentController.java) | 表单提交、DTO 校验、表格刷新、HTTP 状态码 |
| 4 | [EquipmentService.java](../backend/src/main/java/com/factorylink/service/EquipmentService.java)、[EquipmentRepository.java](../backend/src/main/java/com/factorylink/repository/EquipmentRepository.java) | 服务层事务、JPA 查询、设备归档、构造器依赖注入 |
| 5 | [SimulationScheduler.java](../backend/src/main/java/com/factorylink/service/SimulationScheduler.java)、[SimulationService.java](../backend/src/main/java/com/factorylink/service/SimulationService.java) | 定时任务、逐台事务、写入最近数据和历史，模拟设备状态 |
| 6 | [AlertService.java](../backend/src/main/java/com/factorylink/service/AlertService.java)、[WorkOrderService.java](../backend/src/main/java/com/factorylink/service/WorkOrderService.java) | 报警去重和确认、数据库并发更新、工单状态转换 |
| 7 | [useApiData.js](../frontend/src/useApiData.js)、[TelemetryChart.jsx](../frontend/src/components/TelemetryChart.jsx)、[AnalyticsService.java](../backend/src/main/java/com/factorylink/service/AnalyticsService.java) | React Hooks 清理、图表实例复用、统计口径 |

`backend/src/main/java/com/factorylink` 按 Controller、Service、Repository、Entity、DTO 分层，`frontend/src/pages` 按界面拆分，`scripts` 保存启动、数据库初始化和冒烟测试。

## 从浏览器追踪到数据库

1. **登录**时，Axios 先请求 CSRF token，再发送用户名和密码。Spring Security 从 MySQL 读取 BCrypt 哈希并验证。成功后服务端创建认证上下文，浏览器保存 Session Cookie。后续请求只需会话，写操作还要带 CSRF token。
2. **创建设备**时，Ant Design 表单生成 JSON。Controller 做字段校验并把 DTO 交给 Service。Service 调用 Repository 保存实体并记录初始样本。构造器参数标明了需要的对象，Spring 在启动时注入。
3. **定时采样**时，Scheduler 每隔约5秒读取可用设备 ID，通过另一个 Spring Bean 逐台开启事务。设备行锁串行化同一台设备的定时写入和手动操作。设备状态、样本、故障事件及报警在事务内一起提交。
4. **阈值报警**时，Service 查找该设备每项指标尚未恢复的记录。只有首次超限才创建报警，回到阈值内写入恢复时间。确认和恢复各有自己的字段，可先确认再恢复。故障次数统计设备状态进入异常的次数。
5. **工单流转**时，Service 加锁读取旧状态。为了避免页面之外的直接调用跳过业务规则，服务端重新验证状态变化，并在完成时校验维修结果。
6. **刷新图表**时，`useApiData` 通过 `useEffect` 启动请求和下一轮定时器，页面卸载或切换设备时撤销旧请求。ECharts 用 `useRef` 持有实例，`useEffect` 更新数据并负责销毁。
7. **查看统计**时，`AnalyticsService` 从设备、故障事件和历史样本三张表取数。将状态为运行中的样本数除以总样本数，得到近似稼动率。样本为空时返回 `null`。

用 Navicat 打开 `factory_link`，观察 `equipment`、`equipment_sample` 和 `equipment_alert` 在一次故障与恢复前后的变化。对照 [ER 图](../docs/architecture.md) 理解外键，再用 [冒烟测试脚本](../scripts/smoke-test.mjs) 核对响应和数据库状态的关系。

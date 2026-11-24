# REST API

基地址为 `http://127.0.0.1:5173/api`。Vite 将下方路径代理到 Spring Boot 的 `/api`。响应采用 JSON，时间戳为 ISO 8601 UTC 格式。表格中的 `GET` 查询参数可以组合。

## 认证

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/auth/csrf` | 获取 `headerName` 和 `token`，同时建立 Session Cookie |
| POST | `/auth/login` | 提交 `username` 和 `password`。成功后更新 Session ID，需重新取 CSRF token |
| GET | `/auth/me` | 获取当前账户用户名 |
| POST | `/auth/logout` | 销毁会话，返回 204 |

除获取 CSRF token 和登录外，API 需要已认证的会话。登录、退出和其他写请求都需要携带当前 token，头名称使用 `/auth/csrf` 返回的值。

## 设备、监控与分析

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/equipment` | `keyword` 匹配编号、名称、生产线，`status` 筛选运行状态 |
| GET | `/equipment/{id}` | 查询当前设备和最近读数 |
| POST | `/equipment` | 创建设备，返回 201 |
| PUT | `/equipment/{id}` | 编辑设备配置 |
| DELETE | `/equipment/{id}` | 归档设备、停止采样并结束持续中的报警，返回 204 |
| GET | `/equipment/{id}/history` | 取指定时间窗的最近 N 条样本，按时间升序。默认 `hours=1`、`limit=120`，上限 168 小时、720 条 |
| POST | `/equipment/{id}/simulate-fault` | 开启设备持续故障并立即采样 |
| POST | `/equipment/{id}/recover` | 关闭故障模拟并立即采样，低阈值仍可能触发报警 |
| GET | `/analytics/summary` | 当前设备统计及指定时间窗内的故障次数、稼动率。默认 `hours=24`，范围 1–168 |

设备可编辑字段为 `code`、`name`、`type`、`productionLine`、`temperatureLimit`、`currentLimit`。类型取 `MOTOR`、`CONVEYOR`、`ROBOT`。状态取 `RUNNING`、`STOPPED`、`FAULT`。

## 报警与维修工单

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/alerts` | 可用 `equipmentId`、`state`、`from`、`until`、`page` 过滤，默认查最近30天 |
| POST | `/alerts/{id}/acknowledge` | 保存第一次确认时间与登录人 |
| GET | `/work-orders` | 用 `status` 和 `page` 查询工单 |
| POST | `/work-orders` | 提交 `equipmentId`、`title`、`assignee`、`cause`，返回 201 |
| PUT | `/work-orders/{id}` | 提交 `status`、`assignee`、`cause`、`result` 更新工单 |

报警筛选状态为 `ALL`、`OPEN`、`RESOLVED`、`UNACKNOWLEDGED`。时间过滤含开始、不含结束。分页从 0 开始，每页 25 条，返回 `items` 和 `total`。

工单状态只允许 `PENDING` → `IN_PROGRESS` → `COMPLETED`。处理前和处理中可以在原状态保存修改。完成时必须填写维修结果。

## 错误响应

常见状态码为 400（输入非法）、401（会话无效或认证失败）、403（CSRF 校验失败）、404（资源不存在）、409（重复编号或非法状态转换）。响应体包含日语 `message`，前端可直接显示。

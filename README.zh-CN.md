# FactoryLink 制造设备监控与保全管理系统

用于 Java 全栈学习和日本 IT、SE、制造业社内 SE 岗位展示的本地应用。界面使用日语，Java 代码与前端关键逻辑配有中文注释。设备温度、电流、转速和运行状态全部由 Java 模拟。

[日文 README 与实际运行截图](README.md) · [系统架构与 ER 图](docs/architecture.md) · [API 说明](docs/api.md) · [学习指南](learning/guide.zh-CN.md)

## 功能

- 登录、退出、BCrypt 密码哈希、服务端 Session 和 CSRF 防护。
- 设备登记、编辑、归档删除、关键字搜索、运行状态筛选及阈值设置。
- Java 定时采样、REST API 轮询、ECharts 温度、电流和转速历史曲线，以及手动模拟故障与恢复。
- 温度、电流分别检测阈值，持续异常期间去重，支持恢复、人工确认和历史查询。
- 维修工单指定人员、填写故障原因和维修结果，按待处理、处理中、已完成顺序流转。
- MySQL 实时聚合设备总数、正常数、异常数、故障次数、估算稼动率和历史温度。

## 本地启动

需要 Java 21、Maven、Node.js 24 LTS、MySQL Server 和客户端。在项目根目录运行：

```bash
./scripts/configure-env.sh
./scripts/init-db.sh
```

首条命令静默读取本机 MySQL 密码及自选演示密码，写入权限为 `0600` 的 `.env`。第二条命令只创建 `factory_link` 数据库。默认连接 `localhost:3306`、用户 `root`。如果系统中有多个 MySQL 客户端，可以用 `MYSQL_CLIENT` 指定路径。

分别打开两个终端：

```bash
# 终端 1
./scripts/start-backend.sh

# 终端 2
./scripts/start-frontend.sh
```

访问 [本地应用](http://127.0.0.1:5173)，使用 `operator` 和自己配置的 `DEMO_PASSWORD` 登录。首次启动会初始化演示账户与六台设备。修改已经存在账户对应的环境变量不会覆盖数据库里的密码哈希。可用新的用户名和演示密码初始化另一个账号。

在「稼働監視」页面触发模拟故障，在「アラート管理」确认报警，在「保全管理」登记并推进工单，将设备恢复后填写维修结果并完成工单。最后在「データ分析」查看数据库汇总。

## 验证

运行 `./scripts/smoke-test.sh` 可复测核心 API。脚本创建独立编号的测试设备，最终归档这台设备。对应的测试报警与工单历史会保留。编译和浏览器验证见 [检证记录](docs/verification.md)。

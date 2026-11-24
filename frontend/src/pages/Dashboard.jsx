import { Button, Table, Tag } from 'antd';
import { ArrowRightOutlined, BellOutlined } from '@ant-design/icons';
import { useApiData } from '../useApiData';
import {
  equipmentColumns,
  OpenMonitorLink,
  telemetryColumns,
} from '../components/EquipmentColumns';
import MetricCards from '../components/MetricCards';
import TelemetryChart from '../components/TelemetryChart';
import {
  NoData,
  PageHeading,
  PanelTitle,
  RequestError,
} from '../components/Shared';
import { formatDate, formatTime, metricNames } from '../format';

// 面板保留监控所需字段，完整设备类型和配置信息在设备管理页面查看。
const overviewColumns = [
  ...equipmentColumns.filter((column) => column.dataIndex !== 'type'),
  ...telemetryColumns,
];

export default function Dashboard() {
  const equipment = useApiData('/equipment', 5000);
  const summary = useApiData('/analytics/summary', 5000);
  const alerts = useApiData('/alerts?state=OPEN', 5000);
  const featured = equipment.data?.[0];
  const history = useApiData(
    featured ? `/equipment/${featured.id}/history` : null,
    5000,
  );
  const latest = equipment.data?.reduce(
    (previous, item) => (item.sampledAt > previous ? item.sampledAt : previous),
    '',
  );

  return (
    <>
      <PageHeading
        title="ダッシュボード"
        description="設備の稼働状況と異常の発生状況を確認できます。"
        action={
          <span className="live-label">
            <i />
            最終計測 {formatTime(latest)}
          </span>
        }
      />
      <RequestError
        error={
          summary.error || equipment.error || alerts.error || history.error
        }
      />
      <MetricCards summary={summary.data} />
      <div className="dashboard-panels">
        <section className="panel">
          <PanelTitle
            title="設備温度の推移"
            detail={
              featured ? `${featured.code} / ${featured.name}` : undefined
            }
          />
          <TelemetryChart
            samples={history.data}
            limit={featured?.temperatureLimit}
            loading={history.loading}
          />
        </section>
        <section className="panel alerts-panel">
          <div className="panel-heading">
            <PanelTitle title="発生中のアラート" />
            <Tag color={alerts.data?.total ? 'red' : 'default'}>
              {alerts.data?.total ?? '—'} 件
            </Tag>
          </div>
          {alerts.data?.items.length ? (
            <ul className="alert-preview">
              {alerts.data.items.slice(0, 4).map((alert) => (
                <li key={alert.id}>
                  <span className="alert-symbol">
                    <BellOutlined />
                  </span>
                  <div>
                    <strong>{alert.equipmentName}</strong>
                    <small>
                      {formatDate(alert.triggeredAt)} ・{' '}
                      {metricNames[alert.metric]}超過
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <NoData
              description={
                alerts.loading ? '読み込み中' : '発生中のアラートはありません'
              }
            />
          )}
          <Button
            type="link"
            href="#alerts"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
          >
            アラート一覧
          </Button>
        </section>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <PanelTitle title="設備の現在状況" />
          <OpenMonitorLink />
        </div>
        <Table
          rowKey="id"
          size="small"
          loading={equipment.loading}
          columns={overviewColumns}
          dataSource={equipment.data || []}
          pagination={false}
          scroll={{ x: 740 }}
        />
      </section>
    </>
  );
}

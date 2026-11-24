import { useState } from 'react';
import { Alert, App, Button, Segmented, Select, Space } from 'antd';
import { ThunderboltOutlined, UndoOutlined } from '@ant-design/icons';
import { api, errorMessage } from '../api';
import {
  NoData,
  PageHeading,
  PanelTitle,
  RequestError,
  StatusTag,
} from '../components/Shared';
import TelemetryChart from '../components/TelemetryChart';
import { equipmentOptions, equipmentStatuses, formatDate } from '../format';
import { useApiData } from '../useApiData';

export default function Monitoring() {
  const { message } = App.useApp();
  const [selected, setSelected] = useState();
  const [metric, setMetric] = useState('temperature');
  const [busy, setBusy] = useState(false);
  const equipment = useApiData('/equipment', 5000);
  const device =
    equipment.data?.find((item) => item.id === selected) ?? equipment.data?.[0];
  const history = useApiData(
    device ? `/equipment/${device.id}/history` : null,
    5000,
  );
  const thresholds = {
    temperature: device?.temperatureLimit,
    currentAmps: device?.currentLimit,
  };

  async function changeFault(enabled) {
    setBusy(true);
    try {
      const action = enabled ? 'simulate-fault' : 'recover';
      const { data } = await api.post(`/equipment/${device.id}/${action}`);
      if (!enabled && data.status === 'FAULT') {
        message.warning(
          '故障シミュレーションを解除しました。計測値がしきい値を超えています。',
        );
      } else {
        message.success(
          enabled ? '模擬故障を発生させました。' : '通常運転に復帰しました。',
        );
      }
      equipment.reload();
      history.reload();
    } catch (failure) {
      message.error(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeading
        title="稼働監視"
        description="計測値は約5秒ごとに更新されます。"
      />
      <RequestError error={equipment.error || history.error} />
      <section className="panel">
        <div className="monitor-controls">
          <div>
            <label htmlFor="monitor-equipment">監視対象設備</label>
            <Select
              id="monitor-equipment"
              value={device?.id}
              onChange={setSelected}
              options={equipmentOptions(equipment.data ?? [])}
              loading={equipment.loading}
            />
          </div>
          <Space wrap>
            <Button
              danger
              icon={<ThunderboltOutlined />}
              disabled={!device || device.forcedFault || busy}
              onClick={() => changeFault(true)}
            >
              模擬故障を発生
            </Button>
            <Button
              icon={<UndoOutlined />}
              disabled={!device?.forcedFault || busy}
              onClick={() => changeFault(false)}
            >
              通常運転に戻す
            </Button>
          </Space>
        </div>
        {device ? (
          <>
            <div className="monitor-details">
              <StatusTag status={device.status} labels={equipmentStatuses} />
              <span>{device.productionLine}</span>
              <span>最終計測 {formatDate(device.sampledAt)}</span>
            </div>
            {device.forcedFault && (
              <Alert
                type="warning"
                title="模擬故障が発生中です。"
                showIcon
                className="request-error"
              />
            )}
            <div className="reading-grid">
              <div>
                <span>温度</span>
                <strong>
                  {device.temperature.toFixed(1)} <small>℃</small>
                </strong>
                <small>しきい値 {device.temperatureLimit} ℃</small>
              </div>
              <div>
                <span>電流</span>
                <strong>
                  {device.currentAmps.toFixed(1)} <small>A</small>
                </strong>
                <small>しきい値 {device.currentLimit} A</small>
              </div>
              <div>
                <span>回転数</span>
                <strong>
                  {device.rpm.toLocaleString('ja-JP')} <small>rpm</small>
                </strong>
              </div>
            </div>
          </>
        ) : (
          <NoData
            description={
              equipment.loading ? '読み込み中' : '監視対象の設備がありません'
            }
          />
        )}
      </section>
      <section className="panel standalone-chart">
        <div className="panel-heading">
          <PanelTitle
            title="計測データの推移"
            detail="直近1時間の最新120件まで"
          />
          <Segmented
            value={metric}
            onChange={setMetric}
            aria-label="計測項目"
            options={[
              { label: '温度', value: 'temperature' },
              { label: '電流', value: 'currentAmps' },
              { label: '回転数', value: 'rpm' },
            ]}
          />
        </div>
        <TelemetryChart
          samples={history.data}
          metric={metric}
          limit={thresholds[metric]}
          loading={history.loading}
        />
      </section>
    </>
  );
}

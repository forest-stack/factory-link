import { useState } from 'react';
import { Select } from 'antd';
import { equipmentOptions } from '../format';
import MetricCards from '../components/MetricCards';
import TelemetryChart from '../components/TelemetryChart';
import { PageHeading, PanelTitle, RequestError } from '../components/Shared';
import { useApiData } from '../useApiData';

const intervals = [
  { value: 1, label: '過去1時間' },
  { value: 24, label: '過去24時間' },
  { value: 168, label: '過去7日間' },
];

export default function Analytics() {
  const [hours, setHours] = useState(24);
  const [selected, setSelected] = useState();
  const equipment = useApiData('/equipment', 5000);
  const summary = useApiData(`/analytics/summary?hours=${hours}`, 5000);
  const device =
    equipment.data?.find((item) => item.id === selected) ?? equipment.data?.[0];
  const history = useApiData(
    device ? `/equipment/${device.id}/history?hours=${hours}&limit=720` : null,
    5000,
  );

  return (
    <>
      <PageHeading
        title="データ分析"
        description="データベースに蓄積された計測履歴をもとに、設備の稼働実績を確認します。"
        action={
          <Select
            className="filter-select"
            aria-label="集計期間"
            value={hours}
            onChange={setHours}
            options={intervals}
          />
        }
      />
      <RequestError error={equipment.error || summary.error || history.error} />
      <MetricCards summary={summary.data} />
      <section className="panel standalone-chart">
        <div className="panel-heading">
          <PanelTitle
            title="温度の計測履歴"
            detail="選択した期間内の最新720件まで"
          />
          <Select
            className="filter-select wide"
            aria-label="分析対象設備"
            value={device?.id}
            options={equipmentOptions(equipment.data ?? [])}
            onChange={setSelected}
          />
        </div>
        <TelemetryChart
          samples={history.data}
          limit={device?.temperatureLimit}
          loading={history.loading}
        />
      </section>
      <section className="panel methodology">
        <PanelTitle title="集計方法" />
        <dl>
          <div>
            <dt>正常設備</dt>
            <dd>稼働中と停止中の設備の合計です。</dd>
          </div>
          <div>
            <dt>故障発生件数</dt>
            <dd>期間内に設備が異常状態へ移った回数です。</dd>
          </div>
          <div>
            <dt>設備稼働率</dt>
            <dd>
              期間内の稼働中サンプル数 ÷ 全サンプル数。計測件数{' '}
              {summary.data?.sampleCount.toLocaleString('ja-JP') ?? '—'} 件。
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

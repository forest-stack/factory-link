import {
  ApartmentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const metrics = [
  {
    key: 'total',
    label: '設備総数',
    unit: '台',
    icon: <ApartmentOutlined />,
    tone: 'blue',
  },
  {
    key: 'normal',
    label: '正常設備',
    unit: '台',
    icon: <CheckCircleOutlined />,
    tone: 'teal',
  },
  {
    key: 'abnormal',
    label: '異常設備',
    unit: '台',
    icon: <ExclamationCircleOutlined />,
    tone: 'red',
  },
  {
    key: 'faults',
    label: '故障発生件数',
    unit: '件',
    icon: <ThunderboltOutlined />,
    tone: 'amber',
    period: true,
  },
  {
    key: 'utilizationPercent',
    label: '設備稼働率',
    unit: '%',
    icon: <DashboardOutlined />,
    tone: 'indigo',
    period: true,
  },
];

export default function MetricCards({ summary }) {
  return (
    <div className="metric-grid">
      {metrics.map(({ key, label, unit, icon, tone, period }) => (
        <div className="metric-card" key={key}>
          <div className={`metric-icon ${tone}`}>{icon}</div>
          <div className="metric-label">{label}</div>
          <div className="metric-value">
            {summary?.[key]?.toLocaleString('ja-JP') ?? '—'}
            <small>{unit}</small>
          </div>
          <div className="metric-period">
            {period ? `過去${summary?.hours ?? '—'}時間` : '現在'}
          </div>
        </div>
      ))}
    </div>
  );
}

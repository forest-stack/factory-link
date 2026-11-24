import { Button } from 'antd';
import { equipmentStatuses, equipmentTypes, formatTime } from '../format';
import { StatusTag } from './Shared';

export const equipmentColumns = [
  {
    title: '設備番号',
    dataIndex: 'code',
    render: (value) => <span className="equipment-code">{value}</span>,
  },
  { title: '設備名', dataIndex: 'name' },
  {
    title: '種類',
    dataIndex: 'type',
    render: (value) => equipmentTypes[value],
  },
  { title: '生産ライン', dataIndex: 'productionLine' },
  {
    title: '運転状態',
    dataIndex: 'status',
    render: (status) => (
      <StatusTag status={status} labels={equipmentStatuses} />
    ),
  },
];

export const telemetryColumns = [
  {
    title: '温度',
    dataIndex: 'temperature',
    align: 'right',
    render: (value) => (
      <span className="reading-value">{`${value.toFixed(1)} ℃`}</span>
    ),
  },
  {
    title: '電流',
    dataIndex: 'currentAmps',
    align: 'right',
    render: (value) => (
      <span className="reading-value">{`${value.toFixed(1)} A`}</span>
    ),
  },
  {
    title: '回転数',
    dataIndex: 'rpm',
    align: 'right',
    render: (value) => (
      <span className="reading-value">{`${value.toLocaleString('ja-JP')} rpm`}</span>
    ),
  },
  {
    title: '最終計測',
    dataIndex: 'sampledAt',
    align: 'right',
    render: (value) => (
      <span className="reading-value">{formatTime(value)}</span>
    ),
  },
];

export function OpenMonitorLink() {
  return (
    <Button type="link" href="#monitoring">
      稼働監視を開く →
    </Button>
  );
}

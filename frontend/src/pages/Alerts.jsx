import { useState } from 'react';
import { App, Button, DatePicker, Select, Table, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { api, errorMessage } from '../api';
import { PageHeading, RequestError } from '../components/Shared';
import { apiQuery, equipmentOptions, formatDate, metricNames } from '../format';
import { useApiData } from '../useApiData';

const stateOptions = [
  { value: 'ALL', label: 'すべてのアラート' },
  { value: 'OPEN', label: '発生中' },
  { value: 'RESOLVED', label: '復旧済み' },
  { value: 'UNACKNOWLEDGED', label: '未確認' },
];

export default function Alerts() {
  const { message } = App.useApp();
  const [state, setState] = useState('ALL');
  const [device, setDevice] = useState();
  const [range, setRange] = useState(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null);
  const equipment = useApiData('/equipment');
  const alerts = useApiData(
    apiQuery('/alerts', {
      equipmentId: device,
      state,
      from: range?.[0]?.startOf('day').toISOString(),
      until: range?.[1]?.add(1, 'day').startOf('day').toISOString(),
      page: page - 1,
    }),
    5000,
  );

  async function acknowledge(alert) {
    setBusy(alert.id);
    try {
      await api.post(`/alerts/${alert.id}/acknowledge`);
      message.success('アラートを確認済みにしました。');
      alerts.reload();
    } catch (failure) {
      message.error(errorMessage(failure));
    } finally {
      setBusy(null);
    }
  }

  const columns = [
    { title: '発生日時', dataIndex: 'triggeredAt', render: formatDate },
    {
      title: '設備',
      dataIndex: 'equipmentName',
      render: (name, item) => (
        <>
          <strong>{name}</strong>
          <br />
          <span className="equipment-code">{item.equipmentCode}</span>
        </>
      ),
    },
    {
      title: '項目',
      dataIndex: 'metric',
      render: (metric) => metricNames[metric],
    },
    {
      title: '発生時の値 / しきい値',
      dataIndex: 'triggerValue',
      render: (value, item) =>
        `${value} / ${item.thresholdValue} ${item.metric === 'TEMPERATURE' ? '℃' : 'A'}`,
    },
    {
      title: '状態',
      dataIndex: 'resolvedAt',
      render: (value) =>
        value ? (
          <Tag color="green">復旧済み</Tag>
        ) : (
          <Tag color="red">発生中</Tag>
        ),
    },
    {
      title: '復旧日時',
      dataIndex: 'resolvedAt',
      key: 'resolvedTime',
      render: formatDate,
    },
    {
      title: '確認',
      dataIndex: 'acknowledgedAt',
      render: (value, item) =>
        value ? (
          <>
            <Tag color="blue">確認済み</Tag>
            <small className="table-note">
              {item.acknowledgedBy} · {formatDate(value)}
            </small>
          </>
        ) : (
          <Button
            size="small"
            icon={<CheckOutlined />}
            loading={busy === item.id}
            disabled={busy !== null}
            onClick={() => acknowledge(item)}
          >
            確認する
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeading
        title="アラート管理"
        description="しきい値を超えた計測を確認し、復旧と確認の履歴を参照します。"
      />
      <RequestError error={alerts.error || equipment.error} />
      <section className="panel table-panel">
        <div className="filter-bar">
          <Select
            className="filter-select"
            aria-label="アラートの状態"
            value={state}
            options={stateOptions}
            onChange={(value) => {
              setState(value);
              setPage(1);
            }}
          />
          <Select
            className="filter-select wide"
            aria-label="設備で絞り込み"
            allowClear
            value={device}
            options={equipmentOptions(equipment.data ?? [])}
            placeholder="すべての設備"
            onChange={(value) => {
              setDevice(value);
              setPage(1);
            }}
          />
          <DatePicker.RangePicker
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
          />
          {!range && <span className="filter-note">過去30日間</span>}
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={alerts.data?.items || []}
          loading={alerts.loading}
          scroll={{ x: 925 }}
          pagination={{
            current: page,
            pageSize: 25,
            total: alerts.data?.total || 0,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </section>
    </>
  );
}

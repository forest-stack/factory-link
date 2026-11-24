import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { api, errorMessage } from '../api';
import {
  equipmentColumns,
  telemetryColumns,
} from '../components/EquipmentColumns';
import { PageHeading, RequestError } from '../components/Shared';
import {
  apiQuery,
  equipmentStatuses,
  equipmentTypes,
  toOptions,
} from '../format';
import { useApiData } from '../useApiData';

const defaults = { type: 'MOTOR', temperatureLimit: 75, currentLimit: 14 };
const required = [{ required: true, message: 'この項目を入力してください。' }];
const requiredText = [
  { required: true, whitespace: true, message: 'この項目を入力してください。' },
];

export default function Equipment() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const devices = useApiData(
    apiQuery('/equipment', { keyword: search, status }),
    5000,
  );

  useEffect(() => {
    // 给搜索框留出输入时间，避免用户每键入一个字就请求数据库。
    const timer = window.setTimeout(() => setSearch(keyword.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  function showForm(device = null) {
    setEditing(device);
    setFormError('');
    form.resetFields();
    form.setFieldsValue(device || defaults);
    setOpen(true);
  }

  async function save(values) {
    setBusy(true);
    setFormError('');
    try {
      if (editing) await api.put(`/equipment/${editing.id}`, values);
      else await api.post('/equipment', values);
      setOpen(false);
      message.success(
        editing ? '設備情報を更新しました。' : '設備を登録しました。',
      );
      devices.reload();
    } catch (failure) {
      setFormError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  function confirmArchive(device) {
    modal.confirm({
      title: '設備を削除しますか？',
      content: `${device.code} / ${device.name} の計測を停止します。アラートと保全作業の履歴は引き続き参照できます。`,
      okText: '削除',
      okButtonProps: { danger: true },
      cancelText: 'キャンセル',
      async onOk() {
        try {
          await api.delete(`/equipment/${device.id}`);
          message.success('設備を削除しました。');
          devices.reload();
        } catch (failure) {
          message.error(errorMessage(failure));
          throw failure;
        }
      },
    });
  }

  const columns = [
    ...equipmentColumns,
    ...telemetryColumns.slice(0, 3),
    {
      title: '操作',
      key: 'actions',
      align: 'right',
      render: (_, device) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`${device.code} を編集`}
            onClick={() => showForm(device)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`${device.code} を削除`}
            onClick={() => confirmArchive(device)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="設備管理"
        description="設備情報とアラートのしきい値を登録・変更します。"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showForm()}
          >
            設備を登録
          </Button>
        }
      />
      <RequestError error={devices.error} />
      <section className="panel table-panel">
        <div className="filter-bar">
          <Input
            className="filter-search"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
            aria-label="設備を検索"
            placeholder="設備番号・設備名・生産ライン"
          />
          <Select
            className="filter-select"
            value={status}
            onChange={setStatus}
            allowClear
            aria-label="運転状態で絞り込み"
            placeholder="すべての運転状態"
            options={toOptions(equipmentStatuses)}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={devices.data || []}
          loading={devices.loading}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </section>
      <Modal
        title={editing ? '設備情報の編集' : '設備の登録'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? '保存' : '登録'}
        cancelText="キャンセル"
        confirmLoading={busy}
        closable={!busy}
        mask={{ closable: !busy }}
        cancelButtonProps={{ disabled: busy }}
        forceRender
      >
        <RequestError error={formError} />
        <Form form={form} layout="vertical" onFinish={save}>
          <div className="form-grid">
            <Form.Item name="code" label="設備番号" rules={requiredText}>
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item name="name" label="設備名" rules={requiredText}>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item name="type" label="種類" rules={required}>
              <Select options={toOptions(equipmentTypes)} />
            </Form.Item>
            <Form.Item
              name="productionLine"
              label="生産ライン"
              rules={requiredText}
            >
              <Input maxLength={80} />
            </Form.Item>
            <Form.Item
              name="temperatureLimit"
              label="温度しきい値（℃）"
              rules={required}
            >
              <InputNumber min={1} max={300} step={0.1} controls={false} />
            </Form.Item>
            <Form.Item
              name="currentLimit"
              label="電流しきい値（A）"
              rules={required}
            >
              <InputNumber min={0.1} max={200} step={0.1} controls={false} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import {
  App,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Table,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api, errorMessage } from '../api';
import { PageHeading, RequestError, StatusTag } from '../components/Shared';
import {
  apiQuery,
  equipmentOptions,
  formatDate,
  orderStatuses,
  toOptions,
} from '../format';
import { useApiData } from '../useApiData';

const required = [{ required: true, message: 'この項目を入力してください。' }];
const requiredText = [
  { required: true, whitespace: true, message: 'この項目を入力してください。' },
];
const editableStatuses = {
  PENDING: ['PENDING', 'IN_PROGRESS'],
  IN_PROGRESS: ['IN_PROGRESS', 'COMPLETED'],
};

export default function Maintenance() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const nextStatus = Form.useWatch('status', form);
  const orders = useApiData(
    apiQuery('/work-orders', { status, page: page - 1 }),
  );
  const equipment = useApiData('/equipment');
  const completed = editing?.status === 'COMPLETED';

  function showForm(order = null) {
    setEditing(order);
    setFormError('');
    form.resetFields();
    if (order) form.setFieldsValue(order);
    setOpen(true);
  }

  async function save(values) {
    setBusy(true);
    setFormError('');
    try {
      if (editing) {
        await api.put(`/work-orders/${editing.id}`, {
          ...values,
          result: values.result ?? '',
        });
      } else {
        await api.post('/work-orders', values);
        setPage(1);
      }
      setOpen(false);
      orders.reload();
      message.success(
        editing ? '保全作業を更新しました。' : '保全作業を登録しました。',
      );
    } catch (failure) {
      setFormError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      title: '作業番号',
      dataIndex: 'id',
      render: (id) => (
        <span className="equipment-code">WO-{String(id).padStart(4, '0')}</span>
      ),
    },
    { title: '作業名', dataIndex: 'title' },
    {
      title: '設備',
      dataIndex: 'equipmentName',
      render: (name, order) => `${order.equipmentCode} / ${name}`,
    },
    { title: '担当者', dataIndex: 'assignee' },
    {
      title: 'ステータス',
      dataIndex: 'status',
      render: (value) => <StatusTag status={value} labels={orderStatuses} />,
    },
    { title: '更新日時', dataIndex: 'updatedAt', render: formatDate },
    {
      title: '操作',
      key: 'actions',
      render: (_, order) => (
        <Button type="link" onClick={() => showForm(order)}>
          詳細
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="保全管理"
        description="担当者を割り当て、故障原因と作業結果を記録します。"
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!equipment.data?.length}
            onClick={() => showForm()}
          >
            保全作業を登録
          </Button>
        }
      />
      <RequestError error={orders.error || equipment.error} />
      <section className="panel table-panel">
        <div className="filter-bar">
          <Select
            className="filter-select"
            aria-label="作業ステータスで絞り込み"
            allowClear
            value={status}
            options={toOptions(orderStatuses)}
            placeholder="すべてのステータス"
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders.data?.items || []}
          loading={orders.loading}
          scroll={{ x: 825 }}
          pagination={{
            current: page,
            pageSize: 25,
            total: orders.data?.total || 0,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </section>
      <Modal
        title={editing ? '保全作業の詳細' : '保全作業の登録'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? '保存' : '登録'}
        cancelText={completed ? '閉じる' : 'キャンセル'}
        okButtonProps={completed ? { style: { display: 'none' } } : {}}
        confirmLoading={busy}
        closable={!busy}
        mask={{ closable: !busy }}
        cancelButtonProps={{ disabled: busy }}
        forceRender
      >
        <RequestError error={formError} />
        {editing && (
          <Descriptions
            size="small"
            column={1}
            className="order-details"
            items={[
              { key: 'title', label: '作業名', children: editing.title },
              {
                key: 'equipment',
                label: '対象設備',
                children: `${editing.equipmentCode} / ${editing.equipmentName}`,
              },
            ]}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={completed}
        >
          {!editing && (
            <>
              <Form.Item name="equipmentId" label="対象設備" rules={required}>
                <Select options={equipmentOptions(equipment.data ?? [])} />
              </Form.Item>
              <Form.Item name="title" label="作業名" rules={requiredText}>
                <Input maxLength={120} />
              </Form.Item>
            </>
          )}
          <Form.Item name="assignee" label="担当者" rules={requiredText}>
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item name="cause" label="故障原因" rules={requiredText}>
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          {editing && (
            <>
              <Form.Item name="status" label="ステータス" rules={required}>
                <Select
                  options={(
                    editableStatuses[editing.status] || ['COMPLETED']
                  ).map((value) => ({
                    value,
                    label: orderStatuses[value][0],
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="result"
                label="作業結果"
                rules={nextStatus === 'COMPLETED' ? requiredText : []}
              >
                <Input.TextArea rows={3} maxLength={1000} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}

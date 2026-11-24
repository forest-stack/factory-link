import { Alert, Empty, Tag } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <ApiOutlined />
      </span>
      <span>
        <strong>FactoryLink</strong>
        <small>設備監視・保全管理</small>
      </span>
    </div>
  );
}

export function PageHeading({ title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusTag({ status, labels }) {
  const [label, color] = labels[status] || ['不明', 'default'];
  return (
    <Tag color={color} className="status-tag">
      <span />
      {label}
    </Tag>
  );
}

export function RequestError({ error }) {
  if (!error) return null;
  return (
    <Alert className="request-error" type="error" showIcon title={error} />
  );
}

export function NoData({ description = 'データがありません' }) {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
  );
}

export function PanelTitle({ title, detail }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {detail && <p>{detail}</p>}
    </div>
  );
}

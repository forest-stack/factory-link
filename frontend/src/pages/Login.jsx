import { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { errorMessage, login } from '../api';
import { Brand } from '../components/Shared';

export default function Login({ onLogin, expired }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(values) {
    setBusy(true);
    setError('');
    try {
      onLogin(await login(values));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <Brand />
        <div className="login-intro">
          <h2>
            製造現場の設備を、
            <br />
            ひとつの画面で。
          </h2>
          <p>設備の稼働状況、異常の発生、保全作業の進捗を確認できます。</p>
        </div>
        <p className="login-footnote">
          このシステムの設備データはすべてシミュレーションです。
        </p>
      </section>
      <section className="login-form-panel">
        <div className="login-form-card">
          <h1>ログイン</h1>
          <p>ユーザーIDとパスワードを入力してください。</p>
          {expired && !error && (
            <Alert
              className="request-error"
              type="warning"
              showIcon
              title="セッションが終了しました。再度ログインしてください。"
            />
          )}
          {error && (
            <Alert
              className="request-error"
              type="error"
              showIcon
              title={error}
            />
          )}
          <Form
            layout="vertical"
            onFinish={submit}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="username"
              label="ユーザーID"
              rules={[
                { required: true, message: 'ユーザーIDを入力してください。' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                autoComplete="username"
                maxLength={80}
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="パスワード"
              rules={[
                { required: true, message: 'パスワードを入力してください。' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                autoComplete="current-password"
                maxLength={72}
              />
            </Form.Item>
            <Button block type="primary" htmlType="submit" loading={busy}>
              ログイン
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}

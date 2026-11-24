import { useEffect, useState } from 'react';
import { App as AntApp, Button, Drawer, Menu, Spin } from 'antd';
import {
  ApartmentOutlined,
  BellOutlined,
  DashboardOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  MonitorOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { api, errorMessage, logout } from './api';
import { Brand } from './components/Shared';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Monitoring from './pages/Monitoring';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';

const sections = {
  dashboard: {
    label: 'ダッシュボード',
    icon: <DashboardOutlined />,
    Page: Dashboard,
  },
  equipment: {
    label: '設備管理',
    icon: <ApartmentOutlined />,
    Page: Equipment,
  },
  monitoring: {
    label: '稼働監視',
    icon: <MonitorOutlined />,
    Page: Monitoring,
  },
  alerts: { label: 'アラート管理', icon: <BellOutlined />, Page: Alerts },
  maintenance: { label: '保全管理', icon: <ToolOutlined />, Page: Maintenance },
  analytics: {
    label: 'データ分析',
    icon: <LineChartOutlined />,
    Page: Analytics,
  },
};

function currentSection() {
  const key = window.location.hash.slice(1);
  return Object.hasOwn(sections, key) ? key : 'dashboard';
}

export default function App() {
  const { message } = AntApp.useApp();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [section, setSection] = useState(currentSection);
  const [drawer, setDrawer] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/auth/me', { signal: controller.signal })
      .then(({ data }) => setUser(data))
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });

    function invalidateSession() {
      setUser(null);
      setExpired(true);
    }
    function onHashChange() {
      setSection(currentSection());
    }

    window.addEventListener('factorylink-session-expired', invalidateSession);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      controller.abort();
      window.removeEventListener(
        'factorylink-session-expired',
        invalidateSession,
      );
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
      setUser(null);
      setExpired(false);
      window.location.hash = '';
    } catch (error) {
      if (error.response?.status === 401) setUser(null);
      else message.error(errorMessage(error));
    } finally {
      setSigningOut(false);
    }
  }

  if (!ready)
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  if (!user)
    return (
      <Login
        onLogin={(account) => {
          setExpired(false);
          setUser(account);
        }}
        expired={expired}
      />
    );

  const items = Object.entries(sections).map(([key, item]) => ({
    key,
    label: item.label,
    icon: item.icon,
  }));
  const navigation = (
    <>
      <Brand />
      <nav aria-label="メインメニュー">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[section]}
          items={items}
          onClick={({ key }) => {
            window.location.hash = key;
            setDrawer(false);
          }}
        />
      </nav>
    </>
  );
  const Page = sections[section].Page;

  return (
    <div className="app-layout">
      <aside className="sidebar">{navigation}</aside>
      <Drawer
        title="メニュー"
        placement="left"
        open={drawer}
        onClose={() => setDrawer(false)}
        size={252}
        className="mobile-nav"
        styles={{ body: { padding: 0, background: '#10243a' } }}
      >
        {navigation}
      </Drawer>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              className="mobile-menu"
              icon={<MenuOutlined />}
              aria-label="メニューを開く"
              onClick={() => setDrawer(true)}
            />
            <span className="simulation-chip">
              <i />
              シミュレーション環境
            </span>
          </div>
          <div className="topbar-user">
            <span>
              <UserOutlined /> {user.username}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={signOut}
              loading={signingOut}
            >
              ログアウト
            </Button>
          </div>
        </header>
        <main className="main-content">
          <Page />
        </main>
        <footer className="workspace-footer">
          設備データはすべてシミュレーションです。
        </footer>
      </div>
    </div>
  );
}

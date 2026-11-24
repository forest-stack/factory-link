import React from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp, ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import 'antd/dist/reset.css';
import App from './App';
import './styles.css';

dayjs.locale('ja');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={jaJP}
      theme={{
        token: {
          colorPrimary: '#087c83',
          colorText: '#162c43',
          colorTextSecondary: '#53677b',
          borderRadius: 7,
          fontFamily:
            'Inter, "Hiragino Sans", "Noto Sans JP", Meiryo, sans-serif',
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxy = {
    // 代理只接收 API 请求。浏览器看到的是同一域名，因而可以使用会话 Cookie。
    '/api': {
      target: env.VITE_API_TARGET || 'http://127.0.0.1:8080',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'charts', test: /node_modules\/(echarts|zrender)\// },
              {
                name: 'design',
                test: /node_modules\/(antd|@ant-design|@rc-component)\//,
              },
            ],
          },
        },
      },
    },
  };
});

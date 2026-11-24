import axios from 'axios';

export const api = axios.create({ baseURL: '/api', timeout: 10000 });
let csrfToken;

// Axios 会自动发送同源的 Session Cookie。写请求另外添加从后端获得的 CSRF token。
async function loadCsrf() {
  if (!csrfToken) {
    const { data } = await api.get('/auth/csrf');
    csrfToken = data;
  }
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrf = await loadCsrf();
    config.headers.set(csrf.headerName, csrf.token);
  }
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401 &&
    !error.config?.url?.startsWith('/auth/')
  ) {
    csrfToken = undefined;
    window.dispatchEvent(new Event('factorylink-session-expired'));
  }
  return Promise.reject(error);
});

export async function login(credentials) {
  // 刷新登录前 token，兼容长时间停留于登录页或之前已退出的情况。
  csrfToken = undefined;
  const { data } = await api.post('/auth/login', credentials);
  csrfToken = undefined;
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
  csrfToken = undefined;
}

export function errorMessage(error) {
  return (
    error.response?.data?.message ||
    'サーバーとの通信に失敗しました。時間をおいて再度お試しください。'
  );
}

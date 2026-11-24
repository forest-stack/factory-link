import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { api, errorMessage } from './api';

// useEffect 在 URL 变化时重新请求。每次完成后再安排下一次，慢请求也不会造成并发轮询。
export function useApiData(url, interval = 0) {
  const [state, setState] = useState({ url: null, data: null, error: null });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!url) return undefined;

    const controller = new AbortController();
    let timer;

    async function fetchData() {
      try {
        const { data } = await api.get(url, { signal: controller.signal });
        if (!controller.signal.aborted) setState({ url, data, error: null });
      } catch (error) {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          setState((previous) => ({
            url,
            data: previous.url === url ? previous.data : null,
            error: errorMessage(error),
          }));
        }
      } finally {
        if (interval && !controller.signal.aborted) {
          timer = window.setTimeout(fetchData, interval);
        }
      }
    }

    fetchData();
    return () => {
      // StrictMode、切页或切换筛选时清理旧任务，防止旧结果覆盖新页面。
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [url, interval, revision]);

  const current = state.url === url ? state : { data: null, error: null };
  return {
    data: current.data,
    error: current.error,
    loading: Boolean(url && current.data === null && current.error === null),
    reload,
  };
}

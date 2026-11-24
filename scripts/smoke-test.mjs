import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

const base = process.env.FACTORYLINK_TEST_URL || 'http://127.0.0.1:5173/api';
const username = process.env.DEMO_USERNAME || 'operator';
const password = process.env.DEMO_PASSWORD;
assert.ok(password, 'DEMO_PASSWORD を設定してください。');

let cookie;
let csrf;
let equipmentId;

async function call(
  path,
  { method = 'GET', body, expected = 200, sendToken = true } = {},
) {
  const headers = new Headers();
  if (cookie) headers.set('Cookie', cookie);
  if (csrf && sendToken) headers.set(csrf.headerName, csrf.token);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const setCookie = response.headers.getSetCookie()[0];
  if (setCookie) cookie = setCookie.split(';')[0];

  assert.equal(response.status, expected, `${method} ${path}`);
  if (response.status === 204) return undefined;
  return response.json();
}

async function verifyAuth() {
  await call('/equipment', { expected: 401 });
  await call('/auth/login', {
    method: 'POST',
    body: { username, password },
    expected: 403,
  });
  csrf = await call('/auth/csrf');
  await call('/auth/login', {
    method: 'POST',
    body: { username, password: 'incorrect-for-smoke-test' },
    expected: 401,
  });
  const beforeLogin = cookie;
  assert.equal(
    (
      await call('/auth/login', {
        method: 'POST',
        body: { username, password },
      })
    ).username,
    username,
  );
  assert.notEqual(cookie, beforeLogin);
  await call('/auth/logout', { method: 'POST', expected: 403 });
  csrf = await call('/auth/csrf');
  assert.equal((await call('/auth/me')).username, username);
  console.log('PASS: 認証、CSRF、セッションIDの更新');
}

async function verifyEquipment() {
  const input = {
    code: `QA-${Date.now()}`,
    name: '動作検証用モーター',
    type: 'MOTOR',
    productionLine: '動作検証ライン',
    temperatureLimit: 75,
    currentLimit: 14,
  };

  const created = await call('/equipment', {
    method: 'POST',
    body: input,
    expected: 201,
  });
  equipmentId = created.id;
  assert.equal(created.status, 'RUNNING');
  await call('/equipment', { method: 'POST', body: input, expected: 409 });
  const updated = await call(`/equipment/${equipmentId}`, {
    method: 'PUT',
    body: { ...input, name: '検証用モーター（更新済み）' },
  });
  assert.equal(updated.name, '検証用モーター（更新済み）');
  const matches = await call(
    `/equipment?keyword=${encodeURIComponent(input.code)}`,
  );
  assert.deepEqual(
    matches.map((device) => device.id),
    [equipmentId],
  );
  const faults = await call(
    `/equipment?keyword=${encodeURIComponent(input.code)}&status=FAULT`,
  );
  assert.equal(faults.length, 0);
  await call(`/equipment/${equipmentId}/history?limit=0`, { expected: 400 });
  console.log(
    'PASS: 設備登録・検索・絞り込み・編集、重複番号と不正パラメーターの拒否',
  );
}

async function verifySimulation() {
  const initial = await call('/analytics/summary');
  const started = await call(`/equipment/${equipmentId}/simulate-fault`, {
    method: 'POST',
  });
  assert.equal(started.status, 'FAULT');
  assert.equal(started.forcedFault, true);
  const alertsPath = `/alerts?equipmentId=${equipmentId}`;
  const triggered = await call(`${alertsPath}&state=OPEN`);
  assert.deepEqual(triggered.items.map((item) => item.metric).sort(), [
    'CURRENT',
    'TEMPERATURE',
  ]);
  const latest = await call(`/equipment/${equipmentId}/history`);
  assert.equal(latest.at(-1).status, 'FAULT');

  // 跨过一次 Java 定时采样，验证模拟故障持续且没有重复触发报警。
  await setTimeout(6200);
  const sampled = await call(`/equipment/${equipmentId}/history`);
  assert.ok(sampled.length > latest.length);
  assert.equal(sampled.at(-1).status, 'FAULT');
  assert.equal((await call(alertsPath)).total, 2);

  const alert = triggered.items[0];
  const acknowledged = await call(`/alerts/${alert.id}/acknowledge`, {
    method: 'POST',
  });
  assert.equal(acknowledged.acknowledgedBy, username);
  assert.ok(acknowledged.acknowledgedAt);
  assert.equal(acknowledged.resolvedAt, null);

  const recovered = await call(`/equipment/${equipmentId}/recover`, {
    method: 'POST',
  });
  assert.equal(recovered.status, 'RUNNING');
  assert.equal((await call(`${alertsPath}&state=OPEN`)).total, 0);
  assert.equal((await call(`${alertsPath}&state=RESOLVED`)).total, 2);
  assert.equal((await call(`${alertsPath}&state=UNACKNOWLEDGED`)).total, 1);
  assert.equal(
    (
      await call(
        `${alertsPath}&from=2000-01-01T00%3A00%3A00Z&until=2001-01-01T00%3A00%3A00Z`,
      )
    ).total,
    0,
  );

  const summary = await call('/analytics/summary');
  assert.ok(summary.faults >= initial.faults + 1);
  assert.ok(summary.sampleCount > initial.sampleCount);
  assert.equal(summary.total, summary.normal + summary.abnormal);
  assert.ok(
    summary.utilizationPercent >= 0 && summary.utilizationPercent <= 100,
  );
  console.log(
    'PASS: 定時計測、模擬故障、アラートの重複防止・確認・復旧・履歴、統計',
  );
}

async function verifyMaintenance() {
  const input = {
    equipmentId,
    title: '模擬設備の点検',
    assignee: '検証担当',
    cause: '模擬故障による温度上昇',
  };
  const order = await call('/work-orders', {
    method: 'POST',
    body: input,
    expected: 201,
  });
  assert.equal(order.status, 'PENDING');
  const path = `/work-orders/${order.id}`;
  const edit = { assignee: input.assignee, cause: input.cause, result: '' };

  await call(path, {
    method: 'PUT',
    body: { ...edit, status: 'COMPLETED', result: '点検完了' },
    expected: 409,
  });
  const inProgress = await call(path, {
    method: 'PUT',
    body: { ...edit, status: 'IN_PROGRESS' },
  });
  assert.equal(inProgress.status, 'IN_PROGRESS');
  await call(path, {
    method: 'PUT',
    body: { ...edit, status: 'COMPLETED' },
    expected: 400,
  });
  const completed = await call(path, {
    method: 'PUT',
    body: { ...edit, status: 'COMPLETED', result: '通常運転を確認' },
  });
  assert.equal(completed.result, '通常運転を確認');
  await call(path, {
    method: 'PUT',
    body: { ...edit, status: 'IN_PROGRESS' },
    expected: 409,
  });

  await call(`/equipment/${equipmentId}`, { method: 'DELETE', expected: 204 });
  await call(`/equipment/${equipmentId}`, { expected: 404 });
  assert.ok(
    (await call('/work-orders?status=COMPLETED')).items.some(
      (item) => item.id === order.id,
    ),
  );
  equipmentId = undefined;
  console.log('PASS: 保全作業の登録、状態遷移、結果入力、設備削除後の履歴保持');
}

try {
  await verifyAuth();
  await verifyEquipment();
  await verifySimulation();
  await verifyMaintenance();
  await call('/auth/logout', { method: 'POST', expected: 204 });
  await call('/auth/me', { expected: 401 });
  console.log('PASS: ログアウト後のセッション無効化');
} finally {
  if (equipmentId !== undefined && csrf) {
    await call(`/equipment/${equipmentId}`, {
      method: 'DELETE',
      expected: 204,
    }).catch(() =>
      console.error('検証用設備を削除できませんでした。', equipmentId),
    );
  }
}

export const equipmentTypes = {
  MOTOR: 'モーター',
  CONVEYOR: 'コンベヤ',
  ROBOT: '産業用ロボット',
};

export const equipmentStatuses = {
  RUNNING: ['稼働中', 'green'],
  STOPPED: ['停止中', 'default'],
  FAULT: ['異常', 'red'],
};

export const orderStatuses = {
  PENDING: ['未対応', 'gold'],
  IN_PROGRESS: ['対応中', 'blue'],
  COMPLETED: ['完了', 'green'],
};

export const metricNames = {
  TEMPERATURE: '温度',
  CURRENT: '電流',
};

const dateOptions = {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};
const dateFormatter = new Intl.DateTimeFormat('ja-JP', dateOptions);
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : '—';
}

export function formatTime(value) {
  return value ? timeFormatter.format(new Date(value)) : '—';
}

export function toOptions(labels) {
  return Object.entries(labels).map(([value, label]) => ({
    value,
    label: Array.isArray(label) ? label[0] : label,
  }));
}

export function equipmentOptions(equipment = []) {
  return equipment.map((item) => ({
    value: item.id,
    label: `${item.code}　${item.name}`,
  }));
}

export function apiQuery(path, parameters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== '' && value !== undefined && value !== null)
      query.set(key, value);
  }
  const encoded = query.toString();
  return encoded ? `${path}?${encoded}` : path;
}

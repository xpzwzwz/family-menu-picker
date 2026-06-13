import {
  addCloudCheckin,
  fetchCloudCheckinCalendar,
  fetchCloudCheckinSummary,
  hasCurrentCloudRoom,
  removeCloudCheckin,
} from './cloudSquad.js';

const LOCAL_KEY = 'familyMenuPicker.cleanPlate';

// ---------- 纯日期/汇总工具(可独立测试，云端与本地共用同一套口径) ----------

export function todayStr(now = new Date()) {
  const yy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function shiftDate(dateStr, delta) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// 团队视角:dateCounts = { 'YYYY-MM-DD': 顿数 }，连续天数从今天(或昨天)往回数
export function computeSummary(dateCounts, today) {
  const dateSet = new Set(Object.keys(dateCounts || {}));
  const totalCount = Object.values(dateCounts || {}).reduce((sum, n) => sum + n, 0);
  let streakDays = 0;
  let cursor = dateSet.has(today) ? today : shiftDate(today, -1);
  while (dateSet.has(cursor)) {
    streakDays += 1;
    cursor = shiftDate(cursor, -1);
  }
  const monthPrefix = today.slice(0, 7);
  const monthDays = [...dateSet].filter((d) => d.startsWith(monthPrefix)).length;
  return { streakDays, totalCount, monthDays, todayDone: dateSet.has(today), today };
}

// ---------- 本地存档(没加入小分队时，存在本机也能攒连续天数) ----------

function readLocal() {
  const stored = wx.getStorageSync(LOCAL_KEY);
  if (!stored) return { dates: {} };
  try {
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return parsed && parsed.dates ? parsed : { dates: {} };
  } catch (error) {
    return { dates: {} };
  }
}

function writeLocal(value) {
  wx.setStorageSync(LOCAL_KEY, JSON.stringify(value));
  return value;
}

function localCalendar(dateCounts, month) {
  const days = Object.keys(dateCounts)
    .filter((d) => d.startsWith(month))
    .sort()
    .map((date) => ({ date, count: dateCounts[date], photoUrl: '' }));
  return { month, days };
}

// ---------- 对外:页面只调这几个，内部自动选云端/本地 ----------

export function getCheckinSummary(today = todayStr()) {
  if (hasCurrentCloudRoom()) return fetchCloudCheckinSummary(today);
  return Promise.resolve(computeSummary(readLocal().dates, today));
}

export function addCheckin({ mealDate = todayStr(), note = '', photoUrl = '' } = {}) {
  if (hasCurrentCloudRoom()) return addCloudCheckin({ mealDate, note, photoUrl });
  const store = readLocal();
  store.dates[mealDate] = (store.dates[mealDate] || 0) + 1;
  writeLocal(store);
  return Promise.resolve(computeSummary(store.dates, mealDate));
}

export function getCheckinCalendar(month) {
  if (hasCurrentCloudRoom()) return fetchCloudCheckinCalendar(month);
  return Promise.resolve(localCalendar(readLocal().dates, month));
}

export function removeCheckin(mealDate) {
  if (hasCurrentCloudRoom()) return removeCloudCheckin(mealDate);
  const store = readLocal();
  delete store.dates[mealDate];
  writeLocal(store);
  return Promise.resolve(computeSummary(store.dates, mealDate));
}

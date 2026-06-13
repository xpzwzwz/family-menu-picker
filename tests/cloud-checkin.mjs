import assert from 'node:assert/strict';

/* eslint-disable no-console */

// 没加入小分队时走本地存档,验证团队连续天数口径与后端一致。
const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
};

const { computeSummary, shiftDate, addCheckin, getCheckinSummary, getCheckinCalendar, removeCheckin } = await import(
  '../services/squad/cloudCheckin.js'
);

// --- 纯 streak 口径 ---
const threeDays = { '2026-06-11': 1, '2026-06-12': 1, '2026-06-13': 1 };
assert.equal(computeSummary(threeDays, '2026-06-13').streakDays, 3, '连续3天');
assert.equal(computeSummary(threeDays, '2026-06-13').todayDone, true);
assert.equal(computeSummary(threeDays, '2026-06-14').streakDays, 3, '今天没打也按昨天连续算');
assert.equal(computeSummary(threeDays, '2026-06-14').todayDone, false);
assert.equal(computeSummary(threeDays, '2026-06-15').streakDays, 0, '断签归零');
assert.equal(shiftDate('2026-03-01', -1), '2026-02-28', '跨月减一天');

// --- 本地存档读写流程 ---
await addCheckin({ mealDate: '2026-06-11' });
await addCheckin({ mealDate: '2026-06-12' });
const s = await addCheckin({ mealDate: '2026-06-13', note: '红烧肉光速光盘' });
assert.equal(s.streakDays, 3);
assert.equal(s.totalCount, 3);

const summary = await getCheckinSummary('2026-06-13');
assert.equal(summary.streakDays, 3);
assert.equal(summary.monthDays, 3);

const calendar = await getCheckinCalendar('2026-06');
assert.equal(calendar.days.length, 3, '日历聚合到天');

const afterUndo = await removeCheckin('2026-06-13');
assert.equal(afterUndo.totalCount, 2, '撤销当天');
assert.equal(afterUndo.todayDone === false || afterUndo.today === '2026-06-13', true);

console.log('cloud checkin (local) checks passed');

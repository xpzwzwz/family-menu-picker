import assert from 'node:assert/strict';

/* eslint-disable no-console */

const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
};

const m = await import('../model/dishes.js');
const ids = () => m.getDishCategoryOptions().map((c) => c.id);
const nameOf = (id) => (m.getDishCategoryOptions().find((c) => c.id === id) || {}).name;

// 初始:5 个内置 + 其他
assert.deepEqual(ids(), ['quick', 'meat', 'vegetable', 'soup', 'staple', 'other']);

// 改名内置:保留 id(菜品不失联)
m.updateDishCategory('quick', { name: '快手', description: '十分钟' });
assert.equal(nameOf('quick'), '快手');
assert.ok(ids().includes('quick'));

// 删除内置:该组的菜兜底进「其他」
const meatDishes = m.getDishesByCategory('meat').map((d) => d.id);
assert.ok(meatDishes.length > 0);
m.deleteDishCategory('meat');
assert.ok(!ids().includes('meat'), '内置 meat 已移除');
const otherIds = m.getDishesByCategory('other').map((d) => d.id);
meatDishes.forEach((did) => assert.ok(otherIds.includes(did), `原荤菜 ${did} 应进其他`));

// 「其他」不可删/改
assert.equal(m.deleteDishCategory('other'), false);
assert.equal(m.updateDishCategory('other', { name: 'x' }), null);

// 自定义分组 增/删
const added = m.addDishCategory({ name: '早餐', description: '轻食' });
assert.ok(ids().includes(added.id));
m.deleteDishCategory(added.id);
assert.ok(!ids().includes(added.id));

// 一键恢复默认:删除与改名都还原
m.restoreDishCategoryDefaults();
assert.ok(ids().includes('meat'), 'meat 恢复');
assert.equal(nameOf('quick'), '快手菜', '改名还原');

console.log('dish categories custom checks passed');

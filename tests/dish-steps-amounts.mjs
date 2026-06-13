import assert from 'node:assert/strict';

/* eslint-disable no-console */

const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
};

const m = await import('../model/dishes.js');

// 内置菜:备料带用量 + 步骤带时长
const te = m.getDishById('tomato-egg');
assert.equal(te.amounts['番茄'], '2个');
assert.equal(te.amounts['鸡蛋'], '3个');
assert.equal(te.steps[0].minutes, 3);
assert.ok(te.steps.every((s) => typeof s.minutes === 'number'), '每步都有 minutes 字段');

// ingredients 数组本身不变(购物清单不受影响)
assert.deepEqual(te.ingredients, ['番茄', '鸡蛋', '葱', '盐', '糖']);

// 自定义菜:备料写「番茄 2个」能拆出名字 + 用量
const created = m.addCustomDish({
  name: '测试菜',
  category: 'quick',
  cookMinutes: 10,
  ingredientsText: '番茄 2个，鸡蛋 3个，盐',
});
assert.deepEqual(created.ingredients, ['番茄', '鸡蛋', '盐'], '只取名字部分');
assert.equal(created.amounts['番茄'], '2个');
assert.equal(created.amounts['鸡蛋'], '3个');
assert.equal(created.amounts['盐'], undefined, '没写用量的不进 map');

// 存读往返保留用量
const reloaded = m.getDishById(created.id);
assert.equal(reloaded.amounts['番茄'], '2个');

console.log('dish amounts & step minutes checks passed');

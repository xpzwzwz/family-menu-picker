import assert from 'node:assert/strict';

/* eslint-disable no-console */

const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
};

const { categorizeIngredient, buildShoppingBasket, buildShoppingListText } = await import('../model/dishes.js');

// --- 归类(顺序敏感的易错样本) ---
assert.equal(categorizeIngredient('番茄'), 'veg');
assert.equal(categorizeIngredient('番茄酱'), 'seasoning', '酱→调料，别被「番茄」抢成蔬菜');
assert.equal(categorizeIngredient('蒸鱼豉油'), 'seasoning', '豉/油→调料，别被「鱼」抢成肉');
assert.equal(categorizeIngredient('生抽'), 'seasoning');
assert.equal(categorizeIngredient('玉米'), 'veg', '玉米→蔬菜，别被「米」抢成主食');
assert.equal(categorizeIngredient('剩米饭'), 'staple');
assert.equal(categorizeIngredient('豆腐'), 'meat', '豆腐→肉蛋，别被「豆」抢成蔬菜');
assert.equal(categorizeIngredient('鸡蛋'), 'meat');
assert.equal(categorizeIngredient('神秘食材'), 'other');

// --- 字典纠正的几处(关键词版会归错，字典优先) ---
assert.equal(categorizeIngredient('火锅底料'), 'seasoning', '火锅底料→调料');
assert.equal(categorizeIngredient('丸子'), 'meat', '丸子→肉蛋');
assert.equal(categorizeIngredient('烧腊饭'), 'staple', '烧腊饭→主食(不被「腊」抢成肉)');
assert.equal(categorizeIngredient('主食'), 'staple');

// --- 分组 ---
const basket = buildShoppingBasket([
  { spuId: 'tomato-egg', quantity: 1 },
  { spuId: 'mapo-tofu', quantity: 1 },
]);
assert.deepEqual(basket.groups.map((g) => g.key), ['veg', 'meat', 'seasoning'], '分组按蔬菜/肉蛋/主食/调料顺序');
const veg = basket.groups.find((g) => g.key === 'veg');
assert.deepEqual(veg.items.map((i) => i.name).sort(), ['番茄', '蒜', '葱'].sort());
const meat = basket.groups.find((g) => g.key === 'meat');
assert.ok(meat.items.map((i) => i.name).includes('豆腐'));

// --- 清单文本 ---
const text = buildShoppingListText(basket);
assert.ok(text.includes('【蔬菜】') && text.includes('【肉蛋】') && text.includes('【调料】'), '文本按品类分行');
assert.ok(text.startsWith('🛒'));

console.log('shopping basket grouping checks passed');

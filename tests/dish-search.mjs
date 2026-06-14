import assert from 'node:assert/strict';

/* eslint-disable no-console */

const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: (key) => storage.delete(key),
};

const { searchDishes } = await import('../model/dishes.js');
const ids = (kw) => searchDishes(kw).map((g) => g.spuId);

// 按菜名
assert.deepEqual(ids('清蒸鱼'), ['steamed-fish']);
assert.ok(ids('鱼').includes('steamed-fish'), '名字/食材含「鱼」命中清蒸鱼');

// 按食材
const egg = ids('鸡蛋');
assert.ok(egg.includes('egg-fried-rice') && egg.includes('tomato-egg'), '「鸡蛋」命中多道含鸡蛋的菜');

// 按名字关键字「汤」
const soup = ids('汤');
assert.ok(soup.includes('corn-rib-soup') && soup.includes('seaweed-egg-soup'), '「汤」命中汤类');

// 空/无结果
assert.deepEqual(searchDishes(''), []);
assert.deepEqual(searchDishes('   '), []);
assert.deepEqual(searchDishes('这玩意儿不存在xyz'), []);

// 结果是 goods 卡片(能直接渲染+加菜)
const one = searchDishes('麻婆豆腐')[0];
assert.equal(one.spuId, 'mapo-tofu');
assert.ok(one.thumb && one.title && one.thumb.indexOf('http') === 0, '带封面图(云端URL)与标题');

console.log('dish search checks passed');

import assert from 'node:assert/strict';
import { buildDifferentDinnerRecommendation, buildDinnerRecommendation } from '../model/dishes.js';

/* eslint-disable no-console */

const storage = new Map();
globalThis.wx = {
  getStorageSync: (key) => storage.get(key) || '',
  setStorageSync: (key, value) => storage.set(key, value),
};

const SEASONINGS = ['盐', '糖', '油', '酱油', '生抽', '老抽', '蚝油', '料酒', '醋', '香油', '香菜', '葱', '姜', '蒜', '淀粉', '水', '清水', '味精', '鸡精', '胡椒', '花椒', '八角', '香叶'];
const mains = (dish) =>
  (dish.ingredients || []).filter((name) => !SEASONINGS.some((s) => String(name).includes(s)));
const foodType = (dish) => {
  const tags = dish.tags || [];
  if (dish.category === 'soup' || tags.includes('汤')) return 'soup';
  if (dish.category === 'staple' || tags.includes('主食')) return 'staple';
  if (dish.category === 'meat' || tags.includes('荤菜') || tags.includes('高蛋白')) return 'meat';
  if (dish.category === 'vegetable' || tags.includes('素菜') || tags.includes('清淡')) return 'veg';
  return 'other';
};

// --- 多样性:两道菜时,跨多个种子都不应出现「同类型 + 撞主食材」的组合 ---
let typeClashCount = 0;
let ingredientClashCount = 0;
for (let seed = 1; seed <= 40; seed += 1) {
  const { dishes } = buildDinnerRecommendation(seed, 2);
  assert.equal(dishes.length, 2);
  const [a, b] = dishes;
  if (foodType(a) === foodType(b)) typeClashCount += 1;
  const overlap = mains(a).some((name) => mains(b).includes(name));
  if (overlap) ingredientClashCount += 1;
}
// 多样性优先:两道菜应当总是不同类型(菜库分散时零撞)
assert.equal(typeClashCount, 0, `两道菜类型不应撞车,实际 ${typeClashCount}/40`);
assert.equal(ingredientClashCount, 0, `两道菜主食材不应撞车,实际 ${ingredientClashCount}/40`);

// --- 锁定:换一餐时被锁的菜必须保留,其余必须变化 ---
const base = buildDinnerRecommendation(7, 3);
const locked = [base.dishes[0]];
const next = buildDifferentDinnerRecommendation(base, 7, 3, locked);
assert.equal(next.dishes.length, 3);
assert.ok(
  next.dishes.some((dish) => dish.id === locked[0].id),
  '锁定的菜应当被保留在新搭配里',
);
const baseIds = base.dishes.map((d) => d.id).join(',');
const nextIds = next.dishes.map((d) => d.id).join(',');
assert.notEqual(nextIds, baseIds, '换一餐后整体搭配应当变化');

// --- 锁定项不会丢失:全部锁定时结果就是这几道 ---
const allLocked = buildDinnerRecommendation(3, 2);
const keptAll = buildDinnerRecommendation(99, 2, allLocked.dishes);
assert.deepEqual(
  keptAll.dishes.map((d) => d.id).sort(),
  allLocked.dishes.map((d) => d.id).sort(),
  '全部锁定时应原样保留',
);

console.log('dinner recommendation diversity + lock checks passed');

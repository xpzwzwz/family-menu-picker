import assert from 'node:assert/strict';
import {
  addDishesToTonightMenu,
  buildDifferentDinnerRecommendation,
  buildDinnerRecommendation,
  readTonightMenu,
  saveTonightMenu,
} from '../model/dishes.js';

const storage = new Map();

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
};

function dishSignature(recommendation) {
  return recommendation.dishes.map((dish) => dish.id).join(',');
}

const current = buildDinnerRecommendation(0);
const next = buildDifferentDinnerRecommendation(current, 0);

assert.notEqual(dishSignature(next), dishSignature(current));
assert.equal(next.dishes.length, 3);
assert.equal(next.goods.length, 3);

const fiveDishRecommendation = buildDinnerRecommendation(12345, 5);
assert.equal(fiveDishRecommendation.dishes.length, 5);
assert.equal(new Set(fiveDishRecommendation.dishes.map((dish) => dish.id)).size, 5);
assert.equal(fiveDishRecommendation.goods.length, 5);

const signatures = new Set();
for (let seed = 0; seed < 12; seed += 1) {
  signatures.add(dishSignature(buildDinnerRecommendation(seed, 3)));
}
assert.ok(signatures.size > 2);

const nextWithFiveDishes = buildDifferentDinnerRecommendation(fiveDishRecommendation, 12345, 5);
assert.notEqual(dishSignature(nextWithFiveDishes), dishSignature(fiveDishRecommendation));
assert.equal(nextWithFiveDishes.dishes.length, 5);

storage.clear();
saveTonightMenu([]);
const dinner = buildDinnerRecommendation(9, 3);
addDishesToTonightMenu(dinner.goods, { incrementExisting: false });
addDishesToTonightMenu(dinner.goods, { incrementExisting: false });
assert.equal(readTonightMenu().length, 3);
assert.deepEqual(readTonightMenu().map((item) => item.quantity), [1, 1, 1]);

console.log('dinner recommendation checks passed');

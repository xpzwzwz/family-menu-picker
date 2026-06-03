import assert from 'node:assert/strict';
import {
  buildShoppingBasket,
  clearShoppingBasketChecked,
  readShoppingBasketChecked,
  saveTonightMenu,
  toggleShoppingBasketItem,
  toGoodsCard,
  getDishById,
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

storage.clear();
saveTonightMenu([toGoodsCard(getDishById('tomato-egg')), toGoodsCard(getDishById('garlic-lettuce'))]);

const basket = buildShoppingBasket();
assert.equal(basket.totalDishCount, 2);
assert.equal(basket.totalIngredientCount > 0, true);

const garlic = basket.items.find((item) => item.name === '蒜');
assert.equal(garlic.count, 1);
assert.deepEqual(garlic.dishes, ['蒜蓉生菜']);
assert.equal(garlic.checked, false);

const salt = basket.items.find((item) => item.name === '盐');
assert.equal(salt.count, 2);
assert.deepEqual(salt.dishes, ['番茄炒蛋', '蒜蓉生菜']);

toggleShoppingBasketItem(salt.id, true);
assert.deepEqual(readShoppingBasketChecked(), [salt.id]);
assert.equal(buildShoppingBasket().items.find((item) => item.id === salt.id).checked, true);

saveTonightMenu([toGoodsCard(getDishById('tomato-egg'))]);
assert.equal(buildShoppingBasket().items.find((item) => item.id === salt.id).checked, true);
assert.equal(buildShoppingBasket().items.find((item) => item.name === '蒜'), undefined);

clearShoppingBasketChecked();
assert.deepEqual(readShoppingBasketChecked(), []);

console.log('shopping basket checks passed');

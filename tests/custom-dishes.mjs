import assert from 'node:assert/strict';
import {
  addCustomDish,
  buildDinnerRecommendation,
  getDishPlaceholderImage,
  getDishGoodsList,
  getDishSelectionSections,
  getDishesByCategory,
  readCustomDishes,
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

const originalNow = Date.now;
Date.now = () => 1700000001234;

storage.clear();
const saved = addCustomDish({
  name: '家常豆角',
  category: 'vegetable',
  cookMinutes: '16',
  difficulty: '简单',
  flavor: '咸香',
  tagsText: '家常，素菜, 快手',
  notes: '豆角要炒熟',
});

assert.equal(saved.id, 'custom-1700000001234');
assert.equal(saved.isCustom, true);
assert.equal(saved.name, '家常豆角');
assert.equal(saved.cookMinutes, 16);
assert.equal(saved.image, getDishPlaceholderImage('vegetable'));
assert.deepEqual(saved.tags, ['家常', '素菜', '快手']);
assert.equal(readCustomDishes().length, 1);

Date.now = () => 1700000002345;
const savedWithImage = addCustomDish({
  name: '家常鸡翅',
  category: 'meat',
  image: 'wxfile://custom-wing.png',
  cookMinutes: '30',
  difficulty: '中等',
  flavor: '咸香',
});

assert.equal(savedWithImage.image, 'wxfile://custom-wing.png');
assert.equal(readCustomDishes().length, 2);

const vegetableDishes = getDishesByCategory('vegetable');
assert.equal(vegetableDishes.some((dish) => dish.id === saved.id), true);

const goodsList = getDishGoodsList({ categoryId: 'vegetable' }).spuList;
const customGoods = goodsList.find((goods) => goods.spuId === saved.id);
assert.equal(customGoods.title, '家常豆角');
assert.equal(customGoods.isCustom, true);

const selectionSections = getDishSelectionSections();
const vegetableSection = selectionSections.find((section) => section.id === 'vegetable');
assert.equal(vegetableSection.name, '素菜');
assert.equal(vegetableSection.goodsList.some((goods) => goods.spuId === saved.id), true);
assert.equal(selectionSections.every((section) => Array.isArray(section.goodsList)), true);

const recommendation = buildDinnerRecommendation(1);
assert.equal(
  recommendation.dishes.some((dish) => dish.id === saved.id),
  true,
);

storage.set('familyMenuPicker.customDishes', '{bad json');
assert.deepEqual(readCustomDishes(), []);

Date.now = originalNow;
console.log('custom dish checks passed');

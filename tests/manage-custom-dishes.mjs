import assert from 'node:assert/strict';
import {
  addCustomDish,
  deleteCustomDish,
  getCustomDishById,
  getDishesByCategory,
  readCustomDishes,
  updateCustomDish,
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

Date.now = () => 1700000005678;

const saved = addCustomDish({
  name: '红烧茄子',
  category: 'vegetable',
  cookMinutes: 18,
  difficulty: '简单',
  flavor: '咸香',
  tagsText: '素菜，下饭',
  notes: '少油',
});

assert.equal(getCustomDishById(saved.id).name, '红烧茄子');

const updated = updateCustomDish(saved.id, {
  name: '少油红烧茄子',
  category: 'quick',
  cookMinutes: '15',
  difficulty: '中等',
  flavor: '酱香',
  tagsText: '快手，素菜',
  notes: '切滚刀块',
});

assert.equal(updated.id, saved.id);
assert.equal(updated.name, '少油红烧茄子');
assert.equal(updated.category, 'quick');
assert.equal(updated.cookMinutes, 15);
assert.deepEqual(updated.tags, ['快手', '素菜']);
assert.equal(getDishesByCategory('quick').some((dish) => dish.id === saved.id), true);

assert.equal(deleteCustomDish(saved.id), true);
assert.equal(getCustomDishById(saved.id), null);
assert.equal(readCustomDishes().length, 0);
assert.equal(getDishesByCategory('quick').some((dish) => dish.id === saved.id), false);
assert.equal(deleteCustomDish('missing'), false);

storage.set('familyMenuPicker.customDishes', '{bad json');
assert.deepEqual(readCustomDishes(), []);

console.log('manage custom dishes checks passed');

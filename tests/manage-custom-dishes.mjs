import assert from 'node:assert/strict';
import {
  addCustomDish,
  deleteDish,
  getDishById,
  getDishesByCategory,
  getManageableDishes,
  readUserDishes,
  restoreDishDefaults,
  updateDish,
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

assert.equal(getDishById(saved.id).name, '红烧茄子');

const updated = updateDish(saved.id, {
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

assert.equal(deleteDish(saved.id), true);
assert.equal(getDishById(saved.id), null);
assert.equal(readUserDishes().custom.length, 0);
assert.equal(getDishesByCategory('quick').some((dish) => dish.id === saved.id), false);
assert.equal(deleteDish('missing'), false);

const defaultDish = getDishById('tomato-egg');
assert.equal(defaultDish.name, '番茄炒蛋');

const editedDefaultDish = updateDish('tomato-egg', {
  name: '少糖番茄炒蛋',
  category: 'vegetable',
  cookMinutes: '10',
  difficulty: '简单',
  flavor: '酸甜',
  tagsText: '快手，素菜，儿童友好',
  notes: '番茄炒软一点',
});

assert.equal(editedDefaultDish.id, 'tomato-egg');
assert.equal(editedDefaultDish.name, '少糖番茄炒蛋');
assert.equal(editedDefaultDish.category, 'vegetable');
assert.equal(getDishById('tomato-egg').name, '少糖番茄炒蛋');
assert.equal(getDishesByCategory('vegetable').some((dish) => dish.id === 'tomato-egg'), true);
assert.equal(getDishesByCategory('quick').some((dish) => dish.id === 'tomato-egg'), true);

const manageableDishes = getManageableDishes();
assert.equal(manageableDishes.some((dish) => dish.id === 'tomato-egg' && dish.name === '少糖番茄炒蛋'), true);

assert.equal(deleteDish('tomato-egg'), true);
assert.equal(getDishById('tomato-egg'), null);
assert.equal(getDishesByCategory('vegetable').some((dish) => dish.id === 'tomato-egg'), false);
assert.equal(getManageableDishes().some((dish) => dish.id === 'tomato-egg'), false);

assert.equal(restoreDishDefaults('tomato-egg').name, '番茄炒蛋');
assert.equal(getDishById('tomato-egg').name, '番茄炒蛋');

storage.set('familyMenuPicker.customDishes', '{bad json');
assert.deepEqual(readUserDishes().custom, []);

console.log('manage custom dishes checks passed');

/* eslint-disable no-console */
import assert from 'node:assert/strict';
import {
  addCustomDish,
  addDishCategory,
  deleteDishCategory,
  getDishById,
  getDishCategories,
  getDishCategoryOptions,
  getDishSelectionSections,
  getDishesByCategory,
  readUserDishCategories,
  updateDish,
  updateDishCategory,
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

Date.now = () => 1700000010000;

storage.clear();
const breakfast = addDishCategory({ name: '早餐', description: '早上吃点轻的' });
assert.equal(breakfast.id, 'custom-category-1700000010000');
assert.equal(breakfast.name, '早餐');
assert.equal(readUserDishCategories().length, 1);
assert.equal(
  getDishCategoryOptions().some((category) => category.id === breakfast.id),
  true,
);

const customDish = addCustomDish({
  name: '鸡蛋三明治',
  category: breakfast.id,
  cookMinutes: 8,
  difficulty: '简单',
  flavor: '清爽',
});
assert.equal(
  getDishesByCategory(breakfast.id).some((dish) => dish.id === customDish.id),
  true,
);
assert.equal(
  getDishSelectionSections().some((section) => section.id === breakfast.id),
  true,
);
assert.equal(
  getDishCategories().some((category) => category.groupId === breakfast.id),
  true,
);

const renamed = updateDishCategory(breakfast.id, { name: '早午餐', description: '晚起也能吃' });
assert.equal(renamed.name, '早午餐');
assert.equal(getDishById(customDish.id).category, breakfast.id);
assert.equal(getDishSelectionSections().find((section) => section.id === breakfast.id).name, '早午餐');

assert.equal(deleteDishCategory(breakfast.id), true);
assert.equal(
  readUserDishCategories().some((category) => category.id === breakfast.id),
  false,
);
assert.equal(getDishById(customDish.id).category, 'other');
assert.equal(
  getDishesByCategory('other').some((dish) => dish.id === customDish.id),
  true,
);
assert.equal(getDishSelectionSections().find((section) => section.id === 'other').name, '其他');

const dinner = addDishCategory({ name: '晚餐', description: '正式吃一顿' });
const defaultDishInCustomCategory = updateDish('tomato-egg', { category: dinner.id });
assert.equal(defaultDishInCustomCategory.category, dinner.id);
assert.equal(deleteDishCategory(dinner.id), true);
assert.equal(getDishById('tomato-egg').category, 'other');
assert.equal(
  getDishesByCategory('other').some((dish) => dish.id === 'tomato-egg'),
  true,
);

const editedDefaultDish = updateDish('tomato-egg', { category: 'ghost-category' });
assert.equal(editedDefaultDish.category, 'other');
assert.equal(
  getDishesByCategory('other').some((dish) => dish.id === 'tomato-egg'),
  true,
);

assert.equal(deleteDishCategory('quick'), false);
assert.equal(updateDishCategory('quick', { name: '超快手' }), null);

console.log('custom categories checks passed');

import assert from 'node:assert/strict';
import { addCustomDish, getDishById, toGoodsCard, updateDish } from '../model/dishes.js';

const storage = new Map();

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
};

Date.now = () => 1700000006789;

const defaultDish = getDishById('tomato-egg');
assert.equal(defaultDish.name, '番茄炒蛋');
assert.equal(Array.isArray(defaultDish.ingredients), true);
assert.equal(defaultDish.ingredients.includes('番茄'), true);
assert.equal(Array.isArray(defaultDish.steps), true);
assert.equal(defaultDish.steps.length >= 3, true);
assert.equal(defaultDish.steps[0].title.length > 0, true);
assert.equal(defaultDish.steps[0].description.length > 0, true);

const defaultGoods = toGoodsCard(defaultDish);
assert.deepEqual(defaultGoods.ingredients, defaultDish.ingredients);
assert.deepEqual(defaultGoods.steps, defaultDish.steps);

const customDish = addCustomDish({
  name: '蒜香西兰花',
  category: 'vegetable',
  cookMinutes: 10,
  difficulty: '简单',
  flavor: '清爽',
  ingredientsText: '西兰花，蒜，盐',
  stepsText: '西兰花焯水\n蒜末爆香\n下锅翻炒调味',
});

assert.deepEqual(customDish.ingredients, ['西兰花', '蒜', '盐']);
assert.deepEqual(customDish.steps.map((step) => step.title), ['西兰花焯水', '蒜末爆香', '下锅翻炒调味']);
assert.equal(customDish.steps[0].description, '西兰花焯水');

const updatedDish = updateDish(customDish.id, {
  ingredientsText: '西兰花，蒜，蚝油',
  stepsText: '切小朵\n炒香蒜末\n加蚝油收味',
});

assert.deepEqual(updatedDish.ingredients, ['西兰花', '蒜', '蚝油']);
assert.deepEqual(updatedDish.steps.map((step) => step.title), ['切小朵', '炒香蒜末', '加蚝油收味']);

console.log('dish detail checks passed');

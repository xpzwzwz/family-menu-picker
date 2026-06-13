/* eslint-disable no-console */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const appConfig = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
const dishPackage = appConfig.subPackages.find((subPackage) => subPackage.root === 'pages/dish');

assert.ok(dishPackage);
assert.equal(dishPackage.pages.includes('category-manage/index'), true);

const categoryPageFiles = [
  '../pages/dish/category-manage/index.js',
  '../pages/dish/category-manage/index.wxml',
  '../pages/dish/category-manage/index.wxss',
  '../pages/dish/category-manage/index.json',
];

for (const file of categoryPageFiles) {
  assert.equal(existsSync(new URL(file, import.meta.url)), true);
}

const manageJs = readFileSync(new URL('../pages/dish/manage/index.js', import.meta.url), 'utf8');
const manageWxml = readFileSync(new URL('../pages/dish/manage/index.wxml', import.meta.url), 'utf8');
const customCreateJs = readFileSync(new URL('../pages/dish/custom-create/index.js', import.meta.url), 'utf8');
const categoryJs = readFileSync(new URL('../pages/dish/category-manage/index.js', import.meta.url), 'utf8');
const categoryWxml = readFileSync(new URL('../pages/dish/category-manage/index.wxml', import.meta.url), 'utf8');

assert.equal(manageJs.includes('/pages/dish/category-manage/index'), true);
assert.equal(manageWxml.includes('管理分类'), true);
assert.equal(customCreateJs.includes('getDishCategoryOptions()'), true);
assert.equal(categoryJs.includes('addDishCategory'), true);
assert.equal(categoryJs.includes('updateDishCategory'), true);
assert.equal(categoryJs.includes('deleteDishCategory'), true);
assert.equal(categoryJs.includes('该分类下的菜品会自动归到“其他”'), true);
assert.equal(categoryWxml.includes('category-list'), true);
assert.equal(categoryJs.includes('已删除分类，菜品已归到其他'), true);

console.log('category management ui checks passed');

# Custom Dishes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local "新增菜品" flow so custom family dishes can be saved, browsed, added to tonight's menu, and included in random recommendations.

**Architecture:** Keep dish storage and merging in `model/dishes.js`, then let existing category/list/recommendation pages keep using the model helpers. Add one focused create page under `pages/dish/custom-create` and one entry point on the existing "我的菜单" page.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/WXSS, TDesign mini-program components, Node regression scripts with mocked `wx` storage.

---

### Task 1: Custom Dish Model Helpers

**Files:**
- Create: `tests/custom-dishes.mjs`
- Modify: `model/dishes.js`

- [ ] **Step 1: Write failing regression script**

Create `tests/custom-dishes.mjs`:

```js
import assert from 'node:assert/strict';
import {
  addCustomDish,
  getDishGoodsList,
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
assert.deepEqual(saved.tags, ['家常', '素菜', '快手']);
assert.equal(readCustomDishes().length, 1);

const vegetableDishes = getDishesByCategory('vegetable');
assert.equal(vegetableDishes.some((dish) => dish.id === saved.id), true);

const goodsList = getDishGoodsList({ categoryId: 'vegetable' }).spuList;
const customGoods = goodsList.find((goods) => goods.spuId === saved.id);
assert.equal(customGoods.title, '家常豆角');
assert.equal(customGoods.isCustom, true);

storage.set('familyMenuPicker.customDishes', '{bad json');
assert.deepEqual(readCustomDishes(), []);

Date.now = originalNow;
console.log('custom dish checks passed');
```

- [ ] **Step 2: Run script and verify RED**

Run: `node tests/custom-dishes.mjs`

Expected: FAIL because `addCustomDish` and `readCustomDishes` are not exported yet.

- [ ] **Step 3: Implement helper functions and merged dish pool**

In `model/dishes.js`:

- add `CUSTOM_DISHES_STORAGE_KEY = 'familyMenuPicker.customDishes'`
- export `readCustomDishes()`
- export `saveCustomDishes(customDishes)`
- export `addCustomDish(payload)`
- add a private `getAllDishes()` helper
- update `getDishCategories()`, `getDishesByCategory()`, `getDishGoodsList()`, and recommendation picking to use merged default plus custom dishes

- [ ] **Step 4: Run script and verify GREEN**

Run: `node tests/custom-dishes.mjs`

Expected: PASS and print `custom dish checks passed`.

### Task 2: Add "新增菜品" Page

**Files:**
- Modify: `app.json`
- Create: `pages/dish/custom-create/index.js`
- Create: `pages/dish/custom-create/index.json`
- Create: `pages/dish/custom-create/index.wxml`
- Create: `pages/dish/custom-create/index.wxss`

- [ ] **Step 1: Add route**

Add a subpackage:

```json
{
  "root": "pages/dish",
  "name": "dish",
  "pages": ["custom-create/index"]
}
```

- [ ] **Step 2: Implement page JS**

Create page state for the form fields, category and difficulty options, field update handlers, validation, and `submitDish()` that calls `addCustomDish()`, shows `已新增菜品`, then switches to `/pages/category/index`.

- [ ] **Step 3: Implement WXML**

Create a compact form with labels, inputs, category chips, difficulty chips, textarea for notes, and a primary button labeled `保存菜品`.

- [ ] **Step 4: Implement WXSS**

Style the page using the existing family menu palette: warm page background, white form sections, 8rpx radius, red selected chips, and stable button dimensions.

### Task 3: Add User Center Entry

**Files:**
- Modify: `pages/usercenter/index.js`
- Modify: `pages/usercenter/index.wxml` if needed only for existing action rendering

- [ ] **Step 1: Add action item**

Add an action item:

```js
{
  title: '新增菜品',
  desc: '把家里常吃的菜加进来',
  type: 'customDish',
  icon: 'add',
}
```

- [ ] **Step 2: Add navigation handler**

In `handleAction`, navigate to `/pages/dish/custom-create/index` for `customDish`.

### Task 4: Verify, Commit, and Push

**Files:**
- All modified files

- [ ] **Step 1: Run targeted checks**

Run:

```bash
node tests/custom-dishes.mjs
node tests/menu-history.mjs
node --check model/dishes.js
node --check pages/dish/custom-create/index.js
node --check pages/usercenter/index.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Run navigation and project checks**

Run the existing navigation declaration check and `npm run check`.

Expected: exit 0. Existing Node module-type warnings from direct ESM test scripts are acceptable.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-20-custom-dishes.md tests/custom-dishes.mjs model/dishes.js app.json pages/dish/custom-create pages/usercenter/index.js pages/usercenter/index.wxml
HUSKY=0 git commit -m "feat: add custom dishes"
git push
```

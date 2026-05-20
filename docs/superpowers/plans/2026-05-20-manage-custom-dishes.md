# Manage Custom Dishes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users edit and delete custom dishes from a dedicated "管理菜品" page.

**Architecture:** Keep all custom dish mutation helpers in `model/dishes.js`. Reuse the existing `pages/dish/custom-create` page for edit mode, and add a focused `pages/dish/manage` list page for navigation and delete confirmation.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/WXSS, TDesign Dialog/Toast, Node regression script with mocked `wx` storage.

---

### Task 1: Model Helpers

**Files:**
- Create: `tests/manage-custom-dishes.mjs`
- Modify: `model/dishes.js`

- [ ] **Step 1: Write failing regression script**

Create `tests/manage-custom-dishes.mjs`:

```js
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
```

- [ ] **Step 2: Run script and verify RED**

Run: `node tests/manage-custom-dishes.mjs`

Expected: FAIL because `getCustomDishById`, `updateCustomDish`, and `deleteCustomDish` are not exported yet.

- [ ] **Step 3: Implement helpers**

In `model/dishes.js`, export:

- `getCustomDishById(id)`
- `updateCustomDish(id, patch)`
- `deleteCustomDish(id)`

Use the same normalization path as `addCustomDish()`. Preserve id and `isCustom`.

- [ ] **Step 4: Run script and verify GREEN**

Run: `node tests/manage-custom-dishes.mjs`

Expected: PASS and print `manage custom dishes checks passed`.

### Task 2: Edit Mode in Existing Create Page

**Files:**
- Modify: `pages/dish/custom-create/index.js`
- Modify: `pages/dish/custom-create/index.wxml`
- Modify: `pages/dish/custom-create/index.json`

- [ ] **Step 1: Load edit id**

In `onLoad(options)`, if `options.id` exists, load the custom dish and set `modeTitle` to `编辑菜品`, `submitText` to `保存修改`, and fill the form.

- [ ] **Step 2: Submit add or edit**

In `submitDish()`, call `updateCustomDish(editingId, form)` in edit mode; otherwise call `addCustomDish(form)`. Show `已保存修改` for edit and `已新增菜品` for add.

- [ ] **Step 3: Navigate after save**

After edit save, navigate back to `/pages/dish/manage/index`. After add save, keep the current behavior of switching to `/pages/category/index`.

- [ ] **Step 4: Update copy**

Bind page title text and button text to `modeTitle` and `submitText`.

### Task 3: Manage Page and Entry

**Files:**
- Modify: `app.json`
- Modify: `pages/usercenter/index.js`
- Create: `pages/dish/manage/index.js`
- Create: `pages/dish/manage/index.json`
- Create: `pages/dish/manage/index.wxml`
- Create: `pages/dish/manage/index.wxss`

- [ ] **Step 1: Add route and user action**

Add `manage/index` to the `pages/dish` subpackage. Add "管理菜品" to the user center action list and navigate to `/pages/dish/manage/index`.

- [ ] **Step 2: Implement manage page JS**

Load `readCustomDishes()` on show, render display metadata, navigate to edit page on edit, delete through `Dialog.confirm()` and `deleteCustomDish(id)`.

- [ ] **Step 3: Implement WXML**

Render empty state with "新增菜品" button. Render custom dish cards with metadata and `编辑`/`删除` buttons.

- [ ] **Step 4: Implement WXSS**

Use the same warm background, white cards, 8rpx radius, and compact action buttons.

### Task 4: Verification and Commit

**Files:**
- All modified files

- [ ] **Step 1: Run targeted checks**

Run:

```bash
node tests/manage-custom-dishes.mjs
node tests/custom-dishes.mjs
node tests/menu-history.mjs
node tests/reuse-menu-history.mjs
node --check model/dishes.js
node --check pages/dish/custom-create/index.js
node --check pages/dish/manage/index.js
node --check pages/usercenter/index.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Run project checks**

Run navigation declaration check and `npm run check`.

Expected: exit 0.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-20-manage-custom-dishes.md tests/manage-custom-dishes.mjs model/dishes.js app.json pages/dish/custom-create pages/dish/manage pages/usercenter/index.js
HUSKY=0 git commit -m "feat: manage custom dishes"
git push
```

# Reuse Menu History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users replace tonight's menu with a previously confirmed menu from history.

**Architecture:** Add the replacement behavior to `model/dishes.js` as a storage helper, then call it from the "我的菜单" history cards. The page handles confirmation and navigation; the model owns storage normalization.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/WXSS, TDesign Dialog/Toast, Node regression script with mocked `wx` storage.

---

### Task 1: Model Helper

**Files:**
- Create: `tests/reuse-menu-history.mjs`
- Modify: `model/dishes.js`

- [ ] **Step 1: Write failing regression script**

Create `tests/reuse-menu-history.mjs`:

```js
import assert from 'node:assert/strict';
import { readTonightMenu, reuseMenuHistoryEntry } from '../model/dishes.js';

const storage = new Map();

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
};

storage.set(
  'familyMenuPicker.menuHistory',
  JSON.stringify([
    {
      id: 'menu-2',
      confirmedAt: 2,
      goodsList: [{ spuId: 'fish', skuId: 'fish-default', title: '清蒸鱼', quantity: 0, isSelected: 0 }],
    },
    {
      id: 'menu-1',
      confirmedAt: 1,
      goodsList: [{ spuId: 'egg', skuId: 'egg-default', title: '番茄炒蛋', quantity: 2 }],
    },
  ]),
);

const reused = reuseMenuHistoryEntry('menu-2');
assert.equal(reused.length, 1);
assert.equal(reused[0].title, '清蒸鱼');
assert.equal(reused[0].quantity, 1);
assert.equal(reused[0].isSelected, 1);
assert.deepEqual(readTonightMenu(), reused);

const missing = reuseMenuHistoryEntry('missing');
assert.deepEqual(missing, []);
assert.deepEqual(readTonightMenu(), reused);

console.log('reuse menu history checks passed');
```

- [ ] **Step 2: Run script and verify RED**

Run: `node tests/reuse-menu-history.mjs`

Expected: FAIL because `reuseMenuHistoryEntry` is not exported.

- [ ] **Step 3: Implement helper**

In `model/dishes.js`, export `reuseMenuHistoryEntry(historyId)` that finds a history entry by id, normalizes selected/quantity fields, saves to tonight menu, and returns the saved list.

- [ ] **Step 4: Run script and verify GREEN**

Run: `node tests/reuse-menu-history.mjs`

Expected: PASS and print `reuse menu history checks passed`.

### Task 2: User Center UI

**Files:**
- Modify: `pages/usercenter/index.js`
- Modify: `pages/usercenter/index.json`
- Modify: `pages/usercenter/index.wxml`
- Modify: `pages/usercenter/index.wxss`

- [ ] **Step 1: Import dependencies**

Import `Dialog` from `tdesign-miniprogram/dialog/index` and `reuseMenuHistoryEntry` from `model/dishes.js`. Add `t-dialog` to `pages/usercenter/index.json`.

- [ ] **Step 2: Add reuse handler**

Add `reuseHistoryMenu(event)` that reads `event.currentTarget.dataset.id`, confirms replacement, calls `reuseMenuHistoryEntry(id)`, shows a toast if no menu was found, otherwise switches to `/pages/cart/index`.

- [ ] **Step 3: Add WXML button**

Add a `复用` button inside each `.history-card`, with `catchtap="reuseHistoryMenu"` and `data-id="{{item.id}}"`.

- [ ] **Step 4: Add styles**

Add compact button styling that fits in the history card header without resizing the layout.

### Task 3: Verification and Commit

**Files:**
- All modified files

- [ ] **Step 1: Run targeted checks**

Run:

```bash
node tests/reuse-menu-history.mjs
node tests/menu-history.mjs
node tests/custom-dishes.mjs
node --check model/dishes.js
node --check pages/usercenter/index.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Run project checks**

Run navigation declaration check and `npm run check`.

Expected: exit 0.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/specs/2026-05-20-reuse-menu-history-design.md docs/superpowers/plans/2026-05-20-reuse-menu-history.md tests/reuse-menu-history.mjs model/dishes.js pages/usercenter/index.js pages/usercenter/index.json pages/usercenter/index.wxml pages/usercenter/index.wxss
HUSKY=0 git commit -m "feat: reuse menu history"
git push
```

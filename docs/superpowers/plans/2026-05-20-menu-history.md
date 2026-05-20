# Menu History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save each confirmed family dinner menu locally and show recent menu history on the "我的菜单" page.

**Architecture:** Add storage helpers to `model/dishes.js` so pages do not parse history storage directly. The confirmation page writes one confirmed menu through the helper, and the user center page reads formatted history for display.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/WXSS, TDesign mini-program components, Node-based regression script with mocked `wx` storage.

---

### Task 1: Menu History Storage Helpers

**Files:**
- Create: `tests/menu-history.mjs`
- Modify: `model/dishes.js`

- [ ] **Step 1: Write the failing regression script**

Create `tests/menu-history.mjs` with assertions for `saveConfirmedMenu()` and `readMenuHistory()`:

```js
import assert from 'node:assert/strict';
import { readMenuHistory, saveConfirmedMenu } from '../model/dishes.js';

const storage = new Map();

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
};

function parseStored(key) {
  return JSON.parse(storage.get(key));
}

function makeGoods(index) {
  return {
    spuId: `dish-${index}`,
    skuId: `dish-${index}-default`,
    title: `菜 ${index}`,
    quantity: 1,
    cookMinutes: 10 + index,
  };
}

function makeSummary(index) {
  return {
    totalQuantity: 1,
    totalCookMinutes: 10 + index,
    tags: ['家常'],
  };
}

storage.clear();
const saved = saveConfirmedMenu({
  confirmedAt: 1700000000000,
  goodsList: [makeGoods(1)],
  summary: makeSummary(1),
  note: '少辣',
});
assert.equal(saved.id, 'menu-1700000000000');
assert.equal(parseStored('familyMenuPicker.lastConfirmedMenu').note, '少辣');
assert.deepEqual(readMenuHistory().map((entry) => entry.id), ['menu-1700000000000']);

storage.clear();
for (let index = 0; index < 25; index += 1) {
  saveConfirmedMenu({
    confirmedAt: 1700000000000 + index,
    goodsList: [makeGoods(index)],
    summary: makeSummary(index),
    note: `第 ${index} 次`,
  });
}
const history = readMenuHistory();
assert.equal(history.length, 20);
assert.equal(history[0].confirmedAt, 1700000000024);
assert.equal(history[19].confirmedAt, 1700000000005);

storage.set('familyMenuPicker.menuHistory', '{bad json');
assert.deepEqual(readMenuHistory(), []);

console.log('menu history checks passed');
```

- [ ] **Step 2: Run the regression script and verify RED**

Run: `node tests/menu-history.mjs`

Expected: FAIL because `model/dishes.js` does not export `readMenuHistory` or `saveConfirmedMenu`.

- [ ] **Step 3: Add storage helper implementation**

In `model/dishes.js`, add constants for `familyMenuPicker.lastConfirmedMenu` and `familyMenuPicker.menuHistory`, then implement:

```js
export function readLastConfirmedMenu() {}
export function readMenuHistory() {}
export function saveConfirmedMenu({ confirmedAt = Date.now(), goodsList = [], summary = {}, note = '' }) {}
```

The implementation must parse malformed storage as empty, sort history newest-first, cap it to 20 entries, write latest confirmation, and return the saved entry.

- [ ] **Step 4: Run the regression script and verify GREEN**

Run: `node tests/menu-history.mjs`

Expected: PASS and print `menu history checks passed`.

### Task 2: Wire Confirmation and User Center UI

**Files:**
- Modify: `pages/order/order-confirm/index.js`
- Modify: `pages/usercenter/index.js`
- Modify: `pages/usercenter/index.wxml`
- Modify: `pages/usercenter/index.wxss`

- [ ] **Step 1: Update confirmation page**

Replace the direct `wx.setStorageSync('familyMenuPicker.lastConfirmedMenu', ...)` write with `saveConfirmedMenu({ goodsList, summary, note })`.

- [ ] **Step 2: Update user center data flow**

Import `readLastConfirmedMenu` and `readMenuHistory` from `model/dishes.js`. Add `historyList` to page data and map storage entries into display fields: `confirmedAtText`, `dishCount`, `totalCookMinutes`, `dishNames`, and `note`.

- [ ] **Step 3: Update user center markup**

Add a "菜单历史" section below "最近确认" showing the newest entries, with an empty state when no history exists.

- [ ] **Step 4: Update user center styles**

Add compact card styles for history entries, using the existing white card and red accent visual language.

### Task 3: Verify, Commit, and Push

**Files:**
- All modified files

- [ ] **Step 1: Run targeted checks**

Run:

```bash
node tests/menu-history.mjs
node --check model/dishes.js
node --check pages/order/order-confirm/index.js
node --check pages/usercenter/index.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Run project check**

Run: `npm run check`

Expected: exit 0. Existing template warnings are acceptable if there are 0 errors.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-20-menu-history.md tests/menu-history.mjs model/dishes.js pages/order/order-confirm/index.js pages/usercenter/index.js pages/usercenter/index.wxml pages/usercenter/index.wxss
HUSKY=0 git commit -m "feat: add menu history"
git push
```

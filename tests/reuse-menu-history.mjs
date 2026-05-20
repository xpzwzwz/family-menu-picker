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

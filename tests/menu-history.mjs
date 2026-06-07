import assert from 'node:assert/strict';
import { readLastConfirmedMenu, readMenuHistory, readTonightMenu, saveConfirmedMenu, saveTonightMenu } from '../model/dishes.js';

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
saveTonightMenu([makeGoods(0)]);
const saved = saveConfirmedMenu({
  confirmedAt: 1700000000000,
  goodsList: [makeGoods(1)],
  summary: makeSummary(1),
  note: '少辣',
});
assert.equal(saved.id, 'menu-1700000000000');
assert.equal(parseStored('familyMenuPicker.lastConfirmedMenu').note, '少辣');
assert.equal(readLastConfirmedMenu().id, saved.id);
assert.equal(readLastConfirmedMenu().goodsList[0].title, '菜 1');
assert.deepEqual(readMenuHistory().map((entry) => entry.id), ['menu-1700000000000']);
assert.deepEqual(readTonightMenu(), []);

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

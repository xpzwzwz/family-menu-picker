import assert from 'node:assert/strict';
import { saveTonightMenu, toGoodsCard, getDishById, readTonightMenu } from '../model/dishes.js';
import { saveCloudRoom } from '../services/squad/cloudSquad.js';
import { addDishesToSharedMenu, replaceSharedMenu, syncCloudMenuToLocal } from '../services/squad/cloudMenu.js';

/* eslint-disable no-console */

const storage = new Map();
const requests = [];
let remoteMenu = [toGoodsCard(getDishById('tomato-egg'))];

const keyOf = (item) => `${item.spuId} ${item.skuId || ''}`;

// 一个忠实模拟后端「服务端合并」的假服务器:add/update/remove/select-all 都在 remoteMenu 上合并。
function handle(url, method, data) {
  const base = '/api/squad/rooms/room-1/menu';
  if (url.endsWith(base) && method === 'GET') return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu } };
  if (url.endsWith(base) && method === 'PUT') {
    remoteMenu = data.items;
    return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu, updatedAt: 1 } };
  }
  if (url.endsWith(`${base}/add`) && method === 'POST') {
    const index = new Map(remoteMenu.map((it) => [keyOf(it), it]));
    data.items.forEach((goods) => {
      const existing = index.get(keyOf(goods));
      if (existing) {
        if (data.incrementExisting) existing.quantity = (existing.quantity || 1) + (goods.quantity || 1);
        existing.isSelected = 1;
      } else {
        const item = { ...goods, quantity: goods.quantity || 1, isSelected: 1 };
        remoteMenu.push(item);
        index.set(keyOf(item), item);
      }
    });
    return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu, updatedAt: 1 } };
  }
  if (url.endsWith(`${base}/update`) && method === 'POST') {
    const patch = {};
    if (data.quantity !== undefined) patch.quantity = data.quantity;
    if (data.isSelected !== undefined) patch.isSelected = data.isSelected;
    remoteMenu = remoteMenu.map((it) =>
      it.spuId === data.spuId && (it.skuId || '') === (data.skuId || '') ? { ...it, ...patch } : it,
    );
    return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu, updatedAt: 1 } };
  }
  if (url.endsWith(`${base}/remove`) && method === 'POST') {
    remoteMenu = remoteMenu.filter((it) => !(it.spuId === data.spuId && (it.skuId || '') === (data.skuId || '')));
    return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu, updatedAt: 1 } };
  }
  if (url.endsWith(`${base}/select-all`) && method === 'POST') {
    remoteMenu = remoteMenu.map((it) => ({ ...it, isSelected: data.isSelected ? 1 : 0 }));
    return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu, updatedAt: 1 } };
  }
  return { statusCode: 404, data: { detail: 'not found' } };
}

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
  removeStorageSync(key) {
    storage.delete(key);
  },
  request(options) {
    const method = options.method || 'GET';
    requests.push({ url: options.url, method, data: options.data });
    options.success(handle(options.url, method, options.data));
  },
};

storage.set('familyMenuPicker.cloudUser', JSON.stringify({ userId: 'user-1', nickname: '我' }));
saveCloudRoom({ roomId: 'room-1', name: '晚饭小分队', members: [] });

async function main() {
  saveTonightMenu([]);
  await addDishesToSharedMenu([toGoodsCard(getDishById('garlic-lettuce'))]);
  assert.deepEqual(
    remoteMenu.map((item) => item.spuId),
    ['tomato-egg', 'garlic-lettuce'],
    '加菜经服务端合并，保留已有的菜',
  );
  assert.deepEqual(
    readTonightMenu().map((item) => item.spuId),
    ['tomato-egg', 'garlic-lettuce'],
    '本机以服务端返回结果为准',
  );
  assert.deepEqual(
    requests.map((request) => request.method),
    ['POST'],
    '加菜是单次按单道菜接口(不再 GET+PUT 整单覆盖)',
  );

  await replaceSharedMenu([]);
  assert.deepEqual(remoteMenu, []);

  remoteMenu = [toGoodsCard(getDishById('mapo-tofu'))];
  await syncCloudMenuToLocal();
  assert.deepEqual(
    readTonightMenu().map((item) => item.spuId),
    ['mapo-tofu'],
  );

  console.log('cloud menu sync checks passed');
}

main();

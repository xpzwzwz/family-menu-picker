import assert from 'node:assert/strict';
import { saveTonightMenu, toGoodsCard, getDishById, readTonightMenu } from '../model/dishes.js';
import { saveCloudRoom } from '../services/squad/cloudSquad.js';
import {
  removeSharedMenuItem,
  setAllSharedMenuSelected,
  updateSharedMenuItem,
} from '../services/squad/cloudMenu.js';

/* eslint-disable no-console */

// 场景:队友已往云端加了一道菜，本机菜单是过期的(没有那道菜)。
// 改量/删除/选中走「服务端按单道菜合并」接口，绝不能把队友的菜冲掉。
const storage = new Map();
const requests = [];
let remoteMenu = [
  { ...toGoodsCard(getDishById('tomato-egg')), quantity: 1, isSelected: 1 },
  { ...toGoodsCard(getDishById('mapo-tofu')), quantity: 1, isSelected: 1 },
];

const keyOf = (item) => `${item.spuId} ${item.skuId || ''}`;
const skuOf = (spuId) => toGoodsCard(getDishById(spuId)).skuId;

function handle(url, method, data) {
  const base = '/api/squad/rooms/room-1/menu';
  if (url.endsWith(base) && method === 'GET') return { statusCode: 200, data: { roomId: 'room-1', items: remoteMenu } };
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
    requests.push({ url: options.url, method });
    options.success(handle(options.url, method, options.data));
  },
};

storage.set('familyMenuPicker.cloudUser', JSON.stringify({ userId: 'user-1', nickname: '我' }));
saveCloudRoom({ roomId: 'room-1', name: '晚饭小分队', members: [] });

const spuIds = (menu) => menu.map((item) => item.spuId).sort();

async function main() {
  // 本机故意只有 tomato-egg(过期，缺队友的 mapo-tofu)
  saveTonightMenu([{ ...toGoodsCard(getDishById('tomato-egg')), quantity: 1, isSelected: 1 }]);

  // 改 tomato-egg 数量:服务端合并后云端仍应保留队友的 mapo-tofu
  await updateSharedMenuItem('tomato-egg', skuOf('tomato-egg'), { quantity: 3 });
  assert.deepEqual(spuIds(remoteMenu), ['mapo-tofu', 'tomato-egg'], '改量不能冲掉队友的菜');
  assert.equal(remoteMenu.find((i) => i.spuId === 'tomato-egg').quantity, 3, '数量已更新');

  // 全选:所有菜(含队友的)都应被选中
  await setAllSharedMenuSelected(true);
  assert.ok(remoteMenu.every((i) => i.isSelected === 1), '全选作用于云端全部菜品');

  // 删除自己的 tomato-egg:只删这一道，队友的 mapo-tofu 仍在
  await removeSharedMenuItem('tomato-egg', skuOf('tomato-egg'));
  assert.deepEqual(spuIds(remoteMenu), ['mapo-tofu'], '删除只删目标菜，保留队友的菜');

  // 每次写操作都只发一次按单道菜请求(服务端原子合并，无需 GET+PUT)
  assert.deepEqual(
    requests.map((r) => r.method),
    ['POST', 'POST', 'POST'],
    '每次改动只发一次按单道菜请求',
  );

  // 本机也跟随服务端返回的最新状态
  assert.deepEqual(spuIds(readTonightMenu()), ['mapo-tofu'], '本机已同步到合并结果');

  console.log('cloud menu merge (no-clobber) checks passed');
}

main();

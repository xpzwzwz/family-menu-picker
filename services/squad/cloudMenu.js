import {
  addDishesToTonightMenu,
  readTonightMenu,
  removeTonightMenuItem,
  saveTonightMenu,
  updateTonightMenuItem,
} from '../../model/dishes.js';
import {
  addCloudRoomMenuItems,
  fetchCloudRoomMenu,
  hasCurrentCloudRoom,
  removeCloudRoomMenuItem,
  saveCloudRoomMenu,
  setCloudRoomMenuAllSelected,
  updateCloudRoomMenuItem,
} from './cloudSquad.js';

function menuItems(menu) {
  return menu && Array.isArray(menu.items) ? menu.items : [];
}

export function syncLocalMenuToCloud() {
  if (!hasCurrentCloudRoom()) return Promise.resolve(null);
  return saveCloudRoomMenu(readTonightMenu());
}

export function syncCloudMenuToLocal() {
  if (!hasCurrentCloudRoom()) return Promise.resolve(readTonightMenu());
  return fetchCloudRoomMenu().then((menu) => saveTonightMenu(menuItems(menu)));
}

// 加菜、改量、删除、全选都走「服务端原子合并」的按单道菜接口，
// 服务端基于云端最新菜单合并后返回完整菜单，本机直接以返回结果为准。
// 这样多人同时点菜也不会互相覆盖。离线(没进小分队)时退回本机操作。
export function addDishesToSharedMenu(goodsList, options = {}) {
  const incrementExisting = options.incrementExisting !== false;
  if (!hasCurrentCloudRoom()) {
    return Promise.resolve(addDishesToTonightMenu(goodsList, options));
  }
  return addCloudRoomMenuItems(goodsList, incrementExisting).then((menu) => saveTonightMenu(menuItems(menu)));
}

export function updateSharedMenuItem(spuId, skuId, patch) {
  if (!hasCurrentCloudRoom()) {
    return Promise.resolve(updateTonightMenuItem(spuId, skuId, patch));
  }
  return updateCloudRoomMenuItem(spuId, skuId, patch).then((menu) => saveTonightMenu(menuItems(menu)));
}

export function removeSharedMenuItem(spuId, skuId) {
  if (!hasCurrentCloudRoom()) {
    return Promise.resolve(removeTonightMenuItem(spuId, skuId));
  }
  return removeCloudRoomMenuItem(spuId, skuId).then((menu) => saveTonightMenu(menuItems(menu)));
}

export function setAllSharedMenuSelected(isSelected) {
  const selectedValue = isSelected ? 1 : 0;
  if (!hasCurrentCloudRoom()) {
    return Promise.resolve(saveTonightMenu(readTonightMenu().map((item) => ({ ...item, isSelected: selectedValue }))));
  }
  return setCloudRoomMenuAllSelected(isSelected).then((menu) => saveTonightMenu(menuItems(menu)));
}

// 整单替换:用于「用历史菜单覆盖当前菜单」这类显式的整体替换。
export function replaceSharedMenu(menu) {
  const nextMenu = saveTonightMenu(Array.isArray(menu) ? menu : []);
  if (!hasCurrentCloudRoom()) return Promise.resolve(nextMenu);
  return saveCloudRoomMenu(nextMenu).then(() => nextMenu);
}

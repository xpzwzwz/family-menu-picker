import { API_BASE_URL } from '../../config/api.js';

const CLOUD_USER_KEY = 'familyMenuPicker.cloudUser';
const CLOUD_ROOM_KEY = 'familyMenuPicker.cloudRoom';
const CLOUD_ROOMS_KEY = 'familyMenuPicker.cloudRooms';
const CURRENT_CLOUD_ROOM_ID_KEY = 'familyMenuPicker.currentCloudRoomId';

function readStorage(key, fallback = null) {
  const stored = wx.getStorageSync(key);
  if (!stored) return fallback;
  try {
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  wx.setStorageSync(key, JSON.stringify(value));
  return value;
}

function normalizeRoomList(rooms) {
  if (!Array.isArray(rooms)) return [];
  const seen = new Set();
  return rooms.filter((room) => {
    if (!room || !room.roomId || seen.has(room.roomId)) return false;
    seen.add(room.roomId);
    return true;
  });
}

function request({ url, method = 'GET', data, userId }) {
  if (!API_BASE_URL) return Promise.reject(new Error('现在还连不上，请稍后再试'));
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: userId ? { 'X-User-Id': userId } : {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(makeRequestError(res.data && res.data.detail, res.statusCode));
      },
      fail: reject,
    });
  });
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) resolve(res.code);
        else reject(new Error('微信还没准备好，请稍后再试'));
      },
      fail: reject,
    });
  });
}

function toFriendlyError(detail) {
  const message = String(detail || '').trim();
  if (!message) return '这会儿没连上，请稍后再试';
  if (message.includes('not logged in') || message.includes('User')) {
    return '请先打开“我的小分队”准备一下';
  }
  if (message.includes('Room not found')) {
    return '没找到这个口令，检查一下有没有输错';
  }
  if (message.includes('Owner cannot leave')) {
    return '创建小分队的人可以解散小分队';
  }
  if (message.includes('Only owner')) {
    return '只有创建小分队的人可以这样做';
  }
  if (message.includes('Room name')) {
    return '小分队名称不能为空';
  }
  if (message.includes('Member name')) {
    return '名字不能为空';
  }
  if (message.includes('room member')) {
    return '先加入这个小分队再修改菜单';
  }
  if (message.includes('Menu items')) {
    return '菜单内容暂时保存不了，请稍后再试';
  }
  if (message.includes('code') || message.includes('WeChat') || message.includes('access token')) {
    return '微信这会儿没连上，请稍后再试';
  }
  if (message.includes('phone')) {
    return '手机号暂时加不上，稍后再试';
  }
  return message;
}

function makeRequestError(detail, statusCode) {
  const error = new Error(toFriendlyError(detail));
  error.rawDetail = String(detail || '');
  error.statusCode = statusCode;
  return error;
}

function isExpiredRoomError(error) {
  const detail = String((error && error.rawDetail) || (error && error.message) || '');
  return (
    detail.includes('Room not found') || detail.includes('not logged in') || detail.includes('User is not logged in')
  );
}

export function readCloudUser() {
  return readStorage(CLOUD_USER_KEY, null);
}

export function readCloudRooms() {
  const rooms = normalizeRoomList(readStorage(CLOUD_ROOMS_KEY, []));
  if (rooms.length) return rooms;
  const legacyRoom = readStorage(CLOUD_ROOM_KEY, null);
  if (!legacyRoom || !legacyRoom.roomId) return [];
  return [legacyRoom];
}

export function getCurrentCloudRoomId() {
  const currentRoomId = wx.getStorageSync(CURRENT_CLOUD_ROOM_ID_KEY);
  if (currentRoomId) return currentRoomId;
  const currentRoom = readStorage(CLOUD_ROOM_KEY, null);
  return currentRoom && currentRoom.roomId ? currentRoom.roomId : '';
}

export function readCloudRoom() {
  const rooms = readCloudRooms();
  if (!rooms.length) return null;
  const currentRoomId = getCurrentCloudRoomId();
  return rooms.find((room) => room.roomId === currentRoomId) || rooms[0];
}

export function hasCurrentCloudRoom() {
  const room = readCloudRoom();
  return Boolean(room && room.roomId);
}

function writeCloudRooms(rooms, currentRoomId = '') {
  const cleanRooms = normalizeRoomList(rooms);
  writeStorage(CLOUD_ROOMS_KEY, cleanRooms);
  if (cleanRooms.length) {
    const selectedRoom = cleanRooms.find((room) => room.roomId === currentRoomId) || cleanRooms[0];
    wx.setStorageSync(CURRENT_CLOUD_ROOM_ID_KEY, selectedRoom.roomId);
    writeStorage(CLOUD_ROOM_KEY, selectedRoom);
  } else {
    wx.removeStorageSync(CURRENT_CLOUD_ROOM_ID_KEY);
    wx.removeStorageSync(CLOUD_ROOM_KEY);
  }
  return cleanRooms;
}

export function addCloudRoomToCache(room) {
  if (!room || !room.roomId) return readCloudRooms();
  return writeCloudRooms([room, ...readCloudRooms().filter((item) => item.roomId !== room.roomId)], room.roomId);
}

export function saveCloudRoom(room) {
  addCloudRoomToCache(room);
  return room;
}

export function selectCloudRoom(roomId) {
  const rooms = readCloudRooms();
  const room = rooms.find((item) => item.roomId === roomId) || rooms[0] || null;
  if (!room) {
    clearCloudRoom();
    return null;
  }
  wx.setStorageSync(CURRENT_CLOUD_ROOM_ID_KEY, room.roomId);
  writeStorage(CLOUD_ROOM_KEY, room);
  return room;
}

export function clearCloudRoom(roomId = '') {
  const targetRoomId = roomId || getCurrentCloudRoomId();
  if (!targetRoomId) {
    writeCloudRooms([]);
    return;
  }
  const rooms = readCloudRooms().filter((room) => room.roomId !== targetRoomId);
  writeCloudRooms(rooms);
}

export async function loginCloudSquad(nickname = '光盘队员') {
  const code = await wxLogin();
  const user = await request({
    url: '/api/squad/login',
    method: 'POST',
    data: { code, nickname },
  });
  return writeStorage(CLOUD_USER_KEY, user);
}

export async function ensureCloudUser(nickname = '光盘队员') {
  const user = readCloudUser();
  if (user && user.userId) return user;
  return loginCloudSquad(nickname);
}

export function refreshCloudUser(nickname = '光盘队员') {
  return loginCloudSquad(nickname);
}

export async function bindCloudPhone(phoneCode) {
  const user = await ensureCloudUser();
  const boundUser = await request({
    url: '/api/squad/phone',
    method: 'POST',
    userId: user.userId,
    data: { code: phoneCode },
  });
  return writeStorage(CLOUD_USER_KEY, boundUser);
}

export async function updateCloudAvatar(avatarUrl) {
  const user = await ensureCloudUser();
  const updated = await request({
    url: '/api/squad/avatar',
    method: 'POST',
    userId: user.userId,
    data: { avatarUrl },
  });
  return writeStorage(CLOUD_USER_KEY, updated);
}

export async function createCloudRoom({ name, memberName }) {
  const user = await ensureCloudUser(memberName);
  const room = await request({
    url: '/api/squad/rooms',
    method: 'POST',
    userId: user.userId,
    data: { name, memberName },
  });
  return saveCloudRoom(room);
}

export async function refreshCloudRooms() {
  const user = await ensureCloudUser();
  const result = await request({
    url: '/api/squad/rooms',
    userId: user.userId,
  });
  const currentRoomId = getCurrentCloudRoomId();
  const rooms = writeCloudRooms(result.rooms || [], currentRoomId);
  return rooms;
}

export function previewCloudRoom(inviteCode) {
  return request({ url: `/api/squad/rooms/invite/${String(inviteCode || '').trim()}` });
}

export async function joinCloudRoom(inviteCode, payload) {
  const user = await ensureCloudUser(payload.memberName);
  const room = await request({
    url: `/api/squad/rooms/invite/${String(inviteCode || '').trim()}/join`,
    method: 'POST',
    userId: user.userId,
    data: payload,
  });
  return saveCloudRoom(room);
}

export async function refreshCloudRoom(roomId) {
  const user = await ensureCloudUser();
  try {
    const room = await request({
      url: `/api/squad/rooms/${roomId}`,
      userId: user.userId,
    });
    return saveCloudRoom(room);
  } catch (error) {
    if (isExpiredRoomError(error)) {
      clearCloudRoom(roomId);
      throw new Error('没找到这个小分队，可以重新创建或输入队友的口令');
    }
    throw error;
  }
}

export async function fetchCloudRoomMenu(roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items: [], updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu`,
    userId: user.userId,
  });
}

export async function saveCloudRoomMenu(items, roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items, updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu`,
    method: 'PUT',
    userId: user.userId,
    data: { items: Array.isArray(items) ? items : [] },
  });
}

// 以下按单道菜的接口由服务端原子合并(BEGIN IMMEDIATE)，
// 多人并发增删改不会互相覆盖，从根上避免「整单覆盖」把队友的菜冲掉。
export async function addCloudRoomMenuItems(items, incrementExisting = true, roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items: [], updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu/add`,
    method: 'POST',
    userId: user.userId,
    data: { items: Array.isArray(items) ? items : [], incrementExisting },
  });
}

export async function updateCloudRoomMenuItem(spuId, skuId, patch, roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items: [], updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu/update`,
    method: 'POST',
    userId: user.userId,
    data: { spuId, skuId: skuId || '', ...patch },
  });
}

export async function removeCloudRoomMenuItem(spuId, skuId, roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items: [], updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu/remove`,
    method: 'POST',
    userId: user.userId,
    data: { spuId, skuId: skuId || '' },
  });
}

export async function setCloudRoomMenuAllSelected(isSelected, roomId = getCurrentCloudRoomId()) {
  if (!roomId) return { roomId: '', items: [], updatedAt: 0, updatedByUserId: '' };
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/menu/select-all`,
    method: 'POST',
    userId: user.userId,
    data: { isSelected },
  });
}

// 光盘打卡(团队视角):一顿一次，连续天数是整个小分队共享的
export async function addCloudCheckin({ mealDate, note = '', photoUrl = '' }, roomId = getCurrentCloudRoomId()) {
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/checkins`,
    method: 'POST',
    userId: user.userId,
    data: { mealDate, note, photoUrl },
  });
}

export async function fetchCloudCheckinSummary(today, roomId = getCurrentCloudRoomId()) {
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/checkins/summary?today=${encodeURIComponent(today)}`,
    userId: user.userId,
  });
}

export async function fetchCloudCheckinCalendar(month, roomId = getCurrentCloudRoomId()) {
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/checkins/calendar?month=${encodeURIComponent(month)}`,
    userId: user.userId,
  });
}

export async function removeCloudCheckin(mealDate, roomId = getCurrentCloudRoomId()) {
  const user = await ensureCloudUser();
  return request({
    url: `/api/squad/rooms/${roomId}/checkins?mealDate=${encodeURIComponent(mealDate)}`,
    method: 'DELETE',
    userId: user.userId,
  });
}

export async function updateCloudRoomName(roomId, name) {
  const user = await ensureCloudUser();
  const room = await request({
    url: `/api/squad/rooms/${roomId}`,
    method: 'PATCH',
    userId: user.userId,
    data: { name },
  });
  return saveCloudRoom(room);
}

export async function updateCloudMemberName(roomId, memberName) {
  const user = await ensureCloudUser();
  const room = await request({
    url: `/api/squad/rooms/${roomId}/me`,
    method: 'PATCH',
    userId: user.userId,
    data: { memberName },
  });
  return saveCloudRoom(room);
}

export async function disbandCloudRoom(roomId) {
  const user = await ensureCloudUser();
  const result = await request({
    url: `/api/squad/rooms/${roomId}`,
    method: 'DELETE',
    userId: user.userId,
  });
  clearCloudRoom(roomId);
  return result;
}

export async function leaveCloudRoom(roomId) {
  const user = await ensureCloudUser();
  const room = await request({
    url: `/api/squad/rooms/${roomId}/leave`,
    method: 'POST',
    userId: user.userId,
  });
  clearCloudRoom(roomId);
  return room;
}

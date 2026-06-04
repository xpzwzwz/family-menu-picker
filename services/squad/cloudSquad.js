import { API_BASE_URL } from '../../config/api';

const CLOUD_USER_KEY = 'familyMenuPicker.cloudUser';
const CLOUD_ROOM_KEY = 'familyMenuPicker.cloudRoom';

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

function request({ url, method = 'GET', data, userId }) {
  if (!API_BASE_URL) return Promise.reject(new Error('请先配置后端地址'));
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
        reject(new Error((res.data && res.data.detail) || '请求失败'));
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
        else reject(new Error('微信登录失败'));
      },
      fail: reject,
    });
  });
}

export function readCloudUser() {
  return readStorage(CLOUD_USER_KEY, null);
}

export function readCloudRoom() {
  return readStorage(CLOUD_ROOM_KEY, null);
}

export function saveCloudRoom(room) {
  return writeStorage(CLOUD_ROOM_KEY, room);
}

export function clearCloudRoom() {
  wx.removeStorageSync(CLOUD_ROOM_KEY);
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
  const room = await request({
    url: `/api/squad/rooms/${roomId}`,
    userId: user.userId,
  });
  return saveCloudRoom(room);
}

export async function leaveCloudRoom(roomId) {
  const user = await ensureCloudUser();
  const room = await request({
    url: `/api/squad/rooms/${roomId}/leave`,
    method: 'POST',
    userId: user.userId,
  });
  clearCloudRoom();
  return room;
}

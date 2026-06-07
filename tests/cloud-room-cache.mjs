import assert from 'node:assert/strict';
import {
  addCloudRoomToCache,
  clearCloudRoom,
  getCurrentCloudRoomId,
  readCloudRooms,
  refreshCloudRooms,
  refreshCloudRoom,
  readCloudRoom,
  saveCloudRoom,
} from '../services/squad/cloudSquad.js';

const storage = new Map();
let requestHandler = (options) => {
  options.success({
    statusCode: 404,
    data: { detail: 'Room not found' },
  });
};

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
    requestHandler(options);
  },
};

storage.set('familyMenuPicker.cloudUser', JSON.stringify({ userId: 'user-1', nickname: '我' }));

saveCloudRoom({ roomId: 'room-1', name: '午饭小分队', members: [] });
addCloudRoomToCache({ roomId: 'room-2', name: '周末小分队', members: [] });
assert.deepEqual(readCloudRooms().map((room) => room.roomId), ['room-2', 'room-1']);
assert.equal(readCloudRoom().roomId, 'room-2');
assert.equal(getCurrentCloudRoomId(), 'room-2');

clearCloudRoom('room-2');
assert.deepEqual(readCloudRooms().map((room) => room.roomId), ['room-1']);
assert.equal(readCloudRoom().roomId, 'room-1');
assert.equal(getCurrentCloudRoomId(), 'room-1');

saveCloudRoom({ roomId: 'missing-room', name: '旧小分队', members: [] });
await assert.rejects(() => refreshCloudRoom('missing-room'), /没找到这个小分队/);
assert.equal(readCloudRoom().roomId, 'room-1');
assert.deepEqual(readCloudRooms().map((room) => room.roomId), ['room-1']);

requestHandler = (options) => {
  assert.equal(options.url.endsWith('/api/squad/rooms'), true);
  options.success({
    statusCode: 200,
    data: {
      rooms: [
        { roomId: 'remote-1', name: '远程小分队', members: [] },
        { roomId: 'remote-2', name: '第二小分队', members: [] },
      ],
    },
  });
};
const remoteRooms = await refreshCloudRooms();
assert.deepEqual(remoteRooms.map((room) => room.roomId), ['remote-1', 'remote-2']);
assert.equal(readCloudRoom().roomId, 'remote-1');

console.log('cloud room cache checks passed');

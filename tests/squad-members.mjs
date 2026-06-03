import assert from 'node:assert/strict';
import {
  addSquadMember,
  deleteSquadMember,
  getDefaultSquadMembers,
  readSquadMembers,
  updateSquadMember,
} from '../model/user.js';

const storage = new Map();

globalThis.wx = {
  getStorageSync(key) {
    return storage.get(key) || '';
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
};

Date.now = () => 1800000002000;

storage.clear();
assert.deepEqual(readSquadMembers(), getDefaultSquadMembers());
assert.equal(readSquadMembers()[0].name, '我');

const member = addSquadMember({
  name: '小王',
  role: '爱吃辣',
  flavorPreference: '少葱，多肉',
});

assert.equal(member.id, 'member-1800000002000');
assert.equal(member.name, '小王');
assert.equal(readSquadMembers().length, 2);

const updated = updateSquadMember(member.id, {
  name: '王同学',
  role: '点菜员',
  flavorPreference: '不吃香菜',
});

assert.equal(updated.name, '王同学');
assert.equal(readSquadMembers()[1].flavorPreference, '不吃香菜');

assert.equal(deleteSquadMember(member.id), true);
assert.equal(readSquadMembers().length, 1);
assert.equal(deleteSquadMember('self'), false);
assert.equal(deleteSquadMember('missing'), false);

storage.set('familyMenuPicker.squadMembers', '{bad json');
assert.deepEqual(readSquadMembers(), getDefaultSquadMembers());

console.log('squad member checks passed');

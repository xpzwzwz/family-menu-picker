import assert from 'node:assert/strict';
import {
  FEEDBACK_TYPES,
  getDefaultUserProfile,
  readFeedbackList,
  readUserProfile,
  saveUserProfile,
  submitFeedback,
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

const originalNow = Date.now;
Date.now = () => 1800000000000;

storage.clear();
const defaultProfile = getDefaultUserProfile();
assert.equal(defaultProfile.nickname, '光盘队员');
assert.equal(defaultProfile.role, '小分队成员');
assert.deepEqual(readUserProfile(), defaultProfile);

const savedProfile = saveUserProfile({
  nickname: '小王',
  role: '掌勺人',
  flavorPreference: '少辣，多汤',
  note: '周末常备菜',
});

assert.equal(savedProfile.nickname, '小王');
assert.equal(savedProfile.role, '掌勺人');
assert.equal(savedProfile.flavorPreference, '少辣，多汤');
assert.equal(readUserProfile().nickname, '小王');

const feedback = submitFeedback({
  type: 'bug',
  content: '菜品列表滚动不顺畅',
  contact: 'wxid-test',
});

assert.equal(feedback.id, 'feedback-1800000000000');
assert.equal(feedback.type, 'bug');
assert.equal(feedback.typeName, '问题');
assert.equal(feedback.content, '菜品列表滚动不顺畅');
assert.equal(feedback.contact, 'wxid-test');
assert.equal(readFeedbackList().length, 1);

Date.now = () => 1800000001000;
submitFeedback({
  type: 'idea',
  content: '希望支持早餐菜单',
});
assert.equal(readFeedbackList()[0].id, 'feedback-1800000001000');
assert.equal(FEEDBACK_TYPES.some((item) => item.value === 'dish'), true);
assert.throws(() => submitFeedback({ type: 'other', content: '   ' }), /反馈内容/);

storage.set('familyMenuPicker.feedbackList', '{bad json');
assert.deepEqual(readFeedbackList(), []);

Date.now = originalNow;
console.log('user profile and feedback checks passed');

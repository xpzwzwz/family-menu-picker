const USER_PROFILE_STORAGE_KEY = 'familyMenuPicker.userProfile';
const SQUAD_MEMBERS_STORAGE_KEY = 'familyMenuPicker.squadMembers';
const FEEDBACK_LIST_STORAGE_KEY = 'familyMenuPicker.feedbackList';
const MAX_FEEDBACK_COUNT = 50;

export const FEEDBACK_TYPES = [
  { value: 'bug', label: '问题' },
  { value: 'idea', label: '建议' },
  { value: 'dish', label: '菜品数据' },
  { value: 'other', label: '其他' },
];

function readStorageValue(key, fallback) {
  const wxApi = typeof wx !== 'undefined' ? wx : null;
  if (!wxApi || !wxApi.getStorageSync) return fallback;
  const stored = wxApi.getStorageSync(key);
  if (!stored) return fallback;
  try {
    return typeof stored === 'string' ? JSON.parse(stored) : stored;
  } catch (error) {
    return fallback;
  }
}

function writeStorageValue(key, value) {
  const wxApi = typeof wx !== 'undefined' ? wx : null;
  if (!wxApi || !wxApi.setStorageSync) return value;
  wxApi.setStorageSync(key, JSON.stringify(value));
  return value;
}

export function getDefaultUserProfile() {
  return {
    nickname: '光盘队员',
    role: '小分队成员',
    flavorPreference: '',
    note: '',
  };
}

function normalizeUserProfile(profile = {}) {
  const defaultProfile = getDefaultUserProfile();
  return {
    nickname: String(profile.nickname || defaultProfile.nickname).trim() || defaultProfile.nickname,
    role: String(profile.role || defaultProfile.role).trim() || defaultProfile.role,
    flavorPreference: String(profile.flavorPreference || '').trim(),
    note: String(profile.note || '').trim(),
  };
}

export function readUserProfile() {
  return normalizeUserProfile(readStorageValue(USER_PROFILE_STORAGE_KEY, getDefaultUserProfile()));
}

export function saveUserProfile(profile = {}) {
  return writeStorageValue(USER_PROFILE_STORAGE_KEY, normalizeUserProfile(profile));
}

export function getDefaultSquadMembers() {
  return [
    {
      id: 'self',
      name: '我',
      role: '小分队成员',
      flavorPreference: '',
      isSelf: true,
    },
  ];
}

function normalizeSquadMember(member = {}, fallbackId = `member-${Date.now()}`) {
  const id = String(member.id || fallbackId).trim();
  const name = String(member.name || '').trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    role: String(member.role || '小分队成员').trim() || '小分队成员',
    flavorPreference: String(member.flavorPreference || '').trim(),
    isSelf: id === 'self' || !!member.isSelf,
  };
}

export function readSquadMembers() {
  const stored = readStorageValue(SQUAD_MEMBERS_STORAGE_KEY, null);
  if (!Array.isArray(stored)) return getDefaultSquadMembers();
  const members = stored.map((member) => normalizeSquadMember(member)).filter(Boolean);
  if (!members.some((member) => member.id === 'self')) {
    members.unshift(getDefaultSquadMembers()[0]);
  }
  return members.length ? members : getDefaultSquadMembers();
}

function saveSquadMembers(members) {
  return writeStorageValue(
    SQUAD_MEMBERS_STORAGE_KEY,
    members.map((member) => normalizeSquadMember(member)).filter(Boolean),
  );
}

export function addSquadMember(payload = {}) {
  const member = normalizeSquadMember(
    {
      ...payload,
      id: `member-${Date.now()}`,
    },
    `member-${Date.now()}`,
  );
  if (!member) throw new Error('请输入成员名称');
  const next = [...readSquadMembers(), member];
  saveSquadMembers(next);
  return member;
}

export function updateSquadMember(id, patch = {}) {
  const members = readSquadMembers();
  const existing = members.find((member) => member.id === id);
  if (!existing) return null;
  const updated = normalizeSquadMember(
    { ...existing, ...patch, id: existing.id, isSelf: existing.isSelf },
    existing.id,
  );
  if (!updated) throw new Error('请输入成员名称');
  saveSquadMembers(members.map((member) => (member.id === id ? updated : member)));
  return updated;
}

export function deleteSquadMember(id) {
  if (!id || id === 'self') return false;
  const members = readSquadMembers();
  const next = members.filter((member) => member.id !== id);
  if (next.length === members.length) return false;
  saveSquadMembers(next);
  return true;
}

function getFeedbackTypeName(type) {
  const feedbackType = FEEDBACK_TYPES.find((item) => item.value === type);
  return feedbackType ? feedbackType.label : FEEDBACK_TYPES[FEEDBACK_TYPES.length - 1].label;
}

function normalizeFeedback(feedback) {
  if (!feedback || !feedback.id || !feedback.content) return null;
  const type = FEEDBACK_TYPES.some((item) => item.value === feedback.type) ? feedback.type : 'other';
  return {
    id: feedback.id,
    type,
    typeName: getFeedbackTypeName(type),
    content: String(feedback.content || '').trim(),
    contact: String(feedback.contact || '').trim(),
    createdAt: Number(feedback.createdAt) || 0,
  };
}

export function readFeedbackList() {
  const stored = readStorageValue(FEEDBACK_LIST_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .map(normalizeFeedback)
    .filter(Boolean)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, MAX_FEEDBACK_COUNT);
}

export function submitFeedback(payload = {}) {
  const content = String(payload.content || '').trim();
  if (!content) throw new Error('请输入反馈内容');
  const type = FEEDBACK_TYPES.some((item) => item.value === payload.type) ? payload.type : 'other';
  const createdAt = Date.now();
  const feedback = {
    id: `feedback-${createdAt}`,
    type,
    typeName: getFeedbackTypeName(type),
    content,
    contact: String(payload.contact || '').trim(),
    createdAt,
  };
  const next = [feedback, ...readFeedbackList().filter((item) => item.id !== feedback.id)].slice(0, MAX_FEEDBACK_COUNT);
  writeStorageValue(FEEDBACK_LIST_STORAGE_KEY, next);
  return feedback;
}

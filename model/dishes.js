const STORE_ID = 'family-kitchen';
const STORE_NAME = '小分队厨房';
const DEFAULT_IMAGE = '/assets/dishes/default.svg';
const DISH_PLACEHOLDER_IMAGES = {
  quick: '/assets/dishes/quick.svg',
  meat: '/assets/dishes/meat.svg',
  vegetable: '/assets/dishes/vegetable.svg',
  soup: '/assets/dishes/soup.svg',
  staple: '/assets/dishes/staple.svg',
};
const MENU_STORAGE_KEY = 'familyMenuPicker.tonightMenu';
const LAST_CONFIRMED_MENU_STORAGE_KEY = 'familyMenuPicker.lastConfirmedMenu';
const MENU_HISTORY_STORAGE_KEY = 'familyMenuPicker.menuHistory';
const CUSTOM_DISHES_STORAGE_KEY = 'familyMenuPicker.customDishes';
const USER_DISHES_STORAGE_KEY = 'familyMenuPicker.userDishes';
const SHOPPING_BASKET_CHECKED_KEY = 'familyMenuPicker.shoppingBasketChecked';
const MAX_MENU_HISTORY_COUNT = 20;
const OTHER_CATEGORY_ID = 'other';

export const defaultDishCategories = [
  { id: 'quick', name: '快手菜', description: '30 分钟内能上桌' },
  { id: 'meat', name: '荤菜', description: '肉蛋鱼虾和高蛋白' },
  { id: 'vegetable', name: '素菜', description: '清爽蔬菜和豆制品' },
  { id: 'soup', name: '汤', description: '补水暖胃' },
  { id: 'staple', name: '主食', description: '米饭面粉类' },
];
export const otherDishCategory = { id: OTHER_CATEGORY_ID, name: '其他', description: '暂时没归类的菜' };

export const dishCategories = [...defaultDishCategories, otherDishCategory];

export function getDishPlaceholderImage(category) {
  return DISH_PLACEHOLDER_IMAGES[category] || DEFAULT_IMAGE;
}

export const dishes = [
  {
    id: 'tomato-egg',
    name: '番茄炒蛋',
    category: 'quick',
    image: getDishPlaceholderImage('quick'),
    cookMinutes: 12,
    difficulty: '简单',
    flavor: '酸甜',
    servings: 3,
    tags: ['快手', '下饭', '小朋友友好', '素菜'],
    ingredients: ['番茄', '鸡蛋', '葱', '盐', '糖'],
    steps: [
      { title: '处理食材', description: '番茄切块，鸡蛋打散，加少许盐搅匀。' },
      { title: '先炒鸡蛋', description: '热锅下油，把鸡蛋炒到刚凝固后盛出。' },
      { title: '炒番茄出汁', description: '番茄下锅炒软，加少许盐和糖调味。' },
      { title: '合炒收味', description: '倒回鸡蛋翻匀，撒葱花即可。' },
    ],
    notes: '队里常备菜，适合选择困难时兜底。',
  },
  {
    id: 'pepper-beef',
    name: '青椒牛肉',
    category: 'meat',
    image: getDishPlaceholderImage('meat'),
    cookMinutes: 25,
    difficulty: '中等',
    flavor: '咸香',
    servings: 3,
    tags: ['荤菜', '下饭', '高蛋白'],
    ingredients: ['牛肉', '青椒', '蒜', '生抽', '淀粉'],
    steps: [
      { title: '腌牛肉', description: '牛肉切薄片，用生抽、淀粉和少许油抓匀。' },
      { title: '处理配菜', description: '青椒切块，蒜切片备用。' },
      { title: '快炒牛肉', description: '热锅快炒牛肉到变色后盛出。' },
      { title: '回锅合炒', description: '青椒炒断生，倒回牛肉翻匀调味。' },
    ],
    notes: '牛肉提前腌 10 分钟，口感更稳。',
  },
  {
    id: 'garlic-lettuce',
    name: '蒜蓉生菜',
    category: 'vegetable',
    image: getDishPlaceholderImage('vegetable'),
    cookMinutes: 8,
    difficulty: '简单',
    flavor: '清爽',
    servings: 3,
    tags: ['素菜', '快手', '清淡'],
    ingredients: ['生菜', '蒜', '盐', '生抽'],
    steps: [
      { title: '洗菜控水', description: '生菜洗净后尽量控干水分。' },
      { title: '爆香蒜末', description: '热锅下油，小火炒香蒜末。' },
      { title: '大火快炒', description: '下生菜快速翻炒，加盐和少许生抽。' },
    ],
    notes: '适合搭配重口味荤菜。',
  },
  {
    id: 'corn-rib-soup',
    name: '玉米排骨汤',
    category: 'soup',
    image: getDishPlaceholderImage('soup'),
    cookMinutes: 50,
    difficulty: '中等',
    flavor: '鲜甜',
    servings: 4,
    tags: ['汤', '可提前炖', '荤菜'],
    ingredients: ['排骨', '玉米', '胡萝卜', '姜片', '盐'],
    steps: [
      { title: '排骨焯水', description: '排骨冷水下锅，煮出浮沫后洗净。' },
      { title: '加料炖煮', description: '排骨、玉米、胡萝卜和姜片入锅加水。' },
      { title: '小火慢炖', description: '小火炖到排骨软烂，约 45 分钟。' },
      { title: '最后调味', description: '出锅前加盐，按口味撒葱花。' },
    ],
    notes: '时间紧时可换成紫菜蛋花汤。',
  },
  {
    id: 'egg-fried-rice',
    name: '鸡蛋炒饭',
    category: 'staple',
    image: getDishPlaceholderImage('staple'),
    cookMinutes: 15,
    difficulty: '简单',
    flavor: '咸香',
    servings: 2,
    tags: ['主食', '快手', '剩饭友好'],
    ingredients: ['剩米饭', '鸡蛋', '葱花', '盐', '生抽'],
    steps: [
      { title: '打散米饭', description: '剩饭提前压散，鸡蛋打匀。' },
      { title: '炒鸡蛋', description: '热锅下蛋液炒散，盛出备用。' },
      { title: '炒米饭', description: '米饭下锅炒热炒散，加盐和少许生抽。' },
      { title: '合炒出锅', description: '倒回鸡蛋，加葱花翻匀。' },
    ],
    notes: '适合不想煮饭的时候。',
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐',
    category: 'quick',
    image: getDishPlaceholderImage('quick'),
    cookMinutes: 18,
    difficulty: '简单',
    flavor: '微辣',
    servings: 3,
    tags: ['快手', '下饭', '豆制品'],
    ingredients: ['豆腐', '肉末', '豆瓣酱', '蒜', '淀粉水'],
    steps: [
      { title: '处理豆腐', description: '豆腐切块，可用淡盐水稍微焯一下。' },
      { title: '炒香底料', description: '肉末炒散，加入蒜末和豆瓣酱炒出红油。' },
      { title: '烧豆腐', description: '加水后放豆腐，小火煮入味。' },
      { title: '勾芡收汁', description: '淋入淀粉水，轻推收汁。' },
    ],
    notes: '不能吃辣时减少豆瓣酱。',
  },
  {
    id: 'steamed-fish',
    name: '清蒸鱼',
    category: 'meat',
    image: getDishPlaceholderImage('meat'),
    cookMinutes: 22,
    difficulty: '中等',
    flavor: '鲜香',
    servings: 3,
    tags: ['荤菜', '清淡', '高蛋白'],
    ingredients: ['鱼', '姜', '葱', '蒸鱼豉油', '热油'],
    steps: [
      { title: '处理鱼身', description: '鱼清理干净，两面放姜片去腥。' },
      { title: '上锅蒸', description: '水开后上锅，根据鱼大小蒸 8-12 分钟。' },
      { title: '倒掉蒸汁', description: '取出后倒掉盘中腥水，铺葱丝。' },
      { title: '淋油调味', description: '淋蒸鱼豉油，再浇热油激香。' },
    ],
    notes: '适合想吃清淡但又要有主菜的晚上。',
  },
  {
    id: 'mushroom-greens',
    name: '香菇青菜',
    category: 'vegetable',
    image: getDishPlaceholderImage('vegetable'),
    cookMinutes: 12,
    difficulty: '简单',
    flavor: '鲜香',
    servings: 3,
    tags: ['素菜', '清淡', '快手'],
    ingredients: ['青菜', '香菇', '蒜', '盐', '蚝油'],
    steps: [
      { title: '切配食材', description: '青菜洗净，香菇切片，蒜切末。' },
      { title: '先炒香菇', description: '香菇下锅炒软炒香。' },
      { title: '加入青菜', description: '青菜下锅大火翻炒，加盐和少许蚝油。' },
    ],
    notes: '和鱼、牛肉都好搭。',
  },
  {
    id: 'seaweed-egg-soup',
    name: '紫菜蛋花汤',
    category: 'soup',
    image: getDishPlaceholderImage('soup'),
    cookMinutes: 8,
    difficulty: '简单',
    flavor: '清淡',
    servings: 3,
    tags: ['汤', '快手', '清淡'],
    ingredients: ['紫菜', '鸡蛋', '葱花', '盐', '香油'],
    steps: [
      { title: '烧开汤底', description: '锅中加水烧开，放入紫菜。' },
      { title: '淋入蛋液', description: '鸡蛋打散后沿锅边慢慢淋入。' },
      { title: '调味出锅', description: '加盐调味，出锅前点香油和葱花。' },
    ],
    notes: '最快的汤类兜底。',
  },
  {
    id: 'noodle-soup',
    name: '番茄鸡蛋面',
    category: 'staple',
    image: getDishPlaceholderImage('staple'),
    cookMinutes: 18,
    difficulty: '简单',
    flavor: '酸甜',
    servings: 2,
    tags: ['主食', '快手', '热乎'],
    ingredients: ['面条', '番茄', '鸡蛋', '青菜', '盐'],
    steps: [
      { title: '炒番茄汤底', description: '番茄炒软出汁，加水煮开。' },
      { title: '下面条', description: '放入面条煮到接近熟透。' },
      { title: '加蛋和青菜', description: '淋入蛋液，加入青菜煮熟。' },
      { title: '调味', description: '加盐调味，喜欢酸甜可补一点番茄酱。' },
    ],
    notes: '适合懒得炒多个菜时。',
  },
];

export const defaultDishIds = dishes.map((dish) => dish.id);

// 备料用量(约 3 人份)与步骤时长(分钟)——和菜数据分开放便于维护，读菜时合并进去
const DISH_AMOUNTS = {
  'tomato-egg': { 番茄: '2个', 鸡蛋: '3个', 葱: '1根', 盐: '2g', 糖: '5g' },
  'pepper-beef': { 牛肉: '200g', 青椒: '2个', 蒜: '3瓣', 生抽: '15ml', 淀粉: '10g' },
  'garlic-lettuce': { 生菜: '1棵', 蒜: '4瓣', 盐: '2g', 生抽: '10ml' },
  'corn-rib-soup': { 排骨: '400g', 玉米: '1根', 胡萝卜: '1根', 姜片: '3片', 盐: '3g' },
  'egg-fried-rice': { 剩米饭: '2碗', 鸡蛋: '2个', 葱花: '1把', 盐: '2g', 生抽: '10ml' },
  'mapo-tofu': { 豆腐: '1块', 肉末: '100g', 豆瓣酱: '15g', 蒜: '3瓣', 淀粉水: '30ml' },
  'steamed-fish': { 鱼: '1条', 姜: '1块', 葱: '2根', 蒸鱼豉油: '20ml', 热油: '15ml' },
  'mushroom-greens': { 青菜: '300g', 香菇: '5朵', 蒜: '2瓣', 盐: '2g', 蚝油: '10ml' },
  'seaweed-egg-soup': { 紫菜: '1小把', 鸡蛋: '2个', 葱花: '1把', 盐: '2g', 香油: '3ml' },
  'noodle-soup': { 面条: '150g', 番茄: '2个', 鸡蛋: '2个', 青菜: '100g', 盐: '3g' },
};

const DISH_STEP_MINUTES = {
  'tomato-egg': [3, 2, 4, 2],
  'pepper-beef': [10, 5, 3, 5],
  'garlic-lettuce': [3, 2, 3],
  'corn-rib-soup': [5, 5, 38, 2],
  'egg-fried-rice': [2, 3, 6, 4],
  'mapo-tofu': [3, 4, 8, 3],
  'steamed-fish': [6, 12, 1, 3],
  'mushroom-greens': [4, 4, 4],
  'seaweed-egg-soup': [4, 2, 2],
  'noodle-soup': [5, 5, 5, 3],
};

// 真实菜品照片(放在 assets/dishes/photos，已压成 480px WebP)
const DISH_IMAGES = {
  'tomato-egg': '/assets/dishes/photos/tomato-egg.webp',
  'pepper-beef': '/assets/dishes/photos/pepper-beef.webp',
  'garlic-lettuce': '/assets/dishes/photos/garlic-lettuce.webp',
  'corn-rib-soup': '/assets/dishes/photos/corn-rib-soup.webp',
  'egg-fried-rice': '/assets/dishes/photos/egg-fried-rice.webp',
  'mapo-tofu': '/assets/dishes/photos/mapo-tofu.webp',
  'steamed-fish': '/assets/dishes/photos/steamed-fish.webp',
  'mushroom-greens': '/assets/dishes/photos/mushroom-greens.webp',
  'seaweed-egg-soup': '/assets/dishes/photos/seaweed-egg-soup.webp',
  'noodle-soup': '/assets/dishes/photos/noodle-soup.webp',
};

function enrichBuiltInDish(dish) {
  const amounts = DISH_AMOUNTS[dish.id] || {};
  const stepMinutes = DISH_STEP_MINUTES[dish.id] || [];
  const steps = Array.isArray(dish.steps)
    ? dish.steps.map((step, index) => ({ ...step, minutes: step.minutes || stepMinutes[index] || 0 }))
    : dish.steps;
  return {
    ...dish,
    image: DISH_IMAGES[dish.id] || dish.image,
    amounts: { ...amounts, ...(dish.amounts || {}) },
    steps,
  };
}

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

function parseTags(tagsText) {
  if (!tagsText) return [];
  if (Array.isArray(tagsText)) return tagsText.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tagsText)
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function splitIngredientEntries(ingredientsText) {
  if (!ingredientsText) return [];
  const raw = Array.isArray(ingredientsText)
    ? ingredientsText.map((ingredient) => String(ingredient))
    : String(ingredientsText).split(/[,，\n]/);
  return raw.map((entry) => entry.trim()).filter(Boolean);
}

// 一条备料可写「名字 用量」(如「番茄 2个」),这里只取名字部分;用量交给 parseIngredientAmounts
function parseIngredients(ingredientsText) {
  return splitIngredientEntries(ingredientsText).map((entry) => entry.split(/\s+/)[0]);
}

function parseIngredientAmounts(ingredientsText) {
  const amounts = {};
  splitIngredientEntries(ingredientsText).forEach((entry) => {
    const parts = entry.split(/\s+/);
    const name = parts[0];
    const amount = parts.slice(1).join(' ').trim();
    if (name && amount) amounts[name] = amount;
  });
  return amounts;
}

function normalizeStepImage(image) {
  return String(image || '').trim();
}

function parseSteps(stepsText, stepImages = []) {
  const images = Array.isArray(stepImages) ? stepImages : [];
  if (!stepsText) return [];
  if (Array.isArray(stepsText)) {
    return stepsText
      .map((step, index) => {
        if (typeof step === 'string') {
          const text = step.trim();
          return text ? { title: text, description: text, image: normalizeStepImage(images[index]) } : null;
        }
        if (!step || typeof step !== 'object') return null;
        const title = String(step.title || step.description || `第 ${index + 1} 步`).trim();
        const description = String(step.description || step.title || '').trim();
        const image = normalizeStepImage(step.image || images[index]);
        const minutes = Number(step.minutes) || 0;
        return title && description ? { title, description, image, minutes } : null;
      })
      .filter(Boolean);
  }
  return String(stepsText)
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step, index) => ({ title: step, description: step, image: normalizeStepImage(images[index]) }));
}

function getPayloadTags(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'tagsText') ? payload.tagsText : payload.tags;
}

function getPayloadIngredients(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'ingredientsText')
    ? payload.ingredientsText
    : payload.ingredients;
}

function getPayloadSteps(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'stepsText') ? payload.stepsText : payload.steps;
}

function getPayloadStepImages(payload) {
  return Array.isArray(payload.stepImages) ? payload.stepImages : [];
}

function normalizeDishCategory(categoryId) {
  const cleanCategoryId = String(categoryId || '').trim();
  const categoryIds = getKnownDishCategoryIds();
  return categoryIds.has(cleanCategoryId) ? cleanCategoryId : OTHER_CATEGORY_ID;
}

function buildCustomDish(payload = {}, id = `custom-${Date.now()}`) {
  const category = normalizeDishCategory(payload.category);
  return {
    id,
    name: String(payload.name || '').trim(),
    category,
    image: payload.image || getDishPlaceholderImage(category),
    cookMinutes: Math.max(Number(payload.cookMinutes) || 0, 1),
    difficulty: payload.difficulty || '简单',
    flavor: String(payload.flavor || '').trim() || '家常',
    servings: Number(payload.servings) || 3,
    tags: parseTags(getPayloadTags(payload)),
    ingredients: parseIngredients(getPayloadIngredients(payload)),
    amounts:
      payload.amounts && typeof payload.amounts === 'object'
        ? payload.amounts
        : parseIngredientAmounts(getPayloadIngredients(payload)),
    steps: parseSteps(getPayloadSteps(payload), getPayloadStepImages(payload)),
    notes: String(payload.notes || '').trim(),
    isCustom: true,
  };
}

function buildUserDish(payload = {}, id = `custom-${Date.now()}`, isCustom = true) {
  return {
    ...buildCustomDish(payload, id),
    isCustom,
  };
}

function normalizeCustomDish(dish) {
  if (!dish || !dish.id || !dish.name || !dish.category) return null;
  return buildCustomDish(dish, dish.id);
}

function normalizeDishOverride(dish) {
  if (!dish || !dish.id || !dish.name || !dish.category) return null;
  return buildUserDish(dish, dish.id, false);
}

function normalizeDishCategoryRecord(category) {
  if (!category || !category.id || !category.name) return null;
  const id = String(category.id).trim();
  if (!id || defaultDishCategories.some((item) => item.id === id) || id === OTHER_CATEGORY_ID) return null;
  return {
    id,
    name: String(category.name || '').trim(),
    description: String(category.description || '').trim(),
    isCustom: true,
  };
}

function readStoredDishCategories() {
  const stored = readStorageValue(USER_DISHES_STORAGE_KEY, null);
  if (!stored || typeof stored !== 'object' || Array.isArray(stored) || !Array.isArray(stored.categories)) return [];
  return stored.categories.map(normalizeDishCategoryRecord).filter(Boolean);
}

function getKnownDishCategoryIds() {
  return new Set(
    [...defaultDishCategories, ...readStoredDishCategories(), otherDishCategory].map((category) => category.id),
  );
}

function readHiddenDishIds() {
  const legacyHiddenDishIds = readStorageValue('familyMenuPicker.hiddenDishIds', []);
  if (Array.isArray(legacyHiddenDishIds)) return legacyHiddenDishIds.map(String).filter(Boolean);
  return [];
}

function normalizeDishOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object') return {};
  return Object.entries(overrides).reduce((result, [id, dish]) => {
    const normalizedDish = normalizeDishOverride({ ...dish, id });
    return normalizedDish ? { ...result, [id]: normalizedDish } : result;
  }, {});
}

export function readUserDishes() {
  const stored = readStorageValue(USER_DISHES_STORAGE_KEY, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    const custom = Array.isArray(stored.custom) ? stored.custom.map(normalizeCustomDish).filter(Boolean) : [];
    const overrides = normalizeDishOverrides(stored.overrides);
    const hidden = Array.isArray(stored.hidden) ? stored.hidden.map(String).filter(Boolean) : [];
    const categories = Array.isArray(stored.categories)
      ? stored.categories.map(normalizeDishCategoryRecord).filter(Boolean)
      : [];
    const categoryOverrides =
      stored.categoryOverrides && typeof stored.categoryOverrides === 'object' ? stored.categoryOverrides : {};
    const removedCategories = Array.isArray(stored.removedCategories)
      ? stored.removedCategories.map(String).filter((id) => defaultDishCategories.some((category) => category.id === id))
      : [];
    return { custom, overrides, hidden, categories, categoryOverrides, removedCategories };
  }

  return {
    custom: readCustomDishes(),
    overrides: {},
    hidden: readHiddenDishIds(),
    categories: [],
    categoryOverrides: {},
    removedCategories: [],
  };
}

export function saveUserDishes(userDishes = {}) {
  return writeStorageValue(USER_DISHES_STORAGE_KEY, {
    custom: Array.isArray(userDishes.custom) ? userDishes.custom : [],
    overrides: userDishes.overrides && typeof userDishes.overrides === 'object' ? userDishes.overrides : {},
    hidden: Array.isArray(userDishes.hidden) ? userDishes.hidden : [],
    categories: Array.isArray(userDishes.categories)
      ? userDishes.categories.map(normalizeDishCategoryRecord).filter(Boolean)
      : [],
    categoryOverrides:
      userDishes.categoryOverrides && typeof userDishes.categoryOverrides === 'object'
        ? userDishes.categoryOverrides
        : {},
    removedCategories: Array.isArray(userDishes.removedCategories)
      ? [...new Set(userDishes.removedCategories.map(String))]
      : [],
  });
}

export function readUserDishCategories() {
  return readUserDishes().categories;
}

export function getDishCategoryOptions() {
  const userDishes = readUserDishes();
  const removed = new Set(userDishes.removedCategories);
  const overrides = userDishes.categoryOverrides || {};
  const activeDefaults = defaultDishCategories
    .filter((category) => !removed.has(category.id))
    .map((category) => {
      const override = overrides[category.id];
      if (!override) return category;
      return {
        ...category,
        name: String(override.name || '').trim() || category.name,
        description: override.description !== undefined ? String(override.description).trim() : category.description,
      };
    });
  return [...activeDefaults, ...userDishes.categories, otherDishCategory];
}

export function addDishCategory(payload = {}) {
  const name = String(payload.name || '').trim();
  if (!name) return null;
  const userDishes = readUserDishes();
  const category = {
    id: `custom-category-${Date.now()}`,
    name,
    description: String(payload.description || '').trim(),
    isCustom: true,
  };
  saveUserDishes({ ...userDishes, categories: [category, ...userDishes.categories] });
  return category;
}

export function updateDishCategory(id, patch = {}) {
  const categoryId = String(id || '').trim();
  if (!categoryId || categoryId === OTHER_CATEGORY_ID) return null;
  const name = String(patch.name || '').trim();
  if (!name) return null;
  const description = String(patch.description || '').trim();
  const userDishes = readUserDishes();

  // 内置分组:改名存成 override，保留原 id 以免菜品失联
  const baseDefault = defaultDishCategories.find((category) => category.id === categoryId);
  if (baseDefault) {
    saveUserDishes({
      ...userDishes,
      categoryOverrides: { ...userDishes.categoryOverrides, [categoryId]: { name, description } },
      removedCategories: userDishes.removedCategories.filter((removedId) => removedId !== categoryId),
    });
    return { ...baseDefault, name, description, isCustom: false };
  }

  // 自定义分组
  const existing = userDishes.categories.find((category) => category.id === categoryId);
  if (!existing) return null;
  const updated = { ...existing, name, description, isCustom: true };
  saveUserDishes({
    ...userDishes,
    categories: userDishes.categories.map((category) => (category.id === categoryId ? updated : category)),
  });
  return updated;
}

export function deleteDishCategory(id) {
  const categoryId = String(id || '').trim();
  if (!categoryId || categoryId === OTHER_CATEGORY_ID) return false;
  const userDishes = readUserDishes();
  const isDefault = defaultDishCategories.some((category) => category.id === categoryId);
  const isCustom = userDishes.categories.some((category) => category.id === categoryId);
  if (!isDefault && !isCustom) return false;

  // 该分组下的「自定义菜」和「被覆盖的菜」归到「其他」;内置菜由 getDishesByCategory('other') 兜底
  const nextCustom = userDishes.custom.map((dish) => {
    if (dish.category !== categoryId) return dish;
    return buildCustomDish({ ...dish, category: OTHER_CATEGORY_ID }, dish.id);
  });
  const nextOverrides = Object.entries(userDishes.overrides || {}).reduce((result, [dishId, dish]) => {
    const nextDish =
      dish && dish.category === categoryId
        ? buildUserDish({ ...dish, category: OTHER_CATEGORY_ID }, dishId, false)
        : dish;
    return { ...result, [dishId]: nextDish };
  }, {});

  const next = { ...userDishes, custom: nextCustom, overrides: nextOverrides };
  if (isDefault) {
    next.removedCategories = [...new Set([...userDishes.removedCategories, categoryId])];
    const categoryOverrides = { ...userDishes.categoryOverrides };
    delete categoryOverrides[categoryId];
    next.categoryOverrides = categoryOverrides;
  } else {
    next.categories = userDishes.categories.filter((category) => category.id !== categoryId);
  }

  saveUserDishes(next);
  writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, nextCustom);
  return true;
}

// 一键还原系统自带分组(清掉内置改名与删除),不影响自定义分组
export function restoreDishCategoryDefaults() {
  const userDishes = readUserDishes();
  saveUserDishes({ ...userDishes, categoryOverrides: {}, removedCategories: [] });
  return getDishCategoryOptions();
}

export function readCustomDishes() {
  const stored = readStorageValue(CUSTOM_DISHES_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeCustomDish).filter(Boolean);
}

export function saveCustomDishes(customDishes) {
  const userDishes = readUserDishes();
  saveUserDishes({
    ...userDishes,
    custom: Array.isArray(customDishes) ? customDishes : [],
  });
  return writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, Array.isArray(customDishes) ? customDishes : []);
}

export function addCustomDish(payload = {}) {
  const customDish = buildCustomDish(payload);
  const userDishes = readUserDishes();
  const next = [customDish, ...userDishes.custom.filter((dish) => dish.id !== customDish.id)];
  saveUserDishes({ ...userDishes, custom: next });
  writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, next);
  return customDish;
}

export function getCustomDishById(id) {
  return readUserDishes().custom.find((dish) => dish.id === id) || null;
}

export function updateCustomDish(id, patch = {}) {
  const userDishes = readUserDishes();
  const customDishes = userDishes.custom;
  const existing = customDishes.find((dish) => dish.id === id);
  if (!existing) return null;

  const updatedDish = buildCustomDish({ ...existing, ...patch }, id);
  const next = customDishes.map((dish) => (dish.id === id ? updatedDish : dish));
  saveUserDishes({ ...userDishes, custom: next });
  writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, next);
  return updatedDish;
}

export function deleteCustomDish(id) {
  const userDishes = readUserDishes();
  const customDishes = userDishes.custom;
  const next = customDishes.filter((dish) => dish.id !== id);
  if (next.length === customDishes.length) return false;
  saveUserDishes({ ...userDishes, custom: next });
  writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, next);
  return true;
}

export function getDishById(id) {
  return getAllDishes().find((dish) => dish.id === id) || null;
}

export function getManageableDishes() {
  return getAllDishes();
}

export function hasRemovedDefaultDishes() {
  return readUserDishes().hidden.length > 0;
}

export function updateDish(id, patch = {}) {
  const userDishes = readUserDishes();
  const customDish = userDishes.custom.find((dish) => dish.id === id);
  if (customDish) return updateCustomDish(id, patch);

  const baseDish = dishes.find((dish) => dish.id === id);
  if (!baseDish) return null;

  const updatedDish = buildUserDish({ ...baseDish, ...userDishes.overrides[id], ...patch }, id, false);
  const hidden = userDishes.hidden.filter((hiddenId) => hiddenId !== id);
  saveUserDishes({
    ...userDishes,
    overrides: {
      ...userDishes.overrides,
      [id]: updatedDish,
    },
    hidden,
  });
  return updatedDish;
}

export function deleteDish(id) {
  if (deleteCustomDish(id)) return true;

  const userDishes = readUserDishes();
  const baseDish = dishes.find((dish) => dish.id === id);
  if (!baseDish || userDishes.hidden.includes(id)) return false;

  saveUserDishes({
    ...userDishes,
    hidden: [...userDishes.hidden, id],
  });
  return true;
}

export function restoreDishDefaults(id) {
  const baseDish = dishes.find((dish) => dish.id === id);
  if (!baseDish) return null;

  const userDishes = readUserDishes();
  const overrides = { ...userDishes.overrides };
  delete overrides[id];
  saveUserDishes({
    ...userDishes,
    overrides,
    hidden: userDishes.hidden.filter((hiddenId) => hiddenId !== id),
  });
  return baseDish;
}

function getAllDishes() {
  const userDishes = readUserDishes();
  const hidden = new Set(userDishes.hidden);
  const defaults = dishes
    .filter((dish) => !hidden.has(dish.id))
    .map((dish) => ({
      ...enrichBuiltInDish(dish),
      ...userDishes.overrides[dish.id],
      id: dish.id,
      category: normalizeDishCategory((userDishes.overrides[dish.id] || dish).category),
      isCustom: false,
    }));
  return [
    ...defaults,
    ...userDishes.custom.map((dish) => ({ ...dish, category: normalizeDishCategory(dish.category) })),
  ];
}

export function readAllDishes() {
  return getAllDishes();
}

function getTagText(dish) {
  return dish.tags.slice(0, 2);
}

export function toGoodsCard(dish, quantity = 1) {
  return {
    uid: `dish-${dish.id}`,
    saasId: 'family',
    storeId: STORE_ID,
    storeName: STORE_NAME,
    spuId: dish.id,
    skuId: `${dish.id}-default`,
    dishId: dish.id,
    isSelected: 1,
    thumb: dish.image || DEFAULT_IMAGE,
    title: dish.name,
    primaryImage: dish.image || DEFAULT_IMAGE,
    quantity,
    stockStatus: true,
    stockQuantity: 99,
    price: String(Math.max(dish.cookMinutes, 1) * 100),
    originPrice: String(Math.max(dish.cookMinutes, 1) * 100),
    minSalePrice: String(Math.max(dish.cookMinutes, 1) * 100),
    maxLinePrice: String(Math.max(dish.cookMinutes, 1) * 100),
    tagPrice: null,
    titlePrefixTags: getTagText(dish).map((text) => ({ text })),
    tags: getTagText(dish),
    roomId: null,
    specInfo: [
      { specTitle: '耗时', specValue: `${dish.cookMinutes} 分钟` },
      { specTitle: '口味', specValue: dish.flavor },
      { specTitle: '难度', specValue: dish.difficulty },
    ],
    cookMinutes: dish.cookMinutes,
    difficulty: dish.difficulty,
    flavor: dish.flavor,
    servings: dish.servings,
    notes: dish.notes,
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
    steps: Array.isArray(dish.steps) ? dish.steps : [],
    isCustom: !!dish.isCustom,
    available: 1,
    putOnSale: 1,
  };
}

export function getDishCategories() {
  return getDishCategoryOptions().map((category) => ({
    groupId: category.id,
    name: category.name,
    thumbnail: DEFAULT_IMAGE,
    description: category.description,
    children: [
      {
        groupId: category.id,
        name: category.name,
        thumbnail: DEFAULT_IMAGE,
        children: getAllDishes()
          .filter((dish) => dish.category === category.id || (category.id === 'quick' && dish.tags.includes('快手')))
          .map((dish) => ({
            groupId: category.id,
            dishId: dish.id,
            name: dish.name,
            thumbnail: dish.image || DEFAULT_IMAGE,
          })),
      },
    ],
  }));
}

export function getDishesByCategory(categoryId) {
  const allDishes = getAllDishes();
  if (!categoryId || categoryId === 'all') return allDishes;
  if (categoryId === 'quick') {
    return allDishes.filter((dish) => dish.category === 'quick' || dish.tags.includes('快手'));
  }
  // 「其他」兜底:本就归其他的，以及分组被删后无处可去的孤儿菜
  if (categoryId === OTHER_CATEGORY_ID) {
    const activeIds = new Set(
      getDishCategoryOptions()
        .filter((category) => category.id !== OTHER_CATEGORY_ID)
        .map((category) => category.id),
    );
    return allDishes.filter((dish) => dish.category === OTHER_CATEGORY_ID || !activeIds.has(dish.category));
  }
  return allDishes.filter((dish) => dish.category === categoryId);
}

export function getDishGoodsList({ categoryId = 'all', pageNum = 1, pageSize = 20 } = {}) {
  const source = getDishesByCategory(categoryId);
  const start = Math.max(pageNum - 1, 0) * pageSize;
  const page = source.slice(start, start + pageSize).map((dish) => toGoodsCard(dish));
  return {
    spuList: page,
    totalCount: source.length,
  };
}

export function getDishSelectionSections() {
  return getDishCategoryOptions().map((category) => {
    const dishesInCategory = getDishesByCategory(category.id);
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      count: dishesInCategory.length,
      goodsList: dishesInCategory.map((dish) => toGoodsCard(dish)),
    };
  });
}

// 按关键字搜菜:菜名 / 口味 / 难度 / 标签 / 食材 任一命中即返回,结果是 goods 卡片(和分类列表同结构)
export function searchDishes(keyword) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return [];
  return getAllDishes()
    .filter((dish) => {
      const fields = [dish.name, dish.flavor, dish.difficulty]
        .concat(Array.isArray(dish.tags) ? dish.tags : [])
        .concat(Array.isArray(dish.ingredients) ? dish.ingredients : []);
      return fields.join(' ').toLowerCase().includes(kw);
    })
    .map((dish) => toGoodsCard(dish));
}

function normalizeRecommendationCount(count, sourceLength) {
  const parsed = Math.floor(Number(count) || 3);
  return Math.max(1, Math.min(parsed, sourceLength || 1));
}

function createSeededRandom(seed) {
  let state = Math.abs(Math.floor(Number(seed) || 0)) % 2147483647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function shuffleDishes(source, seed) {
  const random = createSeededRandom(seed);
  const result = [...source];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isMeatLikeDish(dish) {
  return dish.category === 'meat' || dish.tags.includes('荤菜') || dish.tags.includes('高蛋白');
}

function isVegetableLikeDish(dish) {
  return dish.category === 'vegetable' || dish.tags.includes('素菜') || dish.tags.includes('清淡');
}

// 算「像不像」时忽略的调料/辅料,避免两道菜因为都放葱姜蒜盐就被判为撞菜
const SEASONING_INGREDIENTS = [
  '盐', '糖', '油', '酱油', '生抽', '老抽', '蚝油', '料酒', '醋', '香油', '香菜',
  '葱', '姜', '蒜', '淀粉', '水', '清水', '味精', '鸡精', '胡椒', '花椒', '八角', '香叶',
];

function mainIngredients(dish) {
  const list = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  return list.filter((name) => !SEASONING_INGREDIENTS.some((seasoning) => String(name).includes(seasoning)));
}

// 把菜归到一个「类型」上做多样性判断:汤 / 主食 / 荤 / 素 / 其他
function dishFoodType(dish) {
  const tags = Array.isArray(dish.tags) ? dish.tags : [];
  if (dish.category === 'soup' || tags.includes('汤')) return 'soup';
  if (dish.category === 'staple' || tags.includes('主食')) return 'staple';
  if (isMeatLikeDish(dish)) return 'meat';
  if (isVegetableLikeDish(dish)) return 'veg';
  return 'other';
}

function sharesMainIngredient(dish, picked) {
  const mine = mainIngredients(dish);
  if (!mine.length) return false;
  return picked.some((other) => {
    const theirs = mainIngredients(other);
    return mine.some((name) => theirs.includes(name));
  });
}

// 多样性打分:类型没和已选撞 +2,主食材没撞 +1。分越高越优先被选。
function diversityScore(dish, picked) {
  const typeUsed = picked.some((other) => dishFoodType(other) === dishFoodType(dish));
  const ingredientClash = sharesMainIngredient(dish, picked);
  return (typeUsed ? 0 : 2) + (ingredientClash ? 0 : 1);
}

function pushDish(picked, pickedIds, dish) {
  if (!dish || pickedIds.has(dish.id)) return false;
  picked.push(dish);
  pickedIds.add(dish.id);
  return true;
}

// 按「类型不撞 + 食材不撞」贪心填满剩余空位;实在凑不齐时也会退而求其次填满
function diverseFill(shuffled, picked, pickedIds, targetCount) {
  while (picked.length < targetCount) {
    let best = null;
    let bestScore = -1;
    shuffled.forEach((dish) => {
      if (pickedIds.has(dish.id)) return;
      const score = diversityScore(dish, picked);
      if (score > bestScore) {
        best = dish;
        bestScore = score;
      }
    });
    if (!pushDish(picked, pickedIds, best)) break;
  }
}

// seed:随机种子;count:几道菜;lockedDishes:用户锁定要保留的菜(换一餐时不动它们)
function pickRandomDinnerDishes(seed, count, lockedDishes = []) {
  const source = getAllDishes();
  if (!source.length) return [];
  const targetCount = normalizeRecommendationCount(count, source.length);
  const shuffled = shuffleDishes(source, seed);
  const byId = new Map(source.map((dish) => [dish.id, dish]));
  const picked = [];
  const pickedIds = new Set();

  // 1) 先放锁定的菜(去重、按上限截断、确认仍在菜库里),它们始终保留在结果靠前
  (Array.isArray(lockedDishes) ? lockedDishes : []).forEach((locked) => {
    if (picked.length >= targetCount) return;
    pushDish(picked, pickedIds, locked && byId.get(locked.id));
  });

  // 2) 其余空位按多样性贪心填满:类型(荤/素/汤/主食)不撞 + 主食材不撞优先,
  //    这样两道菜不会同是「汤」或同是「番茄」,自然也就荤素/品类错开了
  diverseFill(shuffled, picked, pickedIds, targetCount);
  return picked;
}

export function buildDinnerRecommendation(seed = Date.now(), count = 3, lockedDishes = []) {
  const offset = Math.abs(Number(seed) || 0);
  const picked = pickRandomDinnerDishes(offset, count, lockedDishes);
  const totalCookMinutes = picked.reduce((sum, dish) => sum + dish.cookMinutes, 0);
  return {
    id: `recommendation-${offset}`,
    title: totalCookMinutes <= 45 ? '省心快手搭配' : '认真吃饭搭配',
    dishes: picked,
    goods: picked.map((dish) => toGoodsCard(dish)),
    totalCookMinutes,
    tags: ['荤素搭配', totalCookMinutes <= 45 ? '不太费时间' : '适合慢慢做'],
  };
}

function getRecommendationSignature(recommendation) {
  if (!recommendation || !Array.isArray(recommendation.dishes)) return '';
  return recommendation.dishes.map((dish) => dish.id).join(',');
}

export function buildDifferentDinnerRecommendation(
  currentRecommendation,
  seed = Date.now(),
  count = currentRecommendation?.dishes?.length || 3,
  lockedDishes = [],
) {
  const currentSignature = getRecommendationSignature(currentRecommendation);
  for (let step = 0; step < 12; step += 1) {
    const recommendation = buildDinnerRecommendation(seed + step, count, lockedDishes);
    if (getRecommendationSignature(recommendation) !== currentSignature) return recommendation;
  }
  return buildDinnerRecommendation(seed, count, lockedDishes);
}

export function readTonightMenu() {
  const wxApi = typeof wx !== 'undefined' ? wx : null;
  if (!wxApi || !wxApi.getStorageSync) return [];
  const stored = wxApi.getStorageSync(MENU_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveTonightMenu(menu) {
  const wxApi = typeof wx !== 'undefined' ? wx : null;
  if (!wxApi || !wxApi.setStorageSync) return menu;
  wxApi.setStorageSync(MENU_STORAGE_KEY, JSON.stringify(menu));
  return menu;
}

export function readLastConfirmedMenu() {
  const stored = readStorageValue(LAST_CONFIRMED_MENU_STORAGE_KEY, null);
  return stored && Array.isArray(stored.goodsList) ? stored : null;
}

export function readMenuHistory() {
  const stored = readStorageValue(MENU_HISTORY_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((entry) => entry && Array.isArray(entry.goodsList))
    .sort((left, right) => (right.confirmedAt || 0) - (left.confirmedAt || 0))
    .slice(0, MAX_MENU_HISTORY_COUNT);
}

export function saveConfirmedMenu({ confirmedAt = Date.now(), goodsList = [], summary = {}, note = '' }) {
  const confirmedMenu = {
    id: `menu-${confirmedAt}`,
    confirmedAt,
    goodsList,
    summary,
    note,
  };
  const nextHistory = [confirmedMenu, ...readMenuHistory().filter((entry) => entry.id !== confirmedMenu.id)]
    .sort((left, right) => (right.confirmedAt || 0) - (left.confirmedAt || 0))
    .slice(0, MAX_MENU_HISTORY_COUNT);

  writeStorageValue(LAST_CONFIRMED_MENU_STORAGE_KEY, confirmedMenu);
  writeStorageValue(MENU_HISTORY_STORAGE_KEY, nextHistory);
  writeStorageValue(MENU_STORAGE_KEY, []);
  clearShoppingBasketChecked();
  return confirmedMenu;
}

export function reuseMenuHistoryEntry(historyId) {
  const historyEntry = readMenuHistory().find((entry) => entry.id === historyId);
  if (!historyEntry) return [];
  const nextMenu = historyEntry.goodsList.map((goods) => ({
    ...goods,
    quantity: Math.max(Number(goods.quantity) || 1, 1),
    isSelected: 1,
  }));
  clearShoppingBasketChecked();
  return saveTonightMenu(nextMenu);
}

export function addDishesToTonightMenu(goodsList, options = {}) {
  const incrementExisting = options.incrementExisting !== false;
  const current = readTonightMenu();
  const next = [...current];
  goodsList.forEach((goods) => {
    const existing = next.find((item) => item.spuId === goods.spuId && item.skuId === goods.skuId);
    if (existing) {
      if (incrementExisting) {
        existing.quantity += goods.quantity || 1;
      }
      existing.isSelected = 1;
      if (goods.selectedBy) existing.selectedBy = goods.selectedBy;
      if (goods.selectedByName) existing.selectedByName = goods.selectedByName;
      return;
    }
    next.push({ ...goods, quantity: goods.quantity || 1, isSelected: 1 });
  });
  return saveTonightMenu(next);
}

export function updateTonightMenuItem(spuId, skuId, patch) {
  const next = readTonightMenu().map((item) => {
    if (item.spuId === spuId && item.skuId === skuId) {
      return { ...item, ...patch };
    }
    return item;
  });
  return saveTonightMenu(next);
}

export function removeTonightMenuItem(spuId, skuId) {
  const next = readTonightMenu().filter((item) => item.spuId !== spuId || item.skuId !== skuId);
  return saveTonightMenu(next);
}

function normalizeIngredientName(name) {
  return String(name || '').trim();
}

function getShoppingBasketItemId(name) {
  return normalizeIngredientName(name).toLowerCase();
}

export function readShoppingBasketChecked() {
  const stored = readStorageValue(SHOPPING_BASKET_CHECKED_KEY, []);
  if (!Array.isArray(stored)) return [];
  return [...new Set(stored.map(String).filter(Boolean))];
}

function saveShoppingBasketChecked(checkedIds) {
  return writeStorageValue(SHOPPING_BASKET_CHECKED_KEY, [...new Set((checkedIds || []).map(String).filter(Boolean))]);
}

export function toggleShoppingBasketItem(id, checked) {
  const checkedSet = new Set(readShoppingBasketChecked());
  if (checked) {
    checkedSet.add(String(id));
  } else {
    checkedSet.delete(String(id));
  }
  return saveShoppingBasketChecked([...checkedSet]);
}

export function clearShoppingBasketChecked() {
  return saveShoppingBasketChecked([]);
}

// 食材关键词归类(顺序敏感:调料先于肉蛋先于蔬菜，避免「番茄酱→蔬菜」「蒸鱼豉油→肉」之类误判)
const INGREDIENT_CATEGORY_RULES = [
  {
    key: 'seasoning',
    keywords: ['盐', '糖', '酱', '油', '醋', '抽', '料酒', '淀粉', '豆瓣', '蚝', '豉', '味精', '鸡精', '胡椒', '花椒', '孜然', '蜂蜜', '芝麻'],
  },
  {
    key: 'meat',
    keywords: ['牛肉', '猪肉', '羊肉', '排骨', '鸡', '鸭', '鹅', '鱼', '虾', '蟹', '肉', '蛋', '培根', '香肠', '腊', '豆腐', '豆干', '腐竹'],
  },
  {
    key: 'veg',
    keywords: ['菜', '番茄', '茄', '椒', '瓜', '菇', '菌', '葱', '蒜', '姜', '萝卜', '豆角', '豆芽', '玉米', '紫菜', '海带', '木耳', '笋', '藕', '芹', '菠', '韭', '蘑', '洋葱', '土豆', '山药', '莲', '豆'],
  },
  { key: 'staple', keywords: ['米', '面', '馒头', '饺', '粉', '年糕', '饭', '馍', '粥', '麦'] },
];

const SHOPPING_CATEGORIES = [
  { key: 'veg', label: '蔬菜', icon: '🥬' },
  { key: 'meat', label: '肉蛋', icon: '🥩' },
  { key: 'staple', label: '主食', icon: '🍚' },
  { key: 'seasoning', label: '调料', icon: '🧂' },
  { key: 'other', label: '其他', icon: '🛒' },
];

// 内置菜库食材的权威品类(逐个核对过，准；用户新加的生僻食材走下面的关键词兜底)
const INGREDIENT_CATEGORY = {
  葱: 'veg',
  葱花: 'veg',
  番茄: 'veg',
  胡萝卜: 'veg',
  姜: 'veg',
  姜片: 'veg',
  青菜: 'veg',
  青椒: 'veg',
  生菜: 'veg',
  蒜: 'veg',
  香菇: 'veg',
  玉米: 'veg',
  紫菜: 'veg',
  豆腐: 'meat',
  鸡蛋: 'meat',
  牛肉: 'meat',
  排骨: 'meat',
  肉末: 'meat',
  肉片: 'meat',
  鱼: 'meat',
  丸子: 'meat',
  面条: 'staple',
  剩米饭: 'staple',
  烧腊饭: 'staple',
  主食: 'staple',
  淀粉: 'seasoning',
  淀粉水: 'seasoning',
  豆瓣酱: 'seasoning',
  蚝油: 'seasoning',
  热油: 'seasoning',
  生抽: 'seasoning',
  糖: 'seasoning',
  香油: 'seasoning',
  盐: 'seasoning',
  蒸鱼豉油: 'seasoning',
  火锅底料: 'seasoning',
  汤品: 'other',
};

export function categorizeIngredient(name) {
  const clean = normalizeIngredientName(name);
  if (INGREDIENT_CATEGORY[clean]) return INGREDIENT_CATEGORY[clean];
  const matched = INGREDIENT_CATEGORY_RULES.find((rule) => rule.keywords.some((kw) => clean.includes(kw)));
  return matched ? matched.key : 'other';
}

export function buildShoppingBasket(menu = readTonightMenu()) {
  const checkedSet = new Set(readShoppingBasketChecked());
  const grouped = new Map();

  menu.forEach((goods) => {
    const dish = getDishById(goods.dishId || goods.spuId);
    if (!dish || !Array.isArray(dish.ingredients)) return;

    dish.ingredients.forEach((ingredient) => {
      const name = normalizeIngredientName(ingredient);
      if (!name) return;
      const id = getShoppingBasketItemId(name);
      const current = grouped.get(id) || {
        id,
        name,
        count: 0,
        dishes: [],
        checked: checkedSet.has(id),
      };
      current.count += Math.max(Number(goods.quantity) || 1, 1);
      if (!current.dishes.includes(dish.name)) current.dishes.push(dish.name);
      grouped.set(id, current);
    });
  });

  const items = [...grouped.values()]
    .map((item) => ({ ...item, category: categorizeIngredient(item.name) }))
    .sort((left, right) => {
      if (left.checked !== right.checked) return left.checked ? 1 : -1;
      return left.name.localeCompare(right.name, 'zh-Hans-CN');
    });

  const groups = SHOPPING_CATEGORIES.map((category) => {
    const groupItems = items.filter((item) => item.category === category.key);
    return {
      ...category,
      items: groupItems,
      totalCount: groupItems.length,
      checkedCount: groupItems.filter((item) => item.checked).length,
    };
  }).filter((group) => group.items.length);

  return {
    items,
    groups,
    checkedCount: items.filter((item) => item.checked).length,
    totalIngredientCount: items.length,
    totalDishCount: menu.length,
  };
}

// 生成可复制/分享的买菜清单文本(按品类分行，发给买菜的人一目了然)
export function buildShoppingListText(basket = buildShoppingBasket()) {
  if (!basket || !basket.totalIngredientCount) return '菜篮子还是空的，先去选几道菜~';
  const lines = [`🛒 买菜清单（${basket.totalDishCount} 道菜 · ${basket.totalIngredientCount} 样）`];
  basket.groups.forEach((group) => {
    lines.push(`【${group.label}】${group.items.map((item) => item.name).join('、')}`);
  });
  return lines.join('\n');
}

export function buildCartGroupData(menu = readTonightMenu()) {
  // 用当前菜库的图刷新封面:菜单项里的 thumb 是「加菜那一刻」存的，
  // 之后给菜换了图(如补了真实照片)旧菜单项不会自动更新，这里按 spuId 兜底刷新。
  const freshMenu = menu.map((item) => {
    const dish = getDishById(item.dishId || item.spuId);
    // 统一的「谁的菜」:点菜页选的成员(selectedByName)优先,否则用服务端盖的添加者(addedByName)。
    // 头像只在用添加者兜底时显示(成员名没有配套头像,避免名字和头像对不上)。
    const pickerName = item.selectedByName || item.addedByName || '';
    const pickerAvatar = item.selectedByName ? '' : item.addedByAvatar || '';
    const withImage = dish && dish.image ? { ...item, thumb: dish.image, primaryImage: dish.image } : { ...item };
    return { ...withImage, pickerName, pickerAvatar };
  });
  const selectedGoods = freshMenu.filter((item) => item.isSelected);
  const totalCookMinutes = selectedGoods.reduce((sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1), 0);
  return {
    data: {
      isNotEmpty: freshMenu.length > 0,
      isAllSelected: freshMenu.length > 0 && selectedGoods.length === freshMenu.length,
      selectedGoodsCount: selectedGoods.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalAmount: totalCookMinutes * 100,
      totalDiscountAmount: 0,
      totalCookMinutes,
      storeGoods: [
        {
          storeId: STORE_ID,
          storeName: STORE_NAME,
          storeStatus: 1,
          isSelected: freshMenu.length > 0 && selectedGoods.length === freshMenu.length,
          storeStockShortage: false,
          shortageGoodsList: [],
          promotionGoodsList: [
            {
              title: '',
              promotionCode: 'EMPTY_PROMOTION',
              promotionSubCode: '',
              promotionId: null,
              tagText: '',
              promotionStatus: null,
              tag: '',
              description: '',
              doorSillRemain: null,
              isNeedAddOnShop: 0,
              goodsPromotionList: freshMenu,
            },
          ],
        },
      ],
      invalidGoodItems: [],
    },
  };
}

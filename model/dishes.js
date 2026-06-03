const STORE_ID = 'family-kitchen';
const STORE_NAME = '家庭厨房';
const DEFAULT_IMAGE = '/assets/dishes/default.svg';
const DISH_PLACEHOLDER_IMAGES = {
  quick: '/assets/dishes/quick.svg',
  meat: '/assets/dishes/meat.svg',
  vegetable: '/assets/dishes/vegetable.svg',
  soup: '/assets/dishes/soup.svg',
  staple: '/assets/dishes/staple.svg',
  takeout: '/assets/dishes/takeout.svg',
};
const MENU_STORAGE_KEY = 'familyMenuPicker.tonightMenu';
const LAST_CONFIRMED_MENU_STORAGE_KEY = 'familyMenuPicker.lastConfirmedMenu';
const MENU_HISTORY_STORAGE_KEY = 'familyMenuPicker.menuHistory';
const CUSTOM_DISHES_STORAGE_KEY = 'familyMenuPicker.customDishes';
const USER_DISHES_STORAGE_KEY = 'familyMenuPicker.userDishes';
const MAX_MENU_HISTORY_COUNT = 20;

export const dishCategories = [
  { id: 'quick', name: '快手菜', description: '30 分钟内能上桌' },
  { id: 'meat', name: '荤菜', description: '肉蛋鱼虾和高蛋白' },
  { id: 'vegetable', name: '素菜', description: '清爽蔬菜和豆制品' },
  { id: 'soup', name: '汤', description: '补水暖胃' },
  { id: 'staple', name: '主食', description: '米饭面粉类' },
  { id: 'takeout', name: '外卖备选', description: '不想做饭时兜底' },
];

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
    notes: '家里常备菜，适合选择困难时兜底。',
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
  {
    id: 'takeout-rice',
    name: '附近烧腊饭',
    category: 'takeout',
    image: getDishPlaceholderImage('takeout'),
    cookMinutes: 5,
    difficulty: '外卖',
    flavor: '咸香',
    servings: 1,
    tags: ['外卖备选', '省事', '单人'],
    ingredients: ['烧腊饭', '青菜', '汤品'],
    steps: [
      { title: '确认人数', description: '按实际人数决定份数，避免点多浪费。' },
      { title: '补一份蔬菜', description: '如果店里有青菜或例汤，优先搭配。' },
      { title: '到家分餐', description: '到家后先分装，保留明天能复热的部分。' },
    ],
    notes: '只作为今天不想做饭的备选。',
  },
  {
    id: 'hotpot-kit',
    name: '家庭小火锅',
    category: 'takeout',
    image: getDishPlaceholderImage('takeout'),
    cookMinutes: 20,
    difficulty: '简单',
    flavor: '热辣',
    servings: 4,
    tags: ['外卖备选', '聚餐', '可加菜'],
    ingredients: ['火锅底料', '肉片', '丸子', '青菜', '主食'],
    steps: [
      { title: '准备锅底', description: '底料加水煮开，按口味调咸淡。' },
      { title: '先下耐煮食材', description: '丸子、根茎类和冻品先下锅。' },
      { title: '再下鲜菜肉片', description: '肉片和绿叶菜最后下，熟了就吃。' },
      { title: '收尾主食', description: '最后可下粉面或米饭，避免一开始太撑。' },
    ],
    notes: '适合人多但没人想决定吃什么的时候。',
  },
];

export const defaultDishIds = dishes.map((dish) => dish.id);

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

function parseIngredients(ingredientsText) {
  if (!ingredientsText) return [];
  if (Array.isArray(ingredientsText)) return ingredientsText.map((ingredient) => String(ingredient).trim()).filter(Boolean);
  return String(ingredientsText)
    .split(/[,，\n]/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

function parseSteps(stepsText) {
  if (!stepsText) return [];
  if (Array.isArray(stepsText)) {
    return stepsText
      .map((step, index) => {
        if (typeof step === 'string') {
          const text = step.trim();
          return text ? { title: text, description: text } : null;
        }
        if (!step || typeof step !== 'object') return null;
        const title = String(step.title || step.description || `第 ${index + 1} 步`).trim();
        const description = String(step.description || step.title || '').trim();
        return title && description ? { title, description } : null;
      })
      .filter(Boolean);
  }
  return String(stepsText)
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => ({ title: step, description: step }));
}

function getPayloadTags(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'tagsText') ? payload.tagsText : payload.tags;
}

function getPayloadIngredients(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'ingredientsText') ? payload.ingredientsText : payload.ingredients;
}

function getPayloadSteps(payload) {
  return Object.prototype.hasOwnProperty.call(payload, 'stepsText') ? payload.stepsText : payload.steps;
}

function buildCustomDish(payload = {}, id = `custom-${Date.now()}`) {
  const { category } = payload;
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
    steps: parseSteps(getPayloadSteps(payload)),
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

function readHiddenDishIds() {
  const legacyHiddenDishIds = readStorageValue('familyMenuPicker.hiddenDishIds', []);
  if (Array.isArray(legacyHiddenDishIds)) return legacyHiddenDishIds.map(String).filter(Boolean);
  return [];
}

export function readUserDishes() {
  const stored = readStorageValue(USER_DISHES_STORAGE_KEY, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    const custom = Array.isArray(stored.custom) ? stored.custom.map(normalizeCustomDish).filter(Boolean) : [];
    const overrides =
      stored.overrides && typeof stored.overrides === 'object'
        ? Object.entries(stored.overrides).reduce((result, [id, dish]) => {
            const normalizedDish = normalizeDishOverride({ ...dish, id });
            if (normalizedDish) result[id] = normalizedDish;
            return result;
          }, {})
        : {};
    const hidden = Array.isArray(stored.hidden) ? stored.hidden.map(String).filter(Boolean) : [];
    return { custom, overrides, hidden };
  }

  return {
    custom: readCustomDishes(),
    overrides: {},
    hidden: readHiddenDishIds(),
  };
}

export function saveUserDishes(userDishes = {}) {
  return writeStorageValue(USER_DISHES_STORAGE_KEY, {
    custom: Array.isArray(userDishes.custom) ? userDishes.custom : [],
    overrides: userDishes.overrides && typeof userDishes.overrides === 'object' ? userDishes.overrides : {},
    hidden: Array.isArray(userDishes.hidden) ? userDishes.hidden : [],
  });
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
    .map((dish) => ({ ...dish, ...userDishes.overrides[dish.id], id: dish.id, isCustom: false }));
  return [...defaults, ...userDishes.custom];
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
  return dishCategories.map((category) => ({
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
  return dishCategories.map((category) => {
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

function pickByCategory(categoryId, offset = 0) {
  const source = getDishesByCategory(categoryId);
  if (!source.length) return getAllDishes()[offset % getAllDishes().length];
  return source[offset % source.length];
}

export function buildDinnerRecommendation(seed = Date.now()) {
  const offset = Math.abs(Number(seed) || 0);
  const picked = [
    pickByCategory('meat', offset),
    pickByCategory('vegetable', offset + 1),
    offset % 2 === 0 ? pickByCategory('soup', offset + 2) : pickByCategory('staple', offset + 2),
  ];
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
  return saveTonightMenu(nextMenu);
}

export function addDishesToTonightMenu(goodsList) {
  const current = readTonightMenu();
  const next = [...current];
  goodsList.forEach((goods) => {
    const existing = next.find((item) => item.spuId === goods.spuId && item.skuId === goods.skuId);
    if (existing) {
      existing.quantity += goods.quantity || 1;
      existing.isSelected = 1;
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

export function buildCartGroupData(menu = readTonightMenu()) {
  const selectedGoods = menu.filter((item) => item.isSelected);
  const totalCookMinutes = selectedGoods.reduce((sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1), 0);
  return {
    data: {
      isNotEmpty: menu.length > 0,
      isAllSelected: menu.length > 0 && selectedGoods.length === menu.length,
      selectedGoodsCount: selectedGoods.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalAmount: totalCookMinutes * 100,
      totalDiscountAmount: 0,
      totalCookMinutes,
      storeGoods: [
        {
          storeId: STORE_ID,
          storeName: STORE_NAME,
          storeStatus: 1,
          isSelected: menu.length > 0 && selectedGoods.length === menu.length,
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
              goodsPromotionList: menu,
            },
          ],
        },
      ],
      invalidGoodItems: [],
    },
  };
}

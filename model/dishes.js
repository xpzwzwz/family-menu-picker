const STORE_ID = 'family-kitchen';
const STORE_NAME = '家庭厨房';
const DEFAULT_IMAGE = 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png';
const MENU_STORAGE_KEY = 'familyMenuPicker.tonightMenu';
const LAST_CONFIRMED_MENU_STORAGE_KEY = 'familyMenuPicker.lastConfirmedMenu';
const MENU_HISTORY_STORAGE_KEY = 'familyMenuPicker.menuHistory';
const CUSTOM_DISHES_STORAGE_KEY = 'familyMenuPicker.customDishes';
const MAX_MENU_HISTORY_COUNT = 20;

export const dishCategories = [
  { id: 'quick', name: '快手菜', description: '30 分钟内能上桌' },
  { id: 'meat', name: '荤菜', description: '肉蛋鱼虾和高蛋白' },
  { id: 'vegetable', name: '素菜', description: '清爽蔬菜和豆制品' },
  { id: 'soup', name: '汤', description: '补水暖胃' },
  { id: 'staple', name: '主食', description: '米饭面粉类' },
  { id: 'takeout', name: '外卖备选', description: '不想做饭时兜底' },
];

export const dishes = [
  {
    id: 'tomato-egg',
    name: '番茄炒蛋',
    category: 'quick',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
    cookMinutes: 12,
    difficulty: '简单',
    flavor: '酸甜',
    servings: 3,
    tags: ['快手', '下饭', '小朋友友好', '素菜'],
    notes: '家里常备菜，适合选择困难时兜底。',
  },
  {
    id: 'pepper-beef',
    name: '青椒牛肉',
    category: 'meat',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3a.png',
    cookMinutes: 25,
    difficulty: '中等',
    flavor: '咸香',
    servings: 3,
    tags: ['荤菜', '下饭', '高蛋白'],
    notes: '牛肉提前腌 10 分钟，口感更稳。',
  },
  {
    id: 'garlic-lettuce',
    name: '蒜蓉生菜',
    category: 'vegetable',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png',
    cookMinutes: 8,
    difficulty: '简单',
    flavor: '清爽',
    servings: 3,
    tags: ['素菜', '快手', '清淡'],
    notes: '适合搭配重口味荤菜。',
  },
  {
    id: 'corn-rib-soup',
    name: '玉米排骨汤',
    category: 'soup',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3b.png',
    cookMinutes: 50,
    difficulty: '中等',
    flavor: '鲜甜',
    servings: 4,
    tags: ['汤', '可提前炖', '荤菜'],
    notes: '时间紧时可换成紫菜蛋花汤。',
  },
  {
    id: 'egg-fried-rice',
    name: '鸡蛋炒饭',
    category: 'staple',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
    cookMinutes: 15,
    difficulty: '简单',
    flavor: '咸香',
    servings: 2,
    tags: ['主食', '快手', '剩饭友好'],
    notes: '适合不想煮饭的时候。',
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐',
    category: 'quick',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/mz-20a1.png',
    cookMinutes: 18,
    difficulty: '简单',
    flavor: '微辣',
    servings: 3,
    tags: ['快手', '下饭', '豆制品'],
    notes: '不能吃辣时减少豆瓣酱。',
  },
  {
    id: 'steamed-fish',
    name: '清蒸鱼',
    category: 'meat',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2a.png',
    cookMinutes: 22,
    difficulty: '中等',
    flavor: '鲜香',
    servings: 3,
    tags: ['荤菜', '清淡', '高蛋白'],
    notes: '适合想吃清淡但又要有主菜的晚上。',
  },
  {
    id: 'mushroom-greens',
    name: '香菇青菜',
    category: 'vegetable',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17a.png',
    cookMinutes: 12,
    difficulty: '简单',
    flavor: '鲜香',
    servings: 3,
    tags: ['素菜', '清淡', '快手'],
    notes: '和鱼、牛肉都好搭。',
  },
  {
    id: 'seaweed-egg-soup',
    name: '紫菜蛋花汤',
    category: 'soup',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
    cookMinutes: 8,
    difficulty: '简单',
    flavor: '清淡',
    servings: 3,
    tags: ['汤', '快手', '清淡'],
    notes: '最快的汤类兜底。',
  },
  {
    id: 'noodle-soup',
    name: '番茄鸡蛋面',
    category: 'staple',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08a.png',
    cookMinutes: 18,
    difficulty: '简单',
    flavor: '酸甜',
    servings: 2,
    tags: ['主食', '快手', '热乎'],
    notes: '适合懒得炒多个菜时。',
  },
  {
    id: 'takeout-rice',
    name: '附近烧腊饭',
    category: 'takeout',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/mz-11a1.png',
    cookMinutes: 5,
    difficulty: '外卖',
    flavor: '咸香',
    servings: 1,
    tags: ['外卖备选', '省事', '单人'],
    notes: '只作为今天不想做饭的备选。',
  },
  {
    id: 'hotpot-kit',
    name: '家庭小火锅',
    category: 'takeout',
    image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/mz-12b.png',
    cookMinutes: 20,
    difficulty: '简单',
    flavor: '热辣',
    servings: 4,
    tags: ['外卖备选', '聚餐', '可加菜'],
    notes: '适合人多但没人想决定吃什么的时候。',
  },
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

function parseTags(tagsText) {
  if (!tagsText) return [];
  if (Array.isArray(tagsText)) return tagsText.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tagsText)
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeCustomDish(dish) {
  if (!dish || !dish.id || !dish.name || !dish.category) return null;
  return {
    id: dish.id,
    name: String(dish.name).trim(),
    category: dish.category,
    image: dish.image || DEFAULT_IMAGE,
    cookMinutes: Math.max(Number(dish.cookMinutes) || 1, 1),
    difficulty: dish.difficulty || '简单',
    flavor: dish.flavor || '家常',
    servings: Number(dish.servings) || 3,
    tags: parseTags(dish.tags),
    notes: dish.notes || '',
    isCustom: true,
  };
}

export function readCustomDishes() {
  const stored = readStorageValue(CUSTOM_DISHES_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeCustomDish).filter(Boolean);
}

export function saveCustomDishes(customDishes) {
  return writeStorageValue(CUSTOM_DISHES_STORAGE_KEY, Array.isArray(customDishes) ? customDishes : []);
}

export function addCustomDish(payload = {}) {
  const timestamp = Date.now();
  const cookMinutes = Math.max(Number(payload.cookMinutes) || 0, 1);
  const customDish = {
    id: `custom-${timestamp}`,
    name: String(payload.name || '').trim(),
    category: payload.category,
    image: DEFAULT_IMAGE,
    cookMinutes,
    difficulty: payload.difficulty || '简单',
    flavor: String(payload.flavor || '').trim() || '家常',
    servings: Number(payload.servings) || 3,
    tags: parseTags(payload.tagsText || payload.tags),
    notes: String(payload.notes || '').trim(),
    isCustom: true,
  };
  const next = [customDish, ...readCustomDishes().filter((dish) => dish.id !== customDish.id)];
  saveCustomDishes(next);
  return customDish;
}

function getAllDishes() {
  return [...dishes, ...readCustomDishes()];
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
              title: null,
              promotionCode: 'FAMILY_MENU',
              promotionSubCode: null,
              promotionId: null,
              tagText: null,
              promotionStatus: null,
              tag: null,
              description: null,
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

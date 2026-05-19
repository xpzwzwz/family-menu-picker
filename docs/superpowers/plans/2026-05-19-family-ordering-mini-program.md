# Family Ordering Mini Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the TDesign retail starter into a first usable family meal picker with local dish data, dinner recommendations, tonight's menu, and final menu confirmation.

**Architecture:** Keep the native WeChat mini-program structure and reuse the existing mock-service pattern. Add a focused `model/dishes.js` domain module, then adapt home/category/cart/order-confirm pages to use dish/menu language while leaving unused retail routes in place but off the main path.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/WXSS, TDesign Mini Program components, local mock data, Node syntax checks.

---

### File Structure

- Create `model/dishes.js`: source of dish data, category data, retail-compatible transforms, recommendation logic, and menu persistence helpers.
- Modify `services/home/home.js`: return family homepage tabs and no retail promotion copy.
- Modify `services/good/fetchGoods.js`: return dish cards for the homepage.
- Modify `services/good/fetchGoodsList.js`: return paged dish lists for category browsing.
- Modify `services/good/fetchCategoryList.js`: return dish categories.
- Modify `services/cart/cart.js`: read tonight's menu from local storage through dish helpers.
- Modify `model/order/orderConfirm.js`: convert selected dishes into a no-payment confirmation summary.
- Modify `custom-tab-bar/data.js` and `app.json`: rename primary navigation.
- Modify `pages/home/home.*`: build the "今晚吃什么" recommendation homepage.
- Modify `pages/category/index.*`: show dish categories and jump to filtered dish lists.
- Modify `pages/goods/list/index.*`: browse dishes by category and add dishes to tonight's menu.
- Modify `pages/cart/index.*` and cart subcomponents: make cart language and totals fit "今晚菜单".
- Modify `pages/order/order-confirm/index.*`: confirm the final menu without address, coupons, shipping, payment, invoice, or logistics language.
- Modify `README.md`: document first-run flow for the family meal picker.

### Task 1: Dish Domain Model

**Files:**
- Create: `model/dishes.js`

- [ ] **Step 1: Write the failing syntax/import test**

Run:

```bash
node --input-type=module -e "import('./model/dishes.js').then((m) => { const set = m.buildDinnerRecommendation(0); if (!Array.isArray(set.dishes) || set.dishes.length !== 3) throw new Error('expected 3 recommended dishes'); if (!set.totalCookMinutes) throw new Error('expected total cook minutes'); if (!m.getDishCategories().some((item) => item.name === '荤菜')) throw new Error('expected meat category'); })"
```

Expected: FAIL with `Cannot find module` or missing export.

- [ ] **Step 2: Implement the domain module**

Create `model/dishes.js` with:

```js
const STORE_ID = 'family-kitchen';
const STORE_NAME = '家庭厨房';
const DEFAULT_IMAGE = 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png';
const MENU_STORAGE_KEY = 'familyMenuPicker.tonightMenu';

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

function getTagText(dish) {
  return dish.tags.slice(0, 2);
}

export function toGoodsCard(dish, quantity = 1) {
  const index = dishes.findIndex((item) => item.id === dish.id);
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
        children: dishes
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
  if (!categoryId || categoryId === 'all') return dishes;
  if (categoryId === 'quick') {
    return dishes.filter((dish) => dish.category === 'quick' || dish.tags.includes('快手'));
  }
  return dishes.filter((dish) => dish.category === categoryId);
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
  const next = readTonightMenu().map((item) =>
    item.spuId === spuId && item.skuId === skuId ? { ...item, ...patch } : item,
  );
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
```

- [ ] **Step 3: Run the module test**

Run:

```bash
node --input-type=module -e "import('./model/dishes.js').then((m) => { const set = m.buildDinnerRecommendation(0); if (!Array.isArray(set.dishes) || set.dishes.length !== 3) throw new Error('expected 3 recommended dishes'); if (!set.totalCookMinutes) throw new Error('expected total cook minutes'); if (!m.getDishCategories().some((item) => item.name === '荤菜')) throw new Error('expected meat category'); })"
```

Expected: PASS with no output.

- [ ] **Step 4: Commit**

```bash
git add model/dishes.js
git commit -m "feat: add family dish model"
```

### Task 2: Mock Services and Navigation Labels

**Files:**
- Modify: `services/home/home.js`
- Modify: `services/good/fetchGoods.js`
- Modify: `services/good/fetchGoodsList.js`
- Modify: `services/good/fetchCategoryList.js`
- Modify: `services/cart/cart.js`
- Modify: `model/order/orderConfirm.js`
- Modify: `custom-tab-bar/data.js`
- Modify: `app.json`

- [ ] **Step 1: Write the failing service test**

Run:

```bash
node --input-type=module -e "import('./services/good/fetchCategoryList.js').then(async (m) => { const list = await m.getCategoryList(); if (!list.some((item) => item.name === '快手菜')) throw new Error('expected dish categories'); })"
```

Expected: FAIL because the current categories are retail categories.

- [ ] **Step 2: Update home service**

Replace the `tabList` in `services/home/home.js` with:

```js
      tabList: [
        { text: '今晚推荐', key: 0 },
        { text: '快手菜', key: 1 },
        { text: '荤素搭配', key: 2 },
        { text: '外卖备选', key: 3 },
      ],
```

- [ ] **Step 3: Update goods services**

In `services/good/fetchGoods.js`, import `getDishGoodsList` and return dish card data:

```js
import { config } from '../../config/index';

function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getDishGoodsList } = require('../../model/dishes');
  return delay().then(() => {
    const pageNum = pageIndex <= 0 ? 1 : pageIndex;
    return getDishGoodsList({ pageNum, pageSize }).spuList.map((item) => ({
      spuId: item.spuId,
      thumb: item.primaryImage,
      title: item.title,
      price: item.price,
      originPrice: item.originPrice,
      tags: item.tags,
      cookMinutes: item.cookMinutes,
      difficulty: item.difficulty,
      flavor: item.flavor,
    }));
  });
}
```

In `services/good/fetchGoodsList.js`, call `getDishGoodsList(params)` and return its `{ spuList, totalCount }`.

- [ ] **Step 4: Update category service**

In `services/good/fetchCategoryList.js`, have the mock function require `../../model/dishes` and return `getDishCategories()`.

- [ ] **Step 5: Update cart service**

In `services/cart/cart.js`, have `mockFetchCartGroupData()` require `../../model/dishes` and return `buildCartGroupData()`.

- [ ] **Step 6: Update order confirmation model**

In `model/order/orderConfirm.js`, change the confirmation mock so:

```js
resp.data.settleType = 1;
resp.data.userAddress = { name: '家庭菜单', phone: '', address: '今晚在家吃' };
resp.data.invoiceSupport = 0;
resp.data.totalPromotionAmount = 0;
resp.data.totalDeliveryFee = 0;
resp.data.totalPayAmount = totalPrice;
resp.data.storeGoodsList[0].storeName = '家庭厨房';
```

Keep `transformGoodsDataToConfirmData()` compatible with existing goods fields.

- [ ] **Step 7: Rename tab labels**

In `custom-tab-bar/data.js`, use:

```js
export default [
  { icon: 'home', text: '今晚吃什么', url: 'pages/home/home' },
  { icon: 'sort', text: '菜品', url: 'pages/category/index' },
  { icon: 'cart', text: '今晚菜单', url: 'pages/cart/index' },
  { icon: 'person', text: '我的', url: 'pages/usercenter/index' },
];
```

In `app.json`, update tab text and window title to the same language:

```json
"navigationBarTitleText": "今晚吃什么"
```

- [ ] **Step 8: Run service and syntax checks**

Run:

```bash
node --input-type=module -e "import('./services/good/fetchCategoryList.js').then(async (m) => { const list = await m.getCategoryList(); if (!list.some((item) => item.name === '快手菜')) throw new Error('expected dish categories'); })"
node --input-type=module -e "import('./services/good/fetchGoodsList.js').then(async (m) => { const result = await m.fetchGoodsList({ categoryId: 'vegetable', pageNum: 1, pageSize: 10 }); if (!result.spuList.every((item) => item.tags.includes('素菜') || item.title.includes('青菜'))) throw new Error('expected vegetable dishes'); })"
```

Expected: both commands PASS with no output.

- [ ] **Step 9: Commit**

```bash
git add services/home/home.js services/good/fetchGoods.js services/good/fetchGoodsList.js services/good/fetchCategoryList.js services/cart/cart.js model/order/orderConfirm.js custom-tab-bar/data.js app.json
git commit -m "feat: wire family dish mock services"
```

### Task 3: Decision Homepage

**Files:**
- Modify: `pages/home/home.js`
- Modify: `pages/home/home.wxml`
- Modify: `pages/home/home.wxss`
- Modify: `pages/home/home.json`

- [ ] **Step 1: Write failing static marker check**

Run:

```bash
node -e "const fs=require('fs'); const wxml=fs.readFileSync('pages/home/home.wxml','utf8'); if(!wxml.includes('今晚吃什么')) throw new Error('missing family decision title'); if(!wxml.includes('randomDinnerSet')) throw new Error('missing random action binding');"
```

Expected: FAIL because the homepage still contains retail search/swiper markup.

- [ ] **Step 2: Implement homepage behavior**

Update `pages/home/home.js` to import `buildDinnerRecommendation` and `addDishesToTonightMenu`. Add data fields `recommendation`, `recommendationSeed`, `totalMenuCount`, and methods:

```js
refreshRecommendation(seed = Date.now()) {
  const recommendation = buildDinnerRecommendation(seed);
  this.setData({ recommendation, recommendationSeed: seed });
}

randomDinnerSet() {
  this.refreshRecommendation(Date.now());
}

addRecommendationToMenu() {
  addDishesToTonightMenu(this.data.recommendation.goods);
  Toast({ context: this, selector: '#t-toast', message: '已加入今晚菜单' });
}
```

Call `refreshRecommendation(0)` from `init()` after `loadHomePage()`.

- [ ] **Step 3: Replace homepage WXML**

Use a decision-first layout with visible text:

```xml
<view class="dinner-home">
  <view class="hero">
    <view class="eyebrow">Family Menu Picker</view>
    <view class="title">今晚吃什么</view>
    <view class="subtitle">随机搭一桌，尽量兼顾荤素和做饭时间。</view>
    <view class="hero-actions">
      <button class="primary-btn" bindtap="randomDinnerSet">随机换一桌</button>
      <button class="secondary-btn" bindtap="addRecommendationToMenu">加入今晚菜单</button>
    </view>
  </view>

  <view class="summary-card" wx:if="{{recommendation}}">
    <view class="summary-title">{{recommendation.title}}</view>
    <view class="summary-meta">{{recommendation.totalCookMinutes}} 分钟 · {{recommendation.tags.join(' / ')}}</view>
  </view>

  <view class="dish-grid">
    <view class="dish-card" wx:for="{{recommendation.dishes}}" wx:key="id">
      <t-image src="{{item.image}}" t-class="dish-image" mode="aspectFill" />
      <view class="dish-body">
        <view class="dish-name">{{item.name}}</view>
        <view class="dish-meta">{{item.cookMinutes}} 分钟 · {{item.difficulty}} · {{item.flavor}}</view>
        <view class="dish-tags">
          <text wx:for="{{item.tags}}" wx:key="*this">{{item}}</text>
        </view>
      </view>
    </view>
  </view>

  <view class="browse-row" bindtap="navToDishList">
    <view>
      <view class="browse-title">还是想自己挑？</view>
      <view class="browse-desc">去菜品里按快手菜、荤菜、素菜、汤和主食慢慢选。</view>
    </view>
    <t-icon name="chevron-right" size="40rpx" color="#666" />
  </view>

  <t-toast id="t-toast" />
</view>
```

- [ ] **Step 4: Add homepage styles**

Write `pages/home/home.wxss` styles for `.dinner-home`, `.hero`, `.primary-btn`, `.secondary-btn`, `.summary-card`, `.dish-grid`, `.dish-card`, `.dish-image`, `.dish-tags`, and `.browse-row`. Keep cards at `8rpx` radius or less.

- [ ] **Step 5: Update homepage JSON**

Set `navigationBarTitleText` to `今晚吃什么`; keep `t-image`, `t-icon`, and `t-toast` components.

- [ ] **Step 6: Verify static markers and JS syntax**

Run:

```bash
node -e "const fs=require('fs'); const wxml=fs.readFileSync('pages/home/home.wxml','utf8'); if(!wxml.includes('今晚吃什么')) throw new Error('missing family decision title'); if(!wxml.includes('randomDinnerSet')) throw new Error('missing random action binding');"
node --check pages/home/home.js
```

Expected: both commands PASS.

- [ ] **Step 7: Commit**

```bash
git add pages/home/home.js pages/home/home.wxml pages/home/home.wxss pages/home/home.json
git commit -m "feat: build family dinner decision home"
```

### Task 4: Dish Browsing and Add-to-Menu Flow

**Files:**
- Modify: `pages/category/index.js`
- Modify: `pages/category/index.wxml`
- Modify: `pages/category/index.wxss`
- Modify: `pages/category/index.json`
- Modify: `pages/goods/list/index.js`
- Modify: `pages/goods/list/index.wxml`
- Modify: `pages/goods/list/index.wxss`
- Modify: `pages/goods/list/index.json`

- [ ] **Step 1: Write failing static marker check**

Run:

```bash
node -e "const fs=require('fs'); const category=fs.readFileSync('pages/category/index.wxml','utf8'); const list=fs.readFileSync('pages/goods/list/index.wxml','utf8'); if(!category.includes('菜品分类')) throw new Error('missing category title'); if(!list.includes('加入今晚菜单')) throw new Error('missing add-to-menu action');"
```

Expected: FAIL because current pages still use generic category/product list UI.

- [ ] **Step 2: Update category page**

Load dish categories and render cards. On tap, navigate to `/pages/goods/list/index?categoryId=${id}&categoryName=${name}`.

- [ ] **Step 3: Update goods list behavior**

In `pages/goods/list/index.js`, import `addDishesToTonightMenu`. Read `categoryId` and `categoryName` from `onLoad(options)`, pass `categoryId` into `fetchGoodsList(params)`, and implement:

```js
handleAddCart(e) {
  const { index } = e.detail || e.currentTarget.dataset;
  const goods = this.data.goodsList[index];
  addDishesToTonightMenu([goods]);
  Toast({ context: this, selector: '#t-toast', message: '已加入今晚菜单' });
}
```

- [ ] **Step 4: Replace goods list WXML**

Render dish cards directly with metadata and a visible `加入今晚菜单` button. Remove price filter UI from the primary path.

- [ ] **Step 5: Verify static markers and JS syntax**

Run:

```bash
node -e "const fs=require('fs'); const category=fs.readFileSync('pages/category/index.wxml','utf8'); const list=fs.readFileSync('pages/goods/list/index.wxml','utf8'); if(!category.includes('菜品分类')) throw new Error('missing category title'); if(!list.includes('加入今晚菜单')) throw new Error('missing add-to-menu action');"
node --check pages/category/index.js
node --check pages/goods/list/index.js
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add pages/category/index.js pages/category/index.wxml pages/category/index.wxss pages/category/index.json pages/goods/list/index.js pages/goods/list/index.wxml pages/goods/list/index.wxss pages/goods/list/index.json
git commit -m "feat: add family dish browsing flow"
```

### Task 5: Tonight Menu Cart

**Files:**
- Modify: `pages/cart/index.js`
- Modify: `pages/cart/index.json`
- Modify: `pages/cart/index.wxml`
- Modify: `pages/cart/components/cart-bar/index.wxml`
- Modify: `pages/cart/components/cart-empty/index.js`
- Modify: `pages/cart/components/cart-empty/index.wxml`
- Modify: `pages/cart/components/cart-group/index.wxml`

- [ ] **Step 1: Write failing static marker check**

Run:

```bash
node -e "const fs=require('fs'); const cart=fs.readFileSync('pages/cart/index.wxml','utf8'); const bar=fs.readFileSync('pages/cart/components/cart-bar/index.wxml','utf8'); if(!cart.includes('今晚菜单')) throw new Error('missing tonight menu title'); if(!bar.includes('确认菜单')) throw new Error('missing confirm menu button');"
```

Expected: FAIL because current cart still says shopping/settlement.

- [ ] **Step 2: Update cart behavior**

In `pages/cart/index.js`, import `updateTonightMenuItem` and `removeTonightMenuItem`. Update selection, quantity, and delete methods to call these helpers. Change `onToSettle()` to store selected goods in `order.goodsRequestList` and navigate to order confirm as it already does.

- [ ] **Step 3: Update cart labels**

Set `pages/cart/index.json` title to `今晚菜单`. Add a top summary in WXML:

```xml
<view class="menu-header" wx:if="{{cartGroupData.isNotEmpty}}">
  <view class="menu-title">今晚菜单</view>
  <view class="menu-subtitle">共 {{cartGroupData.selectedGoodsCount}} 份 · 预计 {{cartGroupData.totalCookMinutes}} 分钟</view>
</view>
```

- [ ] **Step 4: Update cart subcomponent wording**

In `cart-bar/index.wxml`, change `总计` to `预计耗时`, remove shipping/discount wording, and change the button to `确认菜单({{totalGoodsNum}})`.

In `cart-empty`, set tip to `今晚菜单还是空的` and button to `去选菜`.

In `cart-group/index.wxml`, hide coupon and promotion wording, change stock text to cooking metadata where practical, and keep quantity stepper/delete behavior.

- [ ] **Step 5: Verify static markers and JS syntax**

Run:

```bash
node -e "const fs=require('fs'); const cart=fs.readFileSync('pages/cart/index.wxml','utf8'); const bar=fs.readFileSync('pages/cart/components/cart-bar/index.wxml','utf8'); if(!cart.includes('今晚菜单')) throw new Error('missing tonight menu title'); if(!bar.includes('确认菜单')) throw new Error('missing confirm menu button');"
node --check pages/cart/index.js
node --check pages/cart/components/cart-bar/index.js
node --check pages/cart/components/cart-empty/index.js
node --check pages/cart/components/cart-group/index.js
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add pages/cart/index.js pages/cart/index.json pages/cart/index.wxml pages/cart/components/cart-bar/index.wxml pages/cart/components/cart-empty/index.js pages/cart/components/cart-empty/index.wxml pages/cart/components/cart-group/index.wxml
git commit -m "feat: turn cart into tonight menu"
```

### Task 6: Final Menu Confirmation

**Files:**
- Modify: `pages/order/order-confirm/index.js`
- Modify: `pages/order/order-confirm/index.wxml`
- Modify: `pages/order/order-confirm/index.wxss`
- Modify: `pages/order/order-confirm/index.json`

- [ ] **Step 1: Write failing static marker check**

Run:

```bash
node -e "const fs=require('fs'); const wxml=fs.readFileSync('pages/order/order-confirm/index.wxml','utf8'); if(!wxml.includes('确认今晚菜单')) throw new Error('missing final menu title'); if(wxml.includes('运费') || wxml.includes('支付') || wxml.includes('优惠券')) throw new Error('payment language still visible');"
```

Expected: FAIL because the current page includes address, shipping, coupons, and payment wording.

- [ ] **Step 2: Replace confirmation behavior**

Simplify `pages/order/order-confirm/index.js` so it reads `order.goodsRequestList`, computes `totalCookMinutes`, renders `orderCardList`, supports note input, and `submitOrder()` stores a `familyMenuPicker.lastConfirmedMenu` record then shows toast `今晚菜单已确认`.

- [ ] **Step 3: Replace confirmation WXML**

Use a no-payment page with title `确认今晚菜单`, selected dishes, total servings, estimated cooking time, note textarea, and a fixed button `确认今晚菜单`. Do not include address, invoice, coupon, shipping, price, or payment components.

- [ ] **Step 4: Update confirmation styles and JSON**

Set title to `确认今晚菜单`. Keep only components used by the simplified page: `t-toast`, `t-textarea`, `t-image`, and `t-icon`.

- [ ] **Step 5: Verify static markers and JS syntax**

Run:

```bash
node -e "const fs=require('fs'); const wxml=fs.readFileSync('pages/order/order-confirm/index.wxml','utf8'); if(!wxml.includes('确认今晚菜单')) throw new Error('missing final menu title'); if(wxml.includes('运费') || wxml.includes('支付') || wxml.includes('优惠券')) throw new Error('payment language still visible');"
node --check pages/order/order-confirm/index.js
```

Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add pages/order/order-confirm/index.js pages/order/order-confirm/index.wxml pages/order/order-confirm/index.wxss pages/order/order-confirm/index.json
git commit -m "feat: add final family menu confirmation"
```

### Task 7: README and Full Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Add a short "Family Menu Picker" section at the top explaining:

```markdown
# Family Menu Picker

家庭内部用的微信小程序，用来解决“今晚吃什么”。第一版使用本地 mock 数据，不需要后端、支付、地址或登录。

## 第一版链路

1. 首页随机生成一桌晚餐推荐。
2. 推荐菜可以一键加入今晚菜单。
3. 菜品页可以按分类继续选菜。
4. 今晚菜单页可以改数量、删除、确认。
5. 确认页保存最终菜单，不发起支付。
```

- [ ] **Step 2: Run full syntax/static verification**

Run:

```bash
node --check model/dishes.js
node --check pages/home/home.js
node --check pages/category/index.js
node --check pages/goods/list/index.js
node --check pages/cart/index.js
node --check pages/order/order-confirm/index.js
node -e "const fs=require('fs'); const app=fs.readFileSync('app.json','utf8'); ['今晚吃什么','菜品','今晚菜单'].forEach((text)=>{ if(!app.includes(text)) throw new Error('missing '+text); });"
node -e "const fs=require('fs'); const files=['pages/home/home.wxml','pages/goods/list/index.wxml','pages/cart/index.wxml','pages/order/order-confirm/index.wxml']; for (const file of files) { const body=fs.readFileSync(file,'utf8'); if(/支付|运费|优惠券|物流|售后/.test(body)) throw new Error(file+' still has retail-only wording'); }"
```

Expected: all commands PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe family menu picker flow"
```

- [ ] **Step 4: Push**

```bash
git push
```

Expected: push succeeds to `origin/main`.

---

### Plan Self-Review

- Spec coverage: dish mock data, recommendations, category browsing, tonight menu, no-payment confirmation, local-only scope, and verification are each covered by Tasks 1-7.
- Placeholder scan: no unresolved implementation placeholders are intentionally left in this plan.
- Type consistency: `toGoodsCard()`, `getDishCategories()`, `getDishGoodsList()`, `buildDinnerRecommendation()`, `addDishesToTonightMenu()`, `updateTonightMenuItem()`, `removeTonightMenuItem()`, and `buildCartGroupData()` are defined in Task 1 before use in later tasks.

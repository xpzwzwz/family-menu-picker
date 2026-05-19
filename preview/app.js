const menuKey = 'familyMenuPicker.previewMenu';

const categories = [
  { id: 'all', name: '全部' },
  { id: 'quick', name: '快手菜' },
  { id: 'meat', name: '荤菜' },
  { id: 'vegetable', name: '素菜' },
  { id: 'soup', name: '汤' },
  { id: 'staple', name: '主食' },
  { id: 'takeout', name: '外卖备选' },
];

const dishes = [
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

let activeCategory = 'all';
let recommendationSeed = 0;
let recommendation = buildRecommendation(recommendationSeed);

function byId(id) {
  return document.getElementById(id);
}

function readMenu() {
  try {
    return JSON.parse(localStorage.getItem(menuKey) || '[]');
  } catch {
    return [];
  }
}

function writeMenu(menu) {
  localStorage.setItem(menuKey, JSON.stringify(menu));
}

function dishesByCategory(categoryId) {
  if (categoryId === 'all') return dishes;
  if (categoryId === 'quick') {
    return dishes.filter((dish) => dish.category === 'quick' || dish.tags.includes('快手'));
  }
  return dishes.filter((dish) => dish.category === categoryId);
}

function pick(categoryId, offset) {
  const source = dishesByCategory(categoryId);
  return source[offset % source.length];
}

function buildRecommendation(seed = Date.now()) {
  const offset = Math.abs(Number(seed) || 0);
  const picked = [
    pick('meat', offset),
    pick('vegetable', offset + 1),
    offset % 2 === 0 ? pick('soup', offset + 2) : pick('staple', offset + 2),
  ];
  const totalCookMinutes = picked.reduce((sum, dish) => sum + dish.cookMinutes, 0);
  return {
    title: totalCookMinutes <= 45 ? '省心快手搭配' : '认真吃饭搭配',
    dishes: picked,
    totalCookMinutes,
    tags: ['荤素搭配', totalCookMinutes <= 45 ? '不太费时间' : '适合慢慢做'],
  };
}

function addDish(dish) {
  const menu = readMenu();
  const existing = menu.find((item) => item.id === dish.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    menu.push({ ...dish, quantity: 1 });
  }
  writeMenu(menu);
  renderMenu();
}

function setQuantity(dishId, nextQuantity) {
  const menu = readMenu()
    .map((item) => (item.id === dishId ? { ...item, quantity: Math.max(1, nextQuantity) } : item))
    .filter((item) => item.quantity > 0);
  writeMenu(menu);
  renderMenu();
}

function removeDish(dishId) {
  writeMenu(readMenu().filter((item) => item.id !== dishId));
  renderMenu();
}

function dishCard(dish, actionLabel = '加入今晚菜单') {
  const tags = dish.tags.map((tag) => `<span>${tag}</span>`).join('');
  return `
    <article class="dish-card">
      <img src="${dish.image}" alt="${dish.name}" />
      <div class="dish-body">
        <div class="dish-title-row">
          <h3 class="dish-name">${dish.name}</h3>
          <span class="time-pill">${dish.cookMinutes} 分钟</span>
        </div>
        <p class="dish-meta">${dish.difficulty} · ${dish.flavor}</p>
        <p class="dish-note">${dish.notes}</p>
        <div class="dish-tags">${tags}</div>
        <button class="add-btn" data-add="${dish.id}" type="button">${actionLabel}</button>
      </div>
    </article>
  `;
}

function renderRecommendation() {
  byId('recommendation-title').textContent = recommendation.title;
  byId('recommendation-meta').textContent = `${recommendation.totalCookMinutes} 分钟 · ${recommendation.tags.join(' / ')}`;
  byId('recommendation-list').innerHTML = recommendation.dishes.map((dish) => dishCard(dish)).join('');
}

function renderCategories() {
  byId('category-tabs').innerHTML = categories
    .map(
      (category) =>
        `<button class="${category.id === activeCategory ? 'is-active' : ''}" data-category="${category.id}" type="button">${category.name}</button>`,
    )
    .join('');
}

function renderDishList() {
  byId('dish-list').innerHTML = dishesByCategory(activeCategory).map((dish) => dishCard(dish)).join('');
}

function renderMenu() {
  const menu = readMenu();
  const totalQuantity = menu.reduce((sum, item) => sum + item.quantity, 0);
  const totalCookMinutes = menu.reduce((sum, item) => sum + item.cookMinutes * item.quantity, 0);
  byId('menu-summary').textContent = `${totalQuantity} 份 · ${totalCookMinutes} 分钟`;
  byId('menu-list').innerHTML =
    menu
      .map(
        (item) => `
          <div class="menu-item">
            <div>
              <strong>${item.name}</strong>
              <p class="dish-meta">${item.cookMinutes} 分钟 · ${item.flavor}</p>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" data-minus="${item.id}" type="button">-</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" data-plus="${item.id}" type="button">+</button>
              <button class="remove-btn" data-remove="${item.id}" type="button">移除</button>
            </div>
          </div>
        `,
      )
      .join('') || '<p class="dish-meta">今晚菜单还是空的，先从推荐或菜品里选几道。</p>';
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    const addId = target.dataset.add;
    const categoryId = target.dataset.category;
    const plusId = target.dataset.plus;
    const minusId = target.dataset.minus;
    const removeId = target.dataset.remove;

    if (addId) addDish(dishes.find((dish) => dish.id === addId));
    if (categoryId) {
      activeCategory = categoryId;
      renderCategories();
      renderDishList();
    }
    if (plusId) {
      const item = readMenu().find((dish) => dish.id === plusId);
      if (item) setQuantity(plusId, item.quantity + 1);
    }
    if (minusId) {
      const item = readMenu().find((dish) => dish.id === minusId);
      if (item) setQuantity(minusId, item.quantity - 1);
    }
    if (removeId) removeDish(removeId);
  });

  byId('randomize').addEventListener('click', () => {
    recommendationSeed = Date.now();
    recommendation = buildRecommendation(recommendationSeed);
    renderRecommendation();
  });

  byId('add-recommendation').addEventListener('click', () => {
    recommendation.dishes.forEach(addDish);
  });

  byId('clear-menu').addEventListener('click', () => {
    writeMenu([]);
    renderMenu();
  });

  byId('confirm-menu').addEventListener('click', () => {
    const menu = readMenu();
    const note = byId('menu-note').value.trim();
    if (!menu.length) {
      byId('confirm-status').textContent = '请先选择今晚菜单。';
      return;
    }
    localStorage.setItem(
      'familyMenuPicker.previewLastConfirmed',
      JSON.stringify({ menu, note, confirmedAt: Date.now() }),
    );
    byId('confirm-status').textContent = '今晚菜单已确认。';
  });
}

function render() {
  renderRecommendation();
  renderCategories();
  renderDishList();
  renderMenu();
}

bindEvents();
render();

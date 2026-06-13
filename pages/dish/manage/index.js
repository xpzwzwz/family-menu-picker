import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  defaultDishIds,
  deleteDish,
  getDishCategoryOptions,
  getManageableDishes,
  hasRemovedDefaultDishes,
  restoreDishDefaults,
} from '../../../model/dishes';

function getCategoryNameMap() {
  return getDishCategoryOptions().reduce((result, category) => {
    return {
      ...result,
      [category.id]: category.name,
    };
  }, {});
}

function formatDish(dish, categoryNameMap) {
  const tags = Array.isArray(dish.tags) ? dish.tags : [];
  return {
    ...dish,
    categoryName: categoryNameMap[dish.category] || '未分类',
    tagText: tags.slice(0, 3).join(' / '),
    metaText: `${dish.cookMinutes} 分钟 · ${dish.difficulty} · ${dish.flavor}`,
  };
}

Page({
  data: {
    dishList: [],
    canRestore: false,
  },

  onShow() {
    this.refreshDishes();
  },

  refreshDishes() {
    const categoryNameMap = getCategoryNameMap();
    const dishList = getManageableDishes().map((dish) => formatDish(dish, categoryNameMap));
    this.setData({
      dishList,
      canRestore: hasRemovedDefaultDishes(),
    });
  },

  showToast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
    });
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/dish/custom-create/index' });
  },

  goCategoryManage() {
    wx.navigateTo({ url: '/pages/dish/category-manage/index' });
  },

  editDish(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/dish/custom-create/index?id=${id}` });
  },

  deleteDish(event) {
    const { id } = event.currentTarget.dataset;
    Dialog.confirm({
      title: '移除这道菜？',
      content: '移除后不会再出现在菜品列表和随机推荐里。',
      confirmBtn: '移除',
      cancelBtn: '取消',
    })
      .then(() => {
        const deleted = deleteDish(id);
        if (!deleted) {
          this.showToast('没有找到这道菜');
          return;
        }
        this.refreshDishes();
        this.showToast('已移除菜品');
      })
      .catch(() => {});
  },

  restoreDefaultDishes() {
    defaultDishIds.forEach((id) => {
      restoreDishDefaults(id);
    });
    this.refreshDishes();
    this.showToast('已恢复初始菜品');
  },
});

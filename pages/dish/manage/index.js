import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { deleteCustomDish, dishCategories, readCustomDishes } from '../../../model/dishes';

const categoryNameMap = dishCategories.reduce((result, category) => {
  return {
    ...result,
    [category.id]: category.name,
  };
}, {});

function formatDish(dish) {
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
  },

  onShow() {
    this.refreshDishes();
  },

  refreshDishes() {
    this.setData({
      dishList: readCustomDishes().map(formatDish),
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

  editDish(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/dish/custom-create/index?id=${id}` });
  },

  deleteDish(event) {
    const { id } = event.currentTarget.dataset;
    Dialog.confirm({
      title: '删除这道菜？',
      content: '删除后不会再出现在菜品列表和随机推荐里。',
      confirmBtn: '删除',
      cancelBtn: '取消',
    })
      .then(() => {
        const deleted = deleteCustomDish(id);
        if (!deleted) {
          this.showToast('没有找到这道菜');
          return;
        }
        this.refreshDishes();
        this.showToast('已删除菜品');
      })
      .catch(() => {});
  },
});

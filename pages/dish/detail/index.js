import Toast from 'tdesign-miniprogram/toast/index';
import { getDishById, readTonightMenu, toGoodsCard } from '../../../model/dishes';
import { addDishesToSharedMenu, syncCloudMenuToLocal } from '../../../services/squad/cloudMenu';

function formatDetail(dish) {
  if (!dish) return null;
  const amounts = dish.amounts && typeof dish.amounts === 'object' ? dish.amounts : {};
  const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  return {
    ...dish,
    tagText: Array.isArray(dish.tags) ? dish.tags.join(' / ') : '',
    ingredients,
    ingredientList: ingredients.map((name) => ({ name, amount: amounts[name] || '' })),
    steps: Array.isArray(dish.steps) ? dish.steps : [],
  };
}

Page({
  data: {
    dish: null,
    inMenu: false,
  },

  onLoad(options = {}) {
    const dish = formatDetail(getDishById(options.id));
    if (!dish) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '没有找到这道菜',
      });
      setTimeout(() => wx.navigateBack(), 500);
      return;
    }

    wx.setNavigationBarTitle({ title: dish.name });
    this.setData({
      dish,
      inMenu: this.isDishInMenu(dish.id),
    });
    syncCloudMenuToLocal()
      .catch(() => {})
      .then(() => this.setData({ inMenu: this.isDishInMenu(dish.id) }));
  },

  isDishInMenu(id) {
    return readTonightMenu().some((item) => item.spuId === id);
  },

  addToMenu() {
    const { dish } = this.data;
    if (!dish) return;
    addDishesToSharedMenu([toGoodsCard(dish)])
      .then(() => {
        this.setData({ inMenu: true });
        Toast({
          context: this,
          selector: '#t-toast',
          message: '已加入菜单',
        });
      })
      .catch((error) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: error.message || '暂时没同步给队友，稍后再试',
        });
      });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

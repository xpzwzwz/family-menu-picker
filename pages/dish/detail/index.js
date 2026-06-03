import Toast from 'tdesign-miniprogram/toast/index';
import { addDishesToTonightMenu, getDishById, readTonightMenu, toGoodsCard } from '../../../model/dishes';

function formatDetail(dish) {
  if (!dish) return null;
  return {
    ...dish,
    tagText: Array.isArray(dish.tags) ? dish.tags.join(' / ') : '',
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
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
  },

  isDishInMenu(id) {
    return readTonightMenu().some((item) => item.spuId === id);
  },

  addToMenu() {
    const { dish } = this.data;
    if (!dish) return;
    addDishesToTonightMenu([toGoodsCard(dish)]);
    this.setData({ inMenu: true });
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已加入菜单',
    });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { buildShoppingBasket, clearShoppingBasketChecked, toggleShoppingBasketItem } from '../../../model/dishes';

Page({
  data: {
    basket: {
      items: [],
      checkedCount: 0,
      totalIngredientCount: 0,
      totalDishCount: 0,
    },
    progressText: '暂无备料',
  },

  onShow() {
    this.refreshBasket();
  },

  onPullDownRefresh() {
    this.refreshBasket();
    wx.stopPullDownRefresh();
  },

  refreshBasket() {
    const basket = buildShoppingBasket();
    this.setData({
      basket,
      progressText: basket.totalIngredientCount
        ? `已买 ${basket.checkedCount} / ${basket.totalIngredientCount} 项`
        : '暂无备料',
    });
  },

  toggleItem(event) {
    const { id, checked } = event.currentTarget.dataset;
    toggleShoppingBasketItem(id, !checked);
    this.refreshBasket();
  },

  clearChecked() {
    if (!this.data.basket.checkedCount) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '还没有勾选备料',
      });
      return;
    }

    Dialog.confirm({
      title: '清空已买状态？',
      content: '只会取消勾选，不会修改菜单。',
      confirmBtn: '清空',
      cancelBtn: '取消',
    })
      .then(() => {
        clearShoppingBasketChecked();
        this.refreshBasket();
      })
      .catch(() => {});
  },

  goPickDishes() {
    wx.switchTab({ url: '/pages/category/index' });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

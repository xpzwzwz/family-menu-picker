import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  buildShoppingBasket,
  clearShoppingBasketChecked,
  readLastConfirmedMenu,
  toggleShoppingBasketItem,
} from '../../../model/dishes';

Page({
  data: {
    basket: {
      items: [],
      checkedCount: 0,
      totalIngredientCount: 0,
      totalDishCount: 0,
    },
    progressText: '暂无备料',
    source: 'current',
    menuButtonText: '查看菜单',
  },

  onLoad(options = {}) {
    const source = options.source === 'confirmed' ? 'confirmed' : 'current';
    this.setData({
      source,
      menuButtonText: source === 'confirmed' ? '查看刚确认的菜单' : '查看菜单',
    });
  },

  onShow() {
    this.refreshBasket();
  },

  onPullDownRefresh() {
    this.refreshBasket();
    wx.stopPullDownRefresh();
  },

  refreshBasket() {
    const confirmedMenu = this.data.source === 'confirmed' ? readLastConfirmedMenu() : null;
    const basket = buildShoppingBasket(confirmedMenu && confirmedMenu.goodsList ? confirmedMenu.goodsList : undefined);
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
      title: '把勾选都取消吗？',
      content: '只会取消勾选，不会修改菜单。',
      confirmBtn: '取消勾选',
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
    if (this.data.source === 'confirmed') {
      wx.navigateTo({ url: '/pages/order/order-confirm/index?source=confirmed' });
      return;
    }
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

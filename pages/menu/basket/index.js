import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  buildShoppingBasket,
  buildShoppingListText,
  clearShoppingBasketChecked,
  readLastConfirmedMenu,
  toggleShoppingBasketItem,
} from '../../../model/dishes';
import { syncCloudMenuToLocal } from '../../../services/squad/cloudMenu';

Page({
  data: {
    basket: {
      items: [],
      groups: [],
      checkedCount: 0,
      totalIngredientCount: 0,
      totalDishCount: 0,
    },
    progressText: '暂无备料',
    source: 'current',
    menuButtonText: '查看菜单',
    collapsed: {},
    allCollapsed: false,
  },

  // 收起 / 展开某个分类
  toggleGroup(event) {
    const { key } = event.currentTarget.dataset;
    if (!key) return;
    const collapsed = { ...this.data.collapsed, [key]: !this.data.collapsed[key] };
    this.setData({ collapsed, allCollapsed: this.isAllCollapsed(collapsed) });
  },

  // 一键收起 / 展开全部
  toggleAllGroups() {
    const keys = this.data.basket.groups.map((group) => group.key);
    const next = this.data.allCollapsed ? {} : keys.reduce((acc, key) => ({ ...acc, [key]: true }), {});
    this.setData({ collapsed: next, allCollapsed: !this.data.allCollapsed });
  },

  isAllCollapsed(collapsed) {
    const keys = this.data.basket.groups.map((group) => group.key);
    return keys.length > 0 && keys.every((key) => collapsed[key]);
  },

  onLoad(options = {}) {
    const source = options.source === 'confirmed' ? 'confirmed' : 'current';
    this.setData({
      source,
      menuButtonText: source === 'confirmed' ? '查看刚确认的菜单' : '查看菜单',
    });
  },

  onShow() {
    this.refreshBasketFromSource();
  },

  onPullDownRefresh() {
    this.refreshBasketFromSource().finally(() => wx.stopPullDownRefresh());
  },

  refreshBasketFromSource() {
    const syncTask = this.data.source === 'confirmed' ? Promise.resolve() : syncCloudMenuToLocal();
    return syncTask
      .catch((error) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: error.message || '备料同步失败，先显示本机菜单',
        });
      })
      .then(() => this.refreshBasket());
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

  copyList() {
    if (!this.data.basket.totalIngredientCount) {
      Toast({ context: this, selector: '#t-toast', message: '菜篮子还是空的' });
      return;
    }
    wx.setClipboardData({
      data: buildShoppingListText(this.data.basket),
      success: () => {
        Toast({ context: this, selector: '#t-toast', message: '清单已复制，发给买菜的人吧' });
      },
    });
  },

  onShareAppMessage() {
    return {
      title: `买菜清单：${this.data.basket.totalDishCount} 道菜要买 ${this.data.basket.totalIngredientCount} 样`,
      path: '/pages/menu/basket/index',
    };
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

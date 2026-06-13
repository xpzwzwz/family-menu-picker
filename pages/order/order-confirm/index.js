import Toast from 'tdesign-miniprogram/toast/index';
import { readLastConfirmedMenu, saveConfirmedMenu } from '../../../model/dishes';

function readSelectedMenu() {
  const stored = wx.getStorageSync('order.goodsRequestList');
  if (!stored) return [];
  try {
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function summarizeMenu(goodsList) {
  const totalQuantity = goodsList.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalCookMinutes = goodsList.reduce((sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1), 0);
  const tags = [];
  goodsList.forEach((item) => {
    (item.tags || []).forEach((tag) => {
      if (!tags.includes(tag)) tags.push(tag);
    });
  });
  return {
    totalQuantity,
    totalCookMinutes,
    tags: tags.slice(0, 6),
  };
}

Page({
  data: {
    goodsList: [],
    summary: {
      totalQuantity: 0,
      totalCookMinutes: 0,
      tags: [],
    },
    note: '',
    confirmedMenu: null,
  },

  onLoad(options = {}) {
    if (options.source === 'confirmed') {
      this.showConfirmedMenu();
      return;
    }
    const goodsList = readSelectedMenu();
    this.setData({
      goodsList,
      summary: summarizeMenu(goodsList),
    });
  },

  showConfirmedMenu() {
    const confirmedMenu = readLastConfirmedMenu();
    if (!confirmedMenu || !Array.isArray(confirmedMenu.goodsList)) {
      this.setData({
        goodsList: [],
        summary: summarizeMenu([]),
        confirmedMenu: null,
      });
      return;
    }
    const { goodsList } = confirmedMenu;
    this.setData({
      goodsList,
      summary: confirmedMenu.summary || summarizeMenu(goodsList),
      note: confirmedMenu.note || '',
      confirmedMenu,
    });
  },

  onNoteChange(event) {
    this.setData({ note: event.detail.value });
  },

  goBackToMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  submitOrder() {
    if (!this.data.goodsList.length) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先选择菜单',
      });
      return;
    }

    try {
      const confirmedMenu = saveConfirmedMenu({
        goodsList: this.data.goodsList,
        summary: this.data.summary,
        note: this.data.note,
      });

      // 确认只把菜存进本机「菜单历史」，不动云端共享菜单。
      // saveConfirmedMenu 已清空本地菜单，若再 syncLocalMenuToCloud 就会把全队共享菜单清空。
      this.setData({ confirmedMenu });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '菜单已确认',
      });
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '刚才没保存上，再点一次试试',
      });
    }
  },

  goBasket() {
    wx.navigateTo({ url: '/pages/menu/basket/index?source=confirmed' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/menu/history/index' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },
});

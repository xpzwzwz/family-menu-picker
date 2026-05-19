import Toast from 'tdesign-miniprogram/toast/index';

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
  },

  onLoad() {
    const goodsList = readSelectedMenu();
    this.setData({
      goodsList,
      summary: summarizeMenu(goodsList),
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
        message: '请先选择今晚菜单',
      });
      return;
    }

    wx.setStorageSync(
      'familyMenuPicker.lastConfirmedMenu',
      JSON.stringify({
        confirmedAt: Date.now(),
        goodsList: this.data.goodsList,
        summary: this.data.summary,
        note: this.data.note,
      }),
    );

    Toast({
      context: this,
      selector: '#t-toast',
      message: '今晚菜单已确认',
    });
  },
});

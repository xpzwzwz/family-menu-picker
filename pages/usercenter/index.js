import Toast from 'tdesign-miniprogram/toast/index';
import { readTonightMenu } from '../../model/dishes';

const actionList = [
  {
    title: '随机一桌',
    desc: '回到首页重新生成今晚搭配',
    type: 'home',
    icon: 'refresh',
  },
  {
    title: '继续选菜',
    desc: '按分类补几道菜',
    type: 'category',
    icon: 'app',
  },
  {
    title: '查看今晚菜单',
    desc: '调整份数或确认菜单',
    type: 'menu',
    icon: 'cart',
  },
];

function formatConfirmedAt(timestamp) {
  if (!timestamp) return '暂无';
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${minute}`;
}

function readLastConfirmedMenu() {
  const stored = wx.getStorageSync('familyMenuPicker.lastConfirmedMenu');
  if (!stored) return null;
  try {
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return parsed && Array.isArray(parsed.goodsList) ? parsed : null;
  } catch (error) {
    return null;
  }
}

const getDefaultData = () => ({
  actionList,
  selectedCount: 0,
  totalCookMinutes: 0,
  lastConfirmedAtText: '暂无',
  lastConfirmedCount: 0,
  lastConfirmedNote: '',
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.init();
  },

  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },

  init() {
    const menu = readTonightMenu();
    const lastConfirmed = readLastConfirmedMenu();
    this.setData({
      selectedCount: menu.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalCookMinutes: menu.reduce((sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1), 0),
      lastConfirmedAtText: formatConfirmedAt(lastConfirmed && lastConfirmed.confirmedAt),
      lastConfirmedCount: lastConfirmed ? lastConfirmed.goodsList.length : 0,
      lastConfirmedNote: lastConfirmed && lastConfirmed.note ? lastConfirmed.note : '',
    });
  },

  handleAction({ currentTarget }) {
    const { type } = currentTarget.dataset;
    switch (type) {
      case 'home': {
        wx.switchTab({ url: '/pages/home/home' });
        break;
      }
      case 'category': {
        wx.switchTab({ url: '/pages/category/index' });
        break;
      }
      case 'menu': {
        wx.switchTab({ url: '/pages/cart/index' });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const { version, envVersion = __wxConfig } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});

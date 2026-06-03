import Toast from 'tdesign-miniprogram/toast/index';
import { readTonightMenu } from '../../model/dishes';
import { readUserProfile } from '../../model/user';

const actionList = [
  {
    title: '随机一餐',
    desc: '回到首页重新生成这一餐搭配',
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
    title: '查看我的菜单',
    desc: '调整份数或确认菜单',
    type: 'menu',
    icon: 'cart',
  },
  {
    title: '菜篮子',
    desc: '汇总这顿饭要买的备料',
    type: 'basket',
    icon: 'shop',
  },
  {
    title: '菜单历史',
    desc: '查看和复用确认过的菜单',
    type: 'menuHistory',
    icon: 'time',
  },
  {
    title: '新增菜品',
    desc: '把家里常吃的菜加进来',
    type: 'customDish',
    icon: 'add',
  },
  {
    title: '管理菜品',
    desc: '编辑或移除家里的常吃菜',
    type: 'manageDish',
    icon: 'view-list',
  },
  {
    title: '小分队成员',
    desc: '添加家里一起点菜的人',
    type: 'profile',
    icon: 'usergroup',
  },
  {
    title: '问题反馈',
    desc: '记录问题、建议和菜品数据反馈',
    type: 'feedback',
    icon: 'chat',
  },
];

const getDefaultData = () => ({
  actionList,
  selectedCount: 0,
  totalCookMinutes: 0,
  userProfile: readUserProfile(),
  avatarText: '光',
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
    const userProfile = readUserProfile();
    this.setData({
      userProfile,
      avatarText: userProfile.nickname.slice(0, 1) || '光',
      selectedCount: menu.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalCookMinutes: menu.reduce((sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1), 0),
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
      case 'basket': {
        wx.navigateTo({ url: '/pages/menu/basket/index' });
        break;
      }
      case 'customDish': {
        wx.navigateTo({ url: '/pages/dish/custom-create/index' });
        break;
      }
      case 'manageDish': {
        wx.navigateTo({ url: '/pages/dish/manage/index' });
        break;
      }
      case 'menuHistory': {
        wx.navigateTo({ url: '/pages/menu/history/index' });
        break;
      }
      case 'profile': {
        wx.navigateTo({ url: '/pages/user/profile/index' });
        break;
      }
      case 'feedback': {
        wx.navigateTo({ url: '/pages/user/feedback/index' });
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

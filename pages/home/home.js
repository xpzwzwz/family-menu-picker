import Toast from 'tdesign-miniprogram/toast/index';
import { addDishesToTonightMenu, buildDinnerRecommendation, readTonightMenu } from '../../model/dishes';

Page({
  data: {
    recommendation: null,
    recommendationTagText: '',
    recommendationSeed: 0,
    totalMenuCount: 0,
  },

  onShow() {
    this.getTabBar().init();
    this.updateMenuCount();
  },

  onLoad() {
    this.init();
  },

  onPullDownRefresh() {
    this.randomDinnerSet();
    wx.stopPullDownRefresh();
  },

  init() {
    this.refreshRecommendation(0);
    this.updateMenuCount();
  },

  updateMenuCount() {
    const totalMenuCount = readTonightMenu().reduce((sum, item) => sum + (item.quantity || 1), 0);
    this.setData({ totalMenuCount });
  },

  refreshRecommendation(seed = Date.now()) {
    const recommendation = buildDinnerRecommendation(seed);
    this.setData({
      recommendation,
      recommendationTagText: recommendation.tags.join(' / '),
      recommendationSeed: seed,
    });
  },

  randomDinnerSet() {
    this.refreshRecommendation(Date.now());
  },

  addRecommendationToMenu() {
    if (!this.data.recommendation) return;
    addDishesToTonightMenu(this.data.recommendation.goods);
    this.updateMenuCount();
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已加入今晚菜单',
    });
  },

  navToDishList() {
    wx.switchTab({ url: '/pages/category/index' });
  },

  navToMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

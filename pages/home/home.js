import Toast from 'tdesign-miniprogram/toast/index';
import {
  addDishesToTonightMenu,
  buildDifferentDinnerRecommendation,
  buildDinnerRecommendation,
  readTonightMenu,
} from '../../model/dishes';

const RECOMMENDATION_COUNT_STORAGE_KEY = 'familyMenuPicker.recommendationCount';

Page({
  data: {
    recommendation: null,
    recommendationTagText: '',
    recommendationSeed: 0,
    recommendationCount: 3,
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
    const recommendationCount = this.readRecommendationCount();
    this.setData({ recommendationCount });
    this.refreshRecommendation();
    this.updateMenuCount();
  },

  readRecommendationCount() {
    const stored = wx.getStorageSync(RECOMMENDATION_COUNT_STORAGE_KEY);
    const count = Math.floor(Number(stored) || 3);
    return Math.max(1, Math.min(count, 10));
  },

  saveRecommendationCount(count) {
    wx.setStorageSync(RECOMMENDATION_COUNT_STORAGE_KEY, String(count));
  },

  updateMenuCount() {
    const totalMenuCount = readTonightMenu().reduce((sum, item) => sum + (item.quantity || 1), 0);
    this.setData({ totalMenuCount });
  },

  refreshRecommendation(seed = Date.now()) {
    const recommendation = buildDinnerRecommendation(seed, this.data.recommendationCount);
    this.setData({
      recommendation,
      recommendationTagText: recommendation.tags.join(' / '),
      recommendationSeed: seed,
    });
  },

  randomDinnerSet() {
    const seed = Date.now();
    const recommendation = buildDifferentDinnerRecommendation(
      this.data.recommendation,
      seed,
      this.data.recommendationCount,
    );
    this.setData({
      recommendation,
      recommendationTagText: recommendation.tags.join(' / '),
      recommendationSeed: seed,
    });
  },

  onRecommendationCountChange(event) {
    const count = Math.max(1, Math.min(Math.floor(Number(event.detail.value) || 3), 10));
    this.saveRecommendationCount(count);
    this.setData({ recommendationCount: count }, () => this.randomDinnerSet());
  },

  addRecommendationToMenu() {
    if (!this.data.recommendation) return;
    const currentMenu = readTonightMenu();
    const missingGoods = this.data.recommendation.goods.filter(
      (goods) => !currentMenu.some((item) => item.spuId === goods.spuId && item.skuId === goods.skuId),
    );
    if (!missingGoods.length) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '这几道已经在菜单里了',
      });
      return;
    }
    addDishesToTonightMenu(this.data.recommendation.goods, { incrementExisting: false });
    this.updateMenuCount();
    Toast({
      context: this,
      selector: '#t-toast',
      message: missingGoods.length === this.data.recommendation.goods.length ? '已加入菜单' : '已补进菜单',
    });
  },

  navToDishList() {
    wx.switchTab({ url: '/pages/category/index' });
  },

  navToMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  goDishDetail(event) {
    const { id } = event.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/dish/detail/index?id=${id}` });
  },
});

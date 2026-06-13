import Toast from 'tdesign-miniprogram/toast/index';
import { buildDifferentDinnerRecommendation, buildDinnerRecommendation, readTonightMenu } from '../../model/dishes';
import { addDishesToSharedMenu, syncCloudMenuToLocal } from '../../services/squad/cloudMenu';
import { addCheckin, getCheckinSummary } from '../../services/squad/cloudCheckin';

const RECOMMENDATION_COUNT_STORAGE_KEY = 'familyMenuPicker.recommendationCount';

Page({
  data: {
    recommendation: null,
    recommendationTagText: '',
    recommendationSeed: 0,
    recommendationCount: 3,
    totalMenuCount: 0,
    checkin: { streakDays: 0, totalCount: 0, monthDays: 0, todayDone: false },
    showCheckinPopup: false,
    checkinNote: '',
  },

  onShow() {
    this.getTabBar().init();
    this.loadCheckin();
    syncCloudMenuToLocal()
      .catch(() => {})
      .then(() => this.updateMenuCount());
  },

  loadCheckin() {
    getCheckinSummary()
      .then((summary) => this.setData({ checkin: summary }))
      .catch(() => {});
  },

  goCheckinRecords() {
    wx.navigateTo({ url: '/pages/checkin/index' });
  },

  openCheckin() {
    this.setData({ showCheckinPopup: true });
  },

  onCheckinPopupChange(event) {
    this.setData({ showCheckinPopup: event.detail.visible });
  },

  onCheckinNoteInput(event) {
    this.setData({ checkinNote: event.detail.value });
  },

  confirmCheckin() {
    addCheckin({ note: this.data.checkinNote })
      .then((summary) => {
        this.setData({ checkin: summary, showCheckinPopup: false, checkinNote: '' });
        Toast({
          context: this,
          selector: '#t-toast',
          message: `光盘！连续光盘 ${summary.streakDays} 天 🎉`,
        });
      })
      .catch((error) => {
        this.setData({ showCheckinPopup: false });
        Toast({
          context: this,
          selector: '#t-toast',
          message: (error && error.message) || '打卡没成功，再试一次',
        });
      });
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
    syncCloudMenuToLocal()
      .catch(() => readTonightMenu())
      .then(() => {
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
          return null;
        }
        return addDishesToSharedMenu(this.data.recommendation.goods, { incrementExisting: false }).then(() => {
          this.updateMenuCount();
          Toast({
            context: this,
            selector: '#t-toast',
            message: missingGoods.length === this.data.recommendation.goods.length ? '已加入菜单' : '已补进菜单',
          });
        });
      })
      .catch((error) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: error.message || '暂时没同步给队友，稍后再试',
        });
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

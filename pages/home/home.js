import Toast from 'tdesign-miniprogram/toast/index';
import { buildDifferentDinnerRecommendation, buildDinnerRecommendation, readTonightMenu } from '../../model/dishes';
import { addDishesToSharedMenu, syncCloudMenuToLocal } from '../../services/squad/cloudMenu';
import { addCheckin, getCheckinCalendar, getCheckinSummary, todayStr } from '../../services/squad/cloudCheckin';

const RECOMMENDATION_COUNT_STORAGE_KEY = 'familyMenuPicker.recommendationCount';

Page({
  data: {
    recommendation: null,
    recommendationTagText: '',
    recommendationSeed: 0,
    recommendationCount: 3,
    lockedIds: [],
    totalMenuCount: 0,
    checkin: { streakDays: 0, totalCount: 0, monthDays: 0, todayDone: false, todayCount: 0 },
    cpStatus: '',
    cpButton: '打卡',
    showCheckinPopup: false,
    checkinNote: '',
  },

  onShow() {
    this.getTabBar().init();
    this.loadCheckin();
    this.startShake();
    syncCloudMenuToLocal()
      .catch(() => {})
      .then(() => this.updateMenuCount());
  },

  onHide() {
    this.stopShake();
  },

  onUnload() {
    this.stopShake();
  },

  // 按当前时间问候哪一顿,不再写死「今晚」
  currentMealLabel() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 10) return '早饭';
    if (hour >= 10 && hour < 15) return '午饭';
    return '晚饭';
  },

  // 统一根据 summary + 今天顿数算出状态文案/按钮文案
  setCheckinView(summary, todayCount) {
    const count = todayCount == null ? this.data.checkin.todayCount || 0 : todayCount;
    const checkin = { ...summary, todayCount: count };
    let cpStatus;
    if (!checkin.todayDone) cpStatus = `${this.currentMealLabel()}光盘了吗？`;
    else if (count > 1) cpStatus = `今天已光盘 ${count} 顿`;
    else cpStatus = '今天光盘了 🎉';
    this.setData({ checkin, cpStatus, cpButton: checkin.todayDone ? '再记一顿' : '打卡' });
  },

  loadCheckin() {
    const today = todayStr();
    getCheckinSummary(today)
      .then((summary) => {
        this.setCheckinView(summary, null);
        return getCheckinCalendar(today.slice(0, 7));
      })
      .then((calendar) => {
        if (!calendar) return;
        const day = (calendar.days || []).find((item) => item.date === today);
        this.setCheckinView(this.data.checkin, day ? day.count : 0);
      })
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
        this.setCheckinView(summary, (this.data.checkin.todayCount || 0) + 1);
        this.setData({ showCheckinPopup: false, checkinNote: '' });
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
    this.setCheckinView(this.data.checkin, 0); // 先占个文案,避免异步加载前空白
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

  // 当前锁定的菜(用于换一餐时保留)
  lockedDishes() {
    const rec = this.data.recommendation;
    if (!rec || !this.data.lockedIds.length) return [];
    return rec.dishes.filter((dish) => this.data.lockedIds.includes(dish.id));
  },

  // 统一落地一份推荐:给每道菜标上 locked,并把已失效的锁定 id 清掉
  applyRecommendation(recommendation, seed) {
    const lockedIds = this.data.lockedIds.filter((id) => recommendation.dishes.some((dish) => dish.id === id));
    const dishes = recommendation.dishes.map((dish) => ({ ...dish, locked: lockedIds.includes(dish.id) }));
    this.setData({
      recommendation: { ...recommendation, dishes },
      recommendationTagText: recommendation.tags.join(' / '),
      recommendationSeed: seed,
      lockedIds,
    });
  },

  refreshRecommendation(seed = Date.now()) {
    const recommendation = buildDinnerRecommendation(seed, this.data.recommendationCount, this.lockedDishes());
    this.applyRecommendation(recommendation, seed);
  },

  // 注意:bindtap 会把事件对象当第一个参数传进来,所以只接受「数字种子」(摇一摇用),
  // 其余情况(按钮点击、下拉刷新)一律用 Date.now(),否则种子非数字会退化成 0、换不动。
  randomDinnerSet(seed) {
    const realSeed = typeof seed === 'number' ? seed : Date.now();
    const recommendation = buildDifferentDinnerRecommendation(
      this.data.recommendation,
      realSeed,
      this.data.recommendationCount,
      this.lockedDishes(),
    );
    this.applyRecommendation(recommendation, realSeed);
  },

  // 锁定 / 取消锁定某道菜(不重新随机,只在下次换一餐时生效)
  toggleLock(event) {
    const { id } = event.currentTarget.dataset;
    if (!id || !this.data.recommendation) return;
    const lockedIds = this.data.lockedIds.includes(id)
      ? this.data.lockedIds.filter((x) => x !== id)
      : [...this.data.lockedIds, id];
    const dishes = this.data.recommendation.dishes.map((dish) => ({ ...dish, locked: lockedIds.includes(dish.id) }));
    this.setData({ lockedIds, 'recommendation.dishes': dishes });
    if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
  },

  onRecommendationCountChange(event) {
    const count = Math.max(1, Math.min(Math.floor(Number(event.detail.value) || 3), 10));
    this.saveRecommendationCount(count);
    this.setData({ recommendationCount: count }, () => this.randomDinnerSet());
  },

  // ---------- 摇一摇换一餐 ----------
  startShake() {
    if (this._shakeBound) return;
    this._shakeLast = null;
    this._shakeAt = 0;
    this._onAccel = (res) => this.handleAccel(res);
    if (wx.startAccelerometer) wx.startAccelerometer({ interval: 'normal' });
    if (wx.onAccelerometerChange) wx.onAccelerometerChange(this._onAccel);
    this._shakeBound = true;
  },

  stopShake() {
    if (!this._shakeBound) return;
    if (wx.offAccelerometerChange) wx.offAccelerometerChange(this._onAccel);
    if (wx.stopAccelerometer) wx.stopAccelerometer();
    this._shakeBound = false;
  },

  handleAccel(res) {
    const last = this._shakeLast;
    this._shakeLast = res;
    if (!last) return;
    const delta = Math.abs(res.x - last.x) + Math.abs(res.y - last.y) + Math.abs(res.z - last.z);
    if (delta < 1.3) return; // 阈值:轻微晃动不触发
    const now = Date.now();
    if (now - this._shakeAt < 1200) return; // 防抖:1.2s 内只触发一次
    this._shakeAt = now;
    if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
    this.randomDinnerSet(now);
    Toast({ context: this, selector: '#t-toast', message: '摇出新搭配 🎲' });
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

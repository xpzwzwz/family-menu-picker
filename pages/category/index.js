import Toast from 'tdesign-miniprogram/toast/index';
import { addDishesToTonightMenu, getDishSelectionSections } from '../../model/dishes';
import { readSquadMembers } from '../../model/user';

const SECTION_TOP_OFFSET = 8;
const TAB_BAR_HEIGHT = 76;
const PAGE_VERTICAL_PADDING = 22;

Page({
  data: {
    sections: [],
    activeCategoryId: '',
    scrollTop: 0,
    scrollHeight: 0,
    squadMembers: [],
    selectedMemberId: 'self',
  },

  sectionTops: [],
  scrollTimer: null,

  onShow() {
    this.getTabBar().init();
    this.updateScrollHeight();
    this.refreshSections();
    this.refreshMembers();
  },

  onLoad() {
    this.updateScrollHeight();
    this.refreshSections();
    this.refreshMembers();
  },

  refreshMembers() {
    const squadMembers = readSquadMembers();
    const selectedMemberId = squadMembers.some((member) => member.id === this.data.selectedMemberId)
      ? this.data.selectedMemberId
      : squadMembers[0].id;
    this.setData({ squadMembers, selectedMemberId });
  },

  updateScrollHeight() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const query = this.createSelectorQuery();
    query.select('.page-head').boundingClientRect();
    query.exec((res) => {
      const headRect = res && res[0];
      const headHeight = headRect ? headRect.height : 70;
      const bottomSafeArea = Math.max((windowInfo.screenHeight || 0) - (windowInfo.safeArea ? windowInfo.safeArea.bottom : 0), 0);
      const scrollHeight = Math.max(
        (windowInfo.windowHeight || 0) - headHeight - TAB_BAR_HEIGHT - bottomSafeArea - PAGE_VERTICAL_PADDING,
        260,
      );
      this.setData({ scrollHeight });
    });
  },

  refreshSections() {
    const sections = getDishSelectionSections().filter((section) => section.goodsList.length);
    this.setData(
      {
        sections,
        activeCategoryId: sections[0] ? sections[0].id : '',
      },
      () => this.measureSections(),
    );
  },

  measureSections() {
    const query = this.createSelectorQuery();
    query.select('.dish-scroll').boundingClientRect();
    query.selectAll('.dish-section').boundingClientRect();
    query.exec((res) => {
      const scrollRect = res && res[0];
      const sectionRects = (res && res[1]) || [];
      if (!scrollRect || !sectionRects.length) return;
      this.sectionTops = sectionRects.map((rect, index) => ({
        id: this.data.sections[index].id,
        top: Math.max(rect.top - scrollRect.top, 0),
      }));
    });
  },

  selectCategory(event) {
    const { id } = event.currentTarget.dataset;
    const target = this.sectionTops.find((section) => section.id === id);
    const nextScrollTop = target ? target.top : 0;
    this.setData({
      activeCategoryId: id,
      scrollTop: Math.max(nextScrollTop - 1, 0),
    });
    setTimeout(() => {
      this.setData({ scrollTop: nextScrollTop });
    }, 0);
  },

  onResize() {
    this.updateScrollHeight();
    setTimeout(() => this.measureSections(), 50);
  },

  onUnload() {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
  },

  onHide() {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
  },

  onReady() {
    this.updateScrollHeight();
    setTimeout(() => this.measureSections(), 50);
  },

  onDishScroll(event) {
    const scrollTop = event.detail.scrollTop || 0;
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const current = this.sectionTops.reduce((active, section) => {
        if (scrollTop + SECTION_TOP_OFFSET >= section.top) return section;
        return active;
      }, this.sectionTops[0]);
      if (current && current.id !== this.data.activeCategoryId) {
        this.setData({ activeCategoryId: current.id });
      }
    }, 16);
  },

  addDish(event) {
    const { sectionIndex, goodsIndex } = event.currentTarget.dataset;
    const section = this.data.sections[sectionIndex];
    const goods = section && section.goodsList[goodsIndex];
    if (!goods) return;
    const member = this.data.squadMembers.find((item) => item.id === this.data.selectedMemberId) || this.data.squadMembers[0];
    addDishesToTonightMenu([
      {
        ...goods,
        selectedBy: member ? member.id : '',
        selectedByName: member ? member.name : '',
      },
    ]);
    Toast({
      context: this,
      selector: '#t-toast',
      message: member ? `${member.name} 已加入菜单` : '已加入菜单',
    });
  },

  selectMember(event) {
    const { id } = event.currentTarget.dataset;
    this.setData({ selectedMemberId: id });
  },

  goDishDetail(event) {
    const { id } = event.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/dish/detail/index?id=${id}` });
  },
});

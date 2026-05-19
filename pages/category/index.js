import { getCategoryList } from '../../services/good/fetchCategoryList';

Page({
  data: {
    list: [],
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
  },

  async init() {
    try {
      const list = await getCategoryList();
      this.setData({ list });
    } catch (error) {
      console.error('load dish categories failed:', error);
    }
  },

  openCategory(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goods/list/index?categoryId=${id}&categoryName=${encodeURIComponent(name)}`,
    });
  },
});

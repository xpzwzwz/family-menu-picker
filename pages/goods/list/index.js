import Toast from 'tdesign-miniprogram/toast/index';
import { fetchGoodsList } from '../../../services/good/fetchGoodsList';
import { addDishesToSharedMenu } from '../../../services/squad/cloudMenu';

Page({
  data: {
    categoryId: 'all',
    categoryName: '全部菜品',
    goodsList: [],
    hasLoaded: false,
    loadMoreStatus: 0,
    loading: true,
  },

  pageNum: 1,
  pageSize: 30,
  total: 0,

  onLoad(options = {}) {
    const categoryId = options.categoryId || 'all';
    const categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : '全部菜品';
    this.setData({ categoryId, categoryName });
    wx.setNavigationBarTitle({ title: categoryName });
    this.init(true);
  },

  async init(reset = true) {
    if (this.data.loadMoreStatus !== 0 && !reset) return;
    const pageNum = reset ? 1 : this.pageNum + 1;
    this.setData({ loadMoreStatus: 1, loading: true });

    try {
      const result = await fetchGoodsList({
        categoryId: this.data.categoryId,
        pageNum,
        pageSize: this.pageSize,
      });
      const nextList = reset ? result.spuList : this.data.goodsList.concat(result.spuList);
      this.pageNum = pageNum;
      this.total = result.totalCount || nextList.length;
      this.setData({
        goodsList: nextList,
        hasLoaded: true,
        loading: false,
        loadMoreStatus: nextList.length >= this.total ? 2 : 0,
      });
    } catch (error) {
      this.setData({
        hasLoaded: true,
        loading: false,
        loadMoreStatus: 3,
      });
    }
  },

  onReachBottom() {
    if (this.data.goodsList.length >= this.total) {
      this.setData({ loadMoreStatus: 2 });
      return;
    }
    this.init(false);
  },

  handleAddCart(event) {
    const { index } = event.currentTarget.dataset;
    const goods = this.data.goodsList[index];
    if (!goods) return;
    addDishesToSharedMenu([goods])
      .then(() => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '已加入菜单',
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

  goMenu() {
    wx.switchTab({ url: '/pages/cart/index' });
  },
});

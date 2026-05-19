import Toast from 'tdesign-miniprogram/toast/index';

const shortageImg = 'https://tdesign.gtimg.com/miniprogram/template/retail/cart/shortage.png';

Component({
  isSpecsTap: false,
  externalClasses: ['wr-class'],
  properties: {
    storeGoods: {
      type: Array,
      observer(storeGoods) {
        for (const store of storeGoods) {
          for (const activity of store.promotionGoodsList) {
            for (const goods of activity.goodsPromotionList) {
              goods.specs = goods.specInfo.map((item) => item.specValue);
            }
          }
          for (const goods of store.shortageGoodsList) {
            goods.specs = goods.specInfo.map((item) => item.specValue);
          }
        }

        this.setData({ _storeGoods: storeGoods });
      },
    },
    invalidGoodItems: {
      type: Array,
      observer(invalidGoodItems) {
        invalidGoodItems.forEach((goods) => {
          goods.specs = goods.specInfo.map((item) => item.specValue);
        });
        this.setData({ _invalidGoodItems: invalidGoodItems });
      },
    },
    thumbWidth: { type: null },
    thumbHeight: { type: null },
  },

  data: {
    shortageImg,
    isShowSpecs: false,
    currentGoods: {},
    isShowToggle: false,
    _storeGoods: [],
    _invalidGoodItems: [],
  },

  methods: {
    deleteGoods(e) {
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('delete', { goods });
    },

    clearInvalidGoods() {
      this.triggerEvent('clearinvalidgoods');
    },

    selectGoods(e) {
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('selectgoods', {
        goods,
        isSelected: !goods.isSelected,
      });
    },

    changeQuantity(num, goods) {
      this.triggerEvent('changequantity', {
        goods,
        quantity: num,
      });
    },
    changeStepper(e) {
      const { value } = e.detail;
      const { goods } = e.currentTarget.dataset;
      let num = value;
      if (value > goods.stack) {
        num = goods.stack;
      }
      this.changeQuantity(num, goods);
    },

    input(e) {
      const { value } = e.detail;
      const { goods } = e.currentTarget.dataset;
      const num = value;
      this.changeQuantity(num, goods);
    },

    overlimit(e) {
      const text = e.detail.type === 'minus' ? '这道菜至少保留 1 份' : '同一道菜最多 999 份';
      Toast({
        context: this,
        selector: '#t-toast',
        message: text,
      });
    },

    gotoBuyMore(e) {
      const { promotion, storeId = '' } = e.currentTarget.dataset;
      this.triggerEvent('gocollect', { promotion, storeId });
    },

    selectStore(e) {
      const { storeIndex } = e.currentTarget.dataset;
      const store = this.data.storeGoods[storeIndex];
      const isSelected = !store.isSelected;
      if (store.storeStockShortage && isSelected) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '部分菜品暂不适合选择',
        });
        return;
      }
      this.triggerEvent('selectstore', {
        store,
        isSelected,
      });
    },

    showToggle() {
      this.setData({
        isShowToggle: !this.data.isShowToggle,
      });
    },

    specsTap(e) {
      this.isSpecsTap = true;
      const { goods } = e.currentTarget.dataset;
      this.setData({
        isShowSpecs: true,
        currentGoods: goods,
      });
    },

    hideSpecsPopup() {
      this.setData({
        isShowSpecs: false,
      });
    },

    goGoodsDetail(e) {
      if (this.isSpecsTap) {
        this.isSpecsTap = false;
        return;
      }
      const { goods } = e.currentTarget.dataset;
      this.triggerEvent('goodsclick', { goods });
    },

    gotoCoupons() {
      wx.navigateTo({ url: '/pages/coupon/coupon-list/index' });
    },
  },
});

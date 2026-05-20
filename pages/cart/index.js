import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { fetchCartGroupData } from '../../services/cart/cart';
import { removeTonightMenuItem, updateTonightMenuItem } from '../../model/dishes';

Page({
  data: {
    cartGroupData: null,
  },

  onShow() {
    this.getTabBar().init();
    this.setData({ cartGroupData: null });
    this.refreshData();
  },

  refreshData() {
    this.getCartGroupData().then((res) => {
      let isEmpty = true;
      const cartGroupData = res.data;
      for (const store of cartGroupData.storeGoods) {
        store.isSelected = true;
        store.storeStockShortage = false;
        if (!store.shortageGoodsList) {
          store.shortageGoodsList = [];
        }
        for (const activity of store.promotionGoodsList) {
          activity.goodsPromotionList = activity.goodsPromotionList.filter((goods) => {
            goods.originPrice = undefined;

            if (goods.quantity > goods.stockQuantity) {
              store.storeStockShortage = true;
            }
            if (!goods.isSelected) {
              store.isSelected = false;
            }
            if (goods.stockQuantity > 0) {
              return true;
            }
            store.shortageGoodsList.push(goods);
            return false;
          });

          if (activity.goodsPromotionList.length > 0) {
            isEmpty = false;
          }
        }
        if (store.shortageGoodsList.length > 0) {
          isEmpty = false;
        }
      }
      cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.map((goods) => {
        goods.originPrice = undefined;
        return goods;
      });
      cartGroupData.isNotEmpty = !isEmpty;
      this.setData({ cartGroupData });
    });
  },

  findGoods(spuId, skuId) {
    let currentStore;
    let currentActivity;
    let currentGoods;
    const { storeGoods } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        for (const goods of activity.goodsPromotionList) {
          if (goods.spuId === spuId && goods.skuId === skuId) {
            currentStore = store;
            currentActivity = currentActivity;
            currentGoods = goods;
            return {
              currentStore,
              currentActivity,
              currentGoods,
            };
          }
        }
      }
    }
    return {
      currentStore,
      currentActivity,
      currentGoods,
    };
  },

  getCartGroupData() {
    const { cartGroupData } = this.data;
    if (!cartGroupData) {
      return fetchCartGroupData();
    }
    return Promise.resolve({ data: cartGroupData });
  },

  selectGoodsService({ spuId, skuId, isSelected }) {
    this.findGoods(spuId, skuId).currentGoods.isSelected = isSelected;
    updateTonightMenuItem(spuId, skuId, { isSelected: isSelected ? 1 : 0 });
    return Promise.resolve();
  },

  selectStoreService({ storeId, isSelected }) {
    const currentStore = this.data.cartGroupData.storeGoods.find((s) => s.storeId === storeId);
    currentStore.isSelected = isSelected;
    currentStore.promotionGoodsList.forEach((activity) => {
      activity.goodsPromotionList.forEach((goods) => {
        goods.isSelected = isSelected;
        updateTonightMenuItem(goods.spuId, goods.skuId, { isSelected: isSelected ? 1 : 0 });
      });
    });
    return Promise.resolve();
  },

  changeQuantityService({ spuId, skuId, quantity }) {
    this.findGoods(spuId, skuId).currentGoods.quantity = quantity;
    updateTonightMenuItem(spuId, skuId, { quantity });
    return Promise.resolve();
  },

  deleteGoodsService({ spuId, skuId }) {
    function deleteGoods(group) {
      for (const gindex in group) {
        const goods = group[gindex];
        if (goods.spuId === spuId && goods.skuId === skuId) {
          group.splice(gindex, 1);
          removeTonightMenuItem(spuId, skuId);
          return gindex;
        }
      }
      return -1;
    }
    const { storeGoods, invalidGoodItems } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        if (deleteGoods(activity.goodsPromotionList) > -1) {
          return Promise.resolve();
        }
      }
      if (deleteGoods(store.shortageGoodsList) > -1) {
        return Promise.resolve();
      }
    }
    if (deleteGoods(invalidGoodItems) > -1) {
      return Promise.resolve();
    }
    return Promise.reject();
  },

  clearInvalidGoodsService() {
    this.data.cartGroupData.invalidGoodItems = [];
    return Promise.resolve();
  },

  onGoodsSelect(e) {
    const {
      goods: { spuId, skuId },
      isSelected,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isSelected ? '选择' : '取消'}"${
        currentGoods.title.length > 5 ? `${currentGoods.title.slice(0, 5)}...` : currentGoods.title
      }"`,
      icon: '',
    });
    this.selectGoodsService({ spuId, skuId, isSelected }).then(() => this.refreshData());
  },

  onStoreSelect(e) {
    const {
      store: { storeId },
      isSelected,
    } = e.detail;
    this.selectStoreService({ storeId, isSelected }).then(() => this.refreshData());
  },

  onQuantityChange(e) {
    const {
      goods: { spuId, skuId },
      quantity,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    const stockQuantity = currentGoods.stockQuantity > 0 ? currentGoods.stockQuantity : 0;
    if (quantity > stockQuantity) {
      if (currentGoods.quantity === stockQuantity && quantity - stockQuantity === 1) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '这道菜数量太多了',
        });
        return;
      }
      Dialog.confirm({
        title: '数量超过建议',
        content: `这道菜最多建议准备${stockQuantity}份`,
        confirmBtn: '修改为建议数量',
        cancelBtn: '取消',
      })
        .then(() => {
          this.changeQuantityService({
            spuId,
            skuId,
            quantity: stockQuantity,
          }).then(() => this.refreshData());
        })
        .catch(() => {});
      return;
    }
    this.changeQuantityService({ spuId, skuId, quantity }).then(() => this.refreshData());
  },

  goCollect() {
    wx.switchTab({ url: '/pages/category/index' });
  },

  goGoodsDetail(e) {
    const { title } = e.detail.goods;
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${title} 已在今晚菜单中`,
    });
  },

  clearInvalidGoods() {
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const {
      goods: { spuId, skuId },
    } = e.detail;
    Dialog.confirm({
      content: '确认从今晚菜单删除这道菜吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({ spuId, skuId }).then(() => {
        Toast({ context: this, selector: '#t-toast', message: '已从今晚菜单删除' });
        this.refreshData();
      });
    });
  },

  onSelectAll(event) {
    const { isAllSelected } = (event && event.detail) || {};
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isAllSelected ? '取消' : '点击'}了全选按钮`,
    });
    this.selectStoreService({ storeId: 'family-kitchen', isSelected: !isAllSelected }).then(() => this.refreshData());
  },

  onToSettle() {
    const goodsRequestList = [];
    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((m) => {
          if (m.isSelected === 1) {
            goodsRequestList.push(m);
          }
        });
      });
    });
    wx.setStorageSync('order.goodsRequestList', JSON.stringify(goodsRequestList));
    wx.navigateTo({ url: '/pages/order/order-confirm/index?type=cart' });
  },
  onGotoHome() {
    wx.switchTab({ url: '/pages/category/index' });
  },
});

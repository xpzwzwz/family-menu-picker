import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { fetchCartGroupData } from '../../services/cart/cart';
import { saveConfirmedMenu } from '../../model/dishes';
import {
  removeSharedMenuItem,
  replaceSharedMenu,
  setAllSharedMenuSelected,
  syncCloudMenuToLocal,
  updateSharedMenuItem,
} from '../../services/squad/cloudMenu';

function isDishSelected(value) {
  return value === true || value === 1;
}

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
    this.loadCloudMenuIfNeeded()
      .catch((error) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: error.message || '菜单同步失败，先显示本机菜单',
        });
      })
      .then(() => this.getCartGroupData())
      .then((res) => {
        let isEmpty = true;
        const cartGroupData = res.data;
        for (const store of cartGroupData.storeGoods) {
          store.isSelected = true;
          store.storeStockShortage = false;
          if (!store.shortageGoodsList) {
            store.shortageGoodsList = [];
          }
          for (let activityIndex = 0; activityIndex < store.promotionGoodsList.length; activityIndex += 1) {
            const activity = store.promotionGoodsList[activityIndex];
            const goodsPromotionList = activity.goodsPromotionList
              .map((goods) => ({ ...goods, originPrice: undefined }))
              .filter((goods) => {
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
            store.promotionGoodsList[activityIndex] = { ...activity, goodsPromotionList };

            if (goodsPromotionList.length > 0) {
              isEmpty = false;
            }
          }
          if (store.shortageGoodsList.length > 0) {
            isEmpty = false;
          }
        }
        cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.map((goods) => ({
          ...goods,
          originPrice: undefined,
        }));
        cartGroupData.isNotEmpty = !isEmpty;
        this.setData({ cartGroupData });
      });
  },

  loadCloudMenuIfNeeded() {
    return syncCloudMenuToLocal();
  },

  withSyncToast(promise) {
    return promise.catch((error) => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '菜单暂时没同步给队友',
      });
      throw error;
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
            currentActivity = activity;
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
    const { currentGoods } = this.findGoods(spuId, skuId);
    if (!currentGoods) return Promise.reject(new Error('missing goods'));
    currentGoods.isSelected = isSelected;
    return this.withSyncToast(updateSharedMenuItem(spuId, skuId, { isSelected: isSelected ? 1 : 0 }));
  },

  selectStoreService({ storeId, isSelected }) {
    const currentStore = this.data.cartGroupData.storeGoods.find((s) => s.storeId === storeId);
    if (!currentStore) return Promise.reject(new Error('missing store'));
    currentStore.isSelected = isSelected;
    currentStore.promotionGoodsList = currentStore.promotionGoodsList.map((activity) => {
      const goodsPromotionList = activity.goodsPromotionList.map((goods) => ({ ...goods, isSelected }));
      return { ...activity, goodsPromotionList };
    });
    return this.withSyncToast(setAllSharedMenuSelected(isSelected));
  },

  changeQuantityService({ spuId, skuId, quantity }) {
    const { currentGoods } = this.findGoods(spuId, skuId);
    if (!currentGoods) return Promise.reject(new Error('missing goods'));
    currentGoods.quantity = quantity;
    return this.withSyncToast(updateSharedMenuItem(spuId, skuId, { quantity }));
  },

  deleteGoodsService({ spuId, skuId }) {
    function deleteGoods(group) {
      for (const gindex in group) {
        const goods = group[gindex];
        if (goods.spuId === spuId && goods.skuId === skuId) {
          group.splice(gindex, 1);
          return gindex;
        }
      }
      return -1;
    }
    const { storeGoods, invalidGoodItems } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        if (deleteGoods(activity.goodsPromotionList) > -1) {
          return this.withSyncToast(removeSharedMenuItem(spuId, skuId));
        }
      }
      if (deleteGoods(store.shortageGoodsList) > -1) {
        return this.withSyncToast(removeSharedMenuItem(spuId, skuId));
      }
    }
    if (deleteGoods(invalidGoodItems) > -1) {
      return this.withSyncToast(removeSharedMenuItem(spuId, skuId));
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
    if (!currentGoods) {
      Toast({ context: this, selector: '#t-toast', message: '这道菜刚刚变动了，刷新后再试' });
      this.refreshData();
      return;
    }
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isSelected ? '选择' : '取消'}"${
        currentGoods.title.length > 5 ? `${currentGoods.title.slice(0, 5)}...` : currentGoods.title
      }"`,
      icon: '',
    });
    this.selectGoodsService({ spuId, skuId, isSelected })
      .then(() => this.refreshData())
      .catch(() => this.refreshData());
  },

  onStoreSelect(e) {
    const {
      store: { storeId },
      isSelected,
    } = e.detail;
    this.selectStoreService({ storeId, isSelected })
      .then(() => this.refreshData())
      .catch(() => this.refreshData());
  },

  onQuantityChange(e) {
    const {
      goods: { spuId, skuId },
      quantity,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    if (!currentGoods) {
      Toast({ context: this, selector: '#t-toast', message: '这道菜刚刚变动了，刷新后再试' });
      this.refreshData();
      return;
    }
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
          })
            .then(() => this.refreshData())
            .catch(() => this.refreshData());
        })
        .catch(() => {});
      return;
    }
    this.changeQuantityService({ spuId, skuId, quantity })
      .then(() => this.refreshData())
      .catch(() => this.refreshData());
  },

  goCollect() {
    wx.switchTab({ url: '/pages/category/index' });
  },

  goBasket() {
    wx.navigateTo({ url: '/pages/menu/basket/index' });
  },

  goGoodsDetail(e) {
    const { spuId } = e.detail.goods;
    if (!spuId) return;
    wx.navigateTo({ url: `/pages/dish/detail/index?id=${spuId}&from=menu` });
  },

  clearInvalidGoods() {
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const {
      goods: { spuId, skuId },
    } = e.detail;
    Dialog.confirm({
      content: '从菜单里移除这道菜吗？',
      confirmBtn: '移除',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({ spuId, skuId })
        .then(() => {
          Toast({ context: this, selector: '#t-toast', message: '已从菜单删除' });
          this.refreshData();
        })
        .catch(() => this.refreshData());
    });
  },

  onSelectAll(event) {
    const { isAllSelected } = (event && event.detail) || {};
    Toast({
      context: this,
      selector: '#t-toast',
      message: isAllSelected ? '已取消全选' : '已全选',
    });
    this.selectStoreService({ storeId: 'family-kitchen', isSelected: !isAllSelected })
      .then(() => this.refreshData())
      .catch(() => this.refreshData());
  },

  // 一键清空当前菜单、重新开始选菜(区别于「本顿已完成」:不存入菜单历史)。
  // 同样是整单权威清空(本地+云端),所以清的是整个小分队的菜单,弹框讲清楚。
  onClearMenu() {
    if (!this.data.cartGroupData || !this.data.cartGroupData.isNotEmpty) {
      Toast({ context: this, selector: '#t-toast', message: '菜单还是空的' });
      return;
    }
    Dialog.confirm({
      title: '清空菜单重新选？',
      content: '会清空整个小分队的菜单，且不会存入菜单历史。',
      confirmBtn: '清空',
      cancelBtn: '取消',
    })
      .then(() => {
        replaceSharedMenu([])
          .then(() => {
            Toast({ context: this, selector: '#t-toast', message: '已清空，重新选菜吧' });
            this.setData({ cartGroupData: null });
            this.refreshData();
          })
          .catch(() => {
            Toast({ context: this, selector: '#t-toast', message: '清空没同步成功，稍后再试' });
            this.refreshData();
          });
      })
      .catch(() => {});
  },

  onToSettle() {
    const goodsRequestList = [];
    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((m) => {
          if (isDishSelected(m.isSelected)) {
            goodsRequestList.push(m);
          }
        });
      });
    });
    if (!goodsRequestList.length) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '先选几道菜',
      });
      return;
    }
    // 「本顿已完成」是用户主动结束这一顿:先确认(会清空整个小分队的共享菜单),
    // 再把这桌菜存进本机「菜单历史」做备料快照,然后权威地整单清空(本地+云端)。
    // 注意区别于以前的 bug:那是改量/同步时「误把空菜单推云端」清掉队友在点的菜;
    // 这里是显式的「吃完清桌」,清空是预期行为,菜也已存进历史可复用。
    Dialog.confirm({
      title: '本顿吃完了吗？',
      content: '会把这桌菜存进「菜单历史」，并清空当前菜单（整个小分队的），方便开始下一顿。',
      confirmBtn: '完成并清空',
      cancelBtn: '再等等',
    })
      .then(() => {
        saveConfirmedMenu({
          goodsList: goodsRequestList,
          summary: {
            totalQuantity: goodsRequestList.reduce((sum, item) => sum + (item.quantity || 1), 0),
            totalCookMinutes: goodsRequestList.reduce(
              (sum, item) => sum + (item.cookMinutes || 0) * (item.quantity || 1),
              0,
            ),
            tags: [],
          },
          note: '',
        });
        return replaceSharedMenu([])
          .then(() => {
            Toast({ context: this, selector: '#t-toast', message: '本顿完成，菜单已清空' });
            this.setData({ cartGroupData: null });
            this.refreshData();
          })
          .catch(() => {
            Toast({ context: this, selector: '#t-toast', message: '已存历史，但清空没同步成功，稍后再试' });
            this.refreshData();
          });
      })
      .catch(() => {});
  },
  onGotoHome() {
    wx.switchTab({ url: '/pages/category/index' });
  },
});

import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { readMenuHistory, reuseMenuHistoryEntry } from '../../../model/dishes';
import { syncLocalMenuToCloud } from '../../../services/squad/cloudMenu';

function formatConfirmedAt(timestamp) {
  if (!timestamp) return '暂无';
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${minute}`;
}

function formatHistoryEntry(entry) {
  const goodsList = Array.isArray(entry.goodsList) ? entry.goodsList : [];
  const summary = entry.summary || {};
  return {
    id: entry.id,
    confirmedAtText: formatConfirmedAt(entry.confirmedAt),
    dishCount: goodsList.length,
    totalCookMinutes: summary.totalCookMinutes || 0,
    dishNames: goodsList
      .map((goods) => goods.title)
      .filter(Boolean)
      .join(' / '),
    note: entry.note || '',
  };
}

Page({
  data: {
    historyList: [],
  },

  onShow() {
    this.refreshHistory();
  },

  refreshHistory() {
    this.setData({
      historyList: readMenuHistory().map(formatHistoryEntry),
    });
  },

  reuseHistoryMenu(event) {
    const { id } = event.currentTarget.dataset;
    Dialog.confirm({
      title: '替换我的菜单？',
      content: '会用这条历史菜单覆盖当前已选菜品。',
      confirmBtn: '替换',
      cancelBtn: '取消',
    })
      .then(() => {
        const nextMenu = reuseMenuHistoryEntry(id);
        if (!nextMenu.length) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '没有找到这条历史菜单',
          });
          return;
        }
        syncLocalMenuToCloud()
          .catch((error) => {
            Toast({
              context: this,
              selector: '#t-toast',
              message: error.message || '历史菜单暂时没同步给队友',
            });
          })
          .then(() => wx.switchTab({ url: '/pages/cart/index' }));
      })
      .catch(() => {});
  },
});

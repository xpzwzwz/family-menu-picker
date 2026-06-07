import Toast from 'tdesign-miniprogram/toast/index';
import { createCloudRoom, readCloudUser } from '../../../services/squad/cloudSquad';

Page({
  data: {
    roomName: '光盘小分队',
    memberName: '我',
    saving: false,
    cloudError: '',
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [field]: event.detail.value });
  },

  createRoom() {
    const roomName = String(this.data.roomName || '').trim();
    const memberName = String(this.data.memberName || '').trim();
    if (!roomName) {
      this.setData({ cloudError: '小分队名称不能为空' });
      return;
    }
    this.setData({ saving: true, cloudError: '' });
    createCloudRoom({
      name: roomName,
      memberName: memberName || '我',
    })
      .then(() => {
        Toast({ context: this, selector: '#t-toast', message: '小分队已创建' });
        setTimeout(() => wx.navigateBack(), 350);
      })
      .catch((error) =>
        this.setData({
          saving: false,
          cloudError: friendlyError(error, '还没创建好，稍后再试'),
        }),
      );
  },
});

function friendlyError(error, fallback) {
  const message = String((error && error.message) || '').trim();
  if (!message) return fallback;
  if (!readCloudUser()) return '请先返回我的小分队准备一下';
  return message;
}

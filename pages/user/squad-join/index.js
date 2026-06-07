import Toast from 'tdesign-miniprogram/toast/index';
import { joinCloudRoom, previewCloudRoom } from '../../../services/squad/cloudSquad';

Page({
  data: {
    inviteCode: '',
    memberName: '我',
    joinPreview: null,
    joining: false,
    cloudError: '',
  },

  onLoad(options = {}) {
    if (options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode });
      this.previewInvite();
    }
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [field]: event.detail.value });
  },

  previewInvite() {
    previewCloudRoom(this.data.inviteCode)
      .then((preview) => this.setData({ joinPreview: preview, cloudError: '' }))
      .catch(() => this.setData({ joinPreview: null, cloudError: '没找到这个口令，检查一下有没有输错' }));
  },

  joinRoom() {
    this.setData({ joining: true, cloudError: '' });
    joinCloudRoom(this.data.inviteCode, {
      memberName: this.data.memberName,
      role: '成员',
      flavorPreference: '',
    })
      .then(() => {
        Toast({ context: this, selector: '#t-toast', message: '已加入这个小分队' });
        setTimeout(() => wx.navigateBack(), 350);
      })
      .catch(() => this.setData({ joining: false, cloudError: '还没加入成功，稍后再试' }));
  },
});

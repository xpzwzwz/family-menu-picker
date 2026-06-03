import Toast from 'tdesign-miniprogram/toast/index';
import { readUserProfile, saveUserProfile } from '../../../model/user';

function getDefaultForm() {
  return {
    nickname: '',
    role: '',
    flavorPreference: '',
    note: '',
  };
}

Page({
  data: {
    form: getDefaultForm(),
  },

  onLoad() {
    this.setData({ form: readUserProfile() });
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  saveProfile() {
    const { nickname } = this.data.form;
    if (!String(nickname || '').trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入昵称',
      });
      return;
    }
    saveUserProfile(this.data.form);
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已保存资料',
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },
});

import Toast from 'tdesign-miniprogram/toast/index';
import { FEEDBACK_TYPES, submitFeedback } from '../../../model/user';

function getDefaultForm() {
  return {
    type: FEEDBACK_TYPES[0].value,
    content: '',
    contact: '',
  };
}

Page({
  data: {
    feedbackTypes: FEEDBACK_TYPES,
    form: getDefaultForm(),
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  selectType(event) {
    const { value } = event.currentTarget.dataset;
    this.setData({ 'form.type': value });
  },

  submit() {
    try {
      submitFeedback(this.data.form);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已经记下来了',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '先写一点内容吧',
      });
    }
  },
});

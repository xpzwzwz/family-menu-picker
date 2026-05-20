import Toast from 'tdesign-miniprogram/toast/index';
import { addCustomDish, dishCategories } from '../../../model/dishes';

const difficultyOptions = ['简单', '中等', '费事'];

Page({
  data: {
    form: {
      name: '',
      category: '',
      cookMinutes: '',
      difficulty: '简单',
      flavor: '',
      tagsText: '',
      notes: '',
    },
    categoryOptions: dishCategories,
    difficultyOptions,
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: event.detail.value,
    });
  },

  selectCategory(event) {
    const { value } = event.currentTarget.dataset;
    this.setData({ 'form.category': value });
  },

  selectDifficulty(event) {
    const { value } = event.currentTarget.dataset;
    this.setData({ 'form.difficulty': value });
  },

  showToast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
    });
  },

  validateForm() {
    const { name, category, cookMinutes, difficulty } = this.data.form;
    if (!name.trim()) return '请输入菜名';
    if (!category) return '请选择分类';
    if (!Number(cookMinutes) || Number(cookMinutes) <= 0) return '请输入预计分钟';
    if (!difficulty) return '请选择难度';
    return '';
  },

  submitDish() {
    const errorMessage = this.validateForm();
    if (errorMessage) {
      this.showToast(errorMessage);
      return;
    }

    addCustomDish(this.data.form);
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已新增菜品',
    });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/category/index' });
    }, 500);
  },
});

import Toast from 'tdesign-miniprogram/toast/index';
import { addCustomDish, dishCategories, getDishById, getDishPlaceholderImage, updateDish } from '../../../model/dishes';
import { uploadDishImage } from '../../../services/dish/uploadImage';

const difficultyOptions = ['简单', '中等', '费事'];

function getDefaultForm() {
  return {
    name: '',
    category: '',
    cookMinutes: '',
    difficulty: '简单',
    flavor: '',
    image: '',
    tagsText: '',
    notes: '',
  };
}

function formatDishForm(dish) {
  return {
    name: dish.name,
    category: dish.category,
    cookMinutes: String(dish.cookMinutes || ''),
    difficulty: dish.difficulty || '简单',
    flavor: dish.flavor || '',
    image: dish.image || getDishPlaceholderImage(dish.category),
    tagsText: Array.isArray(dish.tags) ? dish.tags.join('，') : '',
    notes: dish.notes || '',
  };
}

Page({
  data: {
    editingId: '',
    modeTitle: '新增菜品',
    submitText: '保存菜品',
    form: getDefaultForm(),
    categoryOptions: dishCategories,
    difficultyOptions,
    uploadingImage: false,
  },

  onLoad(options = {}) {
    if (!options.id) return;

    const dish = getDishById(options.id);
    if (!dish) {
      this.showToast('没有找到这道菜');
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/dish/manage/index' });
      }, 500);
      return;
    }

    wx.setNavigationBarTitle({ title: '编辑菜品' });
    this.setData({
      editingId: dish.id,
      modeTitle: '编辑菜品',
      submitText: '保存修改',
      form: formatDishForm(dish),
    });
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: event.detail.value,
    });
  },

  selectCategory(event) {
    const { value } = event.currentTarget.dataset;
    const nextData = { 'form.category': value };
    if (!this.data.form.image || this.data.form.image.startsWith('/assets/dishes/')) {
      nextData['form.image'] = getDishPlaceholderImage(value);
    }
    this.setData(nextData);
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

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (!file || !file.tempFilePath) return;
        this.setData({ uploadingImage: true });
        try {
          const imageUrl = await uploadDishImage(file.tempFilePath);
          this.setData({ 'form.image': imageUrl });
          this.showToast('图片已保存');
        } catch (error) {
          this.setData({ 'form.image': file.tempFilePath });
          this.showToast('图片暂存到本机');
        } finally {
          this.setData({ uploadingImage: false });
        }
      },
      fail: () => {},
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

    if (this.data.editingId) {
      const updatedDish = updateDish(this.data.editingId, this.data.form);
      if (!updatedDish) {
        this.showToast('没有找到这道菜');
        return;
      }

      Toast({
        context: this,
        selector: '#t-toast',
        message: '已保存修改',
      });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/dish/manage/index' });
      }, 500);
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

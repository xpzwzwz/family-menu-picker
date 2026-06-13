import Toast from 'tdesign-miniprogram/toast/index';
import {
  addCustomDish,
  getDishById,
  getDishCategoryOptions,
  getDishPlaceholderImage,
  updateDish,
} from '../../../model/dishes';
import { uploadDishImage } from '../../../services/dish/uploadImage';
import { buildStepPreviews, syncStepImagesWithSteps } from './stepImages';

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
    ingredientsText: '',
    stepsText: '',
    stepImages: [],
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
    ingredientsText: Array.isArray(dish.ingredients)
      ? dish.ingredients
          .map((name) => (dish.amounts && dish.amounts[name] ? `${name} ${dish.amounts[name]}` : name))
          .join('，')
      : '',
    stepsText: Array.isArray(dish.steps) ? dish.steps.map((step) => step.description || step.title).join('\n') : '',
    stepImages: Array.isArray(dish.steps) ? dish.steps.map((step) => step.image || '') : [],
    notes: dish.notes || '',
  };
}

Page({
  data: {
    editingId: '',
    modeTitle: '新增菜品',
    submitText: '保存菜品',
    form: getDefaultForm(),
    categoryOptions: getDishCategoryOptions(),
    difficultyOptions,
    uploadingImage: false,
    stepPreviews: [],
  },

  onLoad(options = {}) {
    if (!options.id) {
      this.refreshStepPreviews();
      return;
    }

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
    this.refreshStepPreviews();
  },

  onShow() {
    this.setData({ categoryOptions: getDishCategoryOptions() });
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    if (field === 'stepsText') {
      const stepImages = syncStepImagesWithSteps(this.data.stepPreviews, event.detail.value);
      this.setData({
        'form.stepsText': event.detail.value,
        'form.stepImages': stepImages,
        stepPreviews: buildStepPreviews(event.detail.value, stepImages),
      });
      return;
    }
    this.setData({
      [`form.${field}`]: event.detail.value,
    });
  },

  refreshStepPreviews(nextStepsText = this.data.form.stepsText) {
    this.setData({
      stepPreviews: buildStepPreviews(nextStepsText, this.data.form.stepImages),
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

  // 先让用户明确选「拍照 / 从相册选择」，再按所选来源调起 chooseMedia，
  // 选完压缩并上传到 OSS；失败则暂存本机临时路径，并给出可见提示。
  pickAndUploadImage(onUploaded, { okMsg = '图片已保存', tempMsg = '图片暂存到本机' } = {}) {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: ({ tapIndex }) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: tapIndex === 0 ? ['camera'] : ['album'],
          success: async (res) => {
            const file = res.tempFiles && res.tempFiles[0];
            if (!file || !file.tempFilePath) return;
            this.setData({ uploadingImage: true });
            try {
              const imageUrl = await uploadDishImage(file.tempFilePath);
              onUploaded(imageUrl);
              this.showToast(okMsg);
            } catch (error) {
              onUploaded(file.tempFilePath);
              this.showToast(tempMsg);
            } finally {
              this.setData({ uploadingImage: false });
            }
          },
          fail: (err) => {
            if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
              this.showToast('打开相机/相册失败');
            }
          },
        });
      },
      fail: () => {},
    });
  },

  chooseImage() {
    this.pickAndUploadImage((url) => this.setData({ 'form.image': url }));
  },

  chooseStepImage(event) {
    const { index } = event.currentTarget.dataset;
    this.pickAndUploadImage((url) => this.setStepImage(index, url), {
      okMsg: '步骤图已保存',
      tempMsg: '步骤图暂存到本机',
    });
  },

  removeStepImage(event) {
    const { index } = event.currentTarget.dataset;
    this.setStepImage(index, '');
  },

  setStepImage(index, image) {
    const stepImages = [...(this.data.form.stepImages || [])];
    stepImages[index] = image;
    this.setData({ 'form.stepImages': stepImages });
    this.refreshStepPreviews();
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

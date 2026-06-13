import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  addDishCategory,
  deleteDishCategory,
  getDishCategoryOptions,
  restoreDishCategoryDefaults,
  updateDishCategory,
} from '../../../model/dishes';

const OTHER_CATEGORY_ID = 'other';

function getDefaultForm() {
  return {
    id: '',
    name: '',
    description: '',
  };
}

function formatCategory(category) {
  const isOther = category.id === OTHER_CATEGORY_ID;
  return {
    ...category,
    description: category.description || '暂无描述',
    editable: !isOther,
    badgeText: isOther ? '系统' : category.isCustom ? '自定义' : '内置',
  };
}

Page({
  data: {
    categoryList: [],
    editing: false,
    submitText: '新增分类',
    form: getDefaultForm(),
  },

  onShow() {
    this.refreshCategories();
  },

  refreshCategories() {
    this.setData({
      categoryList: getDishCategoryOptions().map(formatCategory),
    });
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  editCategory(event) {
    const { id } = event.currentTarget.dataset;
    const category = getDishCategoryOptions().find((item) => item.id === id);
    if (!category || category.id === OTHER_CATEGORY_ID) {
      this.showToast('「其他」不能编辑');
      return;
    }

    this.setData({
      editing: true,
      submitText: '保存分类',
      form: {
        id: category.id,
        name: category.name,
        description: category.description || '',
      },
    });
  },

  resetForm() {
    this.setData({
      editing: false,
      submitText: '新增分类',
      form: getDefaultForm(),
    });
  },

  submitCategory() {
    const name = this.data.form.name.trim();
    const description = this.data.form.description.trim();
    if (!name) {
      this.showToast('请输入分类名称');
      return;
    }

    if (this.data.editing) {
      const updated = updateDishCategory(this.data.form.id, { name, description });
      if (!updated) {
        this.showToast('没有找到这个分类');
        return;
      }
      this.showToast('已保存分类');
    } else {
      const added = addDishCategory({ name, description });
      if (!added) {
        this.showToast('请输入分类名称');
        return;
      }
      this.showToast('已新增分类');
    }

    this.resetForm();
    this.refreshCategories();
  },

  deleteCategory(event) {
    const { id } = event.currentTarget.dataset;
    const category = getDishCategoryOptions().find((item) => item.id === id);
    if (!category || category.id === OTHER_CATEGORY_ID) {
      this.showToast('「其他」不能删除');
      return;
    }

    const isBuiltIn = !category.isCustom;
    Dialog.confirm({
      title: `删除「${category.name}」分组？`,
      content: isBuiltIn
        ? '该分组下的菜会自动归到「其他」。内置分组之后可以用「恢复默认分组」找回。'
        : '该分组下的菜会自动归到「其他」。',
      confirmBtn: '删除',
      cancelBtn: '取消',
    })
      .then(() => {
        const deleted = deleteDishCategory(id);
        if (!deleted) {
          this.showToast('没有找到这个分组');
          return;
        }
        this.resetForm();
        this.refreshCategories();
        this.showToast('已删除，菜品已归到其他');
      })
      .catch(() => {});
  },

  restoreDefaults() {
    Dialog.confirm({
      title: '恢复默认分组？',
      content: '会还原系统自带的 6 个分组（名字和增删都重置）。你新增的自定义分组不受影响。',
      confirmBtn: '恢复',
      cancelBtn: '取消',
    })
      .then(() => {
        restoreDishCategoryDefaults();
        this.resetForm();
        this.refreshCategories();
        this.showToast('已恢复默认分组');
      })
      .catch(() => {});
  },

  showToast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
    });
  },
});

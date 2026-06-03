import Toast from 'tdesign-miniprogram/toast/index';
import { addSquadMember, deleteSquadMember, readSquadMembers, updateSquadMember } from '../../../model/user';

function getDefaultForm() {
  return {
    id: '',
    name: '',
    role: '',
    flavorPreference: '',
  };
}

Page({
  data: {
    members: [],
    form: getDefaultForm(),
    editingId: '',
    submitText: '添加成员',
  },

  onLoad() {
    this.refreshMembers();
  },

  refreshMembers() {
    this.setData({ members: readSquadMembers() });
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  startEdit(event) {
    const { id } = event.currentTarget.dataset;
    const member = this.data.members.find((item) => item.id === id);
    if (!member) return;
    this.setData({
      editingId: id,
      submitText: '保存成员',
      form: {
        id: member.id,
        name: member.name,
        role: member.role,
        flavorPreference: member.flavorPreference,
      },
    });
  },

  resetForm() {
    this.setData({
      editingId: '',
      submitText: '添加成员',
      form: getDefaultForm(),
    });
  },

  saveProfile() {
    const { name } = this.data.form;
    if (!String(name || '').trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入成员名称',
      });
      return;
    }
    if (this.data.editingId) {
      updateSquadMember(this.data.editingId, this.data.form);
    } else {
      addSquadMember(this.data.form);
    }
    this.refreshMembers();
    this.resetForm();
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已保存成员',
    });
  },

  removeMember(event) {
    const { id } = event.currentTarget.dataset;
    if (!deleteSquadMember(id)) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '默认成员不能删除',
      });
      return;
    }
    this.refreshMembers();
    if (this.data.editingId === id) this.resetForm();
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已移除成员',
    });
  },
});

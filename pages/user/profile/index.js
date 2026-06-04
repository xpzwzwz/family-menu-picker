import Toast from 'tdesign-miniprogram/toast/index';
import { addSquadMember, deleteSquadMember, readSquadMembers, updateSquadMember } from '../../../model/user';
import {
  createCloudRoom,
  joinCloudRoom,
  leaveCloudRoom,
  previewCloudRoom,
  readCloudRoom,
  readCloudUser,
  refreshCloudRoom,
} from '../../../services/squad/cloudSquad';

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
    cloudUser: null,
    cloudRoom: null,
    inviteCode: '',
    roomName: '光盘小分队',
    memberName: '我',
    joinPreview: null,
    cloudError: '',
  },

  onLoad(options = {}) {
    if (options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode });
      this.previewInvite();
    }
    this.refreshMembers();
    this.refreshCloudState();
  },

  onShow() {
    this.refreshCloudState();
  },

  onShareAppMessage() {
    const { cloudRoom } = this.data;
    return {
      title: cloudRoom ? `加入${cloudRoom.name}` : '加入我的光盘小分队',
      path: cloudRoom
        ? `/pages/user/profile/index?inviteCode=${cloudRoom.inviteCode}`
        : '/pages/user/profile/index',
    };
  },

  refreshMembers() {
    this.setData({ members: readSquadMembers() });
  },

  refreshCloudState() {
    const cloudUser = readCloudUser();
    const cloudRoom = readCloudRoom();
    this.setData({ cloudUser, cloudRoom });
    if (cloudRoom && cloudRoom.roomId) {
      refreshCloudRoom(cloudRoom.roomId)
        .then((room) => this.setData({ cloudRoom: room, cloudError: '' }))
        .catch((error) => this.setData({ cloudError: error.message || '刷新小分队失败' }));
    }
  },

  updateField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  updateCloudField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [field]: event.detail.value });
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

  createRoom() {
    createCloudRoom({
      name: this.data.roomName,
      memberName: this.data.memberName,
    })
      .then((room) => {
        this.setData({ cloudRoom: room, cloudUser: readCloudUser(), cloudError: '' });
        Toast({ context: this, selector: '#t-toast', message: '已创建小分队' });
      })
      .catch((error) => this.setData({ cloudError: error.message || '创建失败' }));
  },

  previewInvite() {
    previewCloudRoom(this.data.inviteCode)
      .then((preview) => this.setData({ joinPreview: preview, cloudError: '' }))
      .catch((error) => this.setData({ joinPreview: null, cloudError: error.message || '没有找到小分队' }));
  },

  joinRoom() {
    joinCloudRoom(this.data.inviteCode, {
      memberName: this.data.memberName,
      role: '成员',
      flavorPreference: '',
    })
      .then((room) => {
        this.setData({ cloudRoom: room, cloudUser: readCloudUser(), joinPreview: null, cloudError: '' });
        Toast({ context: this, selector: '#t-toast', message: '已加入小分队' });
      })
      .catch((error) => this.setData({ cloudError: error.message || '加入失败' }));
  },

  leaveRoom() {
    const { cloudRoom } = this.data;
    if (!cloudRoom) return;
    leaveCloudRoom(cloudRoom.roomId)
      .then(() => {
        this.setData({ cloudRoom: null, cloudError: '' });
        Toast({ context: this, selector: '#t-toast', message: '已退出小分队' });
      })
      .catch((error) => this.setData({ cloudError: error.message || '退出失败' }));
  },
});

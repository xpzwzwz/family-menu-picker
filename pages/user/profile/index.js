import Toast from 'tdesign-miniprogram/toast/index';
import {
  bindCloudPhone,
  disbandCloudRoom,
  leaveCloudRoom,
  readCloudRoom,
  readCloudRooms,
  readCloudUser,
  refreshCloudUser,
  refreshCloudRoom,
  refreshCloudRooms,
  updateCloudAvatar,
  updateCloudMemberName,
  updateCloudRoomName,
} from '../../../services/squad/cloudSquad';
import { uploadDishImage } from '../../../services/dish/uploadImage';

Page({
  data: {
    cloudUser: null,
    cloudRoom: null,
    cloudRooms: [],
    memberName: '我',
    cloudError: '',
    phoneBinding: false,
    avatarUploading: false,
    isRoomOwner: false,
    editingRoomName: false,
    roomNameDraft: '',
    roomSaving: false,
    editingMemberName: false,
    memberNameDraft: '',
    memberSaving: false,
  },

  onChooseAvatar(event) {
    const tempUrl = event.detail && event.detail.avatarUrl;
    if (!tempUrl) return;
    this.setData({ avatarUploading: true });
    uploadDishImage(tempUrl)
      .then((ossUrl) => updateCloudAvatar(ossUrl))
      .then((user) => {
        this.setData({ cloudUser: user });
        Toast({ context: this, selector: '#t-toast', message: '头像已更新' });
      })
      .catch((error) => {
        Toast({ context: this, selector: '#t-toast', message: (error && error.message) || '头像上传失败，再试一次' });
      })
      .finally(() => this.setData({ avatarUploading: false }));
  },

  onLoad(options = {}) {
    if (options.inviteCode) {
      wx.navigateTo({ url: `/pages/user/squad-join/index?inviteCode=${options.inviteCode}` });
    }
    this.loginAndRefreshCloudState();
  },

  onShow() {
    this.refreshCloudState();
  },

  onShareAppMessage() {
    const { cloudRoom } = this.data;
    return {
      title: cloudRoom ? `加入${cloudRoom.name}` : '加入我的小分队',
      path: cloudRoom
        ? `/pages/user/squad-join/index?inviteCode=${cloudRoom.inviteCode}`
        : '/pages/user/squad-join/index',
    };
  },

  loginAndRefreshCloudState() {
    refreshCloudUser(this.data.memberName)
      .then((cloudUser) => {
        this.setData({ cloudUser, cloudError: '' });
        this.refreshCloudState();
      })
      .catch((error) => {
        this.setData({
          cloudUser: readCloudUser(),
          cloudError: friendlyError(error, '这会儿还没连上，稍后再试一下'),
        });
        this.refreshCloudState();
      });
  },

  refreshCloudState() {
    const cloudUser = readCloudUser();
    const cloudRoom = readCloudRoom();
    const cloudRooms = readCloudRooms();
    this.setCloudState(cloudUser, cloudRoom, { cloudRooms });
    if (cloudUser && cloudUser.userId) {
      refreshCloudRooms()
        .then((rooms) => this.setCloudState(readCloudUser(), readCloudRoom(), { cloudRooms: rooms, cloudError: '' }))
        .catch(() => {});
    }
    if (cloudRoom && cloudRoom.roomId) {
      refreshCloudRoom(cloudRoom.roomId)
        .then((room) => this.setCloudState(readCloudUser(), room, { cloudRooms: readCloudRooms(), cloudError: '' }))
        .catch(() => this.setData({ cloudError: '小分队菜单还没同步好，稍后再看' }));
    }
  },

  setCloudState(cloudUser, cloudRoom, extra = {}) {
    const isRoomOwner = Boolean(cloudUser && cloudRoom && cloudRoom.ownerUserId === cloudUser.userId);
    this.setData({
      cloudUser,
      cloudRoom,
      cloudRooms: extra.cloudRooms || this.data.cloudRooms,
      isRoomOwner,
      roomNameDraft: cloudRoom ? cloudRoom.name : '',
      memberNameDraft: getMyMemberName(cloudUser, cloudRoom),
      ...extra,
    });
  },

  updateCloudField(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({ [field]: event.detail.value });
  },

  bindPhone(event) {
    const phoneCode = event.detail && event.detail.code;
    if (!phoneCode) {
      this.setData({ cloudError: '你还没有同意使用手机号' });
      return;
    }
    this.setData({ phoneBinding: true, cloudError: '' });
    bindCloudPhone(phoneCode)
      .then((cloudUser) => {
        this.setData({ cloudUser, phoneBinding: false, cloudError: '' });
        Toast({ context: this, selector: '#t-toast', message: '手机号已添加' });
      })
      .catch(() => {
        this.setData({
          phoneBinding: false,
          cloudError: '手机号暂时加不上，稍后再试',
        });
      });
  },

  openSquadPage(event) {
    const { page } = event.currentTarget.dataset;
    const urlMap = {
      list: '/pages/user/squad-list/index',
      create: '/pages/user/squad-create/index',
      join: '/pages/user/squad-join/index',
    };
    if (urlMap[page]) wx.navigateTo({ url: urlMap[page] });
  },

  startEditRoomName() {
    const { cloudRoom } = this.data;
    if (!cloudRoom) return;
    this.setData({ editingRoomName: true, roomNameDraft: cloudRoom.name, cloudError: '' });
  },

  cancelEditRoomName() {
    const { cloudRoom } = this.data;
    this.setData({
      editingRoomName: false,
      roomNameDraft: cloudRoom ? cloudRoom.name : this.data.roomName,
      cloudError: '',
    });
  },

  saveRoomName() {
    const { cloudRoom, roomNameDraft } = this.data;
    if (!cloudRoom) return;
    const name = String(roomNameDraft || '').trim();
    if (!name) {
      this.setData({ cloudError: '小分队名称不能为空' });
      return;
    }
    this.setData({ roomSaving: true, cloudError: '' });
    updateCloudRoomName(cloudRoom.roomId, name)
      .then((room) => {
        this.setCloudState(readCloudUser(), room, {
          editingRoomName: false,
          roomSaving: false,
          cloudRooms: readCloudRooms(),
          cloudError: '',
        });
        Toast({ context: this, selector: '#t-toast', message: '小分队名称已保存' });
      })
      .catch((error) =>
        this.setData({
          roomSaving: false,
          cloudError: friendlyError(error, '还没保存好，稍后再试'),
        }),
      );
  },

  startEditMemberName() {
    const { cloudUser, cloudRoom } = this.data;
    if (!cloudUser || !cloudRoom) return;
    this.setData({
      editingMemberName: true,
      memberNameDraft: getMyMemberName(cloudUser, cloudRoom),
      cloudError: '',
    });
  },

  cancelEditMemberName() {
    const { cloudUser, cloudRoom } = this.data;
    this.setData({
      editingMemberName: false,
      memberNameDraft: getMyMemberName(cloudUser, cloudRoom),
      cloudError: '',
    });
  },

  saveMemberName() {
    const { cloudRoom, memberNameDraft } = this.data;
    if (!cloudRoom) return;
    const memberName = String(memberNameDraft || '').trim();
    if (!memberName) {
      this.setData({ cloudError: '名字不能为空' });
      return;
    }
    this.setData({ memberSaving: true, cloudError: '' });
    updateCloudMemberName(cloudRoom.roomId, memberName)
      .then((room) => {
        this.setCloudState(readCloudUser(), room, {
          editingMemberName: false,
          memberSaving: false,
          cloudRooms: readCloudRooms(),
          cloudError: '',
        });
        Toast({ context: this, selector: '#t-toast', message: '名字已保存' });
      })
      .catch((error) =>
        this.setData({
          memberSaving: false,
          cloudError: friendlyError(error, '还没保存好，稍后再试'),
        }),
      );
  },

  leaveRoom() {
    const { cloudRoom } = this.data;
    if (!cloudRoom) return;
    leaveCloudRoom(cloudRoom.roomId)
      .then(() => {
        this.setCloudState(readCloudUser(), readCloudRoom(), { cloudRooms: readCloudRooms(), cloudError: '' });
        Toast({ context: this, selector: '#t-toast', message: '已经离开这个小分队' });
      })
      .catch(() => this.setData({ cloudError: '现在还离不开，稍后再试' }));
  },

  disbandRoom() {
    const { cloudRoom } = this.data;
    if (!cloudRoom) return;
    wx.showModal({
      title: '解散这个小分队？',
      content: '解散后，队员需要重新创建或加入新的小分队。',
      confirmText: '解散',
      confirmColor: '#48613f',
      success: (res) => {
        if (!res.confirm) return;
        disbandCloudRoom(cloudRoom.roomId)
          .then(() => {
            this.setCloudState(readCloudUser(), readCloudRoom(), {
              cloudRooms: readCloudRooms(),
              cloudError: '',
              editingRoomName: false,
            });
            Toast({ context: this, selector: '#t-toast', message: '小分队已解散' });
          })
          .catch((error) => this.setData({ cloudError: friendlyError(error, '还没解散好，稍后再试') }));
      },
    });
  },
});

function friendlyError(error, fallback) {
  const message = String((error && error.message) || '').trim();
  if (!message) return fallback;
  if (message.includes('配置') || message.includes('后端') || message.includes('请求') || message.includes('code')) {
    return fallback;
  }
  if (message.includes('not') || message.includes('User') || message.includes('WeChat')) {
    return fallback;
  }
  return message;
}

function getMyMemberName(cloudUser, cloudRoom) {
  if (!cloudUser || !cloudRoom || !Array.isArray(cloudRoom.members)) return '';
  const member = cloudRoom.members.find((item) => item.userId === cloudUser.userId);
  return member ? member.name : '';
}

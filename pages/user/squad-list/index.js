import Toast from 'tdesign-miniprogram/toast/index';
import {
  readCloudRoom,
  readCloudRooms,
  readCloudUser,
  refreshCloudRooms,
  selectCloudRoom,
} from '../../../services/squad/cloudSquad';

Page({
  data: {
    cloudRoom: null,
    cloudRooms: [],
  },

  onShow() {
    this.refreshState();
  },

  refreshState() {
    this.setData({
      cloudRoom: readCloudRoom(),
      cloudRooms: readCloudRooms(),
    });
    const cloudUser = readCloudUser();
    if (!cloudUser || !cloudUser.userId) return;
    refreshCloudRooms()
      .then((rooms) => this.setData({ cloudRoom: readCloudRoom(), cloudRooms: rooms }))
      .catch(() => {});
  },

  switchRoom(event) {
    const { roomId } = event.currentTarget.dataset;
    const room = selectCloudRoom(roomId);
    this.setData({
      cloudRoom: room,
      cloudRooms: readCloudRooms(),
    });
    Toast({ context: this, selector: '#t-toast', message: '已切换小分队' });
  },
});

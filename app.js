import updateManager from './common/updateManager';
import { refreshCloudRooms } from './services/squad/cloudSquad';

App({
  onLaunch: function () {
    // 启动即建立身份:没登录就静默登录拿 user_id,并拉一次房间缓存,
    // 这样首页/菜单/点菜一打开就认得当前用户和小分队,不必先进「小分队管理」。
    // 离线/失败不阻塞,各页自己还有本地兜底。
    refreshCloudRooms().catch(() => {});
  },
  onShow: function () {
    updateManager();
  },
});

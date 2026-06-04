# 光盘小分队

家庭内部用的微信小程序，用来解决“今天吃什么”。当前版本支持本地菜品/菜单管理，并提供一个轻量 Python 后端用于 OSS 图片上传签名和云端小分队房间。

## 功能

1. 首页随机生成一餐搭配推荐。
2. 推荐菜可以一键加入菜单。
3. 菜品页可以按分类继续选菜。
4. 我的菜单页可以改数量、全选、左滑移除菜品。
5. 确认页保存最终菜单和家庭备注。
6. 我的页面可以查看最近确认的菜单，并复用历史菜单。
7. 支持维护菜品库：新增菜品、编辑已有菜品、移除不想推荐的菜。
8. 支持菜篮子：按当前菜单汇总备料并勾选已买。
9. 支持云端小分队：每人有自己的 ID，可创建房间、分享邀请码、加入和退出。

## 技术栈

- 原生微信小程序
- JavaScript / WXML / WXSS
- TDesign Miniprogram
- 本地 mock 数据与微信本地存储
- FastAPI 后端
- SQLite 云端小分队存储

## 目录

```text
app.json                         小程序页面和 tab 配置
pages/home/                      今天吃什么首页
pages/category/                  菜品分类
pages/goods/list/                菜品列表
pages/cart/                      我的菜单
pages/order/order-confirm/       确认菜单
pages/dish/custom-create/        添加/编辑菜品
pages/dish/manage/               管理菜品库
pages/usercenter/                我的/历史菜单
pages/menu/basket/               菜篮子
pages/menu/history/              菜单历史
model/dishes.js                  菜品 mock 数据、菜单存储与历史记录
model/user.js                    本地成员与反馈数据
services/                        mock service 层
backend/                         OSS 签名与云端小分队 API
components/                      通用组件
```

## 运行

推荐在 WSL 里安装依赖，但用微信开发者工具打开 Windows 本地路径。微信开发者工具在 `\\wsl.localhost\...` 路径下可能找不到 npm 构建产物。

1. 在 WSL 中安装依赖：

   ```bash
   cd ~/family-menu-picker
   npm install
   ```

2. 如果微信开发者工具无法正确处理 WSL 路径，可以同步一份到 Windows 本地目录：

   ```bash
   mkdir -p /mnt/c/Users/ASUS/Projects/family-menu-picker
   rsync -a --delete --exclude='.git/' --exclude='node_modules/' ~/family-menu-picker/ /mnt/c/Users/ASUS/Projects/family-menu-picker/
   ```

3. 在微信开发者工具导入项目：

   ```text
   C:\Users\ASUS\Projects\family-menu-picker
   ```

4. AppID 可以选择测试号，后端服务选择“不使用云服务”。

5. 如果未生成 `miniprogram_npm`，在微信开发者工具中执行：

   ```text
   工具 -> 构建 npm
   ```

6. 点击“编译”。

## 图片上传

菜品图片默认使用本地分类占位图。新增或编辑菜品时，用户可以选择自己的图片；如果配置了后端 API，小程序会先压缩图片，再直传到 OSS。云端小分队也复用同一个后端地址。

1. 启动后端签名服务：

   ```bash
   cd ~/family-menu-picker
   cp backend/.env.example backend/.env
   # 在 backend/.env 中填写 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET 等配置
   set -a && . backend/.env && set +a

   # 方式一：使用 uv 临时环境
   uv run --with fastapi==0.115.6 --with uvicorn==0.34.0 --with pydantic==2.10.4 uvicorn backend.main:app --host 0.0.0.0 --port 8787

   # 方式二：使用你自己的 Python 虚拟环境
   # pip install -r backend/requirements.txt
   # uvicorn backend.main:app --host 0.0.0.0 --port 8787
   ```

2. 在 `config/api.js` 中配置后端地址，例如：

   ```js
   export const API_BASE_URL = 'http://127.0.0.1:8787';
   ```

3. 正式发布前，需要把后端域名加入微信小程序 request/uploadFile 合法域名。

后端只负责签发 OSS 上传表单，不接收图片内容，也不会把 OSS Secret 返回给小程序。

## 云端小分队

云端小分队使用后端 SQLite 存储房间和成员关系。小程序通过 `wx.login()` 获取临时 code，后端在本地开发模式下把 code 映射成稳定的开发 openid；正式上线时可以在后端配置 `WECHAT_APPID` / `WECHAT_SECRET` 后接入微信 `code2Session`。

核心接口：

```text
POST /api/squad/login
POST /api/squad/rooms
GET  /api/squad/rooms/{roomId}
GET  /api/squad/rooms/invite/{inviteCode}
POST /api/squad/rooms/invite/{inviteCode}/join
POST /api/squad/rooms/{roomId}/leave
```

本地数据库默认写入 `backend/squad.sqlite3`，该文件不提交。可以用环境变量 `SQUAD_DB_PATH` 指定位置。

## 测试

```bash
cd backend
uv run --with fastapi==0.115.6 --with uvicorn==0.34.0 --with pydantic==2.10.4 --with httpx python -m unittest tests.test_oss_image_upload tests.test_squad_api
cd ..
node tests/custom-dishes.mjs
node tests/menu-history.mjs
node tests/manage-custom-dishes.mjs
node tests/reuse-menu-history.mjs
node tests/user-profile-feedback.mjs
node tests/squad-members.mjs
```

也可以运行核心链路的静态检查：

```bash
npx eslint --ext .js app.js common components custom-tab-bar model services pages --quiet
```

## 开发注意

- `node_modules/`、`miniprogram_npm/`、`package-lock.json` 不提交。
- `project.private.config.json` 是本机微信开发者工具配置，不提交。
- TDesign 字体加载偶尔会在开发者工具里出现缓存/网络警告，一般不影响页面运行。
- 项目仍保留部分 TDesign 零售模板文件作为改造基础；当前实际入口以 `app.json` 注册的页面为准。
- 确认菜单当前会保存历史，但不会自动清空我的菜单。

## 来源

本项目基于 Tencent 的 `tdesign-miniprogram-starter-retail` 模板改造，UI 组件依赖 [TDesign Miniprogram](https://tdesign.tencent.com/miniprogram/overview)。

## License

ISC

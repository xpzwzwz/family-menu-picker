<p align="center">
  <a href="https://tdesign.tencent.com/" target="_blank">
    <img alt="TDesign Logo" width="200" src="https://tdesign.gtimg.com/site/TDesign.png">
  </a>
</p>

<p align="center">
  <a href="https://img.shields.io/github/stars/Tencent/tdesign-miniprogram-starter-retail">
    <img src="https://img.shields.io/github/stars/Tencent/tdesign-miniprogram-starter-retail" alt="License">
  </a>
  <a href="https://github.com/Tencent/tdesign-miniprogram-starter-retail/issues">
    <img src="https://img.shields.io/github/issues/Tencent/tdesign-miniprogram-starter-retail" alt="License">
  </a>
  <a href="https://github.com/Tencent/tdesign-miniprogram-starter-retail/LICENSE">
    <img src="https://img.shields.io/github/license/Tencent/tdesign-miniprogram-starter-retail" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/tdesign-miniprogram">
    <img src="https://img.shields.io/npm/v/tdesign-miniprogram.svg?sanitize=true" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/tdesign-miniprogram">
    <img src="https://img.shields.io/npm/dw/tdesign-miniprogram" alt="Downloads">
  </a>
</p>

# Family Menu Picker

家庭内部用的微信小程序，用来解决“今晚吃什么”。第一版使用本地 mock 数据，不需要后端、支付、地址或登录。

## 功能

1. 首页随机生成一桌晚餐推荐。
2. 推荐菜可以一键加入今晚菜单。
3. 菜品页可以按分类继续选菜。
4. 今晚菜单页可以改数量、删除、全选、确认。
5. 确认页保存最终菜单，不发起支付。
6. 我的页面可以查看最近确认的菜单，并复用历史菜单。
7. 支持添加、管理自定义菜品。

## 技术栈

- 原生微信小程序
- JavaScript / WXML / WXSS
- TDesign Miniprogram
- 本地 mock 数据与本地存储

## 目录

```text
app.json                         小程序页面和 tab 配置
pages/home/                      今晚吃什么首页
pages/category/                  菜品分类
pages/goods/list/                菜品列表
pages/cart/                      今晚菜单
pages/order/order-confirm/       确认菜单
pages/dish/custom-create/        添加自定义菜品
pages/dish/manage/               管理自定义菜品
pages/usercenter/                我的/历史菜单
model/dishes.js                  菜品 mock 数据、菜单存储与历史记录
services/                        mock service 层
components/                      通用组件
```

## 运行

推荐在 WSL 里安装依赖，但用微信开发者工具打开 Windows 本地路径。

1. 在 WSL 中安装依赖：

   ```bash
   cd ~/family-menu-picker
   npm install
   ```

2. 如果微信开发者工具无法正确处理 `\\wsl.localhost\...` 路径，可以同步一份到 Windows 本地目录：

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

## 开发注意

- 当前项目使用本地 mock 数据，不需要后端服务。
- `node_modules/`、`miniprogram_npm/`、`package-lock.json` 不提交。
- 微信开发者工具在 WSL UNC 路径下可能找不到 npm 构建产物；遇到组件路径错误时，优先使用 Windows 本地路径导入。
- TDesign 字体加载偶尔会在开发者工具里出现缓存/网络警告，一般不影响页面运行。

## 测试

```bash
node tests/custom-dishes.mjs
node tests/menu-history.mjs
node tests/manage-custom-dishes.mjs
node tests/reuse-menu-history.mjs
```

## 来源

---

# TDesign 零售行业模版示例小程序

TDesign 零售模版示例小程序采用 [TDesign 企业级设计体系小程序解决方案](https://tdesign.tencent.com/miniprogram/overview) 进行搭建，依赖 [TDesign 微信小程序组件库](https://github.com/Tencent/tdesign-miniprogram)，涵盖完整的基本零售场景需求。

## :pushpin: 项目介绍

### 1. 业务介绍

零售行业模版小程序是个经典的单店版电商小程序，涵盖了电商的黄金链路流程，从商品->购物车->结算->订单等。小程序总共包含 28 个完整的页面，涵盖首页，商品详情页，个人中心，售后流程等基础页面。采用 mock 数据进行展示，提供了完整的零售商品展示、交易与售后流程。页面详情：

<img src="https://tdesign.gtimg.com/miniprogram/template/retail/tdesign-starter-readmeV1.png" width = "650" height = "900" alt="模版小程序页面详情" align=center />

主要页面截图如下：

<p align="center">
    <img alt="example-home" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/home.png" />
    <img alt="example-sort" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v2/sort.png" />
    <img alt="example-cart" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/cart.png" />
    <img alt="example-user-center" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/user-center.png" />
    <img alt="example-goods-detail" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/goods-detail.png" />
    <img alt="example-pay" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/pay.png" />
    <img alt="example-order" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v1/order.png" />
    <img alt="example-order-detail" width="200" src="https://tdesign.gtimg.com/miniprogram/template/retail/example/v2/order.png" />
</p>

### 2. 项目构成

零售行业模版小程序采用基础的 JavaScript + WXSS + ESLint 进行构建，降低了使用门槛。

项目目录结构如下：

```
|-- tdesign-miniprogram-starter
    |-- README.md
    |-- app.js
    |-- app.json
    |-- app.wxss
    |-- components	//	公共组件库
    |-- config	//	基础配置
    |-- custom-tab-bar	//	自定义 tabbar
    |-- model	//	mock 数据
    |-- pages
    |   |-- cart	//	购物车相关页面
    |   |-- coupon	//	优惠券相关页面
    |   |-- goods	//	商品相关页面
    |   |-- home	//	首页
    |   |-- order	//	订单售后相关页面
    |   |-- promotion-detail	//	营销活动页面
    |   |-- usercenter	//	个人中心及收货地址相关页面
    |-- services	//	请求接口
    |-- style	//	公共样式与iconfont
    |-- utils	//	工具库
```

### 3. 数据模拟

零售小程序采用真实的接口数据，模拟后端返回逻辑，在小程序展示完整的购物场景与购物体验逻辑。

### 4. 添加新页面

1. 在 `pages `目录下创建对应的页面文件夹
2. 在 `app.json` 文件中的 ` "pages"` 数组中加上页面路径
3. [可选] 在 `project.config.json` 文件的 `"miniprogram-list"` 下添加页面配置

## :hammer: 构建运行

1. `npm install`
2. 小程序开发工具中引入工程
3. 构建 npm

## :art: 代码风格控制

- `eslint`
- `prettier`

## :iphone: 基础库版本

最低基础库版本`^2.6.5`

## :dart: 反馈

有任何问题，建议通过 [Github issues](https://github.com/Tencent/tdesign-miniprogram/issues) 反馈或扫码加入用户微信群。

<img src="https://raw.githubusercontent.com/Tencent/tdesign/main/packages/site-components/src/images/groups/wx-group.png" width="200" />

## :link: TDesign 其他技术栈实现

- 移动端 小程序 实现：[mobile-miniprogram](https://github.com/Tencent/tdesign-miniprogram)
- 桌面端 Vue 2 实现：[web-vue](https://github.com/Tencent/tdesign-vue)
- 桌面端 Vue 3 实现：[web-vue-next](https://github.com/Tencent/tdesign-vue-next)
- 桌面端 React 实现：[web-react](https://github.com/Tencent/tdesign-react)

## :page_with_curl: 开源协议

TDesign 遵循 [MIT 协议](https://github.com/Tencent/tdesign-miniprogram/LICENSE)。

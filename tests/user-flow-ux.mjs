import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cartJs = readFileSync(new URL('../pages/cart/index.js', import.meta.url), 'utf8');
const confirmJs = readFileSync(new URL('../pages/order/order-confirm/index.js', import.meta.url), 'utf8');
const confirmWxss = readFileSync(new URL('../pages/order/order-confirm/index.wxss', import.meta.url), 'utf8');
const basketJs = readFileSync(new URL('../pages/menu/basket/index.js', import.meta.url), 'utf8');
const feedbackWxml = readFileSync(new URL('../pages/user/feedback/index.wxml', import.meta.url), 'utf8');
const feedbackJs = readFileSync(new URL('../pages/user/feedback/index.js', import.meta.url), 'utf8');
const categoryJs = readFileSync(new URL('../pages/category/index.js', import.meta.url), 'utf8');
const cartBarWxml = readFileSync(new URL('../pages/cart/components/cart-bar/index.wxml', import.meta.url), 'utf8');
const usercenterWxml = readFileSync(new URL('../pages/usercenter/index.wxml', import.meta.url), 'utf8');
const usercenterJs = readFileSync(new URL('../pages/usercenter/index.js', import.meta.url), 'utf8');

assert.equal(cartJs.includes('m.isSelected === 1'), false);
assert.ok(cartJs.includes('isDishSelected(m.isSelected)'));
assert.ok(cartJs.includes('saveConfirmedMenu'));
assert.equal(cartJs.includes("'/pages/order/order-confirm/index?type=cart'"), false);
assert.equal(cartJs.includes('order.goodsRequestList'), false);
assert.ok(cartBarWxml.includes('本顿已完成'));
assert.ok(confirmJs.includes('source=confirmed'));
assert.ok(confirmJs.includes('readLastConfirmedMenu'));
assert.ok(confirmJs.includes('showConfirmedMenu'));
assert.equal(/\.confirm-footer[\s\S]*?position:\s*fixed/.test(confirmWxss), false);
assert.ok(basketJs.includes('readLastConfirmedMenu'));
assert.ok(basketJs.includes("source=confirmed"));
assert.ok(basketJs.includes('查看刚确认的菜单'));
assert.equal(feedbackWxml.includes('发给我们'), false);
assert.equal(feedbackJs.includes('收到了'), false);
assert.ok(categoryJs.includes('readCloudRoom'));
assert.equal(usercenterWxml.includes('profile-card'), false);
assert.equal(usercenterJs.includes("title: '我的小分队'"), false);

console.log('user flow ux checks passed');

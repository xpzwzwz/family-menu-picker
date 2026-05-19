import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getDishCategories } = require('../../model/dishes');
  return delay().then(() => getDishCategories());
}

/** 获取商品列表 */
export function getCategoryList() {
  if (config.useMock) {
    return mockFetchGoodCategory();
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}

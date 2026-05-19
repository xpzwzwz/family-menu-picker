/* eslint-disable no-param-reassign */
import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGoodsList(params) {
  const { delay } = require('../_utils/delay');
  const { getDishGoodsList } = require('../../model/dishes');
  const data = getDishGoodsList(params);
  return delay().then(() => {
    return data;
  });
}

/** 获取商品列表 */
export function fetchGoodsList(params) {
  if (config.useMock) {
    return mockFetchGoodsList(params);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}

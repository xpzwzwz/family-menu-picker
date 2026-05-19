import { config } from '../../config/index';

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const { delay } = require('../_utils/delay');
  const { buildCartGroupData } = require('../../model/dishes');

  return delay().then(() => buildCartGroupData(params));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}

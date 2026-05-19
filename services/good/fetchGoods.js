import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getDishGoodsList } = require('../../model/dishes');
  return delay().then(() => {
    const pageNum = pageIndex <= 0 ? 1 : pageIndex;
    return getDishGoodsList({ pageNum, pageSize }).spuList.map((item) => {
      return {
        spuId: item.spuId,
        thumb: item.primaryImage,
        title: item.title,
        price: item.price,
        originPrice: item.originPrice,
        tags: item.tags,
        cookMinutes: item.cookMinutes,
        difficulty: item.difficulty,
        flavor: item.flavor,
      };
    });
  });
}

/** 获取商品列表 */
export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  if (config.useMock) {
    return mockFetchGoodsList(pageIndex, pageSize);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}

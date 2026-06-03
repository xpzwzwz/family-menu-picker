import { API_BASE_URL } from '../../config/api';

const MAX_IMAGE_WIDTH = 640;
const MAX_IMAGE_HEIGHT = 640;

function getFileName(filePath = '') {
  const cleanPath = String(filePath).split('?', 1)[0];
  return cleanPath.split('/').pop() || `dish-${Date.now()}.jpg`;
}

function getContentType(filePath = '') {
  const lowerPath = String(filePath).toLowerCase();
  if (lowerPath.includes('.png')) return 'image/png';
  if (lowerPath.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function requestUploadPolicy(filePath) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/api/oss/image-upload-policy`,
      method: 'POST',
      data: {
        fileName: getFileName(filePath),
        contentType: getContentType(filePath),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data && res.data.host) {
          resolve(res.data);
          return;
        }
        reject(new Error((res.data && res.data.detail) || '获取上传凭证失败'));
      },
      fail: reject,
    });
  });
}

function uploadToOss(filePath, policy) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: policy.host,
      filePath,
      name: 'file',
      formData: policy.formData,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(policy.url);
          return;
        }
        reject(new Error('图片上传失败'));
      },
      fail: reject,
    });
  });
}

function compressImage(filePath) {
  if (!wx.compressImage) return Promise.resolve(filePath);
  return new Promise((resolve) => {
    wx.compressImage({
      src: filePath,
      quality: 72,
      compressedWidth: MAX_IMAGE_WIDTH,
      compressedHeight: MAX_IMAGE_HEIGHT,
      success: (res) => resolve(res.tempFilePath || filePath),
      fail: () => resolve(filePath),
    });
  });
}

export async function uploadDishImage(filePath) {
  if (!API_BASE_URL) return filePath;
  const compressedFilePath = await compressImage(filePath);
  const policy = await requestUploadPolicy(compressedFilePath);
  return uploadToOss(compressedFilePath, policy);
}

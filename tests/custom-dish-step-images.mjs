import assert from 'node:assert/strict';
import {
  buildStepPreviews,
  syncStepImagesWithSteps,
} from '../pages/dish/custom-create/stepImages.js';

const previews = buildStepPreviews('切菜\n下锅', ['wxfile://cut.png', 'wxfile://cook.png']);

assert.deepEqual(previews, [
  { text: '切菜', image: 'wxfile://cut.png' },
  { text: '下锅', image: 'wxfile://cook.png' },
]);

assert.deepEqual(syncStepImagesWithSteps(previews, '洗菜\n切菜\n下锅'), [
  '',
  'wxfile://cut.png',
  'wxfile://cook.png',
]);

assert.deepEqual(syncStepImagesWithSteps(previews, '切小块\n下锅'), [
  'wxfile://cut.png',
  'wxfile://cook.png',
]);

assert.deepEqual(syncStepImagesWithSteps(previews, '下锅'), ['wxfile://cook.png']);

console.log('custom dish step image checks passed');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appConfig = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
const projectConfig = JSON.parse(readFileSync(new URL('../project.config.json', import.meta.url), 'utf8'));

const appPages = new Set(appConfig.pages || []);
for (const subPackage of appConfig.subPackages || []) {
  for (const page of subPackage.pages || []) {
    appPages.add(`${subPackage.root}/${page}`);
  }
}

const launchPages = projectConfig.condition?.miniprogram?.list || [];
const staleLaunchPages = launchPages
  .map((item) => item.pathName)
  .filter((pathName) => !appPages.has(pathName));

assert.deepEqual(staleLaunchPages, []);

console.log('project config page checks passed');

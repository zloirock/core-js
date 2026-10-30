import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fromCatalog } from './all-platforms.mjs';

function entry(browser, version, os, device, backend = 'webdriver') {
  return { api_name: browser, short_version: version, os, automation_backend: backend, device };
}

test('selects one configuration per browser version and excludes non-browser platforms', () => {
  const platforms = fromCatalog([
    entry('chrome', '67', 'Windows 11'),
    entry('chrome', '67', 'Windows 10'),
    entry('chrome', '109', 'Windows 10'),
    entry('firefox', '54', 'Windows 10'),
    entry('firefox', '55', 'Windows 10'),
    entry('firefox', 'beta', 'Windows 11'),
    entry('internet explorer', '11', 'Windows 10'),
    entry('iphone', '14.0', 'Mac 11', 'iPhone 8', 'appium'),
    entry('iphone', '14.0', 'Mac 11', 'iPhone Simulator', 'appium'),
    { ...entry('android', '5.0', 'Linux', 'Nexus 6', 'appium'), long_name: 'Google Nexus 6 Emulator' },
    entry('ipad', '14.0', 'Mac 11', 'iPad Simulator', 'appium'),
    entry('safari', '14', 'Mac 11'),
    entry('electron', '22', 'Mac 13'),
    entry('chrome', '67', 'Windows 10', undefined, 'appium'),
  ]);
  assert.equal(platforms.length, 10);
  assert.deepEqual(platforms.find(({ name }) => name.startsWith('chrome 67')), {
    name: 'chrome 67 (Windows 10)', w3c: false,
    capabilities: { browserName: 'chrome', version: '67', platform: 'Windows 10' },
  });
  assert.deepEqual(platforms.find(({ name }) => name.startsWith('iphone')), {
    name: 'iphone 14.0 (iPhone Simulator)', w3c: true,
    capabilities: {
      browserName: 'Safari', platformName: 'iOS',
      'appium:deviceName': 'iPhone Simulator', 'appium:platformVersion': '14.0',
      'appium:automationName': 'XCUITest',
    },
  });
  assert.equal(platforms.find(({ name }) => name.startsWith('safari')).capabilities.platformName, 'macOS 11.00');
  assert.equal(platforms.find(({ name }) => name.startsWith('firefox 54')).w3c, false);
  assert.equal(platforms.find(({ name }) => name.startsWith('firefox 55')).w3c, true);
  assert.equal(platforms.find(({ name }) => name.startsWith('firefox beta')).w3c, true);
  assert.equal(platforms.find(({ name }) => name.startsWith('internet explorer')).w3c, false);
  assert.equal(platforms.find(({ name }) => name.startsWith('ipad')).capabilities.browserName, 'Safari');
  assert.equal(platforms.find(({ name }) => name.startsWith('android')).capabilities.browserName, 'Chrome');
  assert.equal(platforms.find(({ name }) => name.startsWith('android')).capabilities['appium:deviceName'], 'Google Nexus 6 Emulator');
});

test('rejects an empty or invalid catalog', () => {
  assert.throws(() => fromCatalog([]), /no supported browsers/);
  assert.throws(() => fromCatalog({}), /not an array/);
  assert.throws(() => fromCatalog([
    entry('chrome', '109', 'Windows 10'),
    entry('android', '6.0', 'Linux', 'Nexus 5', 'appium'),
  ]), /android 6\.0.*emulator name/);
  assert.throws(() => fromCatalog([entry('android', '5.0', 'Linux', 'Nexus 5', 'appium')]), /emulator name/);
});

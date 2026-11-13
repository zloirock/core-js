import assert from 'node:assert/strict';
import { test } from 'node:test';
import allPlatforms, { fromCatalog } from './all-platforms.mjs';

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
    { ...entry('iphone', '14.0', 'Mac 11', 'iPhone Simulator', 'appium'), long_name: 'iPhone Simulator' },
    { ...entry('android', '5.0', 'Linux', 'Nexus 6', 'appium'), long_name: 'Google Nexus 6 Emulator' },
    { ...entry('ipad', '14.0', 'Mac 11', 'iPad Simulator', 'appium'), long_name: 'iPad Simulator' },
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
  assert.equal(platforms.find(({ name }) => name.startsWith('ipad')).capabilities['appium:deviceName'], 'iPad Simulator');
  assert.equal(platforms.find(({ name }) => name.startsWith('android')).capabilities.browserName, 'Chrome');
  assert.equal(platforms.find(({ name }) => name.startsWith('android')).capabilities['appium:deviceName'], 'Google Nexus 6 Emulator');
});

test('fetches and validates the platform catalog', async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async url => {
      assert.equal(url, 'https://api.us-west-1.saucelabs.com/rest/v1/info/platforms/all');
      return { ok: true, json: async () => [null] };
    };
    await assert.rejects(allPlatforms('us-west-1'), /invalid platform entry at index 0/);
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(allPlatforms('us-west-1'), /HTTP 503/);
  } finally {
    globalThis.fetch = previous;
  }
});

test('rejects an empty or invalid catalog', () => {
  assert.throws(() => fromCatalog([]), /no supported browsers/);
  assert.throws(() => fromCatalog({}), /not an array/);
  assert.throws(() => fromCatalog([null]), /invalid platform entry at index 0/);
  assert.throws(() => fromCatalog([
    entry('chrome', '109', 'Windows 10'),
    entry('android', '6.0', 'Linux', 'Nexus 5', 'appium'),
  ]), /android 6\.0.*emulator name/);
  assert.throws(() => fromCatalog([entry('android', '5.0', 'Linux', 'Nexus 5', 'appium')]), /emulator name/);
  assert.throws(() => fromCatalog([entry('iphone', '27.1', 'Mac 15', 'iPhone Duo', 'appium')]), /emulator name/);
  assert.deepEqual(fromCatalog([
    entry('iphone', '27.1', 'Mac 15', 'iPhone Duo', 'appium'),
    { ...entry('iphone', '27.1', 'Mac 15', 'iPhone Duo Simulator', 'appium'), long_name: 'iPhone Duo Simulator' },
  ])[0].capabilities['appium:deviceName'], 'iPhone Duo Simulator');
  for (const browser of ['iphone', 'ipad', 'android']) {
    const os = browser === 'android' ? 'Linux' : 'Mac 15';
    const unnamed = entry(browser, '27.1', os, 'A Device', 'appium');
    const named = { ...entry(browser, '27.1', os, 'Z Device', 'appium'), long_name: 'Z Device Emulator' };
    assert.throws(() => fromCatalog([unnamed]), /emulator name/);
    assert.equal(fromCatalog([unnamed, named])[0].capabilities['appium:deviceName'], named.long_name);
    assert.equal(fromCatalog([named, unnamed])[0].capabilities['appium:deviceName'], named.long_name);
    const sameDevice = { ...named, long_name: 'A Device Emulator' };
    assert.equal(fromCatalog([named, sameDevice])[0].capabilities['appium:deviceName'], sameDevice.long_name);
    assert.equal(fromCatalog([sameDevice, named])[0].capabilities['appium:deviceName'], sameDevice.long_name);
  }
  for (const browser of ['iphone', 'ipad', 'android']) {
    const slashDevice = { ...entry(browser, '7.1', 'C', 'A/B', 'appium'), long_name: 'D Emulator' };
    const slashOs = { ...entry(browser, '7.1', 'B/C', 'A', 'appium'), long_name: 'D Emulator' };
    assert.equal(fromCatalog([slashDevice, slashOs])[0].name, fromCatalog([slashOs, slashDevice])[0].name);
  }
});

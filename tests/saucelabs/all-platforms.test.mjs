import { deepEqual, equal, ok, rejects, throws } from 'node:assert/strict';
import allPlatforms, { fromCatalog } from './all-platforms.mjs';

function entry(browser, version, os, device, backend = 'webdriver') {
  return { api_name: browser, short_version: version, os, automation_backend: backend, device };
}

{
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
  equal(platforms.length, 9, 'selects one configuration per browser version and excludes non-browser platforms #1');
  deepEqual(platforms.find(({ name }) => name.startsWith('chrome 67')), {
    name: 'chrome 67 (Windows 10)', w3c: false,
    capabilities: { browserName: 'chrome', version: '67', platform: 'Windows 10' },
  }, 'selects one configuration per browser version and excludes non-browser platforms #2');
  deepEqual(platforms.find(({ name }) => name.startsWith('iphone')), {
    name: 'iphone 14.0 (iPhone Simulator)', w3c: true,
    capabilities: {
      browserName: 'Safari', platformName: 'iOS',
      'appium:deviceName': 'iPhone Simulator', 'appium:platformVersion': '14.0',
      'appium:automationName': 'XCUITest',
    },
  }, 'selects one configuration per browser version and excludes non-browser platforms #3');
  equal(
    platforms.find(({ name }) => name.startsWith('safari')).capabilities.platformName,
    'macOS 11.00',
    'selects one configuration per browser version and excludes non-browser platforms #4',
  );
  equal(platforms.find(({ name }) => name.startsWith('firefox 54')).w3c, false, 'selects one configuration per browser version and excludes non-browser platforms #5');
  equal(platforms.find(({ name }) => name.startsWith('firefox 55')).w3c, true, 'selects one configuration per browser version and excludes non-browser platforms #6');
  equal(platforms.find(({ name }) => name.startsWith('firefox beta')).w3c, true, 'selects one configuration per browser version and excludes non-browser platforms #7');
  equal(platforms.find(({ name }) => name.startsWith('internet explorer')).w3c, false, 'selects one configuration per browser version and excludes non-browser platforms #8');
  equal(
    platforms.find(({ name }) => name.startsWith('android')).capabilities.browserName,
    'Chrome',
    'selects one configuration per browser version and excludes non-browser platforms #9',
  );
  equal(
    platforms.find(({ name }) => name.startsWith('android')).capabilities['appium:deviceName'],
    'Google Nexus 6 Emulator',
    'selects one configuration per browser version and excludes non-browser platforms #10',
  );
}

{
  const platforms = fromCatalog([
    { ...entry('ipad', '14.0', 'Mac 11', 'iPad Simulator', 'appium'), long_name: 'iPad Simulator' },
  ]);
  equal(platforms[0].capabilities.browserName, 'Safari', 'supports iPad when the catalog has no iPhone for that iOS version #1');
  equal(platforms[0].capabilities['appium:deviceName'], 'iPad Simulator', 'supports iPad when the catalog has no iPhone for that iOS version #2');
}

{
  const phone = { ...entry('iphone', '14.0', 'Mac 11', 'iPhone Simulator', 'appium'), long_name: 'iPhone Simulator' };
  const tablet = { ...entry('ipad', '14.0', 'Mac 11', 'iPad Simulator', 'appium'), long_name: 'iPad Simulator' };
  for (const catalog of [[phone, tablet], [tablet, phone]]) {
    const platforms = fromCatalog(catalog);
    equal(platforms.length, 1, 'selects one iOS simulator per version #1');
    equal(platforms[0].capabilities['appium:deviceName'], 'iPhone Simulator', 'selects one iOS simulator per version #2');
  }
}

{
  const platforms = fromCatalog([
    entry('safari', '18', 'Mac 14'),
    entry('safari', '18', 'Mac 15'),
    { ...entry('android', '14', 'Linux', 'Google ARM Medium Phone', 'appium'), long_name: 'Google ARM Medium Phone Emulator' },
    { ...entry('android', '14', 'Linux', 'Generic Medium Phone', 'appium'), long_name: 'Generic Medium Phone Emulator' },
  ]);
  equal(platforms.find(({ name }) => name.startsWith('safari')).capabilities.platformName, 'macOS 15', 'prefers the manual matrix OS and emulator for matching versions #1');
  equal(
    platforms.find(({ name }) => name.startsWith('android')).capabilities['appium:deviceName'],
    'Generic Medium Phone Emulator',
    'prefers the manual matrix OS and emulator for matching versions #2',
  );
}

{
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      equal(url, 'https://api.us-west-1.saucelabs.com/rest/v1/info/platforms/all', 'fetches and validates the platform catalog #1');
      ok(options.signal instanceof AbortSignal, 'fetches and validates the platform catalog #2');
      return { ok: true, json: async () => [null] };
    };
    await rejects(allPlatforms('us-west-1'), /invalid platform entry at index 0/, 'fetches and validates the platform catalog #3');
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    await rejects(allPlatforms('us-west-1'), /HTTP 503/, 'fetches and validates the platform catalog #4');
    globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
    await rejects(allPlatforms('us-west-1'), /Sauce Labs platform catalog: fetch failed/, 'fetches and validates the platform catalog #5');
    globalThis.fetch = async (url, { signal }) => {
      ok(signal instanceof AbortSignal, 'fetches and validates the platform catalog #6');
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    };
    await rejects(allPlatforms('us-west-1'), /Sauce Labs platform catalog: The operation was aborted due to timeout/, 'fetches and validates the platform catalog #7');
  } finally {
    globalThis.fetch = previous;
  }
}

throws(() => fromCatalog([]), /no supported browsers/, 'rejects an empty or invalid catalog #1');
throws(() => fromCatalog({}), /not an array/, 'rejects an empty or invalid catalog #2');
throws(() => fromCatalog([null]), /invalid platform entry at index 0/, 'rejects an empty or invalid catalog #3');
throws(() => fromCatalog([
  entry('chrome', '109', 'Windows 10'),
  entry('android', '6.0', 'Linux', 'Nexus 5', 'appium'),
]), /android 6\.0.*emulator name/, 'rejects an empty or invalid catalog #4');
throws(() => fromCatalog([entry('android', '5.0', 'Linux', 'Nexus 5', 'appium')]), /emulator name/, 'rejects an empty or invalid catalog #5');
throws(() => fromCatalog([entry('iphone', '27.1', 'Mac 15', 'iPhone Duo', 'appium')]), /emulator name/, 'rejects an empty or invalid catalog #6');
deepEqual(fromCatalog([
  entry('iphone', '27.1', 'Mac 15', 'iPhone Duo', 'appium'),
  { ...entry('iphone', '27.1', 'Mac 15', 'iPhone Duo Simulator', 'appium'), long_name: 'iPhone Duo Simulator' },
])[0].capabilities['appium:deviceName'], 'iPhone Duo Simulator', 'rejects an empty or invalid catalog #7');
for (const browser of ['iphone', 'ipad', 'android']) {
  const os = browser === 'android' ? 'Linux' : 'Mac 15';
  const unnamed = entry(browser, '27.1', os, 'A Device', 'appium');
  const named = { ...entry(browser, '27.1', os, 'Z Device', 'appium'), long_name: 'Z Device Emulator' };
  throws(() => fromCatalog([unnamed]), /emulator name/, 'rejects an empty or invalid catalog #8');
  equal(fromCatalog([unnamed, named])[0].capabilities['appium:deviceName'], named.long_name, 'rejects an empty or invalid catalog #9');
  equal(fromCatalog([named, unnamed])[0].capabilities['appium:deviceName'], named.long_name, 'rejects an empty or invalid catalog #10');
  const sameDevice = { ...named, long_name: 'A Device Emulator' };
  equal(fromCatalog([named, sameDevice])[0].capabilities['appium:deviceName'], sameDevice.long_name, 'rejects an empty or invalid catalog #11');
  equal(fromCatalog([sameDevice, named])[0].capabilities['appium:deviceName'], sameDevice.long_name, 'rejects an empty or invalid catalog #12');
}
for (const browser of ['iphone', 'ipad', 'android']) {
  const slashDevice = { ...entry(browser, '7.1', 'C', 'A/B', 'appium'), long_name: 'D Emulator' };
  const slashOs = { ...entry(browser, '7.1', 'B/C', 'A', 'appium'), long_name: 'D Emulator' };
  equal(fromCatalog([slashDevice, slashOs])[0].name, fromCatalog([slashOs, slashDevice])[0].name, 'rejects an empty or invalid catalog #13');
}

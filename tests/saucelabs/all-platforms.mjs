import manualPlatforms, { android, desktop, ios } from './platforms.mjs';

// one configuration per browser version, preferring the OS and device of the manual matrix
const browsers = new Set(['chrome', 'firefox', 'safari', 'MicrosoftEdge', 'internet explorer', 'iphone', 'ipad', 'android']);
const mobile = new Set(['iphone', 'ipad', 'android']);

function platformName(os) {
  return os === 'Mac 11' ? 'macOS 11.00' : os.startsWith('Mac ') ? `macOS ${ os.slice(4) }` : os;
}

function rank({ api_name: browser, short_version: version, os, device, long_name: deviceName }) {
  const browserName = browser === 'android' ? 'Chrome' : browser === 'iphone' || browser === 'ipad' ? 'Safari' : browser;
  const manual = manualPlatforms.find(({ capabilities }) => capabilities.browserName === browserName &&
    (capabilities.browserVersion || capabilities.version || capabilities['appium:platformVersion']) === version &&
    Boolean(capabilities['appium:deviceName']) === Boolean(device));
  if (device) return JSON.stringify([deviceName ? 0 : 1,
    browser === 'iphone' ? 0 : browser === 'ipad' ? 1 : 0,
    deviceName === manual?.capabilities['appium:deviceName'] ? 0 : 1,
    device === 'iPhone Simulator' || device === 'iPad Simulator' ? 0 : 1, device, os, deviceName || '']);
  if (platformName(os) === (manual?.capabilities.platformName || manual?.capabilities.platform)) return '0';
  if (os === 'Windows 10') return '1';
  if (os === 'Windows 11') return '2';
  return `3${ os }`;
}

function platform({ api_name: browser, short_version: version, os, device, long_name: deviceName }) {
  if (!mobile.has(browser)) return { ...desktop(browser, version, platformName(os)), name: `${ browser } ${ version } (${ os })` };
  const base = browser === 'android' ? android(deviceName, version) : ios(version, deviceName);
  return { ...base, name: `${ browser } ${ version } (${ device })` };
}

export function fromCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new Error('Sauce Labs platform catalog is not an array');
  const selected = new Map();
  for (const [index, entry] of catalog.entries()) {
    if (!entry || typeof entry !== 'object') throw new Error(`Sauce Labs platform catalog: invalid platform entry at index ${ index }`);
    const { api_name: browser, short_version: version, automation_backend: backend, os, device } = entry;
    if (!browsers.has(browser) || backend !== (mobile.has(browser) ? 'appium' : 'webdriver')) continue;
    if (!version || !os || mobile.has(browser) && !device) continue;
    const key = `${ browser === 'ipad' ? 'iphone' : browser }/${ version }`;
    const previous = selected.get(key);
    if (!previous || rank(entry) < rank(previous)) selected.set(key, entry);
  }
  if (!selected.size) throw new Error('Sauce Labs platform catalog contains no supported browsers');
  return Array.from(selected).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([, entry]) => {
      if (mobile.has(entry.api_name) && !entry.long_name) {
        throw new Error(`Sauce Labs platform catalog: ${ entry.api_name } ${ entry.short_version } has no emulator name`);
      }
      return platform(entry);
    });
}

export default async function allPlatforms(region) {
  let catalog;
  try {
    const response = await fetch(`https://api.${ region }.saucelabs.com/rest/v1/info/platforms/all`, {
      signal: AbortSignal.timeout(15e3),
    });
    if (!response.ok) throw new Error(`HTTP ${ response.status }`);
    catalog = await response.json();
  } catch (error) {
    throw new Error(`Sauce Labs platform catalog: ${ error.message }`, { cause: error });
  }
  return fromCatalog(catalog);
}

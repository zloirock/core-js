// Sauce Labs lists operating systems and devices separately for each browser version.
// Keep one configuration per browser and version, preferring the same OS and device each time.
const browsers = new Set(['chrome', 'firefox', 'safari', 'MicrosoftEdge', 'internet explorer', 'iphone', 'ipad', 'android']);
const mobile = new Set(['iphone', 'ipad', 'android']);

function platformName(os) {
  return os === 'Mac 11' ? 'macOS 11.00' : os.startsWith('Mac ') ? `macOS ${ os.slice(4) }` : os;
}

function rank({ os, device }) {
  if (device) return `${ device === 'iPhone Simulator' || device === 'iPad Simulator' ? 0 : 1 }${ device }/${ os }`;
  if (os === 'Windows 10') return '0';
  if (os === 'Windows 11') return '1';
  return `2${ os }`;
}

function platform({ api_name: browser, short_version: version, os, device, long_name: deviceName }) {
  const name = `${ browser } ${ version }${ device ? ` (${ device })` : '' }`;
  if (mobile.has(browser)) {
    const android = browser === 'android';
    return {
      name,
      w3c: true,
      capabilities: {
        browserName: android ? 'Chrome' : 'Safari',
        platformName: android ? 'Android' : 'iOS',
        'appium:deviceName': android ? deviceName : device,
        'appium:platformVersion': version,
        'appium:automationName': android ? 'UiAutomator2' : 'XCUITest',
      },
    };
  }
  const legacy = browser === 'internet explorer' || browser === 'chrome' && +version < 75 || browser === 'firefox' && +version < 55;
  return {
    name: `${ browser } ${ version } (${ os })`,
    w3c: !legacy,
    capabilities: legacy
      ? { browserName: browser, version, platform: platformName(os) }
      : { browserName: browser, browserVersion: version, platformName: platformName(os) },
  };
}

export function fromCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new Error('Sauce Labs platform catalog is not an array');
  const selected = new Map();
  for (const entry of catalog) {
    const { api_name: browser, short_version: version, automation_backend: backend, os, device } = entry;
    if (!browsers.has(browser) || backend !== (mobile.has(browser) ? 'appium' : 'webdriver')) continue;
    if (!version || !os || mobile.has(browser) && !device) continue;
    if (browser === 'android' && !entry.long_name) {
      throw new Error(`Sauce Labs platform catalog: android ${ version } has no emulator name`);
    }
    const key = `${ browser }/${ version }`;
    const previous = selected.get(key);
    if (!previous || rank(entry) < rank(previous)) selected.set(key, entry);
  }
  if (!selected.size) throw new Error('Sauce Labs platform catalog contains no supported browsers');
  return Array.from(selected).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([, entry]) => platform(entry));
}

export default async function allPlatforms(region) {
  const response = await fetch(`https://api.${ region }.saucelabs.com/rest/v1/info/platforms/all`);
  if (!response.ok) throw new Error(`Sauce Labs platform catalog: HTTP ${ response.status }`);
  return fromCatalog(await response.json());
}

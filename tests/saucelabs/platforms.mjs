// the concurrency limit a session counts towards besides the total one;
// Sauce Labs runs macOS 14+ on Apple Silicon, older ones on Intel Macs
function macPool(version, firstArm) {
  return parseInt(version, 10) >= firstArm ? 'mac_arm_vms' : 'mac_vms';
}

export function hostPool(platform) {
  const mac = /^(?:OS X|macOS) (?<major>\d+)/.exec(platform);
  return mac ? { pool: macPool(mac.groups.major, 14) } : {};
}

// Chrome before 75 and Firefox before 55 get no W3C session on Sauce Labs
export function desktop(browserName, version, platform) {
  const legacy = browserName === 'internet explorer' || browserName === 'chrome' && +version < 75 ||
    browserName === 'firefox' && +version < 55;
  return {
    name: `${ browserName } ${ version }`,
    w3c: !legacy,
    ...hostPool(platform),
    capabilities: legacy
      ? { browserName, version, platform }
      : { browserName, browserVersion: version, platformName: platform },
  };
}

// the catalog lists the host Mac; without it, the iOS 18+ simulator runs on Apple Silicon
export function ios(platformVersion, deviceName = 'iPhone Simulator') {
  return {
    name: `ios ${ platformVersion }`,
    w3c: true,
    pool: macPool(platformVersion, 18),
    capabilities: {
      browserName: 'Safari',
      platformName: 'iOS',
      'appium:deviceName': deviceName,
      'appium:platformVersion': platformVersion,
      'appium:automationName': 'XCUITest',
    },
  };
}

// a short device name makes Sauce Labs look for a real device
export function android(deviceName, platformVersion) {
  return {
    name: `android ${ platformVersion }`,
    w3c: true,
    .../\bARM\b/.test(deviceName) && { pool: 'android_arm_vms' },
    capabilities: {
      browserName: 'Chrome',
      platformName: 'Android',
      'appium:deviceName': deviceName,
      'appium:platformVersion': platformVersion,
      'appium:automationName': 'UiAutomator2',
    },
  };
}

export default [
  desktop('safari', '14', 'macOS 11.00'),
  desktop('safari', '16', 'macOS 12'),
  desktop('safari', '18', 'macOS 15'),
  desktop('safari', '26', 'macOS 26'),
  desktop('safari', '27', 'macOS 27'),
  ios('26.1'),
  ios('27.0'),
  android('Google Nexus 10 Tablet Emulator', '5.0'),
  android('Generic Medium Phone Emulator', '7.1'),
  android('Generic Medium Phone Emulator', '8.0'),
  desktop('chrome', '67', 'Windows 10'),
  desktop('chrome', '93', 'Windows 10'),
  desktop('chrome', '109', 'Windows 10'),
  desktop('chrome', '118', 'Windows 10'),
  desktop('firefox', '7', 'Windows 10'),
  desktop('firefox', '15', 'Windows 10'),
  desktop('firefox', '27', 'Windows 10'),
  desktop('firefox', '44', 'Windows 10'),
  desktop('firefox', '54', 'Windows 10'),
  desktop('firefox', '62', 'Windows 10'),
  desktop('MicrosoftEdge', '79', 'Windows 10'),
  desktop('MicrosoftEdge', '93', 'Windows 10'),
  desktop('MicrosoftEdge', '118', 'Windows 10'),
  desktop('internet explorer', '10', 'Windows 2012'),
];

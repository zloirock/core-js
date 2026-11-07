// Cover older engines and mobile Safari/Chrome absent from CI, including versions on both sides of
// native-feature and browser-test failures. Recent desktop Chromium and Firefox already run in CI.
function desktop(browserName, browserVersion, platformName) {
  return {
    name: `${ browserName } ${ browserVersion }`,
    w3c: true,
    capabilities: { browserName, browserVersion, platformName },
  };
}

// ChromeDriver before 75 defaults to JSON Wire, and the Firefox driver before geckodriver knows nothing
// else; Sauce Labs starts no W3C session for the early geckodriver Firefox either
function legacy(browserName, version, platform) {
  return {
    name: `${ browserName } ${ version }`,
    w3c: false,
    capabilities: { browserName, version, platform },
  };
}

function ios(platformVersion) {
  return {
    name: `ios ${ platformVersion }`,
    w3c: true,
    capabilities: {
      browserName: 'Safari',
      platformName: 'iOS',
      'appium:deviceName': 'iPhone Simulator',
      'appium:platformVersion': platformVersion,
      'appium:automationName': 'XCUITest',
    },
  };
}

// a full emulator name, unlike the catalog's short `device`, or Sauce Labs looks for a real device
function android(deviceName, platformVersion) {
  return {
    name: `android ${ platformVersion }`,
    w3c: true,
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
  ios('14.0'),
  ios('26.1'),
  ios('27.0'),
  android('Google Nexus 10 Tablet Emulator', '5.0'),
  android('Generic Medium Phone Emulator', '7.1'),
  android('Generic Medium Phone Emulator', '8.0'),
  legacy('chrome', '67', 'Windows 10'),
  desktop('chrome', '93', 'Windows 10'),
  desktop('chrome', '109', 'Windows 10'),
  desktop('chrome', '118', 'Windows 10'),
  legacy('firefox', '15', 'Windows 10'),
  legacy('firefox', '27', 'Windows 10'),
  legacy('firefox', '44', 'Windows 10'),
  legacy('firefox', '54', 'Windows 10'),
  desktop('firefox', '62', 'Windows 10'),
  desktop('MicrosoftEdge', '79', 'Windows 10'),
  desktop('MicrosoftEdge', '93', 'Windows 10'),
  desktop('MicrosoftEdge', '118', 'Windows 10'),
];

// only the browsers the CI runners lack. besides the bottom of the catalog, a version sits on either
// side of a release where many natives land - before it, the polyfills run on an engine close to the
// native; after it, the detection meets the native
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

export default [
  desktop('safari', '14', 'macOS 11.00'),
  desktop('safari', '16', 'macOS 12'),
  desktop('safari', '18', 'macOS 15'),
  desktop('safari', '27', 'macOS 27'),
  ios('14.0'),
  ios('27.0'),
  legacy('chrome', '67', 'Windows 10'),
  desktop('chrome', '109', 'Windows 10'),
  legacy('firefox', '27', 'Windows 10'),
  legacy('firefox', '54', 'Windows 10'),
];

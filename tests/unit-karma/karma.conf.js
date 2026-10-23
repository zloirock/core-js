'use strict';
const { chromium, firefox, webkit } = require('playwright');
const { sync: which } = require('which');

Object.assign(process.env, {
  CHROMIUM_BIN: chromium.executablePath(),
  FIREFOX_BIN: firefox.executablePath(),
  WEBKIT_BIN: webkit.executablePath(),
});

const customLaunchers = {
  IE_NFM: {
    base: 'IE',
    // prevents crash on launch of multiple IE11 instances
    flags: ['-noframemerging'],
  },
};

const browsers = [
  'ChromiumHeadless',
  'FirefoxHeadless',
  'WebKitHeadless',
  'PhantomJS',
];

if (process.env.CI || which('iexplore.exe', { nothrow: true })) {
  browsers.push('IE_NFM');
}

module.exports = config => config.set({
  plugins: [
    'karma-*',
    '@onslip/karma-playwright-launcher',
  ],
  files: process.argv.find(it => it.startsWith('-f=')).slice(3).split(','),
  frameworks: ['qunit'],
  basePath: '.',
  // PhantomJS can hang on the IPv6 address of localhost, while the server listens on IPv4
  hostname: '127.0.0.1',
  customLaunchers,
  browsers,
  logLevel: config.LOG_ERROR,
  singleRun: true,
});

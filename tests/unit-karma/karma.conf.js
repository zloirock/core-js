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
  customLaunchers,
  browsers,
  logLevel: config.LOG_ERROR,
  singleRun: true,
});

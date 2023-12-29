'use strict';
const { chromium, firefox, webkit } = require('playwright');

Object.assign(process.env, {
  CHROMIUM_BIN: chromium.executablePath(),
  FIREFOX_BIN: firefox.executablePath(),
  WEBKIT_BIN: webkit.executablePath(),
});

const browsers = [
  'ChromiumHeadless',
  'FirefoxHeadless',
  'WebKitHeadless',
  'PhantomJS',
];

if (process.platform === 'win32') {
  browsers.push('IE');
}

module.exports = config => config.set({
  plugins: [
    'karma-*',
    '@onslip/karma-playwright-launcher',
  ],
  files: process.argv.find(it => it.startsWith('-f=')).slice(3).split(','),
  frameworks: ['qunit'],
  basePath: '.',
  browsers,
  browserNoActivityTimeout: 60e3,
  logLevel: config.LOG_ERROR,
  singleRun: true,
});

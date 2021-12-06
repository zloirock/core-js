'use strict';
const { chromium, firefox, webkit } = require('playwright');

Object.assign(process.env, {
  CHROMIUM_BIN: chromium.executablePath(),
  FIREFOX_BIN: firefox.executablePath(),
  WEBKIT_BIN: webkit.executablePath(),
});

module.exports = function (config) {
  config.set({
    plugins: [
      'karma-*',
      '@onslip/karma-playwright-launcher',
    ],
    files: process.argv.find(it => it.startsWith('-f=')).slice(3).split(','),
    frameworks: ['qunit'],
    basePath: '.',
    browsers: [
      'ChromiumHeadless',
      'FirefoxHeadless',
      'WebKitHeadless',
      'PhantomJS',
    ],
    logLevel: config.LOG_ERROR,
    singleRun: true,
  });
};

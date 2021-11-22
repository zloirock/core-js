'use strict';
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  const files = process.argv
    .find(it => it.startsWith('-f='))
    .slice(3)
    .split(',');

  config.set({
    files,
    frameworks: ['qunit'],
    basePath: '.',
    browsers: ['HeadlessChrome', 'PhantomJS'],
    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
    logLevel: config.LOG_ERROR,
    singleRun: true,
  });
};

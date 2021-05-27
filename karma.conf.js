'use strict';
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  const { argv } = process;
  let files;

  for (const arg of argv) {
    if (arg.startsWith('-f=')) {
      files = arg.slice(3).split(',');
    }
  }

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

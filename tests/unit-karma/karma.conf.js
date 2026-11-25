'use strict';
const { chromium, firefox, webkit } = require('playwright');
const { sync: which } = require('which');
const createEchoMiddleware = require('./echo');

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

const IE_BIN = process.env.IE_BIN || which('iexplore.exe', { nothrow: true });

if (IE_BIN) {
  process.env.IE_BIN = IE_BIN;
  browsers.push('IE_NFM');
}

function SummaryReporter(baseReporterDecorator) {
  baseReporterDecorator(this);
  this.onBrowserComplete = browser => this.write('%s\n', this.renderBrowser(browser));
}

module.exports = config => config.set({
  plugins: [
    'karma-*',
    '@onslip/karma-playwright-launcher',
    { 'middleware:echo': ['factory', createEchoMiddleware] },
    { 'reporter:summary': ['type', SummaryReporter] },
  ],
  files: [
    '../unit-browser/qunit-dump.js',
    ...process.argv.find(it => it.startsWith('-f=')).slice(3).split(','),
  ],
  middleware: ['echo'],
  frameworks: ['qunit'],
  basePath: '.',
  // PhantomJS can hang on the IPv6 address of localhost, while the server listens on IPv4
  hostname: '127.0.0.1',
  // Synchronous URL tests exceed the default 5s heartbeat timeout in PhantomJS on Windows.
  // Match the 30s browser no-activity timeout while the browser cannot answer pings.
  pingTimeout: 30000,
  // Three suites share the CI runner. Limit their load to avoid fetch timeouts.
  concurrency: process.env.CI ? 1 : Infinity,
  customLaunchers,
  browsers,
  // A synchronous write per passing test can stall the echo server on Windows CI.
  reporters: [process.env.CI ? 'summary' : 'dots'],
  logLevel: config.LOG_ERROR,
  singleRun: true,
});

'use strict';
const findInternetExplorer = require('./internet-explorer');
const playwrightLauncher = require('./playwright-launcher');

const customLaunchers = {
  IE_NFM: {
    base: 'IE',
    // prevents crash on launch of multiple IE11 instances
    flags: ['-noframemerging'],
  },
};

const browsers = [
  'Chromium',
  'Firefox',
  'WebKit',
];

// on CI IE is not optional: if the image ever drops it, the run has to fail on a missing binary
// instead of quietly skipping the only engine that covers the bottom of the supported baseline
if (process.env.CI || findInternetExplorer()) {
  browsers.push('IE_NFM');
}

module.exports = config => {
  const target = process.argv.find(it => it.startsWith('-f='));

  // the only input this configuration takes, and karma reports a thrown error as a red config
  // line, where reading `slice` of nothing gives a stack trace pointing here
  if (!target) throw new Error('no bundles to run: start karma as `karma start -f=<comma separated paths>`');

  return config.set({
    plugins: [
      'karma-*',
      playwrightLauncher,
    ],
    files: target.slice(3).split(','),
    frameworks: ['qunit'],
    basePath: '.',
    customLaunchers,
    browsers,
    // the defaults assume an idle machine: on a CI runner, starting a browser, loading a megabyte
    // of polyfills and getting the first result out of IE11 all take multiples of them. every
    // deadline karma exposes is raised together - a single one left at its default is enough to
    // lose the run, and `pingTimeout` is the one a browser busy inside a test cannot answer
    captureTimeout: 12e4,
    browserNoActivityTimeout: 12e4,
    browserDisconnectTimeout: 1e4,
    browserDisconnectTolerance: 2,
    browserSocketTimeout: 6e4,
    pingTimeout: 6e4,
    processKillTimeout: 1e4,
    retryLimit: 3,
    // restarting a browser is cheaper than losing the run, but on CI it has to be visible - it is
    // the difference between a suite that passed and one that only passed on the third attempt
    logLevel: process.env.CI ? config.LOG_INFO : config.LOG_ERROR,
    singleRun: true,
  });
};

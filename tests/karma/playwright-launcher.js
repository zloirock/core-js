/* eslint-disable no-underscore-dangle -- karma's launcher API */
'use strict';
const { chromium, firefox, webkit } = require('playwright');

// a browser is captured by navigating a Playwright page to the karma server, and on a loaded CI
// runner both the launch and that navigation regularly need more than Playwright's own 30 seconds
const TIMEOUT = 6e4;

async function close(browser, log) {
  if (!browser) return;
  try {
    await browser.close();
  } catch (error) {
    log.error(error);
  }
}

function createLauncher(displayName, browserType) {
  function Launcher(baseLauncherDecorator, captureTimeoutLauncherDecorator, retryLauncherDecorator, logger) {
    baseLauncherDecorator(this);
    captureTimeoutLauncherDecorator(this);
    retryLauncherDecorator(this);

    const log = logger.create(displayName);

    this.name = this.displayName = displayName;

    let current;
    this.on('start', async url => {
      const attempt = {};
      current = attempt;
      try {
        const browser = await browserType.launch({ headless: true, timeout: TIMEOUT });
        // A timed-out launch can resolve after Karma has started a fresh capture.
        if (current !== attempt) {
          await close(browser, log);
          return;
        }
        attempt.browser = browser;
        const page = await browser.newPage();
        if (current === attempt) await page.goto(url, { timeout: TIMEOUT });
      } catch (error) {
        if (current !== attempt || this.state !== this.STATE_BEING_CAPTURED) return;
        log.error(error);
        const { browser } = attempt;
        attempt.browser = null;
        await close(browser, log);
        if (current === attempt && this.state === this.STATE_BEING_CAPTURED) this._done('failure');
      }
    });

    this.on('kill', async done => {
      const attempt = current;
      const stopped = {};
      current = stopped;
      await close(attempt?.browser, log);
      if (current === stopped) this._done();
      queueMicrotask(done);
    });
  }

  Launcher.$inject = [
    'baseLauncherDecorator',
    'captureTimeoutLauncherDecorator',
    'retryLauncherDecorator',
    'logger',
  ];

  return ['type', Launcher];
}

module.exports = {
  'launcher:Chromium': createLauncher('Chromium', chromium),
  'launcher:Firefox': createLauncher('Firefox', firefox),
  'launcher:WebKit': createLauncher('WebKit', webkit),
};

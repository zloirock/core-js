/* eslint-disable no-underscore-dangle -- karma's launcher API */
'use strict';
const { chromium, firefox, webkit } = require('playwright');

// a browser is captured by navigating a Playwright page to the karma server, and on a loaded CI
// runner both the launch and that navigation regularly need more than Playwright's own 30 seconds
const TIMEOUT = 6e4;

async function close(launcher, log) {
  const browser = launcher._browser;
  launcher._browser = null;
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

    this.on('start', async url => {
      try {
        this._browser = await browserType.launch({ headless: true, timeout: TIMEOUT });
        // karma can give up and kill the launcher while the browser is still starting: the kill
        // finds nothing to close, and the browser that arrives after it would be left running
        if (this.state !== this.STATE_BEING_CAPTURED) {
          await close(this, log);
          return;
        }
        const page = await this._browser.newPage();
        await page.goto(url, { timeout: TIMEOUT });
      } catch (error) {
        // the capture also fails when karma runs out of patience and kills the browser itself -
        // that launcher has reported `done` already, and a second report spends another retry
        if (this.state !== this.STATE_BEING_CAPTURED) return;
        log.error(error);
        // karma considers a launcher that reported `done` already killed, so a browser left
        // running by a failed capture would survive the restart and race the next attempt
        await close(this, log);
        this._done('failure');
      }
    });

    this.on('kill', async done => {
      await close(this, log);
      this._done();
      process.nextTick(done);
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

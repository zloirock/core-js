import { deepEqual, equal } from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mock } from 'node:test';
import { chromium } from 'playwright';
import launchers from './playwright-launcher.js';
import Base from 'karma/lib/launchers/base.js';
import CaptureTimeout from 'karma/lib/launchers/capture_timeout.js';
import Retry from 'karma/lib/launchers/retry.js';

function tick() {
  return new Promise(resolve => { setImmediate(resolve); });
}
const [, Launcher] = launchers['launcher:Chromium'];

for (const order of ['old first', 'new first', 'late rejection', 'pending page', 'pending close']) {
  const launches = [];
  const pages = [];
  const visited = [];
  const closed = [];
  const pending = Promise.withResolvers();
  function browser(id) {
    return {
      async newPage() {
        pages.push(id);
        if (id === 1 && order === 'pending page') await pending.promise;
        if (id === 1 && order === 'pending close') throw new Error('capture failed');
        return { goto() { visited.push(id); } };
      },
      close() {
        closed.push(id);
        if (id === 1 && order === 'pending close') return pending.promise;
      },
    };
  }
  const launch = mock.method(chromium, 'launch', () => {
    const deferred = Promise.withResolvers();
    launches.push(deferred);
    return deferred.promise;
  });
  try {
    let timeout;
    const timer = {
      setTimeout(fn) { timeout = fn; return 1; },
      clearTimeout() { timeout = null; },
    };
    const errors = [];
    // eslint-disable-next-line unicorn/prefer-event-target -- Karma expects Node's EventEmitter.
    const launcher = new Launcher(Base.decoratorFactory(1, new EventEmitter()), CaptureTimeout.decoratorFactory(timer, 60_000),
      Retry.decoratorFactory(3), { create: () => ({ error(error) { errors.push(error.message); } }) });
    launcher.start('http://localhost/');
    if (order.startsWith('pending')) {
      launches[0].resolve(browser(1));
      await tick();
    }
    timeout();
    await tick();
    equal(launches.length, 2, order);
    if (order === 'old first') {
      launches[0].resolve(browser(1));
      await tick();
    }
    launches[1].resolve(browser(2));
    await tick();
    if (order === 'new first') launches[0].resolve(browser(1));
    else if (order === 'late rejection') launches[0].reject(new Error('old launch failed'));
    else pending.resolve();
    await tick();
    equal(launches.length, 2, order);
    deepEqual(pages, order.startsWith('pending') ? [1, 2] : [2], order);
    deepEqual(visited, [2], order);
    deepEqual(errors, order === 'pending close' ? ['capture failed'] : [], order);
    launcher.markCaptured();
    await launcher.forceKill();
    deepEqual(closed, order === 'late rejection' ? [2] : [1, 2], order);
  } finally {
    launch.mock.restore();
  }
}

import { deepStrictEqual, doesNotReject, strictEqual } from 'node:assert/strict';
import createLifecycle from '../../packages/core-js-service-container/lifecycle.js';

function deferred() {
  return Promise.withResolvers();
}

async function settled() {
  await new Promise(resolve => setImmediate(resolve));
}

function fixture({ load = () => ['es.array.at'], createService } = {}) {
  const ready = deferred();
  const warmed = deferred();
  const calls = [];
  const logs = [];
  const service = {
    start() { calls.push('start'); return { ready: ready.promise, warmed: warmed.promise }; },
    serveScript(...args) { calls.push(['serve', ...args]); return 'script'; },
  };
  const lifecycle = createLifecycle({
    load() { calls.push('load'); return load(); },
    createService(scope) { calls.push(['create', scope]); return createService ? createService(scope) : service; },
    log(...args) { logs.push(args); },
  });
  return { lifecycle, ready, warmed, calls, logs, service };
}

const loading = deferred();
const pending = fixture({ load: () => loading.promise });
pending.lifecycle.start();
deepStrictEqual(pending.lifecycle.status(), { state: 'started', baselineReady: false, fullyWarmed: false }, 'container-lifecycle-1 #6');
loading.resolve(['es.promise.all']);
await settled();
deepStrictEqual(pending.calls, ['load', ['create', ['es.promise.all']], 'start'], 'container-lifecycle-1 #7');
pending.ready.resolve();
pending.warmed.resolve({ built: [], failed: [] });
await settled();

const normal = fixture();
deepStrictEqual(normal.lifecycle.status(), { state: 'started', baselineReady: false, fullyWarmed: false }, 'container-lifecycle-1 #1');
strictEqual(normal.lifecycle.serveScript('request'), undefined, 'container-lifecycle-2 #1');
strictEqual(normal.lifecycle.start(), normal.lifecycle.start(), 'container-lifecycle-1 #2');
await settled();
deepStrictEqual(normal.calls, ['load', ['create', ['es.array.at']], 'start'], 'container-lifecycle-1 #3');
normal.ready.resolve();
await settled();
deepStrictEqual(normal.lifecycle.status(), { state: 'ready', baselineReady: true, fullyWarmed: false }, 'container-lifecycle-1 #4');
strictEqual(normal.lifecycle.serveScript('request', 'response'), 'script', 'container-lifecycle-2 #2');
deepStrictEqual(normal.calls.at(-1), ['serve', 'request', 'response'], 'container-lifecycle-2 #3');
normal.warmed.resolve({ built: ['one'], failed: [] });
await settled();
deepStrictEqual(normal.lifecycle.status(), { state: 'ready', baselineReady: true, fullyWarmed: true }, 'container-lifecycle-1 #5');
deepStrictEqual(normal.logs, [], 'container-lifecycle-4 #1');

for (const [label, options, code] of [
  ['container-lifecycle-3 #1', { load() { throw new Error('manifest path'); } }, 'manifest_invalid'],
  ['container-lifecycle-3 #2', { load: () => Promise.reject(new Error('invalid JSON')) }, 'manifest_invalid'],
  ['container-lifecycle-3 #3', { createService() { throw new Error('plan'); } }, 'plan_failed'],
  ['container-lifecycle-3 #4', { createService() { return { start() { throw new Error('baseline'); } }; } }, 'baseline_build_failed'],
]) {
  const failure = fixture(options);
  failure.lifecycle.start();
  await settled();
  deepStrictEqual(failure.lifecycle.status(), { state: 'error', baselineReady: false, fullyWarmed: false, errorCode: code }, label);
  strictEqual(failure.lifecycle.serveScript('request'), undefined, 'container-lifecycle-2 #4');
  failure.lifecycle.start();
  await settled();
  strictEqual(failure.calls.filter(call => call === 'load').length, 1, 'container-lifecycle-4 #2');
  strictEqual(failure.logs.length, 1, 'container-lifecycle-4 #3');
  strictEqual(failure.logs[0][0], code, 'container-lifecycle-4 #4');
}

const baseline = fixture();
baseline.lifecycle.start();
await settled();
baseline.ready.reject(new Error('baseline unavailable'));
baseline.warmed.reject(new Error('baseline unavailable'));
await settled();
deepStrictEqual(baseline.lifecycle.status(), { state: 'error', baselineReady: false, fullyWarmed: false, errorCode: 'baseline_build_failed' }, 'container-lifecycle-3 #5');
strictEqual(baseline.logs.length, 1, 'container-lifecycle-4 #5');

const buckets = fixture();
buckets.lifecycle.start();
await settled();
buckets.ready.resolve();
await settled();
buckets.warmed.resolve({ built: ['ok'], failed: ['bad', 'worse'] });
await settled();
deepStrictEqual(buckets.lifecycle.status(), { state: 'error', baselineReady: true, fullyWarmed: false, errorCode: 'bundle_build_failed' }, 'container-lifecycle-3 #6');
strictEqual(buckets.lifecycle.serveScript('request'), 'script', 'container-lifecycle-2 #5');
deepStrictEqual(buckets.logs, [['bundle_build_failed', ['bad', 'worse']]], 'container-lifecycle-4 #6');
buckets.lifecycle.start();
buckets.lifecycle.serveScript('again');
strictEqual(buckets.logs.length, 1, 'container-lifecycle-4 #7');

const final = fixture();
final.lifecycle.start();
await settled();
final.warmed.reject(new Error('prune failed'));
await settled();
final.ready.resolve();
await settled();
deepStrictEqual(final.lifecycle.status(), { state: 'error', baselineReady: true, fullyWarmed: false, errorCode: 'bundle_build_failed' }, 'container-lifecycle-3 #7');
strictEqual(final.logs[0][1].message, 'prune failed', 'container-lifecycle-4 #8');

const originalStderrWrite = process.stderr.write;
const fallbackLogs = [];
process.stderr.write = function (message) {
  fallbackLogs.push(message);
  return true;
};
try {
  const loggerError = new Error('logging unavailable');
  const failure = createLifecycle({
    load() { throw new Error('manifest path'); },
    createService() { throw new Error('should not create'); },
    log() { throw loggerError; },
  });
  const started = failure.start();
  await doesNotReject(started, 'container-lifecycle-4 #9');
  deepStrictEqual(failure.status(), { state: 'error', baselineReady: false, fullyWarmed: false,
    errorCode: 'manifest_invalid' }, 'container-lifecycle-3 #8');
  strictEqual(failure.start(), started, 'container-lifecycle-4 #10');
  strictEqual(fallbackLogs.length, 1, 'container-lifecycle-4 #11');
  strictEqual(fallbackLogs[0].includes('logging unavailable'), true, 'container-lifecycle-4 #12');
  strictEqual(fallbackLogs[0].includes('manifest_invalid'), true, 'container-lifecycle-4 #13');
  strictEqual(fallbackLogs[0].includes('manifest path'), true, 'container-lifecycle-4 #14');

  process.stderr.write = function () { throw new Error('stderr unavailable'); };
  const noOutput = createLifecycle({
    load() { throw new Error('invalid manifest'); },
    createService() { throw new Error('should not create'); },
    log() { throw loggerError; },
  });
  await doesNotReject(noOutput.start(), 'container-lifecycle-4 #15');
  deepStrictEqual(noOutput.status(), { state: 'error', baselineReady: false, fullyWarmed: false,
    errorCode: 'manifest_invalid' }, 'container-lifecycle-3 #9');
} finally {
  process.stderr.write = originalStderrWrite;
}

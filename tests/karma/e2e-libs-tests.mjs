import { deepEqual, rejects, throws } from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { link, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkWebKitRejections } from './e2e-libs-rejections-test.mjs';
import config from './e2e-libs.conf.js';
import { browserOutcome, hasLoggedFailure, hasUnexpectedBrowserFailure, selectRunnableCells } from './e2e-libs-results.mjs';
import { shouldRetryKarma, waitForKarma } from './helpers.mjs';

const scratch = await mkdtemp(join(tmpdir(), 'karma-checkpoint-'));
try {
  const path = join(scratch, 'results.json');
  config.saveReport(path, { attempt: 1 });
  // Keep the prior checkpoint accessible by name, including on Windows.
  const previous = join(scratch, 'previous.json');
  await link(path, previous);
  config.saveReport(path, { attempt: 2 });
  deepEqual(JSON.parse(await readFile(previous)), { attempt: 1 });
  deepEqual(JSON.parse(await readFile(path)), { attempt: 2 });
} finally {
  try {
    await rm(scratch, { recursive: true, force: true });
  } catch (error) {
    console.warn(`could not remove ${ scratch }: ${ error.message }`);
  }
}

const builtCell = { lib: 'highlight', label: 'highlight/built' };
const failedCell = { lib: 'three', label: 'three/failed', error: 'build failed' };
deepEqual(selectRunnableCells([failedCell, builtCell]), [builtCell]);
deepEqual(selectRunnableCells([failedCell, builtCell], 'highlight'), [builtCell]);
throws(() => selectRunnableCells([failedCell, builtCell], 'three'), /no e2e-libs pages to run for 'three'/u);
throws(() => selectRunnableCells([failedCell, builtCell], 'absent-library'), /no e2e-libs pages to run for 'absent-library'/u);

const frames = [{ label: 'diagnostic' }];
const chromium = { id: '1', name: 'Chromium' };
const firefox = { id: '2', name: 'Firefox' };
const passed = { description: 'diagnostic', success: true };
const failed = { description: 'diagnostic', success: false };
let report;
const Reporter = config.resultsReporter(result => { report = result; });
const reporter = new Reporter(() => { /* no console adapter */ });
reporter.onBrowserStart(chromium);
reporter.onSpecComplete(chromium, failed);
deepEqual(hasUnexpectedBrowserFailure(report), true);
reporter.onBrowserError(chromium, 'Disconnected');
reporter.onBrowserStart(firefox);
reporter.onSpecComplete(firefox, failed);
reporter.onBrowserStart(chromium);
reporter.onSpecComplete(chromium, passed);
reporter.onRunComplete([chromium, firefox]);

deepEqual(browserOutcome(report, frames).get('diagnostic'), new Map([['Chromium', 'passed'], ['Firefox', 'failed']]));
throws(() => browserOutcome({ ...report, results: report.results.slice(1) }, frames), /Chromium did not report/u);
const skipped = [{ ...report.results[0], skipped: true }, report.results[1]];
throws(() => browserOutcome({ ...report, results: skipped }, frames), /Chromium skipped/u);

reporter.onBrowserError(chromium, 'terminal disconnect');
reporter.onRunComplete([chromium, firefox]);
throws(() => browserOutcome(report, frames), /terminal disconnect/u);

const label = 'colorjs/babel-plugin/usage-pure';
const error = `${ label }: run() threw - Unable to get property 'type' of undefined or null reference\nExpected: true\nActual: false\n`;
const ie = 'IE 11.0 (Windows 10)';
function mock(browser, log, cell = label) {
  return browserOutcome({
    browsers: [browser], errors: [], results: [{ browser, label: cell, log, success: false }],
  }, [{ label: cell }]).get(cell).get(browser);
}
deepEqual(mock(ie, [error]), 'diagnostic-failed');
deepEqual(mock(ie, [error.replace('\nExpected:', '\nAdditional failure\nExpected:')]), 'failed');
const spreadCell = 'three/unplugin/usage-pure/pre';
const spreadError = `${ spreadCell }: run() threw - Invalid attempt to spread non-iterable instance.\n`
  + 'In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\nExpected: true\nActual: false\n';
deepEqual(mock(ie, [spreadError], spreadCell), 'diagnostic-failed');
deepEqual(mock(ie, [spreadError.replace('non-array', 'other')], spreadCell), 'failed');
deepEqual(mock('Chromium', [error]), 'failed');
deepEqual(mock(ie, [`${ label } - percent_parse`]), 'failed');
deepEqual(mock(ie, [error, `${ label } - percent_parse`]), 'failed');
deepEqual(mock(ie, [error.replace(label, 'colorjs/babel-plugin/usage-global')], 'colorjs/babel-plugin/usage-global'), 'failed');
deepEqual(mock(ie, [`${ label }: run() threw - unhandled rejection - regress`]), 'failed');

const testsRed = `${ ie }: Executed 222 of 222 (17 FAILED)`;
const disconnected = `${ testsRed }\nFirefox DISCONNECTED`;
const diagnostic = { browser: ie, label, log: [error], success: false };
const ieBrowser = { id: 'ie', name: ie };
const onlyIE = new Reporter(() => { /* no console adapter */ });
onlyIE.onBrowserStart(ieBrowser);
onlyIE.onSpecComplete(ieBrowser, { description: label, success: false, log: [error] });
deepEqual(hasUnexpectedBrowserFailure(report), false);
onlyIE.onSpecComplete(ieBrowser, { description: label, success: false, log: ['unexpected failure'] });
deepEqual(hasUnexpectedBrowserFailure(report), true);
onlyIE.onBrowserStart(ieBrowser);
deepEqual(hasUnexpectedBrowserFailure(report), false);
const regression = { ...diagnostic, browser: 'Chromium' };
const partial = { results: [diagnostic], errors: [{ browser: 'Firefox', error: 'Disconnected reconnect timed out' }] };
deepEqual(await shouldRetryKarma(disconnected, () => hasUnexpectedBrowserFailure(partial)), true);
deepEqual(await shouldRetryKarma(disconnected, () => hasUnexpectedBrowserFailure({ ...partial, results: [diagnostic, regression] })), false);
deepEqual(await shouldRetryKarma(disconnected, () => hasUnexpectedBrowserFailure({
  ...partial, results: [{ ...diagnostic, skipped: true }],
})), false);
deepEqual(await shouldRetryKarma(disconnected, () => hasUnexpectedBrowserFailure({
  ...partial, errors: [...partial.errors, { browser: 'Chromium', error: 'Uncaught ReferenceError: fixtureMissing is not defined' }],
})), false);
deepEqual(await shouldRetryKarma(disconnected), false);
deepEqual(await shouldRetryKarma(testsRed, () => false), false);
deepEqual(await shouldRetryKarma('Firefox DISCONNECTED'), true);
deepEqual(await shouldRetryKarma('', () => false, true), true);
deepEqual(await shouldRetryKarma('', () => true, true), false);
deepEqual(await shouldRetryKarma(disconnected, hasLoggedFailure), false);
deepEqual(await shouldRetryKarma(`${ ie }  control/clean FAILED\nFirefox DISCONNECTED`, hasLoggedFailure), false);
deepEqual(await shouldRetryKarma(`Chromium: Executed 222 of 222\u001B[31m (1 FAILED)\u001B[39m\n${ disconnected }`, hasLoggedFailure), false);

function dots(cell, message) {
  return `${ ie }  ${ cell } FAILED\n\t${ message.trimEnd().replaceAll('\n', '\n\t') }\n\t   at frame.js:1:1\n\t`;
}
const singleRed = `\n${ ie }: Executed 12 of 12 (1 FAILED)\nFirefox DISCONNECTED`;
deepEqual(hasLoggedFailure(dots(label, error) + singleRed), false);
deepEqual(hasLoggedFailure(dots(spreadCell, spreadError) + singleRed), false);
deepEqual(hasLoggedFailure(dots(label, error).replace('Actual: false', 'Actual: false\n\tanother failure') + singleRed), true);
deepEqual(hasLoggedFailure(dots(label, error).replace('Expected: true', 'Expected: false') + singleRed), true);
deepEqual(hasLoggedFailure(dots(label, error) + singleRed.replace('1 FAILED', '2 FAILED')), true);

const { promise: hanging, resolve: stop } = Promise.withResolvers();
Object.assign(hanging, { kill: signal => stop({ exitCode: null, signal, stdout: '', stderr: '' }) });
const expired = await waitForKarma(hanging, 10);
deepEqual([expired.timedOut, expired.signal], [true, 'SIGKILL']);
const { promise: stillRunning } = Promise.withResolvers();
const stopError = new Error('could not list child processes');
Object.assign(stillRunning, { kill: () => Promise.reject(stopError) });
await rejects(waitForKarma(stillRunning, 10), { message: /Karma timed out after 10ms/u, cause: stopError });
// A resolved kill request does not guarantee that the command exited.
const child = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 2000)']);
const exit = once(child, 'exit');
try {
  const command = Object.assign(exit, { child, kill: () => Promise.resolve() });
  await rejects(waitForKarma(command, 10, 20), {
    message: /Karma timed out after 10ms/u, cause: new Error('no exit within 20ms'),
  });
  deepEqual(child.killed, true);
  deepEqual(child.stdio.every(stream => stream.destroyed), true);
} finally {
  child.ref();
  child.kill('SIGKILL');
  await exit;
}
const completed = await waitForKarma(Promise.resolve({ exitCode: 0 }), 10);
deepEqual([completed.timedOut, completed.exitCode], [false, 0]);

await checkWebKitRejections();

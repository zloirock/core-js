import { deepEqual, throws } from 'node:assert/strict';
import config from './e2e-libs.conf.js';
import { browserOutcome, hasFailingModernBrowser, hasUnexpectedBrowserFailure } from './e2e-libs-results.mjs';
import { shouldRetryKarma } from './helpers.mjs';

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
deepEqual(await shouldRetryKarma(disconnected, hasFailingModernBrowser), true);
deepEqual(await shouldRetryKarma(`Chromium: Executed 222 of 222\u001B[31m (1 FAILED)\u001B[39m\n${ disconnected }`, hasFailingModernBrowser), false);

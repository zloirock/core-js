import { deepEqual, throws } from 'node:assert/strict';
import config from './e2e-libs.conf.js';
import { browserOutcome } from './e2e-libs-results.mjs';

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

deepEqual(browserOutcome(report, frames).get('diagnostic'), new Map([['Chromium', true], ['Firefox', false]]));
throws(() => browserOutcome({ ...report, results: report.results.slice(1) }, frames), /Chromium did not report/u);
const skipped = [{ ...report.results[0], skipped: true }, report.results[1]];
throws(() => browserOutcome({ ...report, results: skipped }, frames), /Chromium skipped/u);

reporter.onBrowserError(chromium, 'terminal disconnect');
reporter.onRunComplete([chromium, firefox]);
throws(() => browserOutcome(report, frames), /terminal disconnect/u);

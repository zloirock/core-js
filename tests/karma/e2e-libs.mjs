// The browser leg of `tests/e2e-libs`: every page `runtime.mjs` already built and gated, run in ONE
// karma session, each cell's `frame.html` in an iframe of its own - one bundle per REALM, or one
// cell's injection masks another cell's miss. Two isolation controls run first and prove that holds;
// red there voids the run. A session's exit code cannot say which cell failed, so the verdict per cell
// and browser comes from the file `e2e-libs.conf.js`'s reporter writes, and a cell some browser never
// reported on is red rather than silently green.
//
// Usage:  npm run test-e2e-libs-karma-run [libFilter]
import * as manifest from '../e2e-libs/manifest.mjs';
import './e2e-libs-tests.mjs';
import { browserOutcome, hasFailingModernBrowser, hasUnexpectedBrowserFailure } from './e2e-libs-results.mjs';
import { announceBrowserRun, announceScopedRun, reportBrowserCell, reportBrowserTally } from '../e2e-libs/output.mjs';
import { RUN_TIMEOUT_MS } from '../e2e-libs/page.mjs';
import { ARTIFACTS } from '../e2e-libs/paths.mjs';
import { start } from './helpers.mjs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [libFilter] = argv._.map(String);

// read through the suite's own module: what a manifest is and what a missing one means are that
// suite's questions, and a second reader here would answer them a second way
const parsed = await manifest.read();

// a cell that failed to build has no page, and its own tier has already reddened the run
const runnable = parsed.cells.filter(cell => !cell.error && (libFilter === undefined || cell.lib === libFilter));
if (!runnable.length) throw new Error(`no e2e-libs pages to run${ libFilter ? ` for '${ libFilter }'` : '' }`);

// relative to `frames.js` itself, which sits in `artifacts/` - the driver reads its own anchor from it
const CONTROLS = ['control/poison', 'control/clean'];
const frames = [
  ...CONTROLS.map(label => ({ label, frame: `../harness/${ label.replace('/', '-') }.html` })),
  ...runnable.map(cell => ({ label: cell.label, frame: `${ cell.label }/frame.html` })),
// the frame has to load its bundle before the run's own bound starts, so the driver allows for both
].map(entry => ({ ...entry, timeout: 2 * RUN_TIMEOUT_MS }));

const FRAMES = join(ARTIFACTS, 'frames.js');
const RESULTS = join(ARTIFACTS, 'browser-results.json');
await writeFile(FRAMES, `window.E2E_FRAMES = ${ JSON.stringify(frames, null, 1) };\n`);
await rm(RESULTS, { force: true });

announceScopedRun(libFilter ?? (parsed.scope === 'all libraries' ? undefined : parsed.scope));
announceBrowserRun(runnable.length);

async function readReport() {
  return JSON.parse(await readFile(RESULTS));
}

async function hasTestFailure(output) {
  try {
    if (hasUnexpectedBrowserFailure(await readReport())) return true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return hasFailingModernBrowser(output);
  }
  // The next attempt must write its own report.
  await rm(RESULTS, { force: true });
  return false;
}

// The specialized Karma config exits nonzero for launch and infrastructure failures, even when
// a diagnostic cell also failed. Individual verdicts come from the reporter.
await start(['tests/e2e-libs/harness/shared', 'tests/e2e-libs/artifacts/frames', 'tests/e2e-libs/harness/qunit'], {
  config: 'e2e-libs.conf.js',
  env: { E2E_LIBS_BROWSER_RESULTS: RESULTS },
  hasTestFailure,
});
const report = await readReport();
const outcome = browserOutcome(report, frames);

function browsersWith(label, status) {
  return report.browsers.filter(browser => outcome.get(label).get(browser) === status);
}

for (const label of CONTROLS) {
  const browsers = browsersWith(label, 'failed');
  if (browsers.length) {
    throw new Error(`isolation control ${ label } is red in ${ browsers.join(', ') } - the cells' frames are not realms of their own, so no verdict of this run stands`);
  }
}

const failed = [];
for (const cell of runnable) {
  const red = browsersWith(cell.label, 'failed');
  const diagnostic = browsersWith(cell.label, 'diagnostic-failed');
  cell.karma = red.length ? 'failed' : diagnostic.length ? 'diagnostic-failed' : 'passed';
  if (red.length) {
    failed.push(cell.label);
    reportBrowserCell(cell, red);
  }
  if (diagnostic.length) reportBrowserCell(cell, diagnostic, true);
}

// the browsers are the only tier that answers the real floor of a cell, so their verdict belongs in
// the file, not only in this log
for (const cell of parsed.cells) cell.karma ??= 'not run';
await manifest.save(parsed);

reportBrowserTally({ failed, pages: runnable.length });
if (failed.length) process.exitCode = 1;

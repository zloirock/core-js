// The browser leg of `tests/e2e-libs`: every page `runtime.mjs` already built and gated, run in ONE
// karma session, each cell's `frame.html` in an iframe of its own - one bundle per REALM, or one
// cell's injection masks another cell's miss. Two isolation controls run first and prove that holds;
// red there voids the run. A session's exit code cannot say which cell failed, so the verdict per cell
// and browser comes from the file `e2e-libs.conf.js`'s reporter writes, and a cell some browser never
// reported on is red rather than silently green.
//
// Usage:  npm run test-e2e-libs-karma-run [libFilter]
import * as manifest from '../e2e-libs/manifest.mjs';
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

// decided once, in `cells.mjs`, and carried here by the manifest. A row without it is a manifest
// older than the field, and reading `undefined` as "not gating" would wave every cell through
for (const cell of runnable) {
  if (typeof cell.gatesInBrowsers !== 'boolean') {
    throw new Error(`${ cell.label }: the manifest has no \`gatesInBrowsers\` - rerun the runtime tier first`);
  }
}

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

announceScopedRun(libFilter);
announceBrowserRun(runnable.length);

// a red cell fails the session too, and that is not a launch failure - the results file tells them
// apart: a run that wrote one finished, whatever its exit code
let launchError = null;
try {
  await start(['tests/e2e-libs/harness/shared', 'tests/e2e-libs/artifacts/frames', 'tests/e2e-libs/harness/qunit'], {
    config: 'e2e-libs.conf.js',
    env: { E2E_LIBS_BROWSER_RESULTS: RESULTS },
  });
} catch (error) {
  launchError = error;
}

let report;
try {
  report = JSON.parse(await readFile(RESULTS, 'utf8'));
} catch (error) {
  throw launchError ?? new Error(`karma finished without writing ${ RESULTS }`, { cause: error });
}
if (report.errors.length) {
  throw new Error(`the browser leg's page itself failed - ${ report.errors.map(({ browser, error }) => `${ browser }: ${ error }`).join('; ') }`);
}

// every frame has exactly one result from every browser, or the run is not the run it claims to be
const outcome = new Map(frames.map(({ label }) => [label, new Map()]));
for (const { browser, label, success } of report.results) {
  const perBrowser = outcome.get(label);
  if (!perBrowser) throw new Error(`${ browser } reported on '${ label }', which no frame of this run is`);
  if (perBrowser.has(browser)) throw new Error(`${ browser } reported on '${ label }' twice`);
  perBrowser.set(browser, success);
}
// a browser that never reported on a frame is in this list too, so silence reads as red
function redIn(label) {
  return report.browsers.filter(browser => outcome.get(label).get(browser) !== true);
}

for (const label of CONTROLS) {
  const browsers = redIn(label);
  if (browsers.length) {
    throw new Error(`isolation control ${ label } is red in ${ browsers.join(', ') } - the cells' frames are not realms of their own, so no verdict of this run stands`);
  }
}

const failed = [];
for (const cell of runnable) {
  const browsers = redIn(cell.label);
  cell.karma = browsers.length ? cell.gatesInBrowsers ? 'failed' : 'diagnostic-failed' : 'passed';
  if (!browsers.length) continue;
  if (cell.gatesInBrowsers) failed.push(cell.label);
  reportBrowserCell(cell, browsers);
}

// the browsers are the only tier that answers the real floor of a cell, so their verdict belongs in
// the file, not only in this log
for (const cell of parsed.cells) cell.karma ??= 'not run';
await manifest.save(parsed);

// a red cell, gating or not, is what fails the session; a session that failed with none is
// unexplained, and an unexplained failure is not a green run
if (launchError && runnable.every(cell => cell.karma === 'passed')) {
  throw new Error(`karma failed although every cell is green in every browser - ${ launchError.message }`);
}

reportBrowserTally({ failed, pages: runnable.length });
if (failed.length) process.exitCode = 1;

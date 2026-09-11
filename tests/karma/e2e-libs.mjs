// The browser leg of `tests/e2e-libs`: one page per cell, over the pages `runtime.mjs` already built
// and gated. ONE bundle per page, or one cell's injection masks another cell's miss - the files beside
// it are the cell's data and the two ES5 programs that read it, none of them under test.
//
// Usage:  npm run test-e2e-libs-karma-run [libFilter]
import * as manifest from '../e2e-libs/manifest.mjs';
import { announceBrowserCell, announceBrowserRun, announceScopedRun, reportBrowserCell,
  reportBrowserTally } from '../e2e-libs/output.mjs';
import { start } from './helpers.mjs';

const [libFilter] = argv._.map(String);

// read through the suite's own module: what a manifest is and what a missing one means are that
// suite's questions, and a second reader here would answer them a second way
const parsed = await manifest.read();

// a cell that failed to build has no page, and its own tier has already reddened the run
const runnable = parsed.cells.filter(cell => !cell.error && (libFilter === undefined || cell.lib === libFilter));
if (!runnable.length) throw new Error(`no e2e-libs pages to run${ libFilter ? ` for '${ libFilter }'` : '' }`);

announceScopedRun(libFilter);
announceBrowserRun(runnable.length);

const failed = [];
for (const cell of runnable) {
  // `pre` is unplugin's known-incomplete phase; a babel-plugin cell has no phase axis, so it gates
  const gating = cell.phase !== 'pre';
  announceBrowserCell(cell.label, gating);
  try {
    // `label` is the artifact directory too: `cells.mjs` joins a cell's segments on `/` once, and
    // karma matches its `files` through glob, where a backslash is an escape that matches nothing
    await start([
      `tests/e2e-libs/artifacts/${ cell.label }/bundle`,
      `tests/e2e-libs/artifacts/${ cell.label }/cell`,
      'tests/e2e-libs/harness/shared',
      'tests/e2e-libs/harness/qunit',
    ]);
    cell.karma = 'passed';
  } catch {
    cell.karma = gating ? 'failed' : 'diagnostic-failed';
    if (gating) failed.push(cell.label);
    reportBrowserCell(cell.label, gating);
  }
}

// the browsers are the only tier that answers the real floor of a cell, so their verdict belongs in
// the file, not only in this log
for (const cell of parsed.cells) cell.karma ??= 'not run';
await manifest.save(parsed);

reportBrowserTally({ failed, pages: runnable.length });
if (failed.length) process.exitCode = 1;

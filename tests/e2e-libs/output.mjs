// What a run says about itself: the header, a cell's verdict, the tally, and every phrase more than
// one tier repeats - one worded in two places is worded two ways. zx-bound, unlike `diagnostics.mjs`
// beside it, so `preflight-child.mjs` may never import this one.
import { METHODS, PROVIDERS } from './cells.mjs';
import { checkFailureLine } from './diagnostics.mjs';
import { MANIFEST } from './manifest.mjs';
import { ARTIFACTS } from './paths.mjs';
import { FIXTURE_SHARD } from '../babel-plugin/fixture-shards.mjs';

const { basename } = path;
const { cyan, green, red, yellow } = chalk;

// unplugin's `pre` runs before Babel, so it can miss a polyfill a Babel helper needs - by design on
// some libraries. Both tiers that can see one say so in these words, prefix and all.
function preDiagnostic(what) {
  return `pre diagnostic ${ what } - an expected-possible pre failure; not gating`;
}

// a shard's lines reach the parent's log as one block, so a header repeated per process would stand
// between a run and its description
function fromParentOnly(line) {
  if (!FIXTURE_SHARD) echo(line);
}

// every tier can be narrowed, and every one exits 0 over the fraction it was asked for
export function announceScopedRun(filter) {
  if (filter !== undefined) fromParentOnly(red(`SCOPED RUN: ${ cyan(filter) } only - not a full verification`));
}

// The raw tier, whose `ok`/`FAIL` prefix is the one a cell's verdict carries below.
export function announceExerciseRun(targets) {
  echo(green(`exercises, raw in node - no bundler, no polyfills: ${ cyan(targets.length) } target(s)`
    + ` - ${ cyan(targets.map(target => basename(target)).join(', ')) }`));
}

// before the exercise runs, not after: one that hangs is named by the last line on screen
export function announceExercise(name) {
  echo(green(`\n${ cyan(name) }`));
}

export function reportExercise({ checks, failingChecks }) {
  for (const check of checks) {
    echo((check.pass ? green : red)(check.pass ? `ok   ${ cyan(check.label) }` : `FAIL ${ checkFailureLine(check) }`));
  }
  echo((failingChecks.length ? red : green)(`${ cyan(checks.length) } checks, ${ cyan(failingChecks.length) } failing`));
}

export function reportExerciseFailure(name, reason) {
  echo(red(`FAIL ${ cyan(name) } did not run: ${ reason }`));
}

// `failing` counts checks and `broken` exercises, by identity - one that fails twice is one exercise
export function reportExerciseTally({ total, targets, failing, broken }) {
  echo((failing || broken.length ? red : green)(`\ntotal: ${ cyan(total) } checks across `
    + `${ cyan(targets) } exercise(s), ${ cyan(failing) } failing`
    + `${ broken.length ? `, ${ cyan(broken.length) } exercise(s) did not run: ${ cyan(broken.join(', ')) }` : '' }`));
}

export function announceInput(input) {
  const locks = Object.entries(input.lockfiles).map(([file, digest]) => `${ file } ${ digest }`);
  fromParentOnly(green(`environment: ${ cyan(input.environment) }`));
  fromParentOnly(green(`lockfiles: ${ cyan(locks.join(' | ')) }`));
  // called out of the packages list: consumed as SOURCE, which is the path the phase axis exercises
  fromParentOnly(green(`TS sources: ${ input.tsSources
    .map(name => cyan(`${ name } ${ input.packages[name] ?? '?' }`)).join(' | ') }`));
  fromParentOnly(green(`packages: ${ Object.entries(input.packages)
    .map(([name, version]) => cyan(`${ name } ${ version }`)).join(' | ') }`));
}

export function announceRun({ libs, libraryMethodGroups, libraryFilter, shardCount }) {
  const cellCount = libraryMethodGroups.reduce((total, group) => total + group.length, 0);
  fromParentOnly(green(`\nruntime tier: ${ cyan(libs.length) } librar${ libs.length === 1 ? 'y' : 'ies' }`
    + ` x ${ cyan(METHODS.length) } method(s) x ${ cyan(PROVIDERS.length) } provider(s), phases expanded`
    + ` - ${ cyan(cellCount) } cell(s)${ libraryFilter ? ` filtered by ${ cyan(libraryFilter) }` : '' }`));
  announceScopedRun(libraryFilter);
  if (shardCount > 1) {
    fromParentOnly(green(`sharded over ${ cyan(shardCount) } process(es); each one's lines arrive together when it finishes`));
  }
  fromParentOnly(green('each cell is built once, then gated, snapshotted, pre-flighted in node and written as a page;'
    + ` the browsers run those pages afterwards, from ${ cyan('tests/karma/e2e-libs.mjs') }`));
}

export function reportCell(cell, { ok, checks, failingChecks, injected, delta, snapshotState, stripped, strippedFailed, rawKb, wire, buildMs }) {
  // `providers agree` is about entry-global rather than about a baseline, so it names itself
  const snapshotNote = snapshotState === 'skipped' ? '' : snapshotState === 'providers agree'
    ? `, ${ cyan(snapshotState) }` : `, snapshot ${ cyan(snapshotState) }`;
  echo((ok ? green : red)(`${ ok ? 'ok' : 'FAIL' } ${ cyan(cell.label) }: `
    + `${ cyan(`${ checks.length - failingChecks.length }/${ checks.length }`) } preflight, `
    + `${ cyan(injected.length) } injections${ delta ? ` (delta vs reference ${ cyan(delta.length) })` : '' }`
    + `${ snapshotNote }`
    + `${ stripped?.ok ? `, stripped realm ${ cyan(`${ stripped.count }/${ stripped.count }`) }` : '' } `
    + `(${ cyan(rawKb) }kb raw${ wire.gzKb === null ? '' : ` -> ${ cyan(wire.minKb) }kb min -> ${ cyan(wire.gzKb) }kb gzip` }`
    + `, built in ${ cyan(buildMs.toFixed(0)) }ms)`));
  for (const check of failingChecks) echo(red(`    FAIL ${ checkFailureLine(check) }`));
  if (stripped && !stripped.ok) {
    const what = `stripped realm: ${ stripped.reason }`;
    echo(strippedFailed ? red(`    FAIL ${ what }`) : yellow(`    ${ preDiagnostic(what) }`));
    for (const check of stripped.bad ?? []) echo(red(`        ${ checkFailureLine(check) }`));
  }
}

export function reportCellFailure(cell, reason) {
  echo(red(`FAIL ${ cyan(cell.label) }: ${ reason }`));
}

// a number nothing gates on may not become a gate by accident: its own line, and the verdict untouched
export function warnWireSize(label, reason) {
  echo(yellow(`    could not measure the wire size of ${ cyan(label) } - ${ reason }`));
}

export function announceArtifacts() {
  echo(green(`\nartifacts -> ${ cyan(ARTIFACTS) }`));
  // by the manifest rather than by what is in the directory: the file is what this run stands behind
  echo(green(`Upload the page of each cell the manifest lists - ${ cyan('<lib>/<provider>/<method>[/<phase>]/index.html') },`));
  echo(green(`${ cyan('bundle.js') } beside it - to BrowserStack/SauceLabs IE11 for a manual real-engine check.`));
  echo(green(`\nmanifest -> ${ cyan(MANIFEST) }`));
}

// `ok` is handed in, not derived from the counters beside it: an orphaned baseline reddens a run too
export function reportRuntimeTally({ drift, missing, failed, cells, ok }) {
  if (drift) echo(red(`\nFAIL injection snapshot drifted in ${ cyan(drift) } cell(s) - rerun with OVERWRITE=1 if intended`));
  if (missing) echo(red(`\nFAIL ${ cyan(missing) } cell(s) have no snapshot baseline - rerun with OVERWRITE=1 to author them`));
  // the shards' failures are counted, not named - each shard printed its own red lines
  if (failed) echo(red(`\nFAIL ${ cyan(failed) } cell(s) failed`));
  if (ok) echo(green(`\nruntime tier green - ${ cyan(cells) } cell(s)`));
}

export function announceBrowserRun(pages) {
  echo(green(`\n${ cyan(pages) } page(s), one bundle each. ${ cyan('post') }, ${ cyan('pre+post') }`
    + ` and ${ cyan('entry-global') } gate the job; unplugin's ${ cyan('pre') } is a per-library diagnostic -`));
  echo(green('it runs before Babel, so it can miss Babel-helper polyfills, and a red one is the signal we want.'));
  echo(green(`Per-cell counts print as ${ cyan('"[e2e-libs] <lib>/<provider>/<method>[/<phase>]: N/N checks passed"') }.`));
}

export function announceBrowserCell(label, gating) {
  echo(green(`\n-- ${ cyan(label) }${ gating ? '' : yellow(' [pre diagnostic, not gating]') } --`));
}

// karma has printed the failure itself; what this adds is a line the matrix-wide tally traces back to
export function reportBrowserCell(label, gating) {
  echo(gating ? red(`  FAIL ${ cyan(label) } in the browsers`)
    : yellow(`  ${ preDiagnostic(`${ cyan(label) } is red`) }`));
}

export function reportBrowserTally({ failed, pages }) {
  echo(failed.length ? red(`\nFAIL ${ cyan(failed.length) } cell(s) failed in the browsers: ${ failed.join(', ') }`)
    : green(`\nbrowser leg green - ${ cyan(pages) } page(s)`));
}

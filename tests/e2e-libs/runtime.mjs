import { MinifyOptions } from '@core-js/builder/config.js';
import { transform as swcTransform } from '@swc/core';
import { assertDetectionsStillNeedHelp, buildCell } from './bundle.mjs';
import { groupByLibraryAndMethod } from './cells.mjs';
import { checkResultProblem, errorReason } from './diagnostics.mjs';
import { describeInput } from './input.mjs';
import { librariesMatching, libraries } from './libraries.mjs';
import * as manifest from './manifest.mjs';
import { announceArtifacts, announceInput, announceRun, reportCell, reportCellFailure,
  reportRuntimeTally, warnWireSize } from './output.mjs';
import { ARTIFACTS } from './paths.mjs';
import { writeCell } from './page.mjs';
import { preflight } from './preflight.mjs';
import { rawChecks } from './raw-exercise.mjs';
import * as snapshots from './snapshots.mjs';
import { strippedFails, strippedLeg } from './stripped-realm.mjs';
import { FIXTURE_SHARD, emitShardSummary, runShards, shardSlice } from '../babel-plugin/fixture-shards.mjs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const { mkdir } = fs;
const gzipAsync = promisify(gzip);

const IS_SHARD = Boolean(FIXTURE_SHARD);

process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

const injectionsByGroup = new Map();
const labelsByExercise = new Map();

async function readRawLabels(exercise) {
  const checks = await rawChecks(exercise);
  const failed = checks.find(check => !check.pass);
  if (failed) throw new Error(`raw exercise failed - ${ failed.failure }`);
  return checks.map(check => check.label);
}

function rawLabels(exercise) {
  if (!labelsByExercise.has(exercise)) labelsByExercise.set(exercise, readRawLabels(exercise));
  return labelsByExercise.get(exercise);
}

// The reference injection is the one that the babel-plugin phase produced
function getReferenceInjection(cell) {
  const injected = injectionsByGroup.get(cell.group);
  if (injected) return injected;
  throw new Error(injectionsByGroup.has(cell.group)
    ? `the babel-plugin cell of ${ cell.group } failed, so there is nothing to diff this phase against`
    : `no babel-plugin reference for ${ cell.group } - cell ordering is wrong`);
}

async function runCell(cell) {
  let snapshotState = 'not run';
  try {
    const expected = await rawLabels(cell.lib.exercise);
    const startedAt = process.hrtime.bigint();
    const { code, injected, origins } = await buildCell(cell);
    const buildMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    if (cell.isReference) injectionsByGroup.set(cell.group, injected);
    const delta = cell.isReference ? null : snapshots.deltaLines(getReferenceInjection(cell), injected);
    snapshotState = 'error';
    snapshotState = await getSnapshotState(cell, injected, delta, origins);

    const checks = await preflight(code, cell.label);
    const problem = checkResultProblem(checks, expected);
    if (problem) throw new Error(`pre-flight - ${ problem }`);
    const failingChecks = checks.filter(check => !check.pass);

    // Missing Babel helper polyfills can make `pre` throw. Its returned checks still gate.
    const stripped = cell.method === 'usage-pure' ? await strippedLeg(code, cell.label, expected) : null;
    const strippedFailed = strippedFails(stripped, cell.phase);

    const rawKb = kb(Buffer.byteLength(code));
    const wire = await wireSize(code, cell.label);
    await writeCell(cell, code, checks, expected);

    // a baseline that is not green reddens its cell, so it may not be prefixed `ok`
    const verdict = manifest.runtimeVerdict(snapshotState, Boolean(failingChecks.length) || strippedFailed);
    const ok = verdict.runtime === 'passed';
    if (failingChecks.length || strippedFailed) tally.failed.add(cell.label);
    reportCell(cell, { ok, checks, failingChecks, injected, delta, snapshotState, stripped, strippedFailed, rawKb, wire, buildMs });
    return {
      ...cellIdentity(cell),
      ...verdict,
      rawKb, minKb: wire.minKb, gzKb: wire.gzKb,
      buildMs: +buildMs.toFixed(0),
      injections: injected.length,
      deltaFromReference: delta ? delta.length : null,
      checks: checks.length, preflightFailing: failingChecks.length,
      strippedRealm: stripped === null ? 'not run' : stripped.ok ? 'passed' : strippedFailed ? 'failed' : 'diagnostic-failed',
    };
  } catch (error) { // A cell that throws is a row too: the run does not stop, and the reason travels into the file.
    tally.failed.add(cell.label);
    // `null` only if nothing was recorded: a set that was built stays valid to diff against
    if (cell.isReference && !injectionsByGroup.has(cell.group)) injectionsByGroup.set(cell.group, null);
    const reason = errorReason(error);
    reportCellFailure(cell, reason);
    return { ...cellIdentity(cell), ...manifest.runtimeVerdict(snapshotState, true), error: reason };
  }
}

async function getSnapshotState(cell, injected, delta, origins) {
  if (cell.snapshot) {
    const state = await snapshots.compare(cell, cell.isReference ? injected : delta, origins);
    if (!manifest.snapshotPassed(state)) tally.redSnapshots.push(state);
    return state;
  }
  if (cell.isReference) return 'skipped';
  if (delta.length) throw new Error(`entry-global disagrees between providers (${ delta.length }): ${ delta.slice(0, 6).join(' ') }`);
  return 'providers agree';
}

function cellIdentity(cell) {
  return { lib: cell.lib.name, provider: cell.provider, method: cell.method, phase: cell.phase, label: cell.label };
}

function kb(bytes) {
  return +(bytes / 1024).toFixed(1);
}

// Minified by the settings `@core-js/builder` publishes
async function wireSize(code, label) {
  try {
    const minified = Buffer.from((await swcTransform(code, MinifyOptions)).code);
    return { minKb: kb(minified.length), gzKb: kb((await gzipAsync(minified)).length) };
  } catch (error) {
    warnWireSize(label, errorReason(error));
    return { minKb: null, gzKb: null };
  }
}

// Rows and counters come back together: `failed` adds up, `rows` and `redSnapshots` are lists each
// shard contributed a slice of and arrive concatenated in shard order.
async function collectShards() {
  const totals = await runShards({
    script: fileURLToPath(import.meta.url),
    shards: shardCount,
    extraEnv: { E2E_LIBS_LIB: libraryFilter ?? '' },
  });
  rows.push(...totals.rows ?? []);
  tally.redSnapshots.push(...totals.redSnapshots ?? []);
  tally.fromShards = totals.failed ?? 0;
}

const [libraryFilter] = IS_SHARD ? [process.env.E2E_LIBS_LIB || undefined] : argv._.map(String);
const libs = librariesMatching(libraryFilter);
const libraryMethodGroups = groupByLibraryAndMethod(libs);

const shardsRequested = Number(process.env.E2E_LIBS_SHARDS) || Math.floor(os.cpus().length / 2);
const shardCount = IS_SHARD ? 1 : Math.min(Math.max(shardsRequested, 1), libraryMethodGroups.length);

// a parent that forks builds nothing itself - its rows come back from the children
const cellsBuiltHere = IS_SHARD ? shardSlice(libraryMethodGroups).flat()
  : shardCount > 1 ? []
  : libraryMethodGroups.flat();

const input = await describeInput();

// once per run, in the parent: the workaround in `bundle.mjs` has to still have a reason
if (!IS_SHARD) await assertDetectionsStillNeedHelp();

if (!IS_SHARD) await manifest.prepare();
await snapshots.ensureDirectory();

announceInput(input);
announceRun({ libs, libraryMethodGroups, libraryFilter, shardCount });

const rows = [];
const tally = { failed: new Set(), redSnapshots: [], fromShards: 0 };

for (const cell of cellsBuiltHere) rows.push(await runCell(cell));

if (IS_SHARD) {
  emitShardSummary({ failed: tally.failed.size, redSnapshots: tally.redSnapshots, rows });
} else {
  if (shardCount > 1) await collectShards();
  if (!rows.length) throw new Error('no cells ran - the registry or METHODS is empty');
  const orderedRows = manifest.reconcileRows(libraryMethodGroups.flat(), rows);

  await mkdir(ARTIFACTS, { recursive: true });
  await manifest.save({ input, scope: libraryFilter ?? 'all libraries', sharded: shardCount, cells: orderedRows });
  announceArtifacts();

  // an orphan reddens the run, since no cell can report a baseline nothing produces; one removed under
  // OVERWRITE is counted as written
  const orphaned = await snapshots.orphans(libraries);
  if (orphaned && process.env.OVERWRITE) tally.redSnapshots.push(...Array.from({ length: orphaned }, () => 'updated'));
  const failed = tally.failed.size + tally.fromShards;
  const ok = !failed && !tally.redSnapshots.length && !orphaned;
  reportRuntimeTally({ redSnapshots: tally.redSnapshots, failed, cells: rows.length, ok });
  if (!ok) process.exitCode = 1;
}

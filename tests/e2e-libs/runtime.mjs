import { MinifyOptions } from '@core-js/builder/config.js';
import { transform as swcTransform } from '@swc/core';
import { buildCell } from './bundle.mjs';
import { groupByLibraryAndMethod } from './cells.mjs';
import { errorReason } from './diagnostics.mjs';
import { describeInput } from './input.mjs';
import { librariesMatching, libraries } from './libraries.mjs';
import * as manifest from './manifest.mjs';
import { announceArtifacts, announceInput, announceRun, reportCell, reportCellFailure,
  reportRuntimeTally, warnWireSize } from './output.mjs';
import { ARTIFACTS } from './paths.mjs';
import { writeCell } from './page.mjs';
import { preflight } from './preflight.mjs';
import * as snapshots from './snapshots.mjs';
import { strippedLeg } from './stripped-realm.mjs';
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
// The reference injection is the one that the babel-plugin phase produced
function getReferenceInjection(cell) {
  const injected = injectionsByGroup.get(cell.group);
  if (injected) return injected;
  throw new Error(injectionsByGroup.has(cell.group)
    ? `the babel-plugin cell of ${ cell.group } failed, so there is nothing to diff this phase against`
    : `no babel-plugin reference for ${ cell.group } - cell ordering is wrong`);
}

async function runCell(cell) {
  try {
    const startedAt = process.hrtime.bigint();
    const { code, injected, origins } = await buildCell(cell);
    const buildMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    if (cell.isReference) injectionsByGroup.set(cell.group, injected);
    const delta = cell.isReference ? null : snapshots.deltaLines(getReferenceInjection(cell), injected);
    const snapshotState = await getSnapshotState(cell, injected, delta, origins);

    const checks = await preflight(code, cell.label);
    if (!checks.length) throw new Error('exercise produced 0 checks - nothing verified');
    const failingChecks = checks.filter(check => !check.pass);

    // `pre` is red on some libraries by design, so it stays a diagnostic here as it does in the browser
    const stripped = cell.method === 'usage-pure' ? await strippedLeg(code, cell.label, checks) : null;
    const strippedFailed = stripped !== null && !stripped.ok && cell.phase !== 'pre';

    const rawKb = kb(Buffer.byteLength(code));
    const wire = await wireSize(code, cell.label);
    await writeCell(cell, code, checks);

    // a drifting or missing baseline is a red cell too, so it may not be prefixed `ok`
    const ok = !failingChecks.length && snapshotState !== 'drift' && snapshotState !== 'missing' && !strippedFailed;
    if (failingChecks.length || strippedFailed) tally.failed.add(cell.label);
    reportCell(cell, { ok, checks, failingChecks, injected, delta, snapshotState, stripped, strippedFailed, rawKb, wire, buildMs });
    return {
      ...cellIdentity(cell),
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
    return { ...cellIdentity(cell), error: reason };
  }
}

async function getSnapshotState(cell, injected, delta, origins) {
  if (cell.snapshot) {
    const state = await snapshots.compare(cell, cell.isReference ? injected : delta, origins);
    if (state === 'drift') tally.drift++;
    else if (state === 'missing') tally.missing++;
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

// Rows and counters come back together: the three counters add up, `rows` is a list each shard
// contributed a slice of and arrives concatenated in shard order.
async function collectShards() {
  const totals = await runShards({
    script: fileURLToPath(import.meta.url),
    shards: shardCount,
    extraEnv: libraryFilter === undefined ? {} : { E2E_LIBS_LIB: libraryFilter },
  });
  rows.push(...totals.rows ?? []);
  tally.drift += totals.drift ?? 0;
  tally.missing += totals.missing ?? 0;
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

if (!IS_SHARD) await manifest.prepare();
await snapshots.ensureDirectory();

announceInput(input);
announceRun({ libs, libraryMethodGroups, libraryFilter, shardCount });

const rows = [];
const tally = { failed: new Set(), drift: 0, missing: 0, fromShards: 0 };

for (const cell of cellsBuiltHere) rows.push(await runCell(cell));

if (IS_SHARD) {
  emitShardSummary({ failed: tally.failed.size, drift: tally.drift, missing: tally.missing, rows });
} else {
  if (shardCount > 1) await collectShards();
  if (!rows.length) throw new Error('no cells ran - the registry or METHODS is empty');

  await mkdir(ARTIFACTS, { recursive: true });
  await manifest.save({ input, scope: libraryFilter ?? 'all libraries', sharded: shardCount, cells: rows });
  announceArtifacts();

  // an orphan reddens the run and is not one of the counters - no cell can report a baseline nothing produces
  const orphaned = await snapshots.orphans(libraries);
  const failed = tally.failed.size + tally.fromShards;
  const ok = !failed && !tally.drift && !tally.missing && !(orphaned && !process.env.OVERWRITE);
  reportRuntimeTally({ drift: tally.drift, missing: tally.missing, failed, cells: rows.length, ok });
  if (!ok) process.exitCode = 1;
}

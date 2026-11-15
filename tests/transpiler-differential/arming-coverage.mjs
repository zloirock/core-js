// A generator flag requests an oracle; only executing the raw source can arm it.
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { accountSnippet, emptyCoverage } from './coverage.mjs';

const { check, finish } = createChecker('differential-arming-coverage');
// The coordinator's reaper recognizes live run-PID directories across concurrent runs.
const tmp = join(import.meta.dirname, 'tmp', `run-${ process.pid }`);
const previousTmp = process.env.DIFF_TMP;
process.env.DIFF_TMP = tmp;
await mkdir(tmp, { recursive: true });
const { beginCase } = await import('./cache-store.mjs');
const { checkSnippet, closeStrippedWorker, summarizeVerdict } = await import('./harness.mjs');
const { checkGlobalSnippet } = await import('./global-leg.mjs');
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const globalOptions = { ...options, method: 'usage-global' };
const rows = [
  { name: 'constant', code: 'export const r = 7;', outcome: 'not-armed' },
  { name: 'type-only', code: 'type T = typeof Array.from; export const r: number = 7;', ts: true, outcome: 'not-armed' },
  { name: 'namespace', code: 'export const r = typeof Promise.resolve;', isolated: true, outcome: 'not-armed' },
  { name: 'computed-key', code: 'export const r = [1, 2]["a" + "t"](-1);', outcome: 'checked' },
  { name: 'global-root', code: 'export const r = typeof globalThis;', outcome: 'checked' },
  { name: 'ts-call', code: 'export const r = ([1, 2] as number[]).at(-1);', ts: true, outcome: 'checked' },
  { name: 'script-call', code: 'module.exports.r = [1, 2].at(-1);', sourceType: 'script', outcome: 'checked' },
  { name: 'native-throw', code: 'throw new TypeError(); export const r = 7;', outcome: 'native-throw' },
  { name: 'global-only', code: 'export const r = [1, 2].at(-1);', strip: false, outcome: 'checked' },
];
try {
  const coverage = emptyCoverage();
  for (const { name, code, ts = false, sourceType = 'module', isolated = false, strip = true, outcome } of rows) {
    await beginCase({ name, code, ts, sourceType, isolated, live: true });
    const verdict = await checkSnippet(code, options, ts, strip, sourceType, isolated);
    check(`${ name } runtime`, summarizeVerdict(verdict).failed, false);
    check(`${ name } pure coverage`, verdict.stripCoverage, strip ? outcome : 'not-strip-family');
    const global = await checkGlobalSnippet({ code, ts, sourceType, native: verdict.native, options: globalOptions,
      strippedNative: verdict.strippedNative });
    check(`${ name } global runtime`, global.failed, false);
    check(`${ name } global coverage`, global.skip ?? 'checked', outcome);
    accountSnippet(coverage, {
      'pure-stripped': verdict.stripCoverage,
      'ast-print-through': verdict.astCoverage,
      'global-stripped': global.skip ?? 'checked',
    });
  }
  check('pure armed count', coverage['pure-stripped'].checked, 4);
  check('pure unarmed count', coverage['pure-stripped'].skipped['not-armed'], 3);
  check('global armed count', coverage['global-stripped'].checked, 5);
  check('global unarmed count', coverage['global-stripped'].skipped['not-armed'], 3);
  const constant = 'export const r = 7;';
  await beginCase({ name: 'unarmed-transform-crash', code: constant, live: true });
  const invalid = { ...globalOptions, method: 'invalid-method' };
  const transformCrash = await checkGlobalSnippet({ code: constant, native: 'OK|7|[]', options: invalid });
  check('unarmed transform crash fails', transformCrash.failed, true);
  check('unarmed transform crash is not checked', transformCrash.skip, 'transform-crash');
  // A fresh worker that exits before reporting a key must fail, never count as armed.
  const code = 'process.exit(0); export const r = 7;';
  await beginCase({ name: 'arming-worker-exit', code, live: true });
  const crash = await checkGlobalSnippet({ code, native: 'OK|7|[]', options: globalOptions });
  check('arming worker exit fails', crash.failed, true);
  check('arming worker exit is not checked', crash.skip, 'harness-crash');
} finally {
  closeStrippedWorker();
  if (previousTmp === undefined) delete process.env.DIFF_TMP;
  else process.env.DIFF_TMP = previousTmp;
  await rm(tmp, { recursive: true, force: true });
}
finish();

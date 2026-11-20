// A generator flag requests an oracle; only executing the raw source can arm it.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { runInWorker } from './realm-runner.mjs';
import { serialize } from './serialize.mjs';
import { accountSnippet, emptyCoverage } from './coverage.mjs';

const { check, throwsWith, finish } = createChecker('differential-arming-coverage');
// The coordinator's reaper recognizes live run-PID directories across concurrent runs.
const tmp = join(import.meta.dirname, 'tmp', `run-${ process.pid }`);
const previousTmp = process.env.DIFF_TMP;
process.env.DIFF_TMP = tmp;
await mkdir(tmp, { recursive: true });
const { beginCase } = await import('./cache-store.mjs');
const { EMITTER, checkSnippet, closeStrippedWorker, summarizeVerdict, transformBoth } = await import('./harness.mjs');
const { checkGlobalOutputs, checkGlobalSnippet } = await import('./global-leg.mjs');
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const globalOptions = { ...options, method: 'usage-global' };
const rows = [
  { name: 'constant', code: 'export const r = 7;', outcome: 'not-armed' },
  { name: 'stripped-sparse-observation', code: 'export const r = [[undefined, , -0], [1, 2].at(-1)];', outcome: 'checked' },
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
  check('pure armed count', coverage['pure-stripped'].checked, 5);
  check('pure unarmed count', coverage['pure-stripped'].skipped['not-armed'], 3);
  check('global armed count', coverage['global-stripped'].checked, 6);
  check('global unarmed count', coverage['global-stripped'].skipped['not-armed'], 3);
  // Use the emitted split assignment: both import sets are empty, and the raw source
  // already works without builtins. Removing the assignment changes only the result.
  const source = 'const box = { x: 7 }; let x = 8; (0, ({ x } = box)); export const r = x; export const effects = [];';
  const native = 'OK|7|[]';
  const { babelOut, unpluginOut } = await transformBoth({ src: source, options: globalOptions });
  await beginCase({ name: 'unarmed-split', code: source, live: true });
  const split = { code: source, native, rawStripped: native, babelOut, unpluginOut };
  const control = await checkGlobalOutputs(split);
  check('split is unarmed', control.skip, 'not-armed');
  check('split keeps the write', control.failed, false);
  for (const [host, output] of Object.entries({ babelOut, unpluginOut })) {
    if (output === undefined) continue;
    const missing = output.replace(/\(\{\s*x\s*\}\s*=\s*box\);/u, '');
    check(`split found in ${ host }`, missing !== output, true);
    const verdict = await checkGlobalOutputs({ ...split, [host]: missing });
    check(`dropped write in ${ host }`, verdict.failed, true);
  }
  if (EMITTER === 'both') {
    for (const [name, code, expected, rawStripped] of [
      ['unarmed', 'export const r = 7;', 'OK|7|"__undefined__"', 'OK|7|"__undefined__"'],
      ['armed', 'export const r = [7].at(0);', 'OK|7|"__undefined__"', 'ERR|TypeError'],
    ]) {
      await beginCase({ name, code, live: true });
      const outputs = await transformBoth({ src: code, options: globalOptions });
      const unplugin = `import 'core-js/modules/es.array.with';\n${ outputs.unpluginOut }`;
      const verdict = await checkGlobalOutputs({ ...outputs, code, native: expected, rawStripped, unpluginOut: unplugin });
      check(`${ name } surplus import`, verdict.failed, true);
      check(`${ name } coverage`, verdict.skip, rawStripped === expected ? 'not-armed' : null);
    }
  }
  for (const [left, right] of [
    [undefined, '__undefined__'], [() => 1, '__function__'], [1n, '1n'], [-0, 0], [NaN, '__NaN__'],
    [Infinity, '__Infinity__'], [-Infinity, '__-Infinity__'], [Symbol('id'), 'Symbol(id)'],
    [Symbol.for('id'), Symbol('id')], [Symbol(undefined), Symbol('undefined')],
    [Array(1), [undefined]], [Object.assign(Object.create(null), { k: 1 }), { k: 1 }],
  ]) {
    check('different observations have different keys', serialize(left) === serialize(right), false);
    check('nested observations keep their types', serialize([left]) === serialize([right]), false);
  }
  const record = Object.assign(Object.create(null), { k: 1 });
  check('null prototype marker cannot be supplied by the source', serialize(record) === serialize(['__null_record__', { k: 1 }]), false);
  check('repeated records retain their prototype', serialize([record, record]) === serialize([record, { k: 1 }]), false);
  const proxy = new Proxy({ k: 1 }, { getPrototypeOf() { throw new Error('unexpected prototype read'); } });
  check('observing a proxy adds no prototype trap', serialize(proxy), '{"k":1}');
  const noHas = { has() { throw new Error('unexpected membership check'); } };
  check('an undefined proxy element adds no has trap', serialize(new Proxy([undefined], noHas)), serialize([undefined]));
  const sparse = Object.setPrototypeOf(Array(1), new Proxy(Array.prototype, noHas));
  check('a hole adds no inherited has trap', serialize(sparse), serialize(Array(1)));
  let conversions = 0;
  const custom = Object.assign(Object.create(null), {
    toJSON() {
      conversions++;
      return this;
    },
  });
  serialize(custom);
  check('a custom record is converted only once', conversions, 1);
  check('date conversion is preserved', serialize(new Date(0)), '"1970-01-01T00:00:00.000Z"');
  const cycle = {};
  cycle.self = cycle;
  throwsWith('circular observations fail explicitly', () => serialize(cycle), 'circular');
  const late = join(tmp, 'late-worker.mjs');
  for (const [name, action, want] of [
    ['natural exit', '', 'OK|7|[]'],
    ['synchronous exception', 'throw new RangeError();', 'ERR|RangeError'],
    ['late exception', 'setImmediate(() => { throw Error("late"); });', 'WORKER-CRASH|late'],
    ['late exit', 'setImmediate(() => process.exit(3));', 'WORKER-CRASH|exit code 3'],
    ['live handle', 'setInterval(() => {}, 60000);', 'OK|7|[]'],
    ['observation with replaced builtins', `
      const fail = () => { throw new Error('unexpected observation'); };
      String.prototype.startsWith = String.prototype.trim = fail;
      Object.defineProperty(Symbol.prototype, 'description', { get: fail });
      effects.push('__tag', Symbol('id'), Object.create(null));
    `, `OK|7|${ serialize(['__tag', Symbol('id'), Object.create(null)]) }`],
  ]) {
    await writeFile(late, `export const r = 7; export const effects = []; ${ action }`);
    check(`worker ${ name }`, await runInWorker(late, { strip: false }), want);
  }
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

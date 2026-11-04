// Exclusion keeps the hop above a stored environment probe observable. The fixed-options
// e2e and differential suites cannot express it; foreign setup stays outside the transform.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('excluded-kept-store-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['self'] };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'excluded-kept-store-'));
let count = 0;

try {
  for (const [shape, expression] of [
    ['excluded-value-write', '(held = globalThis.self).window.slot = rhs()'],
    ['excluded-value-tail', '(held = globalThis.self).self.slot = rhs()'],
    ['excluded-value-read', '(held = globalThis.self).self.slot'],
    ['excluded-value-optional', 'globalThis.self?.Array'],
    ['excluded-value-sealed', '(globalThis.self?.Array).from'],
    ['excluded-value-default', '(() => { const { from } = globalThis.self?.Array ?? {}; return typeof from; })()'],
    ['write', '(held = globalThis.window).self.slot = rhs()'],
    ['prefix', '(prefix(), held = globalThis.window).self.slot = rhs()'],
    ['nested-prefix', '(prefix(), (prefix(), held = globalThis.window)).self.slot = rhs()'],
    ['member-store', '(holder.value = globalThis.window).self.slot = rhs()'],
    ['live-claims', '(holder[["value"].at(0)] = globalThis.window).self.slot = rhs(Array.from([23]))'],
    ['chained-store', '(other = held = globalThis.window).self.slot = rhs()'],
    ['typed', '((held = globalThis.window) as any).self.slot = rhs()'],
    ['key', '(held = globalThis.window)[(key(), "self")].slot = rhs()'],
    ['read', '(held = globalThis.window).self.slot'],
    ['delete', 'delete (held = globalThis.window).self.slot'],
    ['call', '(held = globalThis.window).self.touch(rhs())'],
    ['optional', '(held = globalThis.window).self?.slot'],
    ['optional-store', '(held = globalThis.window)?.self.slot'],
    ['sealed-store', '((held = globalThis.window)?.self).slot'],
    ['raw-sequence', '(prefix(), held = globalThis.window).window[(key(), "slot")]'],
  ]) {
    const source = `export const effects = [];
export let held, other, r;
const holder = makeHolder(value => { held = value; });
try { r = [${ expression }]; } catch (error) { r = [error.name]; }
r.push(held === undefined ? 'undefined' : held === null ? 'null' : held === globalThis, written());`;
    scenarioSource(source);
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.ts',
      parserOpts: { plugins: ['typescript'] }, plugins: [[babelPlugin, OPTIONS]],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.ts').code;
    const lowered = [];
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', unplugin]]) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false, filename: 'input.ts',
        plugins: [requireBabel.resolve('@babel/plugin-transform-typescript'), requireBabel.resolve('@babel/plugin-transform-optional-chaining')],
      });
      lowered.push([host, code]);
      if (host !== 'native') check(`${ shape }/${ host }/excluded import`, /from ["'][^"']*\/self["']/.test(output), false);
    }
    for (const state of ['null-window', 'undefined-window', 'undefined-self', 'absent-self', 'present']) {
      const setup = `const realm = Function('return this')();
let captured = 'unset';
function written() { return captured; }
function prefix() { effects.push('prefix'); }
function key() { effects.push('key'); }
function rhs(value) { effects.push(value === undefined ? 'rhs' : 'rhs:' + value[0]); return 23; }
function makeHolder(set) { return { set value(value) { effects.push('capture'); set(value); } }; }
Object.defineProperty(realm, 'window', { configurable: true, get() { effects.push('window');
  return ${ state === 'null-window' ? 'null' : state === 'undefined-window' ? 'undefined' : 'realm' }; } });
${ state === 'absent-self' ? 'delete realm.self;' : `Object.defineProperty(realm, 'self', { configurable: true,
  get() { effects.push('self'); return ${ state === 'undefined-self' ? 'undefined' : 'realm' }; } });` }
Object.defineProperty(realm, 'slot', { configurable: true, get() { effects.push('read'); return 17; },
  set(value) { effects.push('write'); captured = value; } });
realm.touch = function (value) { effects.push('call'); return [value, this === realm]; };`;
      let expected;
      for (const [host, output] of lowered) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`${ shape }/${ state }/${ host }/setup inserted`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        const result = await runInWorker(file, { strip: false });
        if (host === 'native') {
          check(`${ shape }/${ state }/oracle ran`, result.startsWith('OK|'), true);
          expected = result;
        } else {
          check(`${ shape }/${ state }/${ host }/full`, result, expected);
          check(`${ shape }/${ state }/${ host }/stripped`, await runInWorker(file), expected);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();

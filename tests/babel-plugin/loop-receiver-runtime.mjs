// Loop receiver choices survive printing, reparsing and destructuring lowering.
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
const { check, finish } = createChecker('loop-receiver-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'loop-receiver-'));
let count = 0;

try {
  for (const shape of [
    'one', 'same', 'prefix', 'closure', 'rebuilt', 'mixed', 'written',
    'shadowed', 'default', 'rest', 'throw', 'symbol', 'symbol-prefix', 'constructor',
  ]) {
    const custom = ['default', 'rest', 'throw'].includes(shape);
    const elements = shape === 'same' ? 'globalThis, globalThis' : shape === 'mixed' ? 'globalThis, other' : custom ? 'other' : 'globalThis';
    const symbol = shape.startsWith('symbol') || shape === 'constructor';
    const prefix = shape.endsWith('prefix') || shape === 'constructor';
    const binding = symbol ? '[Symbol.iterator]: method' : `at: method${ shape === 'rest' ? ', ...rest' : '' }`;
    const pattern = shape === 'constructor' ? `{ WeakSet: { ${ binding } } }`
      : `{ Array: { prototype: { ${ binding } }${ shape === 'default' ? ' = (effects.push("default"), rows)' : '' } } }`;
    const declaration = `const ${ pattern } = ${ prefix ? '(effects.push("prefix"), realm)' : 'realm' };`;
    const result = shape === 'constructor' ? 'typeof method' : symbol ? 'method.call(rows).next().value' : 'method.call(rows, -1)';
    const read = `${ declaration } r.push(${ result }${ shape === 'rest' ? ', rest.value' : '' });`;
    const body = shape === 'closure' ? `const read = () => { ${ read } }; read();`
      : shape === 'rebuilt' ? `const out = []; out.push((() => { ${ read } return 1; })());`
      : shape === 'shadowed' ? `const read = realm => { ${ read } }; read(other);`
      : `${ shape === 'written' ? 'realm = other;' : '' } ${ read }`;
    const source = `export const effects = [];
export const r = [];
const rows = [4, 9];
const other = { get Array() {
  effects.push("Array"); ${ shape === 'throw' ? 'throw new RangeError("receiver");' : '' }
  return { get prototype() { effects.push("prototype"); return ${ shape === 'default' ? 'undefined' : `{
    get at() { effects.push("at"); return function () { effects.push(this === rows ? "this" : "wrong"); return 23; }; }, value: 31
  }` }; } };
} };
try { for (${ shape === 'written' ? 'let' : 'const' } realm of [${ elements }]) { ${ body } } }
catch (error) { r.push(error.name); }`;
    scenarioSource(source);
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.mjs').code;
    const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin]];
    for (const [host, output] of outputs.slice(1)) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
      if (shape === 'one') check(`${ host }/keeps the loop receiver`, output.includes('realm.Array.prototype'), true);
    }
    const own = ['mixed', 'written', 'shadowed', 'rest'].includes(shape);
    const effects = shape === 'throw' ? ['Array'] : shape === 'default' ? ['Array', 'prototype', 'default']
      : own ? ['Array', 'prototype', 'at', 'this'] : prefix ? ['prefix'] : [];
    const resultValues = shape === 'throw' ? ['RangeError'] : shape === 'same' ? [9, 9] : shape === 'mixed' ? [9, 23]
      : shape === 'rest' ? [23, 31] : own ? [23] : shape === 'constructor' ? ['undefined'] : symbol ? [4] : [9];
    let expected;
    for (const [host, output] of outputs) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, output);
      const actual = await runInWorker(file, { strip: false });
      if (host === 'native') {
        check(`${ shape }/native value`, actual, `OK|${ JSON.stringify(resultValues) }|${ JSON.stringify(effects) }`);
        expected = actual;
      } else {
        check(`${ shape }/${ host }/full`, actual, expected);
        check(`${ shape }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // Measure the rendered source read independently of source-mutation detection. Imports
  // initialize first; a foreign Array getter then observes the original and printed programs.
  for (const shape of ['assignment-loop', 'declaration-loop', 'declaration', 'anchored', 'assignment', 'typed', 'prefix', 'prefix-assignment']) {
    const pattern = '{ Array: { prototype: { at, includes } } }';
    const flat = '{ prototype: { at, includes } }';
    const result = 'r.push(at.call([4, 9], -1), includes.call([4, 9], 9));';
    const body = shape === 'assignment-loop' ? `let at, includes; for (${ pattern } of [globalThis]) { ${ result } }`
      : shape === 'declaration-loop' ? `for (const ${ pattern } of [globalThis]) { ${ result } }`
        : shape === 'prefix-assignment' ? `let at, includes; (${ pattern } = (effects.push("prefix"), realm)); ${ result }`
        : shape === 'assignment' || shape === 'typed' ? `let at, includes; (${ flat } = realm.Array${ shape === 'typed' ? ' as ArrayConstructor' : '' }); ${ result }`
          : `const ${ shape === 'anchored' ? flat : pattern } = ${ shape === 'anchored' ? 'realm.Array' : shape === 'prefix' ? '(effects.push("prefix"), realm)' : 'realm' }; ${ result }`;
    const source = `export const effects = [];
export const r = [];
const realm = globalThis;
try { ${ body } } catch (error) { r.push(error.name); }`;
    scenarioSource(source);
    const plugins = shape === 'typed' ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : [];
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.ts', plugins: [[babelPlugin, OPTIONS], ...plugins],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.ts').code;
    const { code: native } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.ts', plugins,
    });
    const outputs = [['native', native], ['babel', babel], ['unplugin', unplugin]];
    for (const [host, output] of outputs.slice(1)) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false, filename: 'input.ts',
        plugins: [...plugins, requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
    }
    for (const throwing of [false, true]) {
      const setup = `const __realm = Function("return this")();
const __descriptor = Object.getOwnPropertyDescriptor(__realm, "Array");
const __Array = __realm.Array;
let __reads = 0;
Object.defineProperty(__realm, "Array", { configurable: true, get() {
  __reads++;
  ${ throwing ? 'throw new RangeError("receiver");' : 'return __Array;' }
} });`;
      const cleanup = 'Object.defineProperty(__realm, "Array", __descriptor); effects.push(__reads);';
      const expected = `OK|${ JSON.stringify(throwing ? ['RangeError'] : [9, true]) }|${ JSON.stringify(shape.startsWith('prefix') ? ['prefix', 1] : [1]) }`;
      for (const [host, output] of outputs) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        // Erase TS from the unplugin output only after the plugin has seen its wrappers.
        const { code } = await transformAsync(output, {
          configFile: false, babelrc: false, filename: 'input.ts', plugins,
        });
        await fs.outputFile(file, `${ setup }\n${ code }\n${ cleanup }`);
        check(`twin/${ shape }/${ throwing }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`twin/${ shape }/${ throwing }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();

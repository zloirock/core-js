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
  // BigInt in moved patterns survives print/parse/lowering; a loop element remains the
  // receiver when its declaration has no initializer. Observe defaults and source reads.
  for (const shape of ['bigint-loop', 'bigint-catch', 'bigint-key', 'factory', 'null-receiver']) {
    const bigint = shape.startsWith('bigint');
    const pattern = `{ at: method, limit = (effects.push("default"), 10n)${ shape === 'bigint-key' ? ', [1n]: first' : '' } }`;
    const read = `r.push(method.call(rows, -1), String(limit)${ shape === 'bigint-key' ? ', first' : '' });`;
    const body = shape === 'bigint-catch' ? `try { throw rows; } catch (${ pattern }) { ${ read } }`
      : bigint ? `for (const ${ pattern } of [rows]) { ${ read } }`
        : `const make = () => { effects.push("source"); return { data: flag ? rows : null }; };
          for (const { data: { at: method } } of [make()]) r.push(method.call(rows, -1));`;
    const source = `export const effects = []; export const r = [];
      const rows = [4, 9]; const flag = ${ shape !== 'null-receiver' };
      try { ${ body } } catch (error) { r.push(error.name); }`;
    scenarioSource(source);
    const expected = shape === 'null-receiver' ? 'OK|["TypeError"]|["source"]'
      : bigint ? `OK|[9,"10"${ shape === 'bigint-key' ? ',9' : '' }]|["default"]` : 'OK|[9]|["source"]';
    for (const method of ['usage-pure', 'usage-global']) {
      const options = { ...OPTIONS, method };
      const { code: babel } = await transformAsync(source, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
      });
      const plugin = createUnplugin(options);
      const unplugin = plugin.transform(source, 'input.mjs').code;
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
      const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin], ['pre+post', post]];
      for (const [host, output] of outputs.slice(1)) {
        const { code } = await transformAsync(output, {
          configFile: false, babelrc: false,
          plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
        });
        outputs.push([`${ host }/lowered`, code]);
      }
      for (const [host, output] of outputs) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        check(`literal/${ shape }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`literal/${ shape }/${ method }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }

  // Run core-js and lexical lowering on the SAME AST. A print/parse boundary alone
  // repairs missing scope metadata and would let a lost per-iteration capture pass.
  const lowerings = ['block-scoping', 'arrow-functions'].map(name => requireBabel.resolve(`@babel/plugin-transform-${ name }`));
  for (const shape of ['residual', 'last', 'sole', 'rest', 'default', 'written', 'multi', 'for-init', 'var', 'guarded-capture']) {
    const pattern = shape === 'residual' ? '{ name, find }' : shape === 'sole' ? '{ find }'
      : shape === 'rest' ? '{ find, ...rest }' : shape === 'default' ? '{ find = () => 31, name }' : '{ find, at }';
    const read = shape === 'residual' ? '[name, find()]' : shape === 'rest' ? '[rest.name, find()]' : 'find()';
    const declaration = `${ shape === 'var' ? 'var' : 'let' } ${ shape === 'multi' ? 'before = 0, ' : '' }${ pattern } = row${ shape === 'multi' ? ', after = 1' : '' };`;
    const body = shape === 'guarded-capture'
      ? 'const C = row.name ? row : Array; const { x: { from: find } } = { x: C }; closures.push(() => find());'
      : shape === 'for-init' ? `for (${ declaration };) { closures.push(() => ${ read }); break; }`
      : `${ declaration } ${ shape === 'written' ? 'find = () => row.name;' : '' } closures.push(() => ${ read });`;
    const source = `export const effects = [];
      export const r = []; const closures = [];
      function make(rows) { for (const row of rows) { ${ body } } }
      make([{ name: 1, find: () => 11${ shape === 'guarded-capture' ? ', from: () => 11' : '' } },
        { name: 2, find: ${ shape === 'default' ? 'undefined' : '() => 22' }${ shape === 'guarded-capture' ? ', from: () => 22' : '' } }]);
      for (const closure of closures) r.push(closure());`;
    scenarioSource(source);
    const expected = `OK|${ JSON.stringify(shape === 'residual' || shape === 'rest' ? [[1, 11], [2, 22]]
      : shape === 'default' ? [11, 31] : shape === 'written' ? [1, 2] : shape === 'var' ? [22, 22] : [11, 22]) }|[]`;
    for (const method of ['usage-pure', 'usage-global']) {
      const options = { ...OPTIONS, method };
      const config = { configFile: false, babelrc: false, filename: 'input.mjs' };
      const { code: together } = await transformAsync(source, { ...config, plugins: [[babelPlugin, options], ...lowerings] });
      const { code: printed } = await transformAsync(source, { ...config, plugins: [[babelPlugin, options]] });
      const { code: reparsed } = await transformAsync(printed, { ...config, plugins: lowerings });
      const plugin = createUnplugin(options);
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const { code: lowered } = await transformAsync(pre, { ...config, plugins: lowerings });
      const post = plugin.transform(lowered, 'input.mjs', 'post')?.code ?? lowered;
      for (const [host, output] of [['native', source], ['same-ast', together], ['reparsed', reparsed], ['pre+post', post]]) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        check(`binding/${ shape }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`binding/${ shape }/${ method }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // A split admits earlier declined siblings without replaying already queued claims.
  // Set the opaque source after transformation so both hosts must render the same reads.
  for (const shape of ['declined', 'queued', 'two-twins']) {
    const pattern = shape === 'queued' ? '{ name, config: { filters: { keys, values } = {} } }'
      : `{ config: { name, filters: { keys, values } = {}${ shape === 'two-twins' ? ', other: { at, flat } = {}' : '' } } }`;
    const source = `export const effects = []; export const r = [];
      const ${ pattern } = APP_STATE;
      r.push(name, keys, values${ shape === 'two-twins' ? ', at, flat' : '' });`;
    const setup = `const __realm = Function("return this")(); __realm.APP_STATE = {
      get name() { effects.push("name"); return 31; },
      config: {
        get name() { effects.push("name"); return 31; },
        filters: { get keys() { effects.push("keys"); return 17; }, get values() { effects.push("values"); return 23; } },
        other: { get at() { effects.push("at"); return 41; }, get flat() { effects.push("flat"); return 43; } }
      }
    };`;
    const expected = shape === 'two-twins'
      ? 'OK|[31,17,23,41,43]|["name","keys","values","at","flat"]'
      : 'OK|[31,17,23]|["name","keys","values"]';
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
    });
    const plugin = createUnplugin(OPTIONS);
    const single = plugin.transform(source, 'input.mjs').code;
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, `${ setup }\n${ output }\ndelete __realm.APP_STATE;`);
      check(`residual/${ shape }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
      if (host !== 'native') {
        check(`residual/${ shape }/${ host }/stripped`, await runInWorker(file), expected);
        check(`residual/${ shape }/${ host }/serves the earlier sibling`, output.includes('/function/instance/name'), true);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();

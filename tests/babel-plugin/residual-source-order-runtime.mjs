// Excluded statics keep their native reads beside a served function property. Foreign
// getters distinguish source order, including throws; setup runs after output imports.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { planNestedKeyedPatternCapture, renderNestedKeyedPatternCapture } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { assignmentExpression, hostSlot, identifier } from '../../packages/core-js-polyfill-provider/render.js';
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, transformAsync, transformFromAstAsync, types: t } = requireBabel('@babel/core');
const { check, finish } = createChecker('residual-source-order-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['array/from', 'array/of'] };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'residual-source-order-'));
let count = 0;

try {
  // This renderer contract can outlive the routing that currently avoids its anchored branch.
  // The constructor supplies the leaf, while the assignment still returns the source realm.
  for (const [coerceLeaf, rest] of [[true, false], [false, false], [false, true]]) {
    for (const preserveResult of [false, true]) {
      const label = `anchored capture/${ coerceLeaf }/${ rest }/${ preserveResult }`;
      const source = `let iterator, rest; const result = ({ Symbol: { iterator${ rest ? ', ...rest' : '' } } } = receiver);`;
      const ast = await parseAsync(source, { configFile: false, babelrc: false });
      const host = ast.program.body[1].declarations[0].init;
      const plan = planNestedKeyedPatternCapture({ pattern: host.left, init: host.right, force: !rest });
      const refs = [];
      const rendered = renderNestedKeyedPatternCapture(plan, {
        assignment: true, preserveResult, coerceLeaf, embed: hostSlot,
        mintRef: () => {
          const name = `memo${ refs.length }`;
          refs.push(name);
          return name;
        },
        anchorPure: { entry: 'symbol', hintName: 'Symbol' }, injectImport: () => 'SymbolImport',
        renderLeaf: coerceLeaf ? () => assignmentExpression('=', identifier('iterator'), identifier('iteratorImport')) : null,
      });
      let code;
      try {
        const declaration = t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier('result'), estreeToBabel(rendered.expression)),
        ]);
        ({ code } = await transformFromAstAsync(t.file(t.program([declaration])), null, { configFile: false, babelrc: false }));
      } catch (error) {
        check(`${ label }/valid rendered tree`, error.message, null);
        continue;
      }
      const prepared = `import receiver from '@core-js/pure/actual/global-this';
import SymbolImport from '@core-js/pure/actual/symbol';
import iteratorImport from '@core-js/pure/actual/symbol/iterator';
export const effects = [];
let iterator, rest;
${ refs.length ? `var ${ refs.join(', ') };` : '' }
${ code }
export const r = [${ preserveResult ? 'result === receiver' : 'true' }, iterator === iteratorImport, ${ rest ? '!("iterator" in rest)' : 'true' }];`;
      const { code: lowered } = await transformAsync(prepared, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      for (const [mode, output] of [['printed', prepared], ['lowered', lowered]]) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        for (const strip of [false, true]) check(`${ label }/${ mode }/${ strip }`,
          await runInWorker(file, { strip }), 'OK|[true,true,true]|[]');
      }
    }
  }
  for (const shape of ['nested', 'flat', 'member', 'swapped', 'middle', 'default', 'rest', 'multi', 'export', 'for-init', 'bodyless', 'rebuilt']) {
    const keys = shape === 'swapped' ? 'name, from' : shape === 'middle' ? 'from, name, of'
      : shape === 'default' ? 'from = mark("default"), name' : shape === 'rest' ? 'from, name, ...rest' : 'from, name';
    const pattern = shape === 'flat' || shape === 'member' ? `{ ${ keys } }` : `{ Array: { ${ keys } } }`;
    const init = shape === 'flat' ? 'Array' : shape === 'member' ? 'globalThis.Array' : 'globalThis';
    const declaration = `${ shape === 'bodyless' ? 'var' : 'const' } ${ shape === 'multi' ? 'before = mark("before"), ' : '' }${ pattern } = ${ init }${ shape === 'multi' ? ', after = mark("after")' : '' }`;
    const result = `r = [from, name${ shape === 'middle' ? ', of' : shape === 'rest' ? ', rest.extra' : '' }];`;
    const body = shape === 'for-init' ? `for (${ declaration }; true;) { ${ result } break; }`
      : shape === 'bodyless' ? `if (true) ${ declaration }; ${ result }`
      : shape === 'rebuilt' ? `const out = []; out.push((() => { ${ declaration }; ${ result } return 1; })());`
      : `${ declaration }; ${ result }`;
    const source = `export const effects = [];
export let r;
${ shape === 'export' ? `export ${ declaration }; ${ result }` : `try { ${ body } } catch (error) { r = error.name; }` }
restore();`;
    scenarioSource(source);
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.mjs').code;
    const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin]];
    // Parsing the printed output and lowering its new declarators must keep the same reads.
    for (const [host, output] of outputs.slice(1)) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
      check(`${ shape }/${ host }/excluded imports`, /from ["'][^"']*\/array\/(?:from|of)["']/.test(output), false);
      if (shape !== 'rest') check(`${ shape }/${ host }/served name`, output.includes('/function/instance/name'), true);
    }
    for (const throws of shape === 'export' ? [false] : [false, true]) {
      const setup = `const saved = ['from', 'name', 'of', 'extra'].map(key => [key, Object.getOwnPropertyDescriptor(Array, key)]);
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(Array, key, descriptor); else delete Array[key];
} }
function mark(value) { effects.push(value); return 23; }
for (const [key, value] of [['from', ${ shape === 'default' ? 'undefined' : '23' }], ['name', 'own-name'], ['of', 31], ['extra', 41]]) {
  Object.defineProperty(Array, key, { configurable: true, enumerable: key === 'extra', get() {
    effects.push(key); ${ throws ? 'throw new RangeError(key);' : 'return value;' }
  } });
}`;
      let expected;
      for (const [host, output] of outputs) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`${ shape }/${ host }/setup inserted`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        const actual = await runInWorker(file, { strip: false });
        if (host === 'native') {
          check(`${ shape }/native ran`, actual.startsWith('OK|'), true);
          const order = shape === 'swapped' ? ['name', 'from'] : ['from', ...shape === 'default' ? ['default'] : [], 'name',
            ...shape === 'middle' ? ['of'] : shape === 'rest' ? ['extra'] : []];
          const effects = [...shape === 'multi' ? ['before'] : [], ...throws ? [order[0]] : order,
            ...shape === 'multi' && !throws ? ['after'] : []];
          check(`${ shape }/native effects/${ throws }`, actual.split('|').at(-1), JSON.stringify(effects));
          expected = actual;
        } else {
          check(`${ shape }/${ host }/full/${ throws }`, actual, expected);
          check(`${ shape }/${ host }/stripped/${ throws }`, await runInWorker(file), expected);
        }
      }
    }
  }
  // Canonical computed members keep native optional roots intact across print and lowering.
  for (const shape of ['array', 'array-number', 'navigation', 'optional', 'for-init', 'multi']) {
    const positional = shape.startsWith('array');
    const key = shape === 'array-number' ? '0' : '"m-q"';
    const pattern = positional ? `[{ ${ key }: { at: method, kept: {} } }]` : `{ slot: { ${ key }: { flat: method } } }`;
    const init = positional ? 'input' : `{ slot: ${ shape === 'optional' ? 'input?.value' : 'input' }${ shape === 'for-init' ? ', other: input' : '' } }`;
    const declaration = `const ${ shape === 'multi' ? 'lead = effects.push("lead"), ' : '' }${ pattern } = ${ init }`;
    const result = positional ? 'method.call(rows, -1)' : 'method.call(rows)';
    const body = shape === 'for-init' ? `for (${ declaration };;) return ${ result };` : `${ declaration }; return ${ result };`;
    for (const throws of [false, true]) {
      const source = `export const effects = [];
export let r;
const rows = ${ positional ? '[4, 9]' : '[4, [9]]' };
rows.kept = {};
const box = ${ positional ? `{ ${ key }: rows }` : `{ get [${ key }]() {
  effects.push("hop"); ${ throws ? 'throw new RangeError("hop");' : 'return rows;' }
} }` };
function read(input) { ${ body } }
try { r = read(${ positional ? throws ? 'null' : '[box]' : shape === 'optional' ? '{ value: box }' : 'box' }); }
catch (error) { r = error.name; }`;
      scenarioSource(source);
      const options = { ...OPTIONS, exclude: [] };
      const { code: babel } = await transformAsync(source, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
      });
      const plugin = createUnplugin(options);
      const unplugin = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(unplugin, 'input.mjs', 'post')?.code ?? unplugin;
      const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin], ['pre+post', post]];
      for (const [host, output] of outputs.slice(1)) {
        const { code } = await transformAsync(output, {
          configFile: false,
          babelrc: false,
          plugins: [
            requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
            requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
            requireBabel.resolve('@babel/plugin-transform-destructuring'),
          ],
        });
        outputs.push([`${ host }/lowered`, code]);
      }
      const resultValue = throws ? positional ? 'TypeError' : 'RangeError' : positional ? 9 : [4, 9];
      const effects = [...shape === 'multi' ? ['lead'] : [], ...positional ? [] : ['hop']];
      const expected = `OK|${ JSON.stringify(resultValue) }|${ JSON.stringify(effects) }`;
      for (const [host, output] of outputs) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        check(`canonical/${ shape }/${ throws }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`canonical/${ shape }/${ throws }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // An effect-only pattern still reads the source realm and can throw before its binding is published.
  {
    const source = `export const effects = [];
export let r;
function key() { mark(); return "Promise"; }
try {
  var { self: { [key()]: { resolve } }, other } = globalThis;
  r = [typeof resolve, other];
} catch (error) { r = error.name; }`;
    scenarioSource(source);
    const config = { configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]] };
    const { code: babel } = await transformAsync(source, config);
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [state, result, trace] of [
      ['foreign', ['function', 4], ['self', 'key', 'Promise', 'other']],
      ['null', 'TypeError', ['self']], ['undefined', 'TypeError', ['self']],
      ['throw-self', 'URIError', ['self']], ['throw-key', 'EvalError', ['self', 'key']],
      ['throw-ctor', 'RangeError', ['self', 'key', 'Promise']], ['absent', ['function', 4], ['key', 'other']],
    ]) {
      const setup = `const realm = Function("return this")();
function mark() { effects.push("key"); ${ state === 'throw-key' ? 'throw new EvalError();' : '' } }
const foreign = { get Promise() { effects.push("Promise"); ${ state === 'throw-ctor' ? 'throw new RangeError();' : 'return { resolve() {} };' } } };
${ state === 'absent' ? 'delete realm.self;' : `Object.defineProperty(realm, "self", { configurable: true, get() {
  effects.push("self"); ${ state === 'throw-self' ? 'throw new URIError();' : `return ${ ['null', 'undefined'].includes(state) ? state : 'foreign' };` }
} });` }
Object.defineProperty(realm, "other", { configurable: true, get() { effects.push("other"); return 4; } });`;
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`realm-key/${ state }/${ host }/setup`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        const expected = host === 'native' && state === 'absent' ? 'OK|"TypeError"|[]'
          : `OK|${ JSON.stringify(result) }|${ JSON.stringify(trace) }`;
        check(`realm-key/${ state }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`realm-key/${ state }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // Requeued patterns must use live paths and plans after a capture moved their host.
  for (const shape of ['split', 'split-twice', 'split-default', 'join', 'join-bodyless', 'stale-rest', 'stale-loop']) {
    const split = shape.startsWith('split');
    const join = shape.startsWith('join');
    const keys = 'NaN: {}, Array: { from, [(effects.push("key"), "of")]: of, [key]: value }';
    const body = split ? `let from, at, rest;
for ({ Array: { from, k: { at${ shape === 'split-default' ? ' = (effects.push("default"), Array.of)' : '' } }, ...rest } } of [globalThis${ shape === 'split-twice' ? ', globalThis' : '' }]) {
  effects.push("body"); r = [from([4, 9])[1], ${ shape === 'split-default' ? 'at(17)[0]' : 'at()' }, rest.extra];
}` : join ? `${ shape === 'join-bodyless' ? 'if (true) var' : 'const' } { ${ keys } } = globalThis;
r = [from([4])[0], of(9)[0], value];`
      : shape === 'stale-loop' ? `for (const { Map, Array: { from }, ...rest } of [globalThis]) {
  r = [new Map([[1, 4]]).get(1), from([9])[0], 'Map' in rest, 'Array' in rest];
}` : `const { Map, Array: { from }, ...rest } = globalThis;
r = [new Map([[1, 4]]).get(1), from([9])[0], 'Map' in rest, 'Array' in rest];`;
    const source = `export const effects = [];
export let r;
const key = String("length");
try { ${ body } } catch (error) { r = error.name; }
restore();`;
    scenarioSource(source);
    const options = { ...OPTIONS, exclude: [] };
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
    });
    const plugin = createUnplugin(options);
    const unplugin = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(unplugin, 'input.mjs', 'post')?.code ?? unplugin;
    const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin], ['pre+post', post]];
    for (const [host, output] of outputs.slice(1)) {
      check(`live-pattern/${ shape }/${ host }/from import`, output.includes('/array/from'), true);
      if (shape === 'split-default') check(`live-pattern/${ shape }/${ host }/live default import`, output.includes('/array/of'), true);
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
    }
    // Foreign setup follows the imports, so the stripper cannot erase the observed accessor.
    for (const throws of split ? [false, true] : [false]) {
      const setup = split ? `const saved = ["k", "extra"].map(key => [key, Object.getOwnPropertyDescriptor(Array, key)]);
Object.defineProperty(Array, "k", { configurable: true, get() {
  effects.push("get"); ${ throws ? 'throw new RangeError("k");' : shape === 'split-default' ? 'return {};' : 'return { at() { effects.push("call"); return 17; } };' }
} });
Object.defineProperty(Array, "extra", { configurable: true, enumerable: true, value: 23 });
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(Array, key, descriptor); else delete Array[key];
} }` : 'function restore() {}';
      const result = split ? throws ? 'RangeError' : [9, 17, 23] : join ? [4, 9, 1] : [4, 9, false, false];
      const events = split ? throws ? ['get'] : shape === 'split-default' ? ['get', 'default', 'body']
        : Array.from({ length: shape === 'split-twice' ? 2 : 1 }, () => ['get', 'body', 'call']).flat()
        : join ? ['key'] : [];
      const expected = `OK|${ JSON.stringify(result) }|${ JSON.stringify(events) }`;
      for (const [host, output] of outputs) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`live-pattern/${ shape }/${ host }/setup`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        check(`live-pattern/${ shape }/${ throws }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`live-pattern/${ shape }/${ throws }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();

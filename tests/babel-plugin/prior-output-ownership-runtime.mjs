// A prior pure import owns its generated read. Other arguments, receivers and branches
// still need to work in a fresh realm with missing built-ins.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transformSync as lowerJsx } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('prior-output-ownership');
const base = '@core-js/pure/actual/';
const from = `import from from '${ base }array/from';`;
const map = `import PureMap from '${ base }map';`;
const method = `import method from '${ base }get-iterator-method';`;
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const cases = [
  ...[false, true].flatMap(flag => [
    [`generated branch argument/${ flag }`, '', `const C = ${ flag } ? Array : { from: x => x }; const r = C.from(Object.fromEntries([['x', 2]]));`, flag ? [] : { x: 2 }],
    [`nested argument on raw branch/${ flag }`, from,
      'function read(C) { return C === Array ? from([1]) : C.from(Object.fromEntries([["x", 2]])); }'
        + ` const r = read(${ flag ? 'Array' : '{ from: x => x }' });`, flag ? [1] : { x: 2 }],
    [`other method on raw branch/${ flag }`, from, `const C = ${ flag } ? Array : Object; const r = C === Array ? from([1]) : C.fromEntries([['x', 2]]);`, flag ? [1] : { x: 2 }],
  ]),
  ['omitted and explicit undefined', map,
    'function read({ groupBy } = PureMap) { return groupBy([7], String); }'
      + ' const r = [read().get("7"), read(void 0).get("7"), read(Object)["7"]];', [[7], [7], [7]]],
  ...['<_unused />', '<_unused.from />', '<div _unused />'].map(jsx => [`JSX sentinel/${ jsx }`, `import fromIterator from '${ base }iterator/from';`,
    `const { Iterator: _unused } = globalThis; const saved = fromIterator; function element(type) { return type; } const r = typeof ${ jsx };`,
    jsx.startsWith('<div') ? 'string' : 'function']),
  ['guard arguments', '', 'const use = C => C.from(Object.fromEntries([[\'x\', 2]])); const r = use({ from: x => x }).x; use(Array);', 2],
  ['different statics', from, 'const use = C => C === Array ? from([1]) : C.fromEntries([[\'x\', 2]]); const r = [use(Object).x, use(Array)[0]];', [2, 1]],
  ['comma prefix', from, 'function read(rows) { return (from([1]), rows).at(0); } const r = read([7]);', 7],
  ['key prefix', from, 'function read(rows) { return rows[(from([1]), 0)].at(0); } const r = read([[7]]);', 7],
  ['foreign capture', from, 'function read(rows) { var _ref; from(_ref = rows); return _ref.at(0); } const r = read([7]);', 7],
  ['inner instance dispatch returns an array', `import at from '${ base }array/instance/at';`,
    'const matrix = [[7]]; const r = at(matrix).call(matrix, 0).at(0);', 7],
  ['stored receiver escapes before dispatch', `import at from '${ base }array/instance/at';`,
    "const matrix = [[[7]]]; let row; row = at(matrix).call(matrix, 0); row[0] = 'seven'; const r = at(row).call(row, 0).at(0);", 's'],
  ['read-only call and apply', `import at from '${ base }array/instance/at';`,
    'const rows = [[3], [7]]; const r = [at(rows).apply(rows, [0]).at(0), at(rows).call(rows, 1).at(0)];', [3, 7]],
  ['borrowed result uses its own receiver', `import at from '${ base }array/instance/at';`,
    "const a = [[1]]; const b = ['seven']; const r = at(a).call(b, 0).at(-1);", 'n'],
  ['computed default', from, 'const rows = [7]; const { ["at"]: at = from } = rows; const r = at.call(rows, 0);', 7],
  ['supplied parameter', map, 'function read({ groupBy } = PureMap) { return groupBy([7], String); } const r = read(Object)["7"];', [7]],
  ['selected constructor', map,
    'function read(flag) { const { groupBy } = (flag ? Object : null) || PureMap; return groupBy([7], String); }'
      + ' const r = [read(true)["7"], read(false).get("7")];', [[7], [7]]],
  ['foreign comparison', map,
    'const box = { C: Object }; function read(c) { const { groupBy } = box === c ? PureMap : box.C; return groupBy([7], String); }'
      + ' const r = [read({})["7"], read(box).get("7")];', [[7], [7]]],
  ['call can be undefined', method, 'let m; const r = (m = method({})) === void 0 ? [3, 1].toSorted() : m;', [1, 3]],
  ['import-rooted check', `import root from '${ base }global-this';`, 'const r = null == root.Array ? void 0 : [3, 1].toSorted();', [1, 3]],
  ['independent pattern arms', `import of from '${ base }array/of';`, 'function read(f) { const { of: fn } = f ? { of } : Array; return fn.call(Array, 7); } const r = [read(true), read(false)];', [[7], [7]]],
  ...['||', '??'].map(op => [`logical ${ op }`, `import at from '${ base }array/instance/at';`,
    `const row = [3]; const other = { at() { return -1; } }; const fn = (row.at ${ op }= at(other) ${ op } (() => -2)); const r = [fn.call(row, 0), Object.hasOwn(row, 'at')];`, [3, false]]),
];
const tmp = path.resolve(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const dir = await fs.mkdtemp(path.join(tmp, 'prior-output-'));
try {
  for (const [name, imports, source, expected] of cases) {
    const input = `${ imports }\n${ source }\nexport { r }; export const effects = [];`;
    const jsx = name.startsWith('JSX sentinel/');
    const filename = jsx ? 'input.jsx' : 'input.mjs';
    const babel = (await transformAsync(input, {
      filename, parserOpts: { plugins: jsx ? ['jsx'] : [] }, babelrc: false, configFile: false, plugins: [[babelPlugin, options]],
    })).code;
    const plugin = createUnplugin(options);
    const first = plugin.transform(input, filename, 'pre')?.code ?? input;
    const second = plugin.transform(first, filename, 'post')?.code ?? first;
    for (const [host, output] of [['native', input], ['babel', babel], ['unplugin', first], ['pre+post', second]]) {
      const file = path.join(dir, 'case.mjs');
      await fs.writeFile(file, jsx ? lowerJsx(output, {
        jsc: { target: 'es2022', parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'classic', pragma: 'element' } } },
      }).code : output);
      for (const strip of host === 'native' ? [false] : [false, true]) {
        check(`${ name }/${ host }/${ strip ? 'stripped' : 'full' }`, await runInWorker(file, { strip, stripGlobals: jsx ? ['Iterator'] : [] }),
          `OK|${ JSON.stringify(expected) }|[]`);
      }
    }
  }

  // An imported constructor covers one arm. The other can still read a native static
  // through a container even when the comparison makes its slot type uncertain.
  const globalOptions = { ...options, method: 'usage-global' };
  for (const [selection, needsObject] of [
    ['other === box ? PureMap : box.C', true],
    ['other !== box ? box.C : PureMap', true],
    ['(other === box ? null : box.C) || PureMap', true],
    ['(other === box ? PureMap : null) ?? box.C', true],
    ['false ? box.C : PureMap', false],
  ]) {
    const input = `${ map }
      const box = { C: Object };
      function read(other) {
        const { groupBy } = ${ selection };
        const groups = groupBy([7], String);
        return typeof groups.get === 'function' ? groups.get('7') : groups['7'];
      }
      export const r = [read({}), read(box)];
      export const effects = [];
    `;
    const filename = 'input.mjs';
    const babel = (await transformAsync(input, {
      filename, babelrc: false, configFile: false, plugins: [[babelPlugin, globalOptions]],
    })).code;
    const plugin = createUnplugin(globalOptions);
    const standalone = plugin.transform(input, filename)?.code ?? input;
    const pre = plugin.transform(input, filename, 'pre')?.code ?? input;
    const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
    for (const [host, output] of [['babel', babel], ['unplugin', standalone], ['pre+post', post]]) {
      check(`global/${ selection }/${ host }/Object.groupBy`, output.includes('/es.object.group-by'), needsObject);
      const file = path.join(dir, 'case.mjs');
      await fs.writeFile(file, output);
      check(`global/${ selection }/${ host }/stripped`, await runInWorker(file), 'OK|[[7],[7]]|[]');
    }
  }
} finally {
  await fs.remove(dir);
}
finish();

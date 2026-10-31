// Unit tests for the program-exit post-sweep over built-ins a SIBLING transform injects after
// core-js's pre-pass. two branches: a bare global (regenerator mutating a node in-place to `Promise`)
// and an inlined static (`Object.assign` from object spread under setSpreadProperties). transpiler
// fixtures run core-js in ISOLATION, so they cannot express such a sibling; and the real transforms
// that introduce a bare global can also pass its value to a helper reading its statics. The late
// escape census must choose the whole entry there; a source-authored static import can otherwise
// hide a missing namespace. This suite drives a full @babel/core transform
// alongside such a sibling so the post-sweep is exercised directly: BOTH methods must polyfill the
// introduced built-in - usage-global by INJECTING the side-effect import (the reference stays raw),
// usage-pure by SUBSTITUTING it with the pure import. it also locks `isKnownGlobalName`, the predicate
// the member branch leans on to keep the plugin's own synth proxy chains out of the sweep.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { nodePositionKey } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isKnownGlobalName } from '@core-js/polyfill-provider/detect-usage/globals';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('post-sweep-introduced-global');

// sibling plugin, ordered BEFORE core-js so its Program.exit runs first: it renames a marker
// identifier to the requested name (`Map` by default) in-place at exit - AFTER the main traversal
// passed the marker (a non-global name it skipped), but BEFORE core-js's own Program.exit post-sweep.
// the same in-place-mutation shape a sibling transform uses to drop a raw global into existing code
function makeSiblingBareGlobal(name = 'Map', elideImportedSymbol = false) {
  return ({ types: t }) => ({
    visitor: {
      Program: {
        enter(programPath) {
          if (!elideImportedSymbol) return;
          for (const statement of programPath.get('body')) {
            if (!statement.isImportDeclaration() || !statement.node.source.value.endsWith('/symbol/constructor')) continue;
            if (elideImportedSymbol === 'clone') statement.replaceWith(t.cloneNode(statement.node, true));
            else statement.remove();
          }
        },
        exit(programPath) {
          programPath.traverse({
            Identifier(idPath) { if (idPath.node.name === '__M__') idPath.node.name = name; },
          });
        },
      },
    },
  });
}

async function transform(method, name = 'Map', source = 'var x = __M__;') {
  return (await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingBareGlobal(name),
      ['@core-js', { method, version: '4.0', targets: { ie: 11 } }],
    ],
  })).code;
}

// usage-global must inject the side-effect import for the introduced `Map` and leave the reference
// raw. without the post-sweep covering usage-global, `Map` stays unpolyfilled - broken on ie:11
{
  const code = await transform('usage-global');
  checkTruthy('usage-global/introduced bare global side-effect import injected',
    code.includes('core-js/modules/es.map.constructor'));
  checkTruthy('usage-global/introduced global reference left raw',
    /\bvar x = Map;/.test(code) && !code.includes('@core-js/pure'));
}

// usage-pure must substitute the introduced `Map` with the pure import binding
{
  const code = await transform('usage-pure');
  checkTruthy('usage-pure/introduced bare global substituted with pure import',
    code.includes('@core-js/pure/actual/map/constructor') && /\bvar x = _Map\b/.test(code));
  checkTruthy('usage-pure/no global side-effect import emitted',
    !code.includes('core-js/modules/es.map'));
}

// sibling plugin that swaps a marker callee for a position-less `Object.assign` member at exit -
// the introduced-STATIC shape babel@8 emits inlining object spread under setSpreadProperties. drives
// the post-sweep's member branch (the bare-global cases above drive its identifier branch)
function makeSiblingIntroducedStatic() {
  return ({ types: t }) => ({
    visitor: {
      Program: {
        exit(programPath) {
          programPath.traverse({
            CallExpression(callPath) {
              if (callPath.node.callee?.type === 'Identifier' && callPath.node.callee.name === '__ASSIGN__') {
                callPath.node.callee = t.memberExpression(t.identifier('Object'), t.identifier('assign'));
              }
            },
          });
        },
      },
    },
  });
}

async function transformStatic(method) {
  return (await transformAsync('var x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method, version: '4.0', targets: { ie: 11 } }],
    ],
  })).code;
}

// usage-global injects the side-effect import and leaves `Object.assign` raw; usage-pure substitutes
// it with the pure import. without the post-sweep member branch the inlined static stays unpolyfilled
{
  const code = await transformStatic('usage-global');
  checkTruthy('usage-global/introduced static side-effect import injected',
    code.includes('core-js/modules/es.object.assign') && /\bObject\.assign\b/.test(code));
}
{
  const code = await transformStatic('usage-pure');
  checkTruthy('usage-pure/introduced static substituted with pure import',
    code.includes('@core-js/pure') && code.includes('assign') && !/\bObject\.assign\b/.test(code));
}

// Screening uses the complete global catalogue, not only known constructor return types.
// A real global remains subject to lexical shadowing; an unrelated introduced name stays raw.
for (const method of ['usage-global', 'usage-pure']) {
  const cloned = await transform(method, 'structuredClone');
  checkTruthy(`${ method }/introduced non-constructor global is covered`, method === 'usage-pure'
    ? cloned.includes('@core-js/pure/actual/structured-clone') && /\bvar x = _structuredClone\b/.test(cloned)
    : cloned.includes('core-js/modules/web.structured-clone') && /\bvar x = structuredClone;/.test(cloned));
  const local = await transform(method, 'Map', 'function read(Map) { return __M__; }');
  checkTruthy(`${ method }/introduced shadowed global stays local`,
    !local.includes('core-js/') && !local.includes('@core-js/pure') && /return Map;/.test(local));
  const ordinary = await transform(method, 'ordinary');
  checkTruthy(`${ method }/introduced ordinary name stays raw`,
    !ordinary.includes('core-js/') && !ordinary.includes('@core-js/pure') && /\bvar x = ordinary;/.test(ordinary));
}

// a SHADOWED object must not be polyfilled: the gate's binding check excludes a sibling-introduced
// member whose object resolves to a local, even though the name `Object` is a known global
{
  const { code } = await transformAsync('function f() { const Object = { assign() {} }; return __ASSIGN__({}, { a: 1 }); } export { f };', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('shadowed object: introduced static left unpolyfilled',
    !code.includes('core-js/modules/es.object.assign'));
}

// `core-js-disable-file` must suppress the introduced static too: programExit short-circuits before
// the post-sweep runs. no existing disable-file fixture carries a sibling-introduced static, so this
// guards the ordering (the skip gate sits ahead of the sweep, not behind it)
{
  const { code } = await transformAsync('// core-js-disable-file\nvar x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('disable-file: introduced static left unpolyfilled',
    !code.includes('core-js/modules/es.object.assign') && /\bObject\.assign\b/.test(code));
}

// a MUTATED static (`Object.assign = ...` in source) must not be substituted to the pure import even
// when a sibling introduces it: the member sweep routes through the same mutation-aware handler the
// primary pass uses, it does not re-decide substitution itself
{
  const { code } = await transformAsync('Object.assign = function custom() {}; var x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('usage-pure/mutated static: introduced reference not substituted',
    !code.includes('_Object$assign') && !code.includes('@core-js/pure') && /\bObject\.assign\b/.test(code));
}

// the member branch gates the object on `isKnownGlobalName`, NOT shape alone: the plugin's own
// proxy chains (`_globalThis.Array`) and substitution wrappers (`_Array$from.call`) share the
// `<unbound Identifier>.<member>` shape, so the predicate is what keeps them out of the sweep.
// lock its contract: real globals classify in, the plugin's synth import names classify out
checkTruthy('isKnownGlobalName accepts real global objects',
  isKnownGlobalName('Object') && isKnownGlobalName('Array') && isKnownGlobalName('Math'));
checkTruthy('isKnownGlobalName rejects the plugin\'s synth import names',
  !isKnownGlobalName('_globalThis') && !isKnownGlobalName('_Array$from') && !isKnownGlobalName('_Object$assign'));

// Model a sibling's import elision before a new global reference reaches the exit sweep.
for (const elide of [false, true, 'clone']) {
  const { code } = await transformAsync('typeof Symbol; export const value = __M__;', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingBareGlobal('Symbol', elide),
      ['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy(`late pure import/${ elide }/one constructor family`,
    (code.match(/@core-js\/pure\/actual\/symbol(?:\/constructor)?(?=["'])/gu)?.length ?? 0) === 1);
  const lowered = await transformAsync(code, {
    configFile: false,
    babelrc: false,
    plugins: [requireBabel.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const context = { exports: {}, require: createRequire(import.meta.url), Symbol: undefined };
  runInNewContext(lowered.code, context);
  checkTruthy(`late pure import/${ elide }/runtime binding`, typeof context.exports.value === 'function');
}

// Real TypeScript and regenerator pipelines keep the helper's Symbol binding exactly once.
// A well-known-symbol source read alone retains no unused constructor.
for (const importStyle of [undefined, 'require']) {
  const read = 'export const key = Symbol.iterator; const events = [];'
    + " export const value = (({ at }) => at.call([7], 0))(typeof Symbol !== 'undefined' ? (events.push('prefix'), []) : null);";
  for (const [label, source] of [
    ['generator', `${ read } export function run() { function* values() { yield value; } return values().next().value; }`],
    ['async', `${ read } export async function run() { return await Promise.resolve(value); }`],
    ['unused', read],
  ]) {
    const { code } = await transformAsync(source, {
      configFile: false,
      babelrc: false,
      plugins: [
        ['@core-js', { method: 'usage-pure', mode: 'full', version: '4.0', targets: { ie: 11 }, importStyle }],
        requireBabel.resolve('@babel/plugin-transform-typescript'),
        requireBabel.resolve('@babel/plugin-transform-regenerator'),
        requireBabel.resolve('@babel/plugin-transform-modules-commonjs'),
      ],
    });
    const context = { exports: {}, require: createRequire(import.meta.url), Symbol: undefined };
    runInNewContext(code, context);
    const value = label === 'unused' ? context.exports.value : await context.exports.run();
    checkTruthy(`removed pure import/${ importStyle ?? 'import' }/${ label }/runtime`, value === 7);
    checkTruthy(`removed pure import/${ importStyle ?? 'import' }/${ label }/one live constructor family`,
      (code.match(/@core-js\/pure\/full\/symbol(?:\/constructor)?(?=["'])/gu)?.length ?? 0) === Number(label !== 'unused'));
  }
}

// the sweep's binding lookups climb from every reference to its scope owner, which in a nested
// selection crosses every level above the reference: in usage-global the sweep is read-only like the
// primary traversal and shares its climbs through the selection, so the work a whole transform does
// on the selection's nodes grows with its depth, not with the depth squared. a sibling's `pre()`
// counts the type tests made on those nodes before core-js detects anything
{
  const reads = [];
  for (const depth of [64, 128]) {
    let selection = 'Array';
    for (let i = 0; i < depth; i++) selection = `(globalThis.WeakRef || ${ selection })`;
    const counter = { reads: 0 };
    function countSelectionTypeTests() {
      return {
        pre(file) {
          const stack = [file.ast.program];
          while (stack.length) {
            const node = stack.pop();
            if (Array.isArray(node)) stack.push(...node);
            if (typeof node?.type !== 'string') continue;
            for (const [key, value] of Object.entries(node)) if (key !== 'loc' && key !== 'extra') stack.push(value);
            if (node.type !== 'LogicalExpression') continue;
            const { type } = node;
            Object.defineProperty(node, 'type', {
              configurable: true,
              enumerable: true,
              get() {
                counter.reads++;
                return type;
              },
            });
          }
        },
      };
    }
    const { code } = await transformAsync(`use(${ selection }.from(list));`, {
      configFile: false,
      babelrc: false,
      plugins: [countSelectionTypeTests, ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }]],
    });
    checkTruthy(`usage-global/nested selection/${ depth }: the static is injected`, code.includes('core-js/modules/es.array.from'));
    reads.push(counter.reads);
  }
  checkTruthy('usage-global/nested selection: linear type tests', reads[1] <= 2.5 * reads[0], `${ reads.join(' -> ') } reads`);
}

// A bare async source names no Promise static that could decorate the narrow constructor.
// Run the repository's actual sibling lowering pipeline, then assert its entire import set.
// Regenerator reads named Symbol keys; an inner parameter named `r` must not hand out the
// outer `r` holding Symbol. An actual exported Symbol below still requires its namespace.
{
  const lowering = requireBabel('../../babel.config.js');
  const expected = [
    '@core-js/pure/actual/get-iterator',
    '@core-js/pure/actual/get-iterator-method',
    '@core-js/pure/actual/object/create',
    '@core-js/pure/actual/object/define-property',
    '@core-js/pure/actual/object/get-prototype-of',
    '@core-js/pure/actual/promise',
    '@core-js/pure/actual/symbol/async-iterator',
    '@core-js/pure/actual/symbol/constructor',
    '@core-js/pure/actual/symbol/iterator',
    '@core-js/pure/actual/symbol/to-string-tag',
  ];
  for (const importStyle of ['import', 'require']) for (const [label, source, imports] of [
    ['tiny async', 'export async function run() { return 1; }', expected],
    ['early constructor', 'export const early = new Promise(resolve => resolve(0)); export async function run() { return 1; }', expected],
    [
      'exported symbol',
      'export function symbols() { return Symbol; } export async function run() { return 1; }',
      expected.map(name => name === '@core-js/pure/actual/symbol/constructor' ? '@core-js/pure/actual/symbol' : name).sort(),
    ],
    [
      'author constructor',
      "import Kept from '@core-js/pure/actual/promise/constructor';"
        + ' export const early = new Kept(resolve => resolve(0)); export async function run() { return 1; }',
      [...expected, '@core-js/pure/actual/promise/constructor'].sort(),
    ],
    ['construction only', 'export function run() { return new Promise(resolve => resolve(1)); }', ['@core-js/pure/actual/promise/constructor']],
  ]) {
    const { code } = await transformAsync(source, {
      ...lowering,
      configFile: false,
      babelrc: false,
      plugins: [
        ['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, importStyle }],
        ...lowering.plugins.map(([name, options]) => [requireBabel.resolve(name.replace('@babel/', '@babel/plugin-')), options]),
      ],
    });
    const actual = code.matchAll(/require\(["'](?<source>@core-js\/pure\/[^"']+)["']\)/gu).map(match => match.groups.source).toArray().sort();
    checkTruthy(`late namespace/${ importStyle }/${ label }/exact imports`, JSON.stringify(actual) === JSON.stringify(imports), JSON.stringify(actual));
    const context = { exports: {}, require: createRequire(import.meta.url), Symbol: undefined };
    runInNewContext(code, context);
    checkTruthy(`late namespace/${ importStyle }/${ label }/runtime without native Symbol`, await context.exports.run() === 1);
  }
}

// Proper iterator lowering shares generated helper returns across separate call sites.
// Count reads of its spanless selections so a broken memo fails before exhausting the heap.
{
  const lowering = requireBabel('../../scripts/bundle-tests/webpack.usage-pure-babel.config.js').module.rules[0].use.options;
  const counter = { roots: 0, reads: 0 };
  function countGeneratedSelections() {
    return {
      visitor: {
        Program: {
          exit(programPath) {
            programPath.traverse({
              SequenceExpression({ node }) {
                if (nodePositionKey(node) !== null) return;
                counter.roots++;
                const { expressions } = node;
                Object.defineProperty(node, 'expressions', {
                  configurable: true,
                  enumerable: true,
                  get() {
                    counter.reads++;
                    if (counter.reads > 2000) throw new Error('generated return expansion did not converge');
                    return expressions;
                  },
                });
              },
            });
          },
        },
      },
    };
  }
  const source = `
    QUnit.test('plain and computed keys', assert => {
      const key = 'of';
      function read({ key: plain, [key]: of } = Array) { return [plain, of(9)]; }
      const [plain, result] = read();
      assert.same(plain, undefined);
      assert.deepEqual(result, [9]);
    });
    QUnit.test('interior computed key', assert => {
      const key = 'fromAsync';
      function read({ from, [key]: build, of } = Array) { return [from([3]), typeof build, of(4)]; }
      const [fromResult, buildType, ofResult] = read();
      assert.deepEqual(fromResult, [3]);
      assert.same(buildType, 'function');
      assert.deepEqual(ofResult, [4]);
    });
  `;
  let code;
  let failure;
  try {
    ({ code } = await transformAsync(source, {
      ...lowering,
      configFile: false,
      babelrc: false,
      filename: fileURLToPath(new URL('../e2e-usage-pure/destructuring.js', import.meta.url)),
      plugins: [
        countGeneratedSelections,
        ...lowering.plugins.map(([name, options]) => [
          name === '@core-js' ? name : requireBabel.resolve(name.replace(/^@babel\/(?!plugin-)/u, '@babel/plugin-')),
          options,
        ]),
      ],
    }));
  } catch (error) {
    failure = error;
  }
  checkTruthy('late iterator census/generated spanless selections are present', counter.roots > 0);
  checkTruthy('late iterator census/the counted selections are read', counter.reads > 0);
  checkTruthy('late iterator census/shared returns converge', !failure, failure?.message);
  if (code) {
    checkTruthy('late iterator census/actual static imports are retained',
      code.includes('@core-js/pure/full/array/from-async') && code.includes('@core-js/pure/full/array/of'));
    runInNewContext(code, {
      exports: {},
      require: createRequire(import.meta.url),
      QUnit: {
        test(name, run) {
          run({
            same(actual, expected) {
              checkTruthy(`late iterator census/${ name }/value`, actual === expected);
            },
            deepEqual(actual, expected) {
              checkTruthy(`late iterator census/${ name }/array value`, JSON.stringify(actual) === JSON.stringify(expected));
            },
          });
        },
      },
    });
  }
}

finish();

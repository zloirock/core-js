// A declined literal wrapper retains its written iteration, independently of other claims.
// A fully consumed object capture retains coercion, but no private binding without readers.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createContext, runInContext, runInNewContext } from 'node:vm';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, parseSync } = requireBabel('@babel/core');
const { check, checkTruthy, finish } = createChecker('native-wrapper-preparation');
const options = { configFile: false, babelrc: false, filename: 'input.mjs' };

function inspect(code) {
  let spreads = 0;
  let emptyPatterns = 0;
  const refs = new Set();
  // eslint-disable-next-line node/no-sync -- structural assertions inspect one completed output synchronously
  walkAstNodes({ root: parseSync(code, options), visit(node) {
    if (node.type === 'SpreadElement') spreads++;
    if (node.type === 'ObjectPattern' && !node.properties.length) emptyPatterns++;
    if (node.type === 'Identifier' && /^_ref\d*$/u.test(node.name)) refs.add(node.name);
  } });
  return { spreads, emptyPatterns, refs: refs.size };
}

// Controls make both structural observations non-vacuous before inspecting transformed code.
check('spread detector control', inspect('const a = [...[Array]];').spreads, 1);
check('capture detector control', inspect('const { x: _ref } = source;').refs, 1);
check('coercion detector control', inspect('const { x: {} } = source;').emptyPatterns, 1);

const cases = [
  ['native', 'const [{ from }] = [...[Array]]; use(from);', 1],
  ['neighbour', 'const [{ from }] = [...[Array]]; use(from); [1].at(0);', 1],
  ['constructor', 'const [head, { groupBy }] = [...[0], Map]; use(head, groupBy);', 1],
  ['nested spread', 'const [{ from }] = [...[...[Array]]]; use(from); [1].includes(1);', 2],
  ['assignment', 'let from; ([{ from }] = [...[Array]]); use(from); [1].at(0);', 1],
  ['loop', 'for (const [{ from }] = [...[Array]]; cond;) use(from); [1].at(0);', 1],
  ['keyed capture', 'const { x: { [(effect(), "from")]: from } } = { x: Array }; use(from);', 0, false],
  ['deep capture', 'const { x: { y: { [(effect(), "of")]: of } } } = { x: { y: Array } }; use(of);', 0, false],
  ['exported function', 'export function read() { const { x: { [(effect(), "from")]: from } } = { x: Array }; return from; }', 0, false],
  ['live capture', 'const { x: { [(effect(), "from")]: from, length } } = { x: Array }; use(from, length);', 0, true],
  ['opaque capture', 'const { x: { [(effect(), "at")]: at } } = source; use(at);', 0, true],
];

for (const method of ['usage-pure', 'usage-global']) for (const [name, source, spreads, live] of cases) {
  const pluginOptions = { method, version: '4.0', targets: { ie: 11 } };
  for (const leg of ['babel', 'unplugin', 'pre+post']) {
    let code;
    if (leg === 'babel') code = (await transformAsync(source, { ...options, plugins: [[babelPlugin, pluginOptions]] })).code;
    else {
      const plugin = createUnplugin(pluginOptions);
      code = plugin.transform(source, '/input.mjs', leg === 'pre+post' ? 'pre' : 'single')?.code ?? source;
      if (leg === 'pre+post') code = plugin.transform(code, '/input.mjs', 'post')?.code ?? code;
    }
    const label = `${ name }/${ method }/${ leg }`;
    const facts = inspect(code);
    check(`${ label }/written spread survives`, facts.spreads, spreads);
    if (live !== undefined && method === 'usage-pure') {
      check(`${ label }/capture has a reader`, facts.refs > 0, live);
      if (!live) check(`${ label }/coercion survives`, facts.emptyPatterns, 1);
    }
    if (name === 'neighbour' || name === 'constructor') {
      checkTruthy(`${ label }/other claim really injects`, code.includes(method === 'usage-pure' ? '@core-js/pure/' : 'core-js/modules/'));
    }
  }
}

// The native pattern can be lowered before Program.exit. Its former capture must not
// turn into a new destructuring declaration after the sibling's lowering has finished.
for (const [name, source, expected] of [
  ['keyed', 'const { x: { [(effect(), "from")]: from } } = { x: Array }; publish(from([3]));', '[[3]]'],
  ['array', `
    function read(unknown) {
      for (const e of [Array]) {
        const [{ [(effect(), "of")]: of }, { length }] = [e, unknown];
        publish(of(3), length);
      }
    }
    read({ length: 7 });
  `, '[[3],7]'],
]) {
  const { code, ast } = await transformAsync(source, {
    ...options,
    ast: true,
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }],
      ...['destructuring', 'block-scoping', 'for-of', 'computed-properties', 'modules-commonjs']
        .map(transform => requireBabel(`@babel/plugin-transform-${ transform }`))],
  });
  let patterns = 0;
  walkAstNodes({ root: ast, visit(node) {
    if (node.type === 'ObjectPattern' || node.type === 'ArrayPattern') patterns++;
  } });
  check(`${ name }/shared lowering leaves no patterns`, patterns, 0);
  let result;
  let effects = 0;
  runInNewContext(code, {
    require: requireBabel,
    effect() { effects++; },
    publish(...values) { result = JSON.stringify(values); },
  });
  check(`${ name }/shared lowering preserves the result`, result, expected);
  check(`${ name }/shared lowering preserves the key effect`, effects, 1);
}

// Reparse the printed result before lowering: a binding-free pattern in a for-init
// can make downstream destructuring lowering hide adjacent bindings in an IIFE.
for (const [name, source, expected] of [
  ['for-init', 'for (const { x: { [(effect(), "from")]: from } } = { x: Array }; step();) publish(from([3]));', [[3]]],
  ['for-init sibling', `
    for (let before = effect(), { x: { [(effect(), "from")]: from }, other } = { x: Array, other: 7 }, after = effect(); step();)
      publish(from([3]), other, before, after);
  `, [[3], 7, 11, 11]],
  ['for-init array', `
    for (const Ctor of [Array]) {
      for (const [{ [(effect(), "of")]: of }, { length }] = [Ctor, { length: 7 }]; step();) publish(of(3), length);
    }
  `, [[3], 7]],
]) for (const leg of ['babel', 'unplugin', 'pre+post']) {
  const pluginOptions = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const plugin = createUnplugin(pluginOptions);
  const printed = leg === 'babel'
    ? (await transformAsync(source, { ...options, plugins: [[babelPlugin, pluginOptions]] })).code
    : plugin.transform(source, '/input.mjs', leg === 'pre+post' ? 'pre' : 'single')?.code ?? source;
  const lowered = (await transformAsync(printed, {
    ...options,
    plugins: ['destructuring', 'for-of', 'block-scoping', 'computed-properties']
      .map(transform => requireBabel(`@babel/plugin-transform-${ transform }`)),
  })).code;
  const output = leg === 'pre+post' ? plugin.transform(lowered, '/input.mjs', 'post')?.code ?? lowered : lowered;
  const { code } = await transformAsync(output, {
    ...options, plugins: [requireBabel('@babel/plugin-transform-modules-commonjs')],
  });
  for (const stripped of [false, true]) {
    const events = [];
    let turns = 0;
    const context = createContext({
      require: requireBabel,
      effect() { events.push('key'); return 11; },
      step() { events.push('test'); return turns++ === 0; },
      publish(...values) { events.push(JSON.stringify(values)); },
    });
    if (stripped) runInContext('delete Array.from; delete Array.of;', context);
    let error = null;
    try {
      runInContext(code, context);
    } catch (error_) { error = error_.name; }
    const label = `${ name }/${ leg }/${ stripped ? 'stripped' : 'full' }`;
    check(`${ label }/lowered bindings remain visible`, error, null);
    check(`${ label }/lowered effects and result`, JSON.stringify(events), JSON.stringify([
      ...name === 'for-init sibling' ? ['key', 'key', 'key'] : ['key'], 'test', JSON.stringify(expected), 'test',
    ]));
  }
}
finish();

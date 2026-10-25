// The source collectors share a traversal, but aliases and realm-host rewrites still settle
// after import registration. Count pre() program walks and hold the ordering with runtime twins.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformSync } = requireBabel('@babel/core');
const { NodePath } = requireBabel('@babel/traverse');
const { check, checkTruthy, checkDeep, finish } = createChecker('prepass-collection');
const OPTIONS = { version: '4.0', targets: { ie: 11 }, additionalPackages: ['core-js'] };
let insidePre = false;

// Count our phase, excluding Babel's own initial scope crawl (which differs in 7 and 8).
function observedPlugin(...args) {
  const definition = babelPlugin(...args);
  const { pre } = definition;
  definition.pre = function (...preArgs) {
    insidePre = true;
    try {
      return pre.apply(this, preArgs);
    } finally {
      insidePre = false;
    }
  };
  return definition;
}

function transform(code, method, extra = {}) {
  // eslint-disable-next-line node/no-sync -- the counted traversal window cannot yield
  return transformSync(code, {
    filename: '/prepass.mjs', configFile: false, babelrc: false,
    plugins: [[observedPlugin, { ...OPTIONS, method }]], ...extra,
  }).code;
}

for (const method of ['usage-global', 'usage-pure']) {
  for (const [label, source, maximum] of [
    ['plain', 'export const read = values => values.at(0);', 1],
    ['alias', 'const { Map: M } = globalThis; export const read = values => new M(values);', 2],
    ['mutation and alias', 'Array.from = shim; const { Map: M } = globalThis; export const read = values => [Array.from(values), new M(values)];', 2],
    ['split alias', 'let M; const read = values => new M(values); ({ Map: M } = globalThis), use(read);', 3],
  ]) {
    const original = NodePath.prototype.traverse;
    let walks = 0;
    NodePath.prototype.traverse = function (...args) {
      if (insidePre && this.node?.type === 'Program') walks++;
      return original.apply(this, args);
    };
    let output;
    try {
      output = transform(source, method);
    } finally {
      NodePath.prototype.traverse = original;
    }
    checkTruthy(`${ method }/${ label }/counted source walks`, walks > 0);
    checkTruthy(`${ method }/${ label }/no redundant program walk`, walks <= maximum, `${ walks } > ${ maximum }`);
    checkTruthy(`${ method }/${ label }/injection reached`, output.includes(method === 'usage-pure' ? '@core-js/pure/' : 'core-js/modules/'));
    check(`${ method }/${ label }/unobserved output`, output, transform(source, method));
  }
}

for (const [label, source] of [
  ['forward alias', 'function read() { return new M([[1, 2]]).size; } let M; ({ Map: M } = globalThis); read();'],
  ['split mutation and alias', 'function read() { return [Array.from(), new M().size]; } let M; Array.from = () => 7, ({ Map: M } = globalThis), read();'],
  ['prefix alias', "function read() { return new M().size; } let M; (({ Map: M } = globalThis), require)('core-js/modules/es.array.from'); read();"],
  ['prefix getter and alias', 'const log = []; const box = { get value() { log[log.length] = 1; return 0; } }; let M; '
    + "(({ Map: M } = globalThis), box.value, require)('core-js/modules/es.array.from'); [log, new M().size];"],
  ['realm selection', 'const { Map: M } = globalThis.window || globalThis; new M([[1, 2]]).size;'],
  ['shadowed alias', 'function run(globalThis) { const { Map: M } = globalThis; return new M().size; } run({ Map: class { size = 9; } });'],
  ['opted-out alias', '// core-js-disable-next-line\nconst { Map: M } = globalThis;\nnew M().size;'],
]) {
  function require(id) { return id.startsWith('core-js/modules/') ? undefined : requireBabel(id); }
  const native = runInNewContext(source, { require });
  for (const method of ['usage-global', 'usage-pure']) {
    const babel = transform(source, method, { filename: '/prepass.cjs', sourceType: 'script' });
    const unplugin = createPlugin({ ...OPTIONS, method }).transform(source, '/prepass.cjs')?.code ?? source;
    for (const [host, code] of [['babel', babel], ['unplugin', unplugin]]) {
      checkDeep(`${ method }/${ label }/${ host }/runtime`, runInNewContext(code, { require }), native);
    }
  }
}

// A later optional-chain lowering must retain the method receiver, even without an entry
// import. Erasing TS first is the independent source oracle; lowering the plugin output is
// the pipeline that used to lose this when entry-global discarded its normalization.
{
  const source = 'const box = { read<T>(value: T) { return [this === box, value]; } }; (box.read<number>)?.(7);';
  const typescript = requireBabel('@babel/plugin-transform-typescript');
  const optional = requireBabel('@babel/plugin-transform-optional-chaining');
  function lower(code, plugins) {
    // eslint-disable-next-line node/no-sync -- synchronous pipeline oracle
    return transformSync(code, { configFile: false, babelrc: false, filename: '/prepass.ts', plugins }).code;
  }
  const native = runInNewContext(lower(source, [typescript]));
  checkDeep('optional instantiation/native receiver', native, [true, 7]);
  for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
    const normalized = createPlugin({ ...OPTIONS, method }).transform(source, '/prepass.ts')?.code ?? source;
    checkDeep(`${ method }/optional instantiation/later lowering`,
      runInNewContext(lower(normalized, [optional, typescript])), native);
  }
}

finish();

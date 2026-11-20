// A prior pass owns its emitted declarations. Snapshot state carries import facts,
// while a user write poisons deduplication even when its name looks generated.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { parseSync } from 'oxc-parser';
import unplugin from '../../packages/core-js-unplugin/index.js';
import { selectTransformStages } from './phase-imports.mjs';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import ImportInjector from '../../packages/core-js-unplugin/internals/import-injector.js';
import { bindingNamesReducer } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, checkTruthy, finish } = createChecker('unplugin-import-handoff');
const options = { method: 'usage-pure', targets: { ie: '11' } };
const moduleSources = new Map();
const { transformAsync } = createRequire(import.meta.url)('@babel/core');
const typescript = createRequire(import.meta.url).resolve('@babel/plugin-transform-typescript');

async function evaluate(code, stripped = false, ts = false) {
  if (ts) ({ code } = await transformAsync(code, {
    filename: 'source.cts', sourceType: 'script', configFile: false, babelrc: false, plugins: [typescript],
  }));
  const module = { exports: null };
  const context = createContext({ module });
  const modules = new Map();
  // The dispatcher and the source must share an Array prototype. Loading a helper
  // in the outer Node realm would mistake the inner array for a foreign receiver.
  function localRequire(source, parent = import.meta.url) {
    const filename = createRequire(parent).resolve(source);
    if (modules.has(filename)) return modules.get(filename).exports;
    // eslint-disable-next-line node/no-sync -- CommonJS requires execute synchronously in the tested realm
    if (!moduleSources.has(filename)) moduleSources.set(filename, readFileSync(filename, 'utf8'));
    const child = { exports: {} };
    modules.set(filename, child);
    runInContext(`(function (require, module, exports) { ${ moduleSources.get(filename) }\n})`, context)(
      next => localRequire(next, filename), child, child.exports,
    );
    return child.exports;
  }
  context.require = localRequire;
  if (stripped) runInContext('delete Array.prototype.at;', context);
  try {
    runInContext(code, context);
    return JSON.stringify(module.exports);
  } catch (error) {
    return `ERR:${ error.name }`;
  }
}

for (const name of ['_ref', '_ref2', 'userAt']) for (const [shape, write, ts = false] of [
  ['argument', 'use(NAME = replacement());'],
  ['member', '(NAME = replacement()).tag;'],
  ['test', '(NAME = replacement()) === null;'],
  ['statement', 'NAME = replacement();'],
  ['pattern', '({ value: NAME } = { value: replacement() });'],
  ['for-of', 'for (NAME of [replacement()]) use(NAME);'],
  ['for-in', 'for (NAME in { replaced: 1 }) use(NAME);'],
  ['cast', 'use((NAME as any) = replacement());', true],
  ['nonnull', 'use(NAME! = replacement());', true],
  ['satisfies', 'use((NAME satisfies any) = replacement());', true],
]) {
  const source = `var ${ name } = require('@core-js/pure/actual/array/instance/at');
    var effects = [];
    function replacement() { effects.push('write'); return function () { return function () { return 99; }; }; }
    function use(value) { effects.push('use'); return value; }
    ${ write.replaceAll('NAME', name) }
    module.exports = [[7].at(0), ${ shape === 'for-in' ? name : `${ name }()()` }, effects];`;
  const expectedEffects = shape === 'for-in' ? ['use'] : write.includes('use(') ? ['write', 'use'] : ['write'];
  const expected = JSON.stringify([7, shape === 'for-in' ? 'replaced' : 99, expectedEffects]);
  const label = `${ name }/${ shape }`;
  check(`${ label }/native`, await evaluate(source, false, ts), expected);
  check(`${ label }/stripped control`, await evaluate(source, true, ts), 'ERR:TypeError');
  const filename = ts ? '/import-handoff.cts' : '/import-handoff.cjs';
  // eslint-disable-next-line node/no-sync -- inspect the same synchronous parser used by the plugin
  const { program } = parseSync(filename, source, { sourceType: 'commonjs' });
  const census = collectFileCensus(program, [bindingNamesReducer()]);
  check(`${ label }/written import`, census.assignedNames.has(name), true);
  check(`${ label }/reserved name`, census.names.has(name), true);
  for (const phase of ['single', 'pre', 'post', 'pre+post', 'orphan-post']) {
    const plugin = createPlugin(options);
    let code = source;
    for (const pass of phase === 'pre+post' || phase === 'orphan-post' ? ['pre', 'post'] : [phase]) {
      const host = pass === 'post' && phase === 'orphan-post' ? createPlugin(options) : plugin;
      code = host.transform(code, filename, pass)?.code ?? code;
    }
    check(`${ label }/${ phase }/full`, await evaluate(code, false, ts), expected);
    check(`${ label }/${ phase }/stripped`, await evaluate(code, true, ts), expected);
  }
}

// Pre can defer a global import, but every phase must emit its own memo declaration.
// Losing the snapshot is a supported standalone post, not permission to adopt free writes.
for (const method of ['usage-pure', 'usage-global']) for (const source of [
  'function run(xs) { return xs?.at(0); } module.exports = [run(null), run([7])];',
  'var _ref, _ref2 = 19; function run(xs) { return xs.at(0); } module.exports = [run([7]), _ref2];',
  "require('@core-js/pure/actual/array/instance/at'); use(_ref2 = foreign()); module.exports = [_ref2, [7].at(0)];",
]) {
  const input = `function use(x) { return x; } function foreign() { return 23; } ${ source }`;
  const expected = await evaluate(input);
  checkTruthy(`${ method }/native control`, !expected.startsWith('ERR:'));
  for (const inherit of [false, true]) {
    const plugin = createPlugin({ ...options, method });
    const pre = plugin.transform(input, '/handoff.cjs', 'pre')?.code ?? input;
    const post = (inherit ? plugin : createPlugin({ ...options, method })).transform(pre, '/handoff.cjs', 'post')?.code ?? pre;
    check(`${ method }/${ inherit }/pre declares its own refs`, await evaluate(pre), expected);
    check(`${ method }/${ inherit }/post`, await evaluate(post), expected);
    const again = createPlugin({ ...options, method }).transform(post, '/handoff.cjs', 'post')?.code ?? post;
    check(`${ method }/${ inherit }/repeated post`, await evaluate(again), expected);
  }
}

// No AST-declaration ledger is needed to reserve slots from the preceding source.
// The suffix and imported-binding facts still survive a snapshot independently.
{
  const first = new ImportInjector({ pkg: '@core-js/pure', mode: 'actual' });
  first.seedReservedNames(['_ref', '_ref2']);
  check('snapshot/first free slot', first.generateDeclaredRef(), '_ref3');
  const inherited = new ImportInjector({ pkg: '@core-js/pure', mode: 'actual', inherit: first.snapshot() });
  check('snapshot/next free slot', inherited.generateLocalRef(), '_ref4');
  check('snapshot/independent allocation', first.generateLocalRef(), '_ref4');
  const standalone = new ImportInjector({ pkg: '@core-js/pure', mode: 'actual' });
  standalone.seedReservedNames(['_ref', '_ref2', '_ref3']);
  check('snapshot/fresh post reserves printed names', standalone.generateLocalRef(), '_ref4');
}

// A sibling introduces a read that pre could not see. Post must recognize the imported
// Array.from as the source of xs and emit only the array-specific helper for the new call.
{
  const id = '/alias.mjs';
  const fixture = new URL('../transpiler-fixtures/usage-pure/audit-cross-pass-alias-narrowing-dedup/input.mjs', import.meta.url);
  const source = await readFile(fixture, 'utf8');
  const [pre, post] = unplugin.raw({ ...options, phase: 'pre+post' }, { framework: 'vite' });
  const first = pre.transform(source, id).code;
  check('alias/pre has no late at', first.includes('/instance/at"'), false);
  const { code } = post.transform(`${ first }\nexport const late = xs.at(1);`, id);
  check('alias/post adds typed at once', code.split('/actual/array/instance/at"').length - 1, 1);
  check('alias/post omits generic at', code.includes('/actual/instance/at"'), false);
  check('alias/post retains one Array.from', code.split('/actual/array/from"').length - 1, 1);
}

// The benchmark uses the very same admitted stages for ordinary and lowered inputs.
{
  const id = '/measured.mjs';
  const [pre, post] = unplugin.raw({ ...options, phase: 'pre+post' }, { framework: 'vite' });
  for (const stages of [[pre], [post], [post, pre], [pre, { ...post, transformInclude: () => false }]]) {
    let message;
    try {
      selectTransformStages(stages, id, 'pre+post');
    } catch (error) {
      ({ message } = error);
    }
    checkTruthy('measured pre+post rejects a missing or reordered phase', message?.includes('Expected pre+post'));
  }
  check('measured pre+post admits both stages', selectTransformStages([pre, post], id, 'pre+post').length, 2);
  const single = unplugin.raw(options, { framework: 'vite' });
  check('measured JS pre skips the component companion', selectTransformStages(single, id, 'pre')[0], single[0]);
}

for (const [firstId, otherId, equivalent] of [
  ['/a.js?k=1&k=2', '/a.js?k=2&k=1', '/a.js?t=42&k=1&k=2'],
  ['file:///src/a%20b.js', '/src/a%20b.js', '/src/a b.js'],
  ['file://server/share/a.js', '/server/share/a.js', '//server/share/a.js'],
]) {
  for (const method of ['usage-pure', 'usage-global']) {
    const plugin = createPlugin({ ...options, method });
    const pure = method === 'usage-pure';
    const after = pure ? 'export const r = Array.from([]);' : 'export default 0;';
    plugin.transform(pure ? 'Array.from = () => [23];' : '[3].at(-1);', firstId, 'pre');
    plugin.transform('export default 1;', otherId, 'pre');
    const first = plugin.transform(after, equivalent, 'post')?.code ?? after;
    const other = plugin.transform(after, otherId, 'post')?.code ?? after;
    const marker = pure ? '/array/from' : 'es.array.at';
    check(`id handoff/${ method }/${ firstId }`, first.includes(marker), !pure);
    check(`neighbor handoff/${ method }/${ otherId }`, other.includes(marker), pure);
  }
}

// An abandoned pre must also be replaced when the next pre returns before detection.
{
  const plugin = createPlugin({ ...options, method: 'usage-global' });
  const id = '/changed.js';
  plugin.transform('[2].at(0);', id, 'pre');
  plugin.transform('// core-js-disable-file\nexport default 0;', id, 'pre');
  check('disabled pre supersedes an orphan', plugin.transform('export default 0;', id, 'post'), null);
}

finish();

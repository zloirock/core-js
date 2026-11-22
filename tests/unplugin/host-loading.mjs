import { createChecker } from '../polyfill-provider/harness.mjs';
import unplugin, { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import SnapshotCache from '../../packages/core-js-unplugin/internals/snapshot-cache.js';
import { sourceDialectOf } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { webpackModuleType } from '../../packages/core-js-unplugin/internals/host-loading.js';

const { check, checkDeep, checkTruthy, finish } = createChecker('host-loading');

for (const [a, b] of [
  ['/app/file.js?variant=Dark', '/app/file.js?variant=dark'],
  ['/app/file.js?Mode=dark', '/app/file.js?mode=dark'],
  ['/app/file.js?T=123', '/app/file.js'],
  ['/app/C#/file.js', '/app/C#other/file.js'],
]) {
  const cache = new SnapshotCache();
  cache.store(a, { tag: 'a' });
  cache.store(b, { tag: 'b' });
  check(`${ a }/identity`, cache.take(a)?.tag, 'a');
  check(`${ b }/identity`, cache.take(b)?.tag, 'b');
  cache.store(a, { tag: 'a' });
  cache.store('/app/C', { tag: 'unrelated' });
  cache.invalidate('/app/C');
  check(`${ a }/invalidation boundary`, cache.take(a)?.tag, 'a');
}

for (const ext of ['vue', 'svelte', 'astro', 'md', 'mdx', 'svx', 'gjs', 'gts']) {
  const id = `/app/C#/view.${ ext }`;
  check(`${ ext }/source`, shouldTransform(id), false);
  check(`${ ext }/compiled`, shouldTransform(id, 'post'), true);
  check(`${ ext }/asset`, shouldTransform(`${ id }?raw`, 'post'), false);
  for (const host of ['esbuild', 'bun']) {
    const stages = unplugin.raw({ method: 'usage-pure', phase: 'post' }, { framework: host });
    check(`${ ext }/${ host }/raw`, stages[0].transformInclude(id), false);
  }
  const code = 'export const view = <span>{[3].at(0)}</span>;';
  const result = createPlugin({ method: 'usage-pure', targets: { ie: 11 } }).transform(code, id, 'post');
  checkTruthy(`${ ext }/JSX printer`, result?.code.includes('<span>'));
  checkTruthy(`${ ext }/injection`, result?.code.includes('@core-js/pure/'));
}

checkDeep('loader overrides syntax but preserves filename goal', sourceDialectOf('/app/view.cjs', 'tsx'),
  { jsx: true, esm: false, lang: 'tsx', parseGoal: 'commonjs' });
check('loader preserves explicit ESM', sourceDialectOf('/app/view.mjs', 'ts').esm, true);

for (const extension of ['mjs', 'cjs']) for (const moduleType of ['javascript/auto', 'javascript/dynamic', 'javascript/esm']) {
  const id = `/app/view.${ extension }`;
  const esm = moduleType === 'javascript/esm';
  const dialect = sourceDialectOf(id, 'tsx', moduleType);
  check(`${ extension }/${ moduleType }/pinned`, dialect.esm, esm);
  check(`${ extension }/${ moduleType }/goal`, dialect.parseGoal,
    !esm && (extension === 'cjs' || moduleType === 'javascript/dynamic') ? 'commonjs' : 'module');
  const warnings = [];
  const output = createPlugin({ method: 'usage-pure', targets: { ie: 11 } }).transform.call({
    warn(message) { warnings.push(message); },
  }, 'if (false) return; var result = [3].at(0);', id, 'single', '', { moduleType });
  check(`${ extension }/${ moduleType }/return diagnostic`, warnings.length, esm ? 1 : 0);
  if (esm) check(`${ extension }/${ moduleType }/rejected`, output, null);
  else checkTruthy(`${ extension }/${ moduleType }/require`, output?.code.includes('require('));
}

for (const phase of ['pre', 'post', 'pre+post']) {
  const stages = unplugin.raw({ method: 'usage-pure', phase }, { framework: 'vite' });
  for (const stage of stages) {
    stage.vite.configResolved({ cacheDir: '/app/custom-cache' });
    check(`vite/${ phase }/optimized dependency`, stage.transformInclude('/app/custom-cache/deps/pure.js?v=1'), false);
    check(`vite/${ phase }/similar directory`, stage.transformInclude('/app/custom-cache-user/source.js'), phase !== 'pre' || stage.enforce === 'pre');
  }
}

for (const rule of [/lib\.js$/g, [/lib\.js$/g]]) {
  const regexp = Array.isArray(rule) ? rule[0] : rule;
  const context = { getNativeBuildContext: () => ({
    compiler: { options: { module: { noParse: rule } } },
    loaderContext: { _module: { type: 'javascript/auto', request: '/app/lib.js' } },
  }) };
  for (let turn = 0; turn < 2; turn++) {
    check(`noParse/${ Array.isArray(rule) }/${ turn }`, webpackModuleType(context), null);
    check('regexp state retained', regexp.lastIndex, 0);
  }
}

// farm's native `warn` takes nothing but a string and aborts the process otherwise. Through
// unplugin's own farm adapter a parse failure reaches it as one; every other host keeps the
// context it calls the transform with
const farmWarnings = [];
const farmStage = unplugin.farm({ method: 'usage-pure', phase: 'post', targets: { ie: 11 } });
const farmResult = await farmStage.transform.executor({ resolvedPath: '/app/broken.mjs', query: [], content: 'class { method( ' }, {
  warn(message) { farmWarnings.push(message); },
  error(message) { throw new Error(`farm error: ${ message }`); },
});
check('farm/parse failure declines', farmResult, null);
checkDeep('farm/parse failure reaches farm as a string', farmWarnings.map(message => typeof message), ['string']);
checkTruthy('farm/parse failure names the file', String(farmWarnings[0]).startsWith('[core-js] could not parse /app/broken.mjs:'));
for (const host of ['bun', 'rolldown', 'rollup', 'rsbuild', 'rspack', 'vite', 'webpack']) {
  const warnings = [];
  const [{ transform }] = unplugin.raw({ method: 'usage-pure', phase: 'post', targets: { ie: 11 } }, { framework: host });
  const result = (transform.handler ?? transform).call({ warn(message) { warnings.push(message); } }, 'class { method( ', '/app/broken.mjs');
  check(`${ host }/parse failure declines`, result, null);
  checkDeep(`${ host }/parse failure reaches the host context`, warnings.map(message => typeof message), ['string']);
}

finish();

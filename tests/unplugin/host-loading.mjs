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
  { jsx: true, esm: false, lang: 'tsx', parseGoal: 'script' });
check('loader preserves explicit ESM', sourceDialectOf('/app/view.mjs', 'ts').esm, true);

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

finish();

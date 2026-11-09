// External loading checks use the host's resolved dependency and keep per-module metadata fresh.
import { strict as assert } from 'node:assert';
import unplugin from '../../packages/core-js-unplugin/index.js';
import { externalRequireHooks, validateEsbuildRequires } from '../../packages/core-js-unplugin/internals/external-requires.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, finish } = createChecker('external-requires');
const request = '@core-js/pure/actual/array/at';
const requires = [[request, true]];
for (const [banner, loader] of [
  ['', false], ['// const require = loader;', false], ['function nested() { const require = loader; }', false],
  ['const require;', false], ['const require = loader;', true], ['function require(id) { return loader(id); }', true],
  ['import require from "loader";', true], ['export const require = loader;', true],
]) {
  let resolved = 0;
  const build = {
    initialOptions: { format: 'esm', banner: { js: banner } },
    async resolve(source, context) {
      assert.equal(source, request);
      assert.equal(context.kind, 'require-call');
      resolved++;
      return { external: true };
    },
  };
  if (loader) await validateEsbuildRequires(build, requires, '/input.cjs');
  else await assert.rejects(() => validateEsbuildRequires(build, requires, '/input.cjs'), /\[core-js\].*injected require/);
  check(`esbuild/banner ${ banner }/resolver`, resolved, loader ? 0 : 1);
}
for (const format of ['cjs', 'iife', 'esm']) {
  const build = { initialOptions: { format }, async resolve() { return { external: false }; } };
  await validateEsbuildRequires(build, requires, '/input.cjs');
  check(`${ format }/bundled dependency`, true, true);
}
for (const host of ['vite', 'rolldown', 'webpack', 'rspack']) for (const phase of ['pre', 'post', 'pre+post']) {
  const stages = unplugin.raw({ method: 'usage-pure', phase, targets: { ie: 11 } }, { framework: host });
  const info = { coreJSRequires: [[request, true]] };
  const context = {
    getModuleInfo() { return { meta: info }; },
    getNativeBuildContext() { return { loaderContext: { _module: { type: 'javascript/auto', buildInfo: info } } }; },
  };
  for (const stage of stages) {
    if (!stage.transformInclude('/input.cjs')) continue;
    const transform = stage.transform.handler ?? stage.transform;
    const output = transform.call(context, 'module.exports = 1;', '/input.cjs');
    if (output?.meta) Object.assign(info, output.meta);
  }
  check(`${ host }/${ phase }/changed source clears metadata`, info.coreJSRequires?.length ?? 0, 0);
}
for (const [format, platform, code, reject] of [
  ['es', 'neutral', 'const r = 1;', true], ['cjs', 'neutral', '', false],
  ['es', 'node', '', false], ['es', 'neutral', 'const require = loader;', false],
]) {
  const hooks = externalRequireHooks();
  hooks.options({ platform });
  const context = {
    getModuleInfo() { return { meta: { coreJSRequires: requires } }; },
    async resolve() { return { external: true }; },
  };
  const bundle = { output: { type: 'chunk', code, modules: { '/input.cjs': {} } } };
  function generate() { return hooks.generateBundle.call(context, { format }, bundle); }
  if (reject) await assert.rejects(generate, /\[core-js\].*injected require/);
  else await generate();
  check(`emitted dependency/${ format }/${ platform }/${ code }`, true, true);
}
finish();

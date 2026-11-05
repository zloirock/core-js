// Crawler preparation belongs only to TypeScript usage transforms. Observe a harmless,
// non-enumerable Program slot: raw syntax walks and printing never need a parameter list there.
// The TypeScript control proves that the parser observer reaches the preparation pass.
import { registerHooks } from 'node:module';
import { parseSync } from 'oxc-parser';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, checkTruthy, finish } = createChecker('unplugin-syntax-preparation');
const pluginURL = new URL('../../packages/core-js-unplugin/internals/plugin.js?preparation-test', import.meta.url).href;
const parserURL = import.meta.resolve('oxc-parser');
const wrapperURL = new URL('./preparation-parser.mjs', import.meta.url).href;
let reads = 0;
let observed = 0;
globalThis.observePreparationTree = program => {
  observed++;
  Object.defineProperty(program, 'params', { get() {
    reads++;
    return undefined;
  } });
};
const hooks = registerHooks({
  resolve(specifier, context, next) {
    return specifier === 'oxc-parser' && context.parentURL === pluginURL
      ? { url: wrapperURL, shortCircuit: true } : next(specifier, context);
  },
  load(url, context, next) {
    if (url !== wrapperURL) return next(url, context);
    return {
      format: 'module', shortCircuit: true,
      source: `import { parseSync as parse } from ${ JSON.stringify(parserURL) };
        export function parseSync(...args) {
          const result = parse(...args);
          globalThis.observePreparationTree(result.program);
          return result;
        }`,
    };
  },
});

try {
  const { default: createPlugin } = await import(pluginURL);
  for (const [id, typed, jsx] of [
    ['/input.js', false, false], ['/input.mjs', false, false], ['/input.cjs', false, false],
    ['/input.jsx', false, true], ['/input.ts', true, false], ['/input.mts', true, false],
    ['/input.cts', true, false], ['/input.tsx', true, true],
    ['/app.vue?vue&type=script&lang=ts', true, false],
  ]) for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
    const typeSource = typed ? 'type F = (...args: number[]) => void;\nclass Box { constructor(public value = [1].at(0)) {} }\n' : '';
    const entry = method === 'entry-global' ? 'import "core-js/actual/array/at";\n' : '';
    const source = `${ entry }${ typeSource }const value = [1].at(0);${ jsx ? '\nconst view = <div>{value}</div>;' : '' }`;
    const plugin = createPlugin({ method, version: '4.0', targets: { ie: 11 } });
    // Reuse the instance across files as bundlers do; no parser observation can leak to the next call.
    for (let turn = 0; turn < 2; turn++) {
      reads = observed = 0;
      const output = plugin.transform(source, id);
      const label = `${ method }/${ id }/${ turn }`;
      checkTruthy(`${ label }/parser observed`, observed > 0);
      check(`${ label }/crawler preparation`, reads > 0, typed && method !== 'entry-global');
      checkTruthy(`${ label }/injection`, output?.code.includes(method === 'usage-pure' ? '@core-js/pure' : 'core-js/modules/'));
      // Reparse the printed source in the same language; type rest parameters and parameter
      // properties must survive even when the entry path never neutralized them.
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides a sync API
      const parsed = parseSync('output.tsx', output.code, { lang: typed ? jsx ? 'tsx' : 'ts' : 'jsx', sourceType: 'module' });
      check(`${ label }/reparse`, parsed.errors.length, 0);
      if (typed) {
        checkTruthy(`${ label }/rest type`, output.code.includes('...args: number[]'));
        checkTruthy(`${ label }/parameter property`, output.code.includes('public value ='));
      }
      checkTruthy(`${ label }/source map`, output.map.sourcesContent.includes(source));
    }
  }
} finally {
  hooks.deregister();
  delete globalThis.observePreparationTree;
}

finish();

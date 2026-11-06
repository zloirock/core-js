// Crawler preparation belongs only to TypeScript usage transforms. Observe a harmless,
// non-enumerable Program slot: raw syntax walks and printing never need a parameter list there.
// The TypeScript control proves that the parser observer reaches the preparation pass.
import { registerHooks } from 'node:module';
import * as oxc from 'oxc-parser';
import { createSyntaxVisitors } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('unplugin-syntax-preparation');
const pluginURL = new URL('../../packages/core-js-unplugin/internals/plugin.js?preparation-test', import.meta.url).href;
const standardPluginURL = `${ pluginURL }-standard`;
const parserURL = import.meta.resolve('oxc-parser');
const wrapperURL = new URL('./preparation-parser.mjs', import.meta.url).href;
const standardURL = `${ wrapperURL }?standard`;
let reads = 0;
let observed = 0;
let refused;
globalThis.observePreparationTree = program => {
  observed++;
  Object.defineProperty(program, 'params', { get() {
    reads++;
    return undefined;
  } });
};
globalThis.observePreparationTransport = options => {
  if (!refused) return;
  const raw = options.experimentalRawTransfer === true;
  refused.push([options.lang, options.sourceType, raw]);
  if (raw) throw new RangeError('Raw transfer buffer unavailable');
};
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'oxc-parser' && context.parentURL === standardPluginURL) return { url: standardURL, shortCircuit: true };
    return specifier === 'oxc-parser' && context.parentURL === pluginURL
      ? { url: wrapperURL, shortCircuit: true } : next(specifier, context);
  },
  load(url, context, next) {
    if (url === standardURL) return { format: 'module', shortCircuit: true, source: `export { parseSync } from ${ JSON.stringify(parserURL) };` };
    if (url !== wrapperURL) return next(url, context);
    return {
      format: 'module', shortCircuit: true,
      source: `import { parseSync as parse } from ${ JSON.stringify(parserURL) };
        export * from ${ JSON.stringify(parserURL) };
        export function parseSync(...args) {
          globalThis.observePreparationTransport(args[2]);
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
      const parsed = oxc.parseSync('output.tsx', output.code, { lang: typed ? jsx ? 'tsx' : 'ts' : 'jsx', sourceType: 'module' });
      check(`${ label }/reparse`, parsed.errors.length, 0);
      if (typed) {
        checkTruthy(`${ label }/rest type`, output.code.includes('...args: number[]'));
        checkTruthy(`${ label }/parameter property`, output.code.includes('public value ='));
      }
      checkTruthy(`${ label }/source map`, output.map.sourcesContent.includes(source));
    }
  }
  // Both goals must still work if this host cannot reserve the parser's raw buffer.
  const source = '<!-- legacy\nmodule.exports = [1].at(0);';
  const options = { method: 'usage-pure', targets: { ie: 11 } };
  const plugin = createPlugin(options);
  // The browser entry of oxc-parser exposes parseSync without a raw transfer capability.
  const { default: createStandardPlugin } = await import(standardPluginURL);
  const standard = createStandardPlugin(options);
  const expected = standard.transform(source, '/fallback.js');
  checkTruthy('transfer fallback control injects', expected?.code.includes('@core-js/pure'));
  refused = [];
  checkDeep('transfer fallback preserves code and sourcemap', plugin.transform(source, '/fallback.js'), expected);
  const modes = oxc.rawTransferSupported?.() ? [true, false] : [false];
  const attempts = ['module', 'script'].flatMap(goal => modes.map(raw => ['jsx', goal, raw]));
  checkDeep('transfer fallback preserves each parse goal', refused, attempts);
  // Both transports accept literal lone surrogates but return different literal values.
  for (const surrogate of ['\uD800', '\uDFFF']) {
    const input = `export const text = "${ surrogate }"; Array.from(text);`;
    refused = [];
    const result = plugin.transform(input, '/unicode.mjs');
    checkDeep('lone surrogate uses the standard transport', refused, [['jsx', 'module', false]]);
    checkDeep('lone surrogate matches standard output', result, standard.transform(input, '/unicode.mjs'));
    checkTruthy('lone surrogate preserves the original map source', result.map.sourcesContent.includes(input));
    checkTruthy('lone surrogate keeps the standard printed value', result.code.includes('\uFFFD'));
  }
} finally {
  hooks.deregister();
  delete globalThis.observePreparationTree;
  delete globalThis.observePreparationTransport;
}

// ESTree uses Literal for both numbers and regular expressions. Only the latter can
// owe regexp syntax helpers; its shared handler still has to check ambient ancestors.
for (const [expression, ambient, walks, injects] of [
  ['0', false, false, false],
  ['"(?<name>a)"', false, false, false],
  ['/(?<name>a)/', false, true, true],
  ['/(?<name>a)/', true, true, false],
]) {
  const { program } = await oxc.parse('literal.js', expression);
  const node = program.body[0].expression;
  let parents = 0;
  const entries = [];
  const visitors = createSyntaxVisitors({ isDisabled: () => false, injectModulesForModeEntry: entry => entries.push(entry) });
  visitors.Literal({ node, get parentPath() {
    parents++;
    return ambient ? { node: { type: 'TSInterfaceDeclaration' } } : null;
  } });
  check(`literal ancestry/${ expression }/${ ambient }`, parents > 0, walks);
  check(`literal injection/${ expression }/${ ambient }`, entries.includes('regexp/exec'), injects);
}

finish();

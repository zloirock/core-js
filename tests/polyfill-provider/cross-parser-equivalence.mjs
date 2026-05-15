// End-to-end equivalence harness: feed identical sources through BOTH plugin pipelines
// (`@core-js/babel-plugin` via `@babel/core.transformAsync`, `@core-js/unplugin` via
// `createPlugin().transform()`) and assert that the resulting `core-js/modules/...`
// import sets are IDENTICAL. isolates polyfill-set decisions from output formatting -
// the existing fixture suite catches output regressions but couldn't easily surface
// "two parsers picked different polyfill sets on the same source"
import { transformAsync } from '@babel/core';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from './harness.mjs';

const { fail, finish, pass } = createChecker('cross-parser-equivalence');

// extract sorted set of core-js polyfill imports from emitted code. matches both ESM
// (`import "..."`) and CJS (`require("...")`) shapes, dedupes via Set
function extractPolyfillImports(code) {
  if (!code) return [];
  const imports = new Set();
  const re = /(?:import\s+["']|require\s*\(\s*["'])(?<source>core-js(?:-pure)?\/[^"']+)["']/g;
  let match;
  while ((match = re.exec(code)) !== null) imports.add(match.groups.source);
  return [...imports].sort();
}

async function runEquivalence(label, source, pluginOptions, parserPlugins = ['typescript']) {
  // babel side: full pipeline with `@core-js/babel-plugin`. TS parser plugin enabled
  // by default since most parser-sensitive cases involve TS shapes
  const testId = parserPlugins.includes('typescript') ? 'input.ts' : 'input.mjs';
  const babelOptions = {
    plugins: [['@core-js', pluginOptions]],
    parserOpts: { plugins: parserPlugins },
    filename: testId,
  };
  let babelImports, unpluginImports;
  try {
    babelImports = extractPolyfillImports((await transformAsync(source, babelOptions))?.code ?? '');
  } catch (error) {
    return fail(label, `babel threw: ${ error.message }`);
  }
  // unplugin side: direct createPlugin call mirrors how the unplugin runner invokes it
  try {
    const result = createUnplugin(pluginOptions).transform(source, testId);
    unpluginImports = extractPolyfillImports(result?.code ?? source);
  } catch (error) {
    return fail(label, `unplugin threw: ${ error.message }`);
  }
  if (babelImports.length === unpluginImports.length
      && babelImports.every((s, i) => s === unpluginImports[i])) return pass();
  fail(label, `babel: [${ babelImports.join(', ') }] vs unplugin: [${ unpluginImports.join(', ') }]`);
}

// --- equivalence scenarios ---

// each scenario picks a syntax shape that historically differed between parsers OR that
// stresses the polyfill-provider's cross-parser dispatch. all use `usage-global` for the
// most common method; targeting `ie 11` so most ES2015+ features need polyfills

const USAGE_GLOBAL_IE11 = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
const USAGE_PURE = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };

await runEquivalence('plain Array.from', 'Array.from(arr);', USAGE_GLOBAL_IE11);
await runEquivalence('plain Promise.allSettled', 'Promise.allSettled(ps);', USAGE_GLOBAL_IE11);
await runEquivalence('Array.prototype.at', '[1].at(0);', USAGE_GLOBAL_IE11);
await runEquivalence('String.prototype.includes', '"x".includes("y");', USAGE_GLOBAL_IE11);
await runEquivalence('Object.fromEntries', 'Object.fromEntries(entries);', USAGE_GLOBAL_IE11);

// TS-AST shapes: AsExpression / NonNullExpression / SatisfiesExpression wrappers
await runEquivalence('TS AsExpression around static call', '(Array.from as any)([1]);', USAGE_GLOBAL_IE11);
await runEquivalence('TS NonNullExpression around static', '(Array.from!)([1]);', USAGE_GLOBAL_IE11);
await runEquivalence('TS SatisfiesExpression', '([1].at satisfies any)(0);', USAGE_GLOBAL_IE11);
await runEquivalence('TS as around instance method receiver', '(arr as number[]).at(0);', USAGE_GLOBAL_IE11);

// ChainExpression-wrapped optional chains: oxc wraps via `ChainExpression`, babel via
// `OptionalMemberExpression`/`OptionalCallExpression` - resolve-node-type normalises both
await runEquivalence('optional chain at()', 'arr?.at(0);', USAGE_GLOBAL_IE11);
await runEquivalence('optional chain instance', 'maybe?.values?.()?.next?.();', USAGE_GLOBAL_IE11);

// ParenthesizedExpression: babel preserves with `createParenthesizedExpressions:true`,
// oxc never emits this node - both should still detect the inner call
await runEquivalence('wrapped paren static', '(Array.from)([1]);', USAGE_GLOBAL_IE11);

// Spread / iteration shape - triggers Symbol.iterator
await runEquivalence('Spread in array', 'const xs = [...src];', USAGE_GLOBAL_IE11);
await runEquivalence('Spread in call', 'fn(...args);', USAGE_GLOBAL_IE11);
await runEquivalence('Destructure with rest', 'const [a, ...rest] = arr;', USAGE_GLOBAL_IE11);

// generators / async
await runEquivalence('async function', 'async function f() {}', USAGE_GLOBAL_IE11);
await runEquivalence('generator function', 'function* g() { yield 1; }', USAGE_GLOBAL_IE11);
await runEquivalence('async generator', 'async function* g() { yield 1; }', USAGE_GLOBAL_IE11);

// for-of / for-await iteration
await runEquivalence('for-of', 'for (const x of arr) {}', USAGE_GLOBAL_IE11);
await runEquivalence('for-await-of', 'async function f() { for await (const x of arr) {} }', USAGE_GLOBAL_IE11);

// using declaration (resources)
await runEquivalence('using declaration', 'function f() { using r = res(); }', USAGE_GLOBAL_IE11);
await runEquivalence('await using declaration', 'async function f() { await using r = res(); }', USAGE_GLOBAL_IE11);

// dynamic import - parsers differ on node shape (ImportExpression vs CallExpression(Import))
await runEquivalence('dynamic import', 'import("./mod");', USAGE_GLOBAL_IE11);

// usage-pure mode equivalence: parsers must agree on rewrite targets too
await runEquivalence('usage-pure Array.from', 'Array.from(arr);', USAGE_PURE);
await runEquivalence('usage-pure Promise', 'Promise.resolve(1);', USAGE_PURE);
await runEquivalence('usage-pure includes', '[1].includes(2);', USAGE_PURE);

// TS type annotation on declaration: a Promise<T> reference must register Promise
// for entry detection - both walkers must reach the TSTypeReference uniformly
await runEquivalence('TS type annotation Promise<T>', 'const p: Promise<number> = null!;', USAGE_GLOBAL_IE11);

// optional call on instance: receiver type resolution must agree
await runEquivalence('optional instance call', '(maybe ?? [])?.at(0);', USAGE_GLOBAL_IE11);

finish();

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

// extract sorted set of core-js polyfill paths from emitted code. matches any quoted
// `core-js/...`, `core-js-pure/...`, or `@core-js/<scope>/...` literal regardless of
// surrounding syntax. earlier shape (`import "..."` / `require(...)`) missed
// usage-pure default imports (`import _Name from "@core-js/pure/..."`) AND scoped
// package paths entirely, leaving every usage-pure scenario vacuously green
function extractPolyfillImports(code) {
  if (!code) return [];
  const imports = new Set();
  const re = /["'](?<source>(?:@core-js\/[^"'/]+|core-js(?:-pure)?)\/[^"']+)["']/g;
  let match;
  while ((match = re.exec(code)) !== null) imports.add(match.groups.source);
  return [...imports].sort();
}

// file extension drives oxc's parser-language detection in the unplugin, so derive
// it from the selected parser plugins rather than hardcoding `.ts` / `.mjs`. JSX
// needs `.jsx` (or `.tsx` if TS is also on); Flow needs `.flow.js` for oxc to
// switch modes. the babel side uses the same id as `filename` so its error frames
// point at a consistent location across scenarios
function inferTestId(parserPlugins) {
  const hasTS = parserPlugins.includes('typescript');
  const hasJSX = parserPlugins.includes('jsx');
  if (hasJSX) return hasTS ? 'input.tsx' : 'input.jsx';
  if (parserPlugins.includes('flow')) return 'input.flow.js';
  return hasTS ? 'input.ts' : 'input.mjs';
}

// sorted-list equality avoids the per-element `[].every` shape inline. inputs are
// guaranteed sorted by `extractPolyfillImports`, so identical-set test reduces to
// length + position-wise compare
function importsAgree(a, b) {
  return a.length === b.length && a.every((s, i) => s === b[i]);
}

// symmetric-diff failure reporter. `Set.prototype.difference` would be cleaner but
// lands in newer Node; manual filter keeps the harness portable. highlights what's
// UNIQUE to each side rather than dumping two full lists - for a 12-module
// mismatch where only 1 module differs, the diff shows the one offender immediately
function reportMismatch(label, babelImports, unpluginImports) {
  const babelSet = new Set(babelImports);
  const unpluginSet = new Set(unpluginImports);
  const babelOnly = babelImports.filter(s => !unpluginSet.has(s));
  const unpluginOnly = unpluginImports.filter(s => !babelSet.has(s));
  fail(label, `babel-only: [${ babelOnly.join(', ') }] / unplugin-only: [${ unpluginOnly.join(', ') }]`);
}

async function runEquivalence(label, source, pluginOptions, {
  parserPlugins = ['typescript'],
  // forwarded to babel's parser to let scenarios opt in to `createParenthesizedExpressions:true`
  // and other parse-time controls that the unplugin (oxc) doesn't have a switch for. oxc keeps
  // its native node shape regardless; the asymmetry IS the point - both walkers must agree
  parserOpts = {},
} = {}) {
  const testId = inferTestId(parserPlugins);
  // babel side: full pipeline with `@core-js/babel-plugin`. TS parser plugin enabled
  // by default since most parser-sensitive cases involve TS shapes
  const babelOptions = {
    plugins: [['@core-js', pluginOptions]],
    parserOpts: { plugins: parserPlugins, ...parserOpts },
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
  if (importsAgree(babelImports, unpluginImports)) return pass();
  reportMismatch(label, babelImports, unpluginImports);
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
// oxc never emits this node - both should still detect the inner call. the default
// babel parse strips parens at parse time, so the test would be a no-op without
// explicitly enabling that option here. the unplugin side reads source through oxc
// regardless, which never produces ParenthesizedExpression nodes - so the parity
// assertion is "babel WITH paren node === unplugin WITHOUT paren node"
await runEquivalence('wrapped paren static', '(Array.from)([1]);', USAGE_GLOBAL_IE11,
  { parserOpts: { createParenthesizedExpressions: true } });

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

// for-x HEAD reassignment of an outer `var`: the loop head's per-iteration write is a constantViolation
// that babel records as a NodePath while oxc / estree-toolkit recompute the violation set differently;
// the resolvers must still agree on the polyfill set. A head-reassign that DOMINATES the use bails the
// pure receiver walk (no stale-init array/from) on BOTH parsers; the same shape with the use BEFORE the
// reassign resolves it on both. Exercises the for-x-head branch of the var-reassignment recovery in
// lockstep so a parser-only difference in the phantom head-write can never desync the polyfill set.
await runEquivalence('for-x head reassign dominates use (pure bail)',
  'var A = Array;\nfor (A of [Set]) {}\nA.from([1]);', USAGE_PURE);
await runEquivalence('for-x head reassign after use (pure resolves)',
  'var A = Array;\nA.from([1]);\nfor (A of [Set]) {}', USAGE_PURE);
await runEquivalence('for-x head reassign dominates use (global)',
  'var A = Array;\nfor (A of [Set]) {}\nA.from([1]);', USAGE_GLOBAL_IE11);

// function PARAM reassigned via MULTIPLE same-name destructuring-pattern assignments. estree-toolkit
// records each violation as the LHS Identifier and does NOT recompute it to an AssignmentExpression for
// kind=param (unlike var/let/const), so the value-flow recovery must pair each violation to its OWN
// assignment by NODE IDENTITY. A by-name match collapsed every `[M] = ...` onto the first, dropping the
// later globals from the union - babel (which records AssignmentExpression violations and skips this path)
// kept them, so unplugin under-injected es.array.from. Both walkers must now union the same polyfill set.
await runEquivalence('param multi-pattern-reassign union (by-name collapse guard)',
  'function f(M, a, b) {\n  const O = Object, A = Array;\n  if (a) [M] = [O];\n  if (b) [M] = [A];\n  M.from([1]);\n}', USAGE_GLOBAL_IE11);
await runEquivalence('param multi-object-pattern-reassign union',
  'function f(M, a, b) {\n  const O = Object, A = Array;\n  if (a) ({ x: M } = { x: O });\n  if (b) ({ x: M } = { x: A });\n  M.from([1]);\n}', USAGE_GLOBAL_IE11);

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

// --- non-TS parser plugin parity ---

// JSX: a JSXExpression-wrapped polyfill call must be detected by both walkers.
// the `parserPlugins` argument used to be dead - default `['typescript']` made every
// scenario flow through TS-only parsing. JSX-specific dispatch (JSXElement /
// JSXExpressionContainer node traversal) needs explicit coverage
await runEquivalence(
  'JSX expression containing polyfill call',
  'const el = <div>{Array.from(xs).at(0)}</div>;',
  USAGE_GLOBAL_IE11,
  { parserPlugins: ['typescript', 'jsx'] },
);

// decorators: class with a decorator that wraps a method - polyfill detection must
// survive the Decorator wrapper node both parsers emit. `decorators-legacy` is the
// stage-1 form most widely deployed; `decorators` (stage-3) has different AST shape
// but both should parse here uniformly via TS parser baseline
await runEquivalence(
  'decorator on class method body',
  '@d class C { m() { return [1].at(0); } }',
  USAGE_GLOBAL_IE11,
  { parserPlugins: ['typescript', 'decorators-legacy'] },
);

// Flow: mutually exclusive with TS at the babel parser level. covers the
// FunctionTypeAnnotation / GenericTypeAnnotation dispatch on oxc's Flow mode
await runEquivalence(
  'Flow type annotation Promise<T>',
  'const p/*: Promise<number> */ = null;',
  USAGE_GLOBAL_IE11,
  { parserPlugins: ['flow'] },
);

finish();

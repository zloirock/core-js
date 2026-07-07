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
// needs `.jsx` (or `.tsx` if TS is also on). the babel side uses the same id as
// `filename` so its error frames point at a consistent location across scenarios
function inferTestId(parserPlugins) {
  const hasTS = parserPlugins.includes('typescript');
  const hasJSX = parserPlugins.includes('jsx');
  if (hasJSX) return hasTS ? 'input.tsx' : 'input.jsx';
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

// NO Flow scenario here on purpose: oxc has no Flow mode on any extension, so a cross-parser
// Flow equivalence is not expressible (both sides would emit zero imports and trivially agree -
// a vacuous scenario that can never catch a regression). babel-side Flow dispatch is locked by
// the real-annotation `at-call-flow-*` fixtures instead

// --- parenthesized type-slot dispatch (oxc keeps `(X)` as TSParenthesizedType, babel
// strips it at parse) - every raw `.type` dispatch on a type slot must peel, else the
// unplugin side under/mis-narrows while babel narrows ---

await runEquivalence('paren mapped constraint (keyof T)',
  'type Copy<T> = { [K in (keyof T)]: T[K] }; declare const a: Copy<string[]>; a.at(0);', USAGE_PURE);
await runEquivalence('paren mapped constraint (literal union)',
  "type Pluck<V> = { [K in ('items' | 'name')]: V }; declare const a: Pluck<number[]>; a.items.at(0);", USAGE_PURE);
await runEquivalence('paren mapped union MEMBER',
  "type Pluck<V> = { [K in ('items') | 'name']: V }; declare const a: Pluck<number[]>; a.items.at(0);", USAGE_PURE);
await runEquivalence('paren as-rename template',
  'type Up<T> = { [K in keyof T as (Uppercase<K & string>)]: T[K] }; declare const a: Up<{ at: number[] }>; a.AT.at(0);',
  USAGE_PURE);
await runEquivalence('paren generic-container infer arg',
  'type Elem<T> = T extends Array<(infer U)> ? U[] : never; declare const a: Elem<number[][]>; a.at(0).at(0);',
  USAGE_PURE);
await runEquivalence('paren keyof source must NOT defeat the passthrough capture guard',
  'interface Src { t1: string } interface Other { t1: unknown; onlyInU: number[] } '
    + 'type Cross<T, U> = { [K in keyof (T)]: U[K] }; declare const r: Cross<Src, Other>; r.onlyInU.at(0);',
  USAGE_PURE);
await runEquivalence('paren index-signature key type',
  'interface M { [k: (number)]: string[] } declare const m: M; declare const s: string; m[s].at(0);', USAGE_PURE);
await runEquivalence('paren ReturnType<(typeof f)> arg',
  'declare function f(): string[]; type R = ReturnType<(typeof f)>; declare const r: R; r.at(0);', USAGE_PURE);
await runEquivalence('paren discriminant literal member',
  "type U = { kind: ('a'); v: number[] } | { kind: 'b'; v: string }; declare const u: U; if (u.kind === 'a') u.v.at(0);",
  USAGE_PURE);
await runEquivalence('paren alias body through the alias chain',
  'type Inner = (number[]); type Outer = Inner; declare const o: Outer; o.at(0);', USAGE_PURE);
await runEquivalence('paren callback param function type',
  'interface Api { each(cb: ((x: string[]) => void)): void } declare const api: Api; api.each(x => x.at(0));',
  USAGE_PURE);
await runEquivalence('paren declared callable annotation',
  'declare const make: ((() => number[])); make().at(0);', USAGE_PURE);
await runEquivalence('paren Awaited<(Promise<T>)> arg',
  'type A = Awaited<(Promise<number[]>)>; declare const a: A; a.at(0);', USAGE_PURE);
await runEquivalence('paren mapped constraint - usage-global flavor',
  'type Copy<T> = { [K in (keyof T)]: T[K] }; declare const a: Copy<string[]>; a.at(0);', USAGE_GLOBAL_IE11);
await runEquivalence('paren index-signature key - usage-global flavor',
  'interface M { [k: (number)]: string[] } declare const m: M; declare const s: string; m[s].at(0);',
  USAGE_GLOBAL_IE11);

// anon-escape slot walks: babel strips runtime parens while oxc keeps ParenthesizedExpression, so a
// paren / TS-cast between slot-read steps must not split the escape verdict (held read of the anon's
// own slot) between the pipelines; destructure targets and untrackable slots are parser-symmetric locks
const ANON_HELD = '{ data: ["x"], read() { return this.data.at(0); } }';
await runEquivalence('anon escape: paren between slot-read steps',
  `function f(sink) { const o = { a: { b: ${ ANON_HELD } } }; sink((o.a).b); } f(x => x);`, USAGE_PURE);
await runEquivalence('anon escape: TS cast between slot-read steps',
  `function f(sink) { const o = { a: { b: ${ ANON_HELD } } }; sink((o.a as any).b); } f(x => x);`, USAGE_PURE);
await runEquivalence('anon escape: TS cast between member and call',
  `function f(sink) { const o = { w: ${ ANON_HELD }, grab() { return this.w; } }; sink((o.grab as any)()); } f(x => x);`,
  USAGE_PURE);
await runEquivalence('anon escape: destructure target leaks',
  `function f(sink) { const [g] = [${ ANON_HELD }]; sink(g); } f(x => x);`, USAGE_PURE);
await runEquivalence('anon escape: dynamic computed key held read',
  `function f(sink, dyn) { const o = { [dyn]: ${ ANON_HELD } }; sink(o[dyn]); } f(x => x, "k");`, USAGE_PURE);
await runEquivalence('anon escape: member store then held slot read',
  `function f(sink) { const holder = {}; holder.f = ${ ANON_HELD }; sink(holder.f); } f(x => x);`, USAGE_PURE);
await runEquivalence('anon escape: paren between slot-read steps - usage-global flavor',
  `function f(sink) { const o = { a: { b: ${ ANON_HELD } } }; sink((o.a).b); } f(x => x);`, USAGE_GLOBAL_IE11);
await runEquivalence('anon escape: field write through a TS-cast slot read',
  `const o = { a: ${ ANON_HELD } }; (o.a as any).data = 5; o.a.read();`, USAGE_PURE);

// own-this method extraction rebinds `this` - the held-read verdicts must agree between the
// pipelines for the object, class-instance and prototype channels, and a direct call keeps
// the narrow identically on both
await runEquivalence('method extraction: var extraction then call',
  `const o = ${ ANON_HELD }; const m = o.read; m.call({ data: 42 });`, USAGE_PURE);
await runEquivalence('method extraction: object-spread copy with override',
  `const o = ${ ANON_HELD }; const o2 = { ...o, data: 42 }; o2.read();`, USAGE_PURE);
await runEquivalence('method extraction: class prototype extraction',
  'class C { data = ["x"]; read() { return this.data.at(0); } }\n'
  + 'const m = C.prototype.read; m.call({ data: 42 }); new C().read();', USAGE_PURE);
await runEquivalence('method extraction: direct call control',
  `const o = ${ ANON_HELD }; o.read();`, USAGE_PURE);
await runEquivalence('method extraction: var extraction - usage-global flavor',
  `const o = ${ ANON_HELD }; const m = o.read; m.call({ data: 42 });`, USAGE_GLOBAL_IE11);

finish();

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

// member NAME slots: the two parsers spell these members differently (babel folds the bodyless
// class signatures into `TSDeclareMethod`, oxc keeps a null-body `MethodDefinition` and separate
// `TSAbstract*` types), and babel's own `isReferencedIdentifier` reports such a key as referenced.
// so a global-shaped member name is exactly where the two pipelines can pick different polyfill
// sets. each key below names a global used NOWHERE else, so any import for it is a false positive
await runEquivalence(
  'bodyless overload signature key named as a global',
  'class C { Set(): void; Set(x?: number) {} }\nexport const r = [1].at(0);',
  USAGE_GLOBAL_IE11,
);
await runEquivalence(
  'abstract method key named as a global',
  'abstract class C { abstract WeakMap(): void; }\nexport const r = [1].at(0);',
  USAGE_GLOBAL_IE11,
);
await runEquivalence(
  'abstract accessor key named as a global',
  'abstract class C { abstract accessor Promise: number; }\nexport const r = [1].at(0);',
  USAGE_GLOBAL_IE11,
  { parserPlugins: ['typescript', 'decoratorAutoAccessors'] },
);
await runEquivalence(
  'interface method signature key named as a global',
  'interface I { Map(): void }\nexport const r = [1].at(0);',
  USAGE_GLOBAL_IE11,
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

// for-of head member write aliases same-slot body reads - no method module may inject for
// them in either flavor. wrappers around the receiver / head object must not desync the
// parsers: oxc keeps paren NODES the babel default parse strips (historically unplugin
// over-injected `es.array.at` on the paren read), and TS casts survive in both
await runEquivalence('for-x write alias: paren body read',
  'const o = [1, 2];\nfor (o.at of fns) { (o).at(0); }', USAGE_GLOBAL_IE11);
await runEquivalence('for-x write alias: cast body read',
  'const o = [1, 2];\nfor (o.at of fns) { (o as any).at(0); }', USAGE_GLOBAL_IE11);
await runEquivalence('for-x write alias: cast head object',
  'const o = [1, 2];\nfor ((o as any).includes of fns) { o.includes(1); }', USAGE_GLOBAL_IE11);
await runEquivalence('for-x write alias: paren body read - usage-pure flavor',
  'const o = [1, 2];\nfor (o.at of fns) { (o).at(0); }', USAGE_PURE);
await runEquivalence('for-x write alias: cast head object - usage-pure flavor',
  'const o = [1, 2];\nfor ((o as any).includes of fns) { o.includes(1); }', USAGE_PURE);
// optionality resolves the SAME written slot, and the parsers model it with different node
// TYPES (OptionalMemberExpression vs ChainExpression-wrapped member) - a type-literal shape
// compare desyncs the emitters here (babel injected es.array.at while unplugin skipped)
await runEquivalence('for-x write alias: optional body read',
  'const o = [1, 2];\nfor (o.at of fns) { o?.at(0); }', USAGE_GLOBAL_IE11);
await runEquivalence('for-x write alias: optional body read - usage-pure flavor',
  'const o = [1, 2];\nfor (o.at of fns) { o?.at(0); }', USAGE_PURE);
await runEquivalence('for-x write alias: optional non-aliased receiver still polyfills',
  'const a = [1];\nconst b = [2];\nfor (a.flat of fns) { b?.flat(); }', USAGE_PURE);

// a tagged-template tag on a runtime-ctor-guarded alias static is a this-carrying invocation:
// both parsers must classify tag-position callee-ness identically (import sets already agreed
// before the raw-branch bind fix; this locks the guard plan against parser-side drift). the
// usage-global flavor injects the same module set for the tag read as for a call read
await runEquivalence('guarded static tagged-template tag',
  'function viaTag(c) {\n  let M;\n  c ? ({ Map: M } = globalThis) : 0;\n  return M.groupBy`items`;\n}', USAGE_PURE);
await runEquivalence('guarded static tagged-template tag - usage-global flavor',
  'function viaTag(c) {\n  let M;\n  c ? ({ Map: M } = globalThis) : 0;\n  return M.groupBy`items`;\n}', USAGE_GLOBAL_IE11);

// a GUARDED destructure alias feeding a call whose result dispatches an instance method: the
// value-flow return resolver must refuse the static pair on BOTH parsers (babel's post-rewrite
// scope loses the pattern while the pristine estree walk still resolved it - babel imported the
// generic instance/at helper while unplugin imported the array-typed one)
await runEquivalence('guarded destructure alias call-result dispatch',
  'let make;\nif (cond) ({ from: make } = Array);\nexport const r = make([1]);\nexport const x = r.at(0);', USAGE_PURE);
await runEquivalence('unconditional destructure alias call-result control',
  'const { of } = Array;\nexport const s = of(1, 2);\nexport const z = s.includes(1);', USAGE_PURE);
// logical-operand guard is a distinct branch of the guarded-write walk (LogicalExpression
// parent vs IfStatement) - the refusal must hold there identically on both parsers
await runEquivalence('guarded destructure alias - logical form',
  'let make;\ncond && ({ from: make } = Array);\nexport const r = make([1]);\nexport const x = r.at(0);', USAGE_PURE);
await runEquivalence('guarded destructure alias - ternary form',
  'let make;\ncond ? ({ from: make } = Array) : 0;\nexport const r = make([1]);\nexport const x = r.at(0);', USAGE_PURE);
await runEquivalence('guarded destructure alias - switch-case form',
  'let make;\nswitch (x) {\n  case 1:\n    ({ from: make } = Array);\n}\nexport const r = make([1]);\nexport const x2 = r.at(0);', USAGE_PURE);
// the same refusal in usage-global degrades the call-result to the generic TYPE, which
// injects the full method pair (over-inject-safe) - identically on both parsers
await runEquivalence('guarded destructure alias - usage-global flavor',
  'let make;\nif (cond) ({ from: make } = Array);\nexport const r = make([1]);\nexport const x = r.at(0);', USAGE_GLOBAL_IE11);

// SE-bearing inits joining the anchored proxy-hop fold: the effect rides a re-emittable
// channel (prefix replay / whole-rescued chain assignment) - both parsers must agree on
// the import set for every admitted and declined form
await runEquivalence('anchored SE-init: sequence prefix + proxy key',
  'const { self: { navigator: nav } } = (eff(), globalThis);\nexport const r = nav;', USAGE_PURE);
await runEquivalence('anchored SE-init: chain assignment + full consume',
  'let w;\nconst { Map: { groupBy } } = (w = globalThis);\nexport const r = [w, groupBy];', USAGE_PURE);
await runEquivalence('anchored SE-init: ternary-branch effect stays nested',
  'const { Iterator: { customC } } = (cond ? (eff(), globalThis) : globalThis);\nexport const r = customC;', USAGE_PURE);
await runEquivalence('anchored SE-init: assignment-form cascade host',
  'let nv;\n({ self: { isSecureContext: nv } } = (eff(), globalThis));\nexport const r = nv;', USAGE_PURE);
await runEquivalence('anchored SE-init: deferred chain-assign host',
  'let q3, customV;\nexport const { keys } = (({ Set: { customV } } = (q3 = globalThis)), Object);\nexport const r = [q3, customV];', USAGE_PURE);
// a symbol-iterator leaf in a deferred host folds expression-shaped on both parsers -
// the import sets (getIteratorMethod + the anchored ctor) must agree
await runEquivalence('anchored SE-init: deferred symbol-iterator leaf',
  'let it2;\nexport const { keys } = (({ WeakSet: { [Symbol.iterator]: it2 } } = globalThis), Object);\nexport const r = it2;', USAGE_PURE);
await runEquivalence('anchored SE-init: for-init symbol-iterator leaf',
  'let it, outS;\nfor (const { values } = (({ WeakSet: { [Symbol.iterator]: it } } = globalThis), Object); !outS;) outS = values;\nexport const r = [it, outS];', USAGE_PURE);
await runEquivalence('anchored SE-init: for-init-buried host',
  'let q8, onx, out8;\nfor (const { keys: fk } = (({ self: { ononline: onx } } = (q8 = globalThis)), Object); !out8;) out8 = fk;\nexport const r = [q8, onx, out8];', USAGE_PURE);
// full consume with an SE-bearing init: the prefix / chain write stays, the dead hop read
// drops - the import sets (no globalThis for the prefix form) must agree
await runEquivalence('anchored SE-init: deferred symbol leaf + SE prefix full consume',
  'let it3;\nexport const { keys } = (({ WeakSet: { [Symbol.iterator]: it3 } } = (eff(), globalThis)), Object);\nexport const r = it3;', USAGE_PURE);
await runEquivalence('anchored SE-init: for-init symbol leaf + chain full consume',
  'let q9, i9, o9;\nfor (const { values } = (({ Map: { [Symbol.iterator]: i9 } } = (q9 = globalThis)), Object); !o9;) o9 = values;\nexport const r = [q9, i9, o9];', USAGE_PURE);
// a DEFAULTED symbol leaf keeps the key-swap (symbol/iterator import, no getIteratorMethod)
// on both parsers, for the identifier and the pattern flavor alike
await runEquivalence('anchored symbol leaf: identifier default keeps key-swap',
  'let itD;\nexport const { entries } = (({ WeakMap: { [Symbol.iterator]: itD = null } } = globalThis), Object);\nexport const r = [itD, entries];', USAGE_PURE);
await runEquivalence('anchored symbol leaf: pattern default keeps key-swap',
  'const { Promise: { [Symbol.iterator]: { bind: bnd } = {} } } = globalThis;\nexport const r = bnd;', USAGE_PURE);
// a scope-shadowed `Symbol` keeps the user's own key verbatim (no iterator-helper import)
await runEquivalence('anchored symbol leaf: shadowed Symbol stays verbatim',
  'const Symbol = { iterator: "k" };\nconst { Map: { [Symbol.iterator]: sh } } = globalThis;\nexport const r = sh;', USAGE_PURE);
// an SE-BEARING symbol key on an anchored host keeps the key-swap (no iterator-helper
// import) for values and defaults alike
await runEquivalence('anchored symbol leaf: SE-bearing key keeps key-swap',
  'const { Set: { [(eff(), Symbol.iterator)]: e1 } } = globalThis;\nexport const r = e1;', USAGE_PURE);
await runEquivalence('anchored symbol leaf: SE-bearing key + default keeps key-swap',
  'const { WeakMap: { [(eff(), Symbol.iterator)]: e2 = null } } = globalThis;\nexport const r = e2;', USAGE_PURE);
// a verbatim computed sibling + consumed static under one anchored ctor: the static stays
// polyfill-wins on both parsers (the import sets carry the static entry)
await runEquivalence('anchored mixed: computed sibling + consumed static',
  'let av, fv;\nexport const { keys } = (({ Array: { [Symbol.asyncIterator]: av, from: fv } } = globalThis), Object);\nexport const r = [av, fv];', USAGE_PURE);
// a CONSTANT-RESOLVED computed-key Symbol alias folds the downstream well-known-symbol
// member read on both parsers (defaulted and plain consumers alike); a non-Symbol computed
// alias never folds
await runEquivalence('computed-key Symbol alias folds member read',
  'const k = "Symbol";\nconst { [k]: S } = globalThis;\nconst { iterator = fb } = S;\nexport const r = arr[iterator];', USAGE_PURE);
await runEquivalence('computed-key Symbol alias, plain consumer',
  'const k = "Symbol";\nconst { [k]: S } = globalThis;\nconst { iterator: it } = S;\nexport const r = arr[it];', USAGE_PURE);
// a provably-reassigned key (unconditional dominating write) resolves to the reaching
// value on both parsers - the target engine gets its polyfill either way
await runEquivalence('computed-key Symbol alias, dominating reassigned key',
  'let k = "Array";\nk = "Symbol";\nconst { [k]: S } = globalThis;\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
// the key evaluates at the CAPTURE: a post-capture flip to a Symbol-name must not fold
// (the captured binding holds Array), and a flip away from it must still fold - both
// parsers anchor the reaching-value analysis at the destructure, not the eventual use
await runEquivalence('computed-key alias, post-capture flip to Symbol stays raw',
  'let k = "Array";\nconst { [k]: S } = globalThis;\nk = "Symbol";\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
await runEquivalence('computed-key Symbol alias, post-capture flip away still folds',
  'let k = "Symbol";\nconst { [k]: S } = globalThis;\nk = "Array";\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
await runEquivalence('computed-key Symbol alias, write between capture and use folds',
  'let k = "Array";\nk = "Symbol";\nconst { [k]: S } = globalThis;\nk = "Array";\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
// a hoisted-closure write called before the capture may run before the read: bail on both
await runEquivalence('computed-key alias, hoisted closure key write stays raw',
  'let k = "Symbol";\nf();\nconst { [k]: S } = globalThis;\nconst { iterator: it = fb } = S;\nexport const r = arr[it];\nfunction f() { k = "Array"; }', USAGE_PURE);
// a conditionally-initialized hoisted var key holds the string on one path only - the untaken
// path captures globalThis[undefined], so the dominance gate (anchored at the capture) bails
await runEquivalence('computed-key alias, conditional var key stays raw',
  'if (c) var k = "Symbol";\nconst { [k]: S } = globalThis;\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
await runEquivalence('computed-key alias, capture before hoisted key declarator stays raw',
  'const { [k]: S } = globalThis;\nvar k = "Symbol";\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
// an assignment-form ctor alias folds its consumer chain off the verified registration hint
await runEquivalence('assignment-form Symbol alias folds consumer chain',
  'let S;\n({ Symbol: S } = globalThis);\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
// order negatives: reads captured BEFORE the aliasing write hold undefined and stay raw
await runEquivalence('consumer before aliasing write stays raw',
  'let S;\nconst { iterator: it = fb } = S;\n({ Symbol: S } = globalThis);\nexport const r = arr[it];', USAGE_PURE);
await runEquivalence('alias hop captured before aliasing write stays raw',
  'let T;\nconst S = T;\n({ Symbol: T } = globalThis);\nconst { iterator: it = fb } = S;\nexport const r = arr[it];', USAGE_PURE);
await runEquivalence('proxy hop captured before aliasing write stays raw',
  'let g;\nconst s = g;\n({ self: g } = globalThis);\nexport const r = s.Array.from(x);', USAGE_PURE);
// a for-init destructure host folds like the block twin (the estree per-iteration self-rebind
// record is the declaration, not a reassignment); an out-of-scope same-named unbound read is
// a runtime ReferenceError the name-keyed registration must not serve
await runEquivalence('for-init Symbol destructure folds its in-body consumer',
  'for (const { iterator: it = fb } = globalThis.Symbol;;) { use(arr[it]); break; }', USAGE_PURE);
await runEquivalence('out-of-scope read of a scoped Symbol alias stays raw',
  'function f() {\n  const { iterator: x = 0 } = Symbol;\n  return x;\n}\nexport const r = [][x];', USAGE_PURE);
// a fn-local alias named like the global must not mask the REAL global read outside its scope
await runEquivalence('global-named local alias does not shadow the outer global',
  'function f() {\n  const { iterator: Symbol } = globalThis.Symbol;\n  return Symbol;\n}\nexport const r = [1, 2][Symbol.iterator];', USAGE_PURE);
// a well-known-symbol VALUE alias is not a Symbol source: destructuring off it stays raw
await runEquivalence('value alias is not a Symbol source for its own destructure',
  'function f() {\n  const { iterator: Symbol } = globalThis.Symbol;\n  const { iterator: it = fb } = Symbol;\n  return arr[it];\n}\nexport const r = f();', USAGE_PURE);
// a NON-global pattern slot off the proxy surface must not classify as the proxy root
await runEquivalence('plain destructured slot is not a proxy root',
  'const { x } = globalThis;\nexport const r = x.Array.from(y);', USAGE_PURE);
await runEquivalence('proxy-named destructured slot re-enters the surface',
  'const { self: s } = globalThis;\nexport const r = s.Array.from(y);', USAGE_PURE);
// a hoisted `var` alias in a labeled block serves its whole function - the span follows the hoist
await runEquivalence('labeled-block var alias folds the post-block use',
  'labeled: {\n  var { iterator: vl } = Symbol;\n}\nexport const r = [][vl];', USAGE_PURE);
// a block-scoped ctor alias must not narrow the same-named unbound read after its block
await runEquivalence('block-scoped ctor alias does not narrow the post-block read',
  '{\n  let { Map: M3 } = globalThis;\n  use(M3.groupBy(x, f2));\n}\nexport const r = M3.groupBy(x, f2);', USAGE_PURE);
// anchor-less deferred hosts fold via the full-consume path: a ctor alias binds the pure
// ctor (no globalThis import), a rest sibling keeps the sentinel'd residual polyfill-wins
await runEquivalence('deferred ctor-alias host full consume',
  'let aM;\nexport const { values } = (({ Map: aM } = globalThis), Object);\nexport const r = [aM, values];', USAGE_PURE);
await runEquivalence('deferred static + rest sibling keeps polyfill-wins',
  'let fv2, rv2;\nexport const { entries } = (({ Promise: { allSettled: fv2, ...rv2 } } = globalThis), Object);\nexport const r = [fv2, rv2, entries];', USAGE_PURE);

finish();

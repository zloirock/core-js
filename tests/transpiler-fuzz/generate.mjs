// Transpiler-fuzz generator. Each family yields self-contained modules exporting `r` (the observed
// value) and `effects` (a side-effect log, so a receiver double-eval shows up as a duplicated
// entry). Snippets must run natively without a "boring" throw so the runtime three-way comparison
// stays high-signal. `arr`, `cond`, `nul`, `log` are bound by the prelude. Node-only: `globalThis`
// is used (never `self` / `window`, which don't exist here).
const PRELUDE = [
  'const log = [];',
  'const cond = true;',
  'const nul = null;',
  'const arr = [3, [1, 2]];',
];

function snippet(name, expr) {
  return {
    name,
    code: [...PRELUDE, `export const r = ${ expr };`, 'export const effects = log;'].join('\n'),
  };
}

// --- Combinatorial grammar ---
// the real generative core: a polyfilled call is RECEIVER (typed) . METHOD (valid for that type),
// dressed by a WRAPPER (optional / side-effect / TS cast / non-null) and dropped into a CONTEXT (the
// syntactic position - statement, parameter default, class field, ...). the cross-product explores
// combinations no one wrote by hand; `effects` stays single because every context evaluates the
// hole exactly once. each receiver/method carries a `type` so only valid pairings are emitted
const G_RECEIVERS = [
  { id: 'array-lit', src: '[3, [1, 2]]', type: 'array' },
  { id: 'array-local', src: 'arr', type: 'array' },
  { id: 'array-call', src: 'arr.slice()', type: 'array' },
  { id: 'string-lit', src: '"abcde"', type: 'string' },
  { id: 'static-array', src: 'Array', type: 'sarray' },
  { id: 'static-array-proxy', src: 'globalThis.Array', type: 'sarray' },
  { id: 'static-object', src: 'Object', type: 'sobject' },
  { id: 'static-object-proxy', src: 'globalThis.Object', type: 'sobject' },
];
const G_METHODS = [
  { id: 'flat', call: 'flat()', types: ['array'] },
  { id: 'at', call: 'at(0)', types: ['array', 'string'] },
  { id: 'includes', call: 'includes(3)', types: ['array'] },
  { id: 'flatMap', call: 'flatMap(x => [x])', types: ['array'] },
  { id: 'padStart', call: 'padStart(8, "0")', types: ['string'] },
  { id: 'from', call: 'from([1, 2])', types: ['sarray'] },
  { id: 'of', call: 'of(1, 2)', types: ['sarray'] },
  { id: 'fromEntries', call: 'fromEntries([["a", 1]])', types: ['sobject'] },
];
// each wrapper renders the full `receiver.method` so it owns both the receiver dressing and the
// call join (`.` vs `?.`); `ts: true` wrappers make the whole snippet TypeScript
const G_WRAPPERS = [
  { id: 'plain', render: (r, m) => `${ r }.${ m }`, ts: false },
  { id: 'optional', render: (r, m) => `${ r }?.${ m }`, ts: false },
  { id: 'paren-se', render: (r, m) => `(log.push("e"), ${ r }).${ m }`, ts: false },
  { id: 'cast', render: (r, m) => `(${ r } as any).${ m }`, ts: true },
  { id: 'nonnull', render: (r, m) => `(${ r })!.${ m }`, ts: true },
];
// each context is a template with a `{hole}` for the polyfilled expression, wrapping it so the value
// surfaces as `r`. `ts: true` contexts are TypeScript-only positions
const G_CONTEXTS = [
  { id: 'stmt', tpl: e => e, ts: false },
  { id: 'param-default', tpl: e => `(() => { function f(p = ${ e }) { return p; } return f(); })()`, ts: false },
  { id: 'destructure-default', tpl: e => `(() => { const [p = ${ e }] = []; return p; })()`, ts: false },
  { id: 'class-field', tpl: e => `(() => { class C { p = ${ e }; } return new C().p; })()`, ts: false },
  { id: 'ternary', tpl: e => `(true ? ${ e } : null)`, ts: false },
  { id: 'loop-body', tpl: e => `(() => { let p; for (const _ of [0]) p = ${ e }; return p; })()`, ts: false },
  { id: 'ts-param-prop', tpl: e => `(() => { class C { constructor(public p = ${ e }) {} } return new C().p; })()`, ts: true },
];

function * generateGrammar() {
  for (const ctx of G_CONTEXTS) {
    for (const recv of G_RECEIVERS) {
      for (const method of G_METHODS) {
        if (!method.types.includes(recv.type)) continue;
        for (const wrapper of G_WRAPPERS) {
          const inner = wrapper.render(recv.src, method.call);
          const name = `grammar/${ ctx.id }/${ recv.id }/${ method.id }/${ wrapper.id }`;
          yield { ...snippet(name, ctx.tpl(inner)), ts: ctx.ts || wrapper.ts };
        }
      }
    }
  }
}

// expression families (one valid + observable snippet each), weighted to fragile areas
const EXPR_FAMILIES = {
  'optional-chain': [
    'arr?.flat()',
    'arr?.flat?.()',
    'arr?.slice()?.flat()',
    'nul?.flat()',
    'nul?.flat?.()',
    '(nul ?? arr).flat()',
    '(arr?.slice()).flat()',
    '(log.push("e"), arr)?.flat()',
  ],
  chained: [
    'arr.slice().flat()',
    'arr.flat().map(x => x)',
    'arr.flatMap(x => [x]).flat()',
    'arr.slice()?.flat().at(0)',
    'arr?.slice()?.flat()?.at(-1)',
  ],
  // two polyfillable instance calls separated by optional hops - the chain-combine path, the
  // most entangled B area (babel chain-combined emit vs unplugin threaded receiver)
  'inner-poly-chain': [
    'arr.flat?.().at(0)',
    'arr?.flat?.().at(0)',
    'arr.flatMap(x => [x]).flat()',
    'arr?.slice()?.flatMap(x => [x])?.flat()',
    '[[1], [2]].flat()?.includes(1)',
    'arr.slice().flat?.().at(-1)',
    '(log.push("e"), arr).flat?.().at(0)',
  ],
  'proxy-global': [
    'globalThis.Array.from("ab")',
    'globalThis.Object.fromEntries([["a", 1]])',
    'globalThis?.Array.from([1, 2])',
    '(globalThis).Array.from([1])',
    '(log.push("e"), globalThis).Array.from([1])',
  ],
  static: [
    'Array.from("ab")',
    'Array.of(1, 2)',
    'Object.fromEntries([["a", 1]])',
    'Object.assign({}, { a: 1 })',
  ],
  'in-expr': [
    '"flat" in []',
    '"from" in Array',
    'Symbol.iterator in arr',
    '"foo" in arr',
    '(log.push("e"), "flat") in []',
  ],
  'symbol-iterator': [
    '[...arr]',
    '[...arr].length',
    'Array.from(arr[Symbol.iterator]())',
    '(() => { const it = arr[Symbol.iterator](); return it.next().value; })()',
  ],
  destructure: [
    '(() => { const { from } = Array; return typeof from; })()',
    '(() => { const [first] = arr; return first; })()',
    '(() => { const { fromEntries } = Object; return typeof fromEntries; })()',
  ],
  // receiver-SE must evaluate BEFORE argument-SE (native order); the log records the sequence so
  // a reorder shows as ['a','r'] instead of ['r','a']
  'se-ordering': [
    '(log.push("r"), arr).includes((log.push("a"), 3))',
    '(log.push("r"), arr).at((log.push("a"), 0))',
    '(log.push("r"), arr).flat((log.push("a"), 1))',
    'arr.includes((log.push("a"), 3))',
    '(log.push("r"), arr)?.includes((log.push("a"), 3))',
  ],
  'nested-se': [
    '((log.push("a"), log.push("b")), arr).flat()',
    '(log.push("a"), (log.push("b"), arr)).flat()',
    '(log.push("a"), arr).slice().flat()',
  ],
  'computed-symbol': [
    'arr[Symbol.iterator]?.().next().value',
    'arr[Symbol["iterator"]]().next().value',
    'arr[Symbol[(log.push("k"), "iterator")]]().next().value',
    'Symbol["iterator"] in arr',
  ],
  'deep-proxy': [
    'globalThis.globalThis.Array.from([1, 2])',
    'globalThis?.Array?.from?.([1, 2])',
    'globalThis["Array"].from([1, 2])',
    '(globalThis ?? {}).Array.from([1, 2])',
    'globalThis.Array.from(globalThis.Array.of(1, 2))',
  ],
  'destructure-edge': [
    '(() => { const { from = null } = Array; return typeof from; })()',
    '(() => { const { nope = (log.push("d"), 5) } = Array; return nope; })()',
    '(() => { const { ["from"]: f } = Array; return typeof f; })()',
    '(() => { const { [(log.push("k"), "from")]: f } = Array; return typeof f; })()',
  ],
  // side-effecting computed destructure key across different patterns - all must preserve the
  // effect (run once) and not crash. each is the shape that the static rewrite bails on
  'destructure-se-key': [
    '(() => { const { [(log.push("e"), "from")]: f } = Array; return [typeof f, log.length]; })()',
    '(() => { const { [(log.push("e"), "from")]: f } = globalThis.Array; return [typeof f, log.length]; })()',
    '(() => { const { x: { [(log.push("e"), "from")]: f } } = { x: Array }; return [typeof f, log.length]; })()',
    '(() => { const g = ({ [(log.push("e"), "from")]: f } = Array) => typeof f; return [g(), log.length]; })()',
    '(() => { const { [(log.push("e"), "fromEntries")]: f } = Object; return [typeof f, log.length]; })()',
  ],
  // side effect in a computed MEMBER key (`recv[(eff(), "method")](args)`) - here the SE IS
  // captured (member-access has an effects channel), so it must survive in BOTH emitters
  'member-se-key': [
    '[1, [2]][(log.push("e"), "flat")]()',
    'Array[(log.push("e"), "from")]([1, 2])',
    '[3, 1, 2][(log.push("e"), "at")](0)',
    'Object[(log.push("e"), "fromEntries")]([["a", 1]])',
  ],
  // string receivers exercise the String Maybe-variant path (distinct from Array)
  'string-receiver': [
    '"abc".at(0)',
    '"a-b-c".replaceAll("-", "_")',
    '"5".padStart(3, "0")',
    '"abcd".at(-1)',
    '"hello".includes("ell")',
  ],
  // `new` constructor polyfills (Set / Map / WeakSet) - distinct emit from call/member
  'new-expr': [
    'new Set([1, 2, 1]).size',
    '[...new Set([3, 1, 2])]',
    '[...new Map([["a", 1]])]',
    'new WeakSet().has({})',
  ],
  'static-more': [
    'Object.hasOwn({ a: 1 }, "a")',
    'Object.groupBy([1, 2, 3, 4], x => (x % 2 ? "odd" : "even"))',
    'Array.of(1, 2, 3)',
    'structuredClone([1, [2]])',
    'Math.trunc(4.7)',
  ],
  // async statics resolved via top-level await in the snippet module
  'async-static': [
    'await Promise.all([1, 2])',
    'await Promise.allSettled([1, 2]).then(a => a.map(x => x.value))',
    'await Promise.any([Promise.resolve(5)])',
  ],
  // global referenced as a VALUE (not called) - the reference itself is rewritten to the import
  'global-value': [
    'typeof Map',
    'typeof structuredClone',
    '(() => { const M = Set; return new M([1, 2, 1]).size; })()',
  ],
  // iterator helpers: `.map`/`.filter`/`.take` on an Iterator (NOT Array) - exercises return-type
  // inference (`.values()` -> Iterator) to decide the receiver is polyfillable
  'iterator-helper': [
    '[...[1, 2, 3].values().map(x => x * 2)]',
    '[1, 2, 3, 4].values().filter(x => x % 2 === 0).toArray()',
    '[1, 2, 3].values().take(2).toArray()',
    '[1, 2, 3].values().drop(1).toArray()',
  ],
  // optional + computed + SE intersections (where the most fragile composition lives)
  'optional-mixed': [
    'arr?.["flat"]?.()',
    'arr?.slice()?.at?.(0)',
    '(log.push("e"), arr)?.["flat"]?.()',
    'nul?.["flat"]?.()',
  ],
  // newer Array instance methods - distinct polyfill entries + Maybe-variant shapes
  'array-new-methods': [
    '[3, 1, 2].toSorted()',
    '[1, 2, 3].toReversed()',
    '[1, 2, 3].with(0, 9)',
    '[1, 2, 3].findLast(x => x < 3)',
  ],
  // Set methods (esnext) - observed order-independently so the documented order choice is moot
  'collection-methods': [
    '[...new Set([1, 2]).union(new Set([2, 3]))].sort()',
    '[...new Set([1, 2, 3]).intersection(new Set([2, 3]))].sort()',
    '[...new Set([1, 2, 3]).difference(new Set([2]))].sort()',
  ],
  'number-math-static': [
    'Number.isInteger(5)',
    'Number.parseInt("42px", 10)',
    'Math.clz32(1)',
    'Math.hypot(3, 4)',
  ],
  // regex instance methods - matchAll spreads an iterator, replaceAll takes a global regex
  'regex-methods': [
    '[..."a1b2".matchAll(/\\d/g)].map(m => m[0])',
    '"a-b-c".replaceAll(/-/g, "_")',
  ],
  // minifier-style sequences: multiple polyfills packed into one comma / var-declarator list
  'minifier-sequence': [
    '(log.push("a"), [1, [2]].flat(), arr.at(-1))',
    '(() => { let a = [1, 2].flat(), b = [3, 4].at(0); return [a, b]; })()',
    '(() => { let x; x = "ab".at(0), x += [1].flat()[0]; return x; })()',
  ],
  // class contexts: method body, static method, field initializer
  'class-context': [
    '(() => { class C { m() { return [1, [2]].flat(); } } return new C().m(); })()',
    '(() => { class C { static s() { return Array.from([1, 2]); } } return C.s(); })()',
    '(() => { class C { f = [3, 1, 2].at(0); } return new C().f; })()',
  ],
  // default params (synth-swap area): polyfill in a default, and the static-destructure default
  'default-param': [
    '(() => { function f(x = [1, 2].flat()) { return x; } return f(); })()',
    '(() => { const f = (a = "x".at(0)) => a; return f(); })()',
    '(() => { function f({ of } = Array) { return typeof of; } return f(); })()',
  ],
  // computed key that is dynamic (ternary / concat) - resolved by folding, else bailed
  'dynamic-key': [
    'arr[cond ? "flat" : "at"]()',
    'arr[("fl" + "at")]()',
    'arr[("a" + "t")](0)',
  ],
  // spread into a polyfilled call's arguments
  'spread-args': [
    'Array.of(...[1, 2, 3])',
    '[1, 2].flat(...[1])',
    '"abc".at(...[0])',
  ],
  // polyfill on the RHS of a logical/nullish assignment (short-circuit + assignment target)
  'logical-assignment': [
    '(() => { let a; a ??= [1, [2]].flat(); return a; })()',
    '(() => { let a = 0; a ||= Array.from([1, 2]); return a; })()',
    '(() => { let a = 1; a &&= [3, 1, 2].at(0); return a; })()',
    '(() => { const o = {}; o.x ??= "ab".at(0); return o.x; })()',
  ],
  // polyfill sitting in a value position: object / array literal, ternary branch
  'literal-context': [
    '({ a: [1, [2]].flat(), b: Array.from([3]) })',
    '[[1].flat()[0], "x".at(0)]',
    '(cond ? [1, [2]].flat() : [3].at(0))',
  ],
  // polyfill inside control-flow statements (try / catch / labeled loop / switch)
  'control-flow': [
    '(() => { try { return [1, [2]].flat(); } finally { } })()',
    '(() => { try { null.x; } catch { return [3, 1, 2].at(0); } })()',
    '(() => { let r; outer: for (let i = 0; i < 1; i++) { r = [1, 2].flat(); break outer; } return r; })()',
    '(() => { let r; switch (1) { case 1: r = "ab".at(1); } return r; })()',
  ],
  'generator-yield': [
    '(() => { function* g() { yield* [1, [2]].flat(); } return [...g()]; })()',
    '(() => { function* g() { yield [1].flat()[0]; } return [...g()]; })()',
  ],
  // polyfill in a destructure DEFAULT (scoping-sensitive, like a parameter default)
  'destructure-default': [
    '(() => { const [a = [1, [2]].flat()] = []; return a; })()',
    '(() => { const { x = Array.from([1, 2]) } = {}; return x; })()',
    '(() => { const [a = "ab".at(0)] = [undefined]; return a; })()',
    '(() => { const { y = [3, 1].at(0) } = { y: undefined }; return y; })()',
  ],
  // polyfill in loop contexts: for-of iterable, while/do condition, for-of body
  'loop-context': [
    '(() => { const out = []; for (const x of [1, [2]].flat()) out.push(x); return out; })()',
    '(() => { let n = 0; while ([1, 2, 3].at(n) !== undefined && n < 2) n++; return n; })()',
    '(() => { let r; do { r = [9, 8].at(0); } while (false); return r; })()',
    '(() => { const out = []; for (const x of arr) out.push([x].flat()[0]); return out.length; })()',
  ],
  // polyfill nested inside a callback (a fresh function scope)
  'callback-arg': [
    '[[1], [2, 3]].map(a => a.at(0))',
    '[1, 2, 3].filter(x => [x].flat().length > 0)',
  ],
  // polyfill result spread into an array / object literal
  'spread-literal': [
    '[...[1, [2]].flat(), 9]',
    '[...Array.from([1, 2]), 3]',
    '({ ...Object.fromEntries([["a", 1]]), b: 2 })',
  ],
  // polyfill inside a getter body (object literal + class)
  'accessor-context': [
    '(() => { const o = { get v() { return [1, [2]].flat(); } }; return o.v; })()',
    '(() => { class C { get v() { return [3, 1].at(0); } } return new C().v; })()',
  ],
  // polyfill in a for-loop init / condition clause (header-position memo)
  'for-clause': [
    '(() => { let s = 0; for (let i = [1, 2].at(0); i <= 2; i++) s += i; return s; })()',
    '(() => { const out = []; for (let i = 0; i < [1, 2].flat().length; i++) out.push(i); return out; })()',
  ],
  // polyfill in a catch binding / finally block
  'try-catch-binding': [
    '(() => { try { throw [1, [2]]; } catch (e) { return e.flat(); } })()',
    '(() => { let r; try { r = 1; } finally { r = [3, 1].at(0); } return r; })()',
  ],
  // polyfill inside a labeled (non-loop) block
  'labeled-block': [
    '(() => { let r; block: { r = [1, [2]].flat(); break block; } return r; })()',
  ],
  // polyfill result passed to a constructor
  'new-args': [
    'new Set([1, 2].flat()).size',
    '[...new Set(Array.from([1, 1, 2]))].sort()',
  ],
  // sparse-array receiver and a receiver reached through coercion (`.toString()` -> String)
  'sparse-and-coerce': [
    '[1, , 3].flat()',
    '(5).toString().at(0)',
    '"5".repeat(2).at(0)',
  ],
  // polyfill behind a short-circuit operator (only the taken branch runs)
  'short-circuit': [
    '(false || [1, [2]].flat())',
    '(true && "x".at(0))',
    '(nul ?? Array.from([1, 2]))',
  ],
  // polyfill as a unary operand (typeof / void / negation)
  'unary-operand': [
    '(typeof [1, 2].flat())',
    '(void "x".at(0))',
    '(-[1].flat().length)',
  ],
  // polyfill in a class static block / private field
  'class-private-static': [
    '(() => { class C { static v; static { C.v = [1, [2]].flat(); } } return C.v; })()',
    '(() => { class C { #x = [1, [2]].flat(); get() { return this.#x; } } return new C().get(); })()',
  ],
  // polyfill in a NESTED destructure default (default-of-a-default)
  'nested-destructure-default': [
    '(() => { const { a: { b = [1, [2]].flat() } = {} } = {}; return b; })()',
  ],
  // polyfill off a call result (JSON.parse -> array)
  'call-result-chain': [
    'JSON.parse("[1, [2]]").flat()',
  ],
  // polyfill inside async iteration: async generator + for-await, and an async callback
  'async-iter': [
    'await (async () => { async function* g() { yield* [1, [2]].flat(); } const out = []; for await (const x of g()) out.push(x); return out; })()',
    'await Promise.all([[1], [2, 3]].map(async a => a.at(0)))',
  ],
  // polyfill inside a tagged template / template-literal interpolation
  /* eslint-disable no-template-curly-in-string -- snippets carry template-literal SOURCE as a string */
  'tagged-template': [
    'String.raw`a${[1].flat()[0]}b`',
    '`${[1, 2].flat().length}`',
  ],
  /* eslint-enable no-template-curly-in-string -- restore the rule after the tagged-template family */
  // polyfill as a computed property key / computed method name
  'computed-member-name': [
    '({ [[1].at(0)]: "v" })',
    '(() => { class C { [["m"].at(0)]() { return [1, [2]].flat(); } } return new C().m(); })()',
  ],
  // BigInt-valued receiver elements flowing through the polyfill (serialization edge)
  'bigint-receiver': [
    '[1n, 2n, 3n].at(1)',
    '[10n, 20n].flat()',
  ],
  // polyfill in an object param-default, and a polyfill on a rest-destructure binding
  'param-object-rest': [
    '(() => { function f({ x } = { x: [1, [2]].flat() }) { return x; } return f(); })()',
    '(() => { const [, ...rest] = [1, 2, 3]; return rest.at(0); })()',
  ],
  // polyfill in a switch discriminant, a for-in body, and a setter body
  'misc-statement-context': [
    '(() => { switch ([1, 2].at(1)) { case 2: return "two"; default: return "?"; } })()',
    '(() => { const out = []; for (const k in { a: 1, b: 2 }) out.push([k].at(0)); return out; })()',
    '(() => { const o = { set v(x) { this._ = [x, [x]].flat(); }, _: null }; o.v = 1; return o._; })()',
  ],
};

// TypeScript inputs - exercise TS-wrapper handling (cast / non-null / satisfies / type-args), where
// babel (path-based) and oxc (node-based) diverge most. yielded with `ts: true`; the runner
// transforms them as `.ts` and strips TS before the runtime comparison
const TS_FAMILIES = {
  'ts-wrapper': [
    '(arr as number[]).flat()',
    'arr!.flat()',
    '(arr satisfies number[]).flat()',
    '(arr as any)?.flat?.()',
    '(log.push("e"), arr as number[]).flat()',
    'arr[("flat" as string)]()',
    '[1, 2].flat!()',
    'Array.from<number>([1, 2])',
    '(arr as number[])[("at" as string)](0)',
  ],
  // the destructure-SE-key bug-class WITH a TS cast on the key / receiver
  'ts-destructure': [
    '(() => { const { [(log.push("e") as any, "from")]: f } = Array; return [typeof f, log.length]; })()',
    '(() => { const { from } = (Array as typeof Array); return typeof from; })()',
    '(() => { const { [("from" as string)]: f } = Array; return typeof f; })()',
  ],
  'ts-generic-cast': [
    'new Map<string, number>([["a", 1]]).size',
    '(globalThis as any).Array.from([1, 2])',
    'Array.from<number>([1, 2]).at(0)',
    '([1, 2] as number[]).at!(-1)',
  ],
  // TS runtime constructs - enum / namespace have real runtime emit; `enum Map` shadows the global
  // and must NOT be polyfilled as the constructor
  'ts-runtime-construct': [
    '(() => { enum E { A = 1, B = 2 } return [E.A, [E.B]].flat(); })()',
    '(() => { enum Map { A } return typeof Map.A; })()',
    '(() => { namespace N { export const v = [3, [1]]; } return N.v.flat?.(); })()',
    '(() => { const enum E { A = 5 } return [E.A, 1].flat?.(); })()',
  ],
  // cast forms: `as const`, angle-bracket cast (`<T>x`, valid in .ts not .tsx)
  'ts-cast-forms': [
    '([1, 2] as const).at(0)',
    '("abc" as const).at(0)',
    '(<number[]>arr).flat()',
  ],
  // polyfill in a TS parameter-property default: the memoize ref must hoist ABOVE the class, not into
  // the constructor body (a body var is invisible to the param default, which evaluates in the param
  // scope). cover the modifiers, multiple params, and a chained (nested-memoize) default
  'ts-param-property': [
    '(() => { class C { constructor(public x = [1, [2]].flat()) {} } return new C().x; })()',
    '(() => { class C { constructor(readonly x = [3, 1, 2].at(0)) {} } return new C().x; })()',
    '(() => { class C { constructor(private x = [5, 6].at(-1)) { this.y = x; } } return new C().y; })()',
    '(() => { class C { constructor(public a = [1].flat(), public b = [3, 1].at(0)) {} } return [new C().a, new C().b]; })()',
    '(() => { class C { constructor(public x = [1, [2]].flat().at(0)) {} } return new C().x; })()',
  ],
  'ts-nonnull-chain': [
    'arr!.flat!().at!(0)',
    '(arr as number[])!.flat()',
  ],
  // polyfill in a TS destructure default (default + cast / non-null / type-arg)
  'ts-destructure-default': [
    '(() => { const [a = ([1, [2]] as number[][]).flat()] = []; return a; })()',
    '(() => { const { x = Array.from<number>([1, 2]) } = {}; return x; })()',
    '(() => { const [a = "ab".at!(0)] = [undefined]; return a; })()',
  ],
  // optional / generic-constrained / typed params carrying a polyfill
  'ts-param-shapes': [
    '(() => { function f(x?: number[]) { return x?.flat?.() ?? []; } return f([1, [2]]); })()',
    '(() => { function f<T extends unknown[]>(x: T) { return x.at?.(0); } return f([3, 1, 2]); })()',
    '(() => { function f(x: number[] = [1, 2].flat()) { return x; } return f(); })()',
  ],
  'ts-satisfies-misc': [
    '([1, 2] satisfies number[]).at(0)',
    '(arr satisfies unknown[]).flat()',
  ],
  // string enum (runtime emit) and an abstract class whose concrete subclass runs the polyfill
  'ts-enum-abstract': [
    '(() => { enum E { A = "x", B = "y" } return [E.A, E.B].at(0); })()',
    '(() => { abstract class A { m() { return [1, [2]].flat(); } } class B extends A {} return new B().m(); })()',
  ],
  // readonly-array and tuple type assertions on a polyfilled receiver
  'ts-readonly-tuple': [
    '(arr as readonly number[]).at(0)',
    '([1, 2] as [number, number]).at(0)',
  ],
  // definite-assignment (`let x!: T`) and a user type-guard gating the polyfill
  'ts-definite-guard': [
    '(() => { let x!: number[]; x = [1, [2]]; return x.flat(); })()',
    '(() => { function isArr(v: unknown): v is number[] { return Array.isArray(v); } return isArr(arr) ? arr.flat() : []; })()',
  ],
  // cast on a call result, overloaded function impl, class implementing an interface
  'ts-call-cast': [
    '(Array.from([1, [2]]) as number[][]).flat()',
  ],
  'ts-overload': [
    '(() => { function f(x: number): number[]; function f(x) { return [x, [x]].flat(); } return f(1); })()',
  ],
  'ts-implements': [
    '(() => { interface I { m(): number[]; } class C implements I { m() { return [1, [2]].flat(); } } return new C().m(); })()',
  ],
  // async arrow with a typed param default + return type, and an async fn with a typed local
  'ts-async': [
    'await (async (x: number[] = [1, 2].flat()): Promise<number[]> => x)()',
    'await (async () => { const xs: number[] = [1, [2]].flat(); return xs; })()',
  ],
  // cast inside an array spread, and a `typeof` type annotation on a polyfilled binding
  'ts-spread-typeof': [
    '[...(arr as number[])].at(0)',
    '(() => { const x: typeof arr = [1, [2]]; return x.flat(); })()',
  ],
  // TS cast in a switch discriminant, and an enum member as a computed key with a polyfilled value
  'ts-misc-context': [
    '(() => { switch ((arr as number[]).at(0)) { case 3: return "x"; default: return "?"; } })()',
    '(() => { enum E { A } const o = { [E.A]: [1, [2]].flat() }; return o[E.A]; })()',
  ],
  // legacy decorators on class / method / field / accessor, polyfill in the decorated member
  'ts-decorator': [
    '(() => { function dec(c) { return c; } @dec class C { m() { return [1, [2]].flat(); } } return new C().m(); })()',
    '(() => { function log(t, k, d) { return d; } class C { @log m() { return [3, 1, 2].at(0); } } return new C().m(); })()',
    '(() => { function obs(t, k) {} class C { @obs x = [1, [2]].flat(); } return new C().x; })()',
    '(() => { function dec(t, k, d) { return d; } class C { @dec get v() { return [3, 1].at(0); } } return new C().v; })()',
  ],
  // polyfill in distinct decorator positions: a decorator-factory argument, a parameter decorator
  // combined with a parameter-property default (re-tests the param-default ref scope under decoration)
  'ts-decorator-position': [
    '(() => { function validate(v) { return function(c) { c.tag = v; return c; }; } @validate([1, 2].at(1)) class C {} return C.tag; })()',
    '(() => { function inject() { return function(t, k, i) {}; } class C { constructor(@inject() public x = [1, [2]].flat()) {} } return new C().x; })()',
  ],
};

export function * generate() {
  yield * generateGrammar();
  for (const [family, exprs] of Object.entries(EXPR_FAMILIES)) {
    for (const expr of exprs) yield snippet(`${ family }: ${ expr }`, expr);
  }
  for (const [family, exprs] of Object.entries(TS_FAMILIES)) {
    for (const expr of exprs) yield { ...snippet(`${ family }: ${ expr }`, expr), ts: true };
  }
}

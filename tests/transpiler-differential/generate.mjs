// Transpiler-differential generator. Each family yields self-contained modules exporting `r` (the observed
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
  // a STATIC-call result whose return type narrows to Array (KNOWN_STATIC_METHOD_RETURN_TYPES) - distinct
  // resolver path from the instance-call result above; the `from` static AND the chained instance method
  // both inject, so import parity + the cast/optional/context cross all exercise the return-narrow surface
  { id: 'static-call', src: 'Array.from([3, [1, 2]])', type: 'array' },
  { id: 'string-lit', src: '"abcde"', type: 'string' },
  { id: 'static-array', src: 'Array', type: 'sarray' },
  { id: 'static-array-proxy', src: 'globalThis.Array', type: 'sarray' },
  { id: 'static-object', src: 'Object', type: 'sobject' },
  { id: 'static-object-proxy', src: 'globalThis.Object', type: 'sobject' },
  { id: 'static-number', src: 'Number', type: 'snumber' },
  { id: 'static-number-proxy', src: 'globalThis.Number', type: 'snumber' },
];
// `strip: false` marks a method whose target builtin is NOT in strip-builtins.mjs (Number statics):
// the stripped oracle would be vacuous (native still present), so it stays full-env only. the 3-way
// (native == babel == unplugin) + import parity still cover its resolution
const G_METHODS = [
  { id: 'flat', call: 'flat()', types: ['array'] },
  { id: 'at', call: 'at(0)', types: ['array', 'string'] },
  { id: 'includes', call: 'includes(3)', types: ['array'] },
  { id: 'flatMap', call: 'flatMap(x => [x])', types: ['array'] },
  { id: 'findLast', call: 'findLast(x => x === 3)', types: ['array'] },
  { id: 'findLastIndex', call: 'findLastIndex(x => x === 3)', types: ['array'] },
  { id: 'toReversed', call: 'toReversed()', types: ['array'] },
  { id: 'toSorted', call: 'toSorted()', types: ['array'] },
  { id: 'toSpliced', call: 'toSpliced(0, 1)', types: ['array'] },
  { id: 'with', call: 'with(0, 9)', types: ['array'] },
  { id: 'padStart', call: 'padStart(8, "0")', types: ['string'] },
  { id: 'padEnd', call: 'padEnd(8, "0")', types: ['string'] },
  { id: 'trimStart', call: 'trimStart()', types: ['string'] },
  { id: 'trimEnd', call: 'trimEnd()', types: ['string'] },
  { id: 'replaceAll', call: 'replaceAll("a", "z")', types: ['string'] },
  { id: 'from', call: 'from([1, 2])', types: ['sarray'] },
  { id: 'of', call: 'of(1, 2)', types: ['sarray'] },
  { id: 'fromEntries', call: 'fromEntries([["a", 1]])', types: ['sobject'] },
  { id: 'hasOwn', call: 'hasOwn({ a: 1 }, "a")', types: ['sobject'] },
  { id: 'isInteger', call: 'isInteger(3)', types: ['snumber'], strip: false },
  { id: 'isFinite', call: 'isFinite(3)', types: ['snumber'], strip: false },
  { id: 'isSafeInteger', call: 'isSafeInteger(3)', types: ['snumber'], strip: false },
  { id: 'isNaN', call: 'isNaN(3)', types: ['snumber'], strip: false },
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
          // grammar receivers are typed + provable -> the plugin MUST inject every polyfillable
          // call, so the builtin-stripped oracle applies (a leftover native call = a real missed
          // injection). hand-written EXPR_FAMILIES include deliberate bail cases (unprovable
          // receivers) where a native call legitimately survives, so they stay full-env only
          yield { ...snippet(name, ctx.tpl(inner)), ts: ctx.ts || wrapper.ts, strip: method.strip !== false };
        }
      }
    }
  }
}

// --- Destructure grammar ---
// the generative core for the destructure family: an extraction PATTERN off a provable receiver,
// dropped into a binding HOST (declaration / param-default / assignment). replaces hand-adding
// single destructure examples - the cross-product covers shorthand / alias / multi / rest / nested
// proxy-hop / side-effect-key uniformly. each pattern OBSERVES an injected binding (`typeof from`)
// so the stripped-realm oracle stays valid (the observable never reads a native that wasn't replaced).
// `strip` is pattern.strip && host.strip: only declaration hosts off a guaranteed-injected pattern
// qualify; param-default (synth-swap may bail) and assignment hosts stay full-env only
const D_PATTERNS = [
  { id: 'shorthand', recv: 'Array', lhs: '{ from }', names: ['from'], observe: 'typeof from', strip: true },
  { id: 'alias', recv: 'Array', lhs: '{ from: f }', names: ['f'], observe: 'typeof f', strip: true },
  { id: 'multi', recv: 'Array', lhs: '{ from, of }', names: ['from', 'of'], observe: '[typeof from, typeof of]', strip: true },
  { id: 'rest', recv: 'Array', lhs: '{ from, ...rest }', names: ['from', 'rest'], observe: 'typeof from', strip: true },
  { id: 'object', recv: 'Object', lhs: '{ fromEntries }', names: ['fromEntries'], observe: 'typeof fromEntries', strip: true },
  { id: 'nested-proxy', recv: 'globalThis', lhs: '{ Array: { from } }', names: ['from'], observe: 'typeof from', strip: true },
  { id: 'nested-proxy-multi', recv: 'globalThis', lhs: '{ Array: { from, of } }', names: ['from', 'of'], observe: '[typeof from, typeof of]', strip: true },
  { id: 'se-key', recv: 'Array', lhs: '{ [(log.push("k"), "from")]: f }', names: ['f'], observe: 'typeof f', strip: true },
  // nested INSTANCE-method destructure (`{ y: { flat: m } } = { y: <recv> }`) - the body-extract path
  // distinct from the static / proxy-hop patterns above. a SOLE binding off a side-effect-free receiver
  // drops the dead residual entirely (`const m = _flat(<recv>)`); a SIBLING binding keeps the residual and
  // memoizes a constant-literal receiver into one `_ref`. `m` is the polyfilled method, so `typeof m` is
  // `function` on every realm once injected (stripped oracle valid). the sibling form's `a: log.push("e")`
  // pins side-effect-once: a memoize that re-ran the receiver, or a dropped sibling, shows in `effects`
  { id: 'nested-instance-lit', recv: '{ y: [3, [1, 2]] }', lhs: '{ y: { flat: m } }', names: ['m'], observe: 'typeof m', strip: true },
  { id: 'nested-instance-ident', recv: '{ y: arr }', lhs: '{ y: { flat: m } }', names: ['m'], observe: 'typeof m', strip: true },
  { id: 'nested-instance-sibling', recv: '{ a: log.push("e"), y: [3, [1, 2]] }', lhs: '{ a, y: { flat: m } }', names: ['a', 'm'], observe: '[a, typeof m]', strip: true },
];
const D_HOSTS = [
  { id: 'decl', strip: true, build: p => `(() => { const ${ p.lhs } = ${ p.recv }; return ${ p.observe }; })()` },
  { id: 'param-default', strip: false, build: p => `(() => { function g(${ p.lhs } = ${ p.recv }) { return ${ p.observe }; } return g(); })()` },
  { id: 'assign', strip: false, build: p => `(() => { let ${ p.names.join(', ') }; (${ p.lhs } = ${ p.recv }); return ${ p.observe }; })()` },
];

function * generateDestructure() {
  for (const host of D_HOSTS) {
    for (const pat of D_PATTERNS) {
      const name = `destructure-grammar/${ host.id }/${ pat.id }`;
      yield { ...snippet(name, host.build(pat)), strip: host.strip && pat.strip };
    }
  }
}

// --- Proxy-global full-consume from a side-effecting receiver ---
// a full-consume proxy-global destructure (every binding resolves to a proxy-global static /
// constructor) off a receiver wrapped in a side-effecting SequenceExpression. the emitter drops the
// dead receiver value but lifts the SE prefix; the dropped proxy-global root must NOT orphan a
// `globalThis -> _globalThis` rewrite inside the statement overwrite (an unplugin text-composition
// crash that aborts the whole file) nor leak a now-dead import. flat + nested-hop patterns across
// declaration and assignment hosts; the prefix's `log.push` pins the effect so a dropped / doubled
// SE shows in `effects`. for-init keeps the tail in a sink declarator (static-fixture territory).
// declaration host is stripped-valid (every binding is an injected polyfill); assignment host stays
// full-env like the other assignment-host destructure families
const PGS_PATTERNS = [
  { id: 'flat-single', lhs: '{ Map }', names: ['Map'], observe: 'typeof Map' },
  { id: 'flat-multi', lhs: '{ Map, Set }', names: ['Map', 'Set'], observe: '[typeof Map, typeof Set]' },
  { id: 'nested-hop', lhs: '{ Array: { from } }', names: ['from'], observe: 'typeof from' },
];
const PGS_HOSTS = [
  { id: 'decl', strip: true, build: p => `(() => { const ${ p.lhs } = (log.push("r"), globalThis); return ${ p.observe }; })()` },
  { id: 'assign', strip: false, build: p => `(() => { let ${ p.names.join(', ') }; (${ p.lhs } = (log.push("r"), globalThis)); return ${ p.observe }; })()` },
];

function * generateProxyGlobalSEReceiver() {
  for (const host of PGS_HOSTS) {
    for (const pat of PGS_PATTERNS) {
      const name = `proxy-global-se-receiver/${ host.id }/${ pat.id }`;
      yield { ...snippet(name, host.build(pat)), strip: host.strip };
    }
  }
}

// --- Conditional-receiver destructure mirror grammar ---
// the receiver is a runtime-selected ternary / `&&` / `||` carrying a global-PROXY operand beside a
// USER-object (or short-circuit) operand. each snippet exercises BOTH runtime selections; the bug
// classes surface in the three-way (native == babel == unplugin):
//   - MIRRORABLE pattern (single / multi key): the proxy operand becomes a synth literal binding the
//     polyfill, the user branch stays native. forcing the polyfill onto the user branch is a VALUE
//     divergence (the user branch returns a sentinel a real Array.from never produces); dropping a
//     `&&` short-circuit is a THROW divergence. stripped-valid (the polyfill is an imported binding)
//   - a RESOLVABLE computed key (string literal / const binding) mirrors exactly like a static key:
//     the synth literal carries the resolved key, so it joins the mirrorable set above
//   - UN-MIRRORABLE pattern (rest) on a shape WITH a user branch (ternary / `||`): the synth literal
//     can't carry the unknown rest keys, so the receiver stays NATIVE (an inline default would
//     corrupt the user branch's legitimate `undefined`). the user branch here LACKS the static, and
//     the observe is `typeof from` - a default-synth that wrongly fires the polyfill on that branch
//     reads `function` instead of native `undefined`, caught full-env (the proxy branch is native
//     too, so full-env only)
//   - UN-MIRRORABLE pattern on `&&` (proxy-only value): the sound inline default fires only when the
//     global static is absent, so it stays stripped-valid
const CM_USER = '{ Array: { from: () => "U", of: () => "U" } }';
const CM_USER_NOSTATIC = '{ Array: {} }';
const CM_PATTERNS = [
  { id: 'single', lhs: '{ Array: { from } }', obs: 'String(from([1, 2]))', mirror: true },
  { id: 'multi', lhs: '{ Array: { from, of } }', obs: 'String(from([1])) + "/" + String(of(9))', mirror: true },
  { id: 'rest', lhs: '{ Array: { from, ...rest } }', obs: 'String(from([1, 2]))', mirror: false },
  { id: 'computed', lhs: '{ Array: { ["from"]: from } }', obs: 'String(from([1, 2]))', mirror: true },
];
const CM_SHAPES = [
  { id: 'ternary', recv: 'sel ? globalThis : U', sels: ['true', 'false'], hasUser: true },
  { id: 'logical-or', recv: 'sel || globalThis', sels: ['U', '0'], hasUser: true },
  { id: 'logical-and', recv: 'sel && globalThis', sels: ['1', '0'], hasUser: false },
];

function * generateConditionalMirror() {
  for (const shape of CM_SHAPES) {
    for (const pat of CM_PATTERNS) {
      const bails = !pat.mirror && shape.hasUser;
      const user = bails ? CM_USER_NOSTATIC : CM_USER;
      const obs = bails ? 'typeof from' : pat.obs;
      const pick = `sel => { try { const ${ pat.lhs } = ${ shape.recv }; return ${ obs }; } catch { return "THROW"; } }`;
      const body = `(() => { const U = ${ user }; const pick = ${ pick }; return [pick(${ shape.sels[0] }), pick(${ shape.sels[1] })]; })()`;
      yield { ...snippet(`conditional-mirror/${ shape.id }/${ pat.id }`, body), strip: !bails };
    }
  }
}

// --- Chain grammar (MULTI-hop; single calls are generateGrammar's job) ---
// the generative core for the optional-chain / chained / inner-poly-chain families: a RECEIVER
// followed by 2-3 HOPS, under an OPTIONALITY pattern. this is the most entangled area (babel
// chain-combined AST emit vs unplugin threaded-receiver text), so the cross-product of receiver x
// hop-shape x optionality is high-signal for the runtime three-way (native == babel == unplugin),
// including short-circuit (null receiver) and side-effect-once (`se` receiver). full-env only - a
// chain mixes optional / native / poly hops, so a stripped-realm native call can survive benignly.
// each receiver carries a `type` (mirrors the main grammar) so only type-valid chains are emitted.
// `null` is type-agnostic: it short-circuits before any hop, so it pairs with chains of any type
const C_RECEIVERS = [
  { id: 'live', src: 'arr', type: 'array' },
  { id: 'lit', src: '[3, [1, 2]]', type: 'array' },
  { id: 'null', src: 'nul', type: null },
  { id: 'se', src: '(log.push("e"), arr)', type: 'array' },
  // static-call result feeding a multi-hop instance chain (return-narrow -> chained dispatch + receiver-memo)
  { id: 'static-call', src: 'Array.from([3, [1, 2]])', type: 'array' },
  { id: 'str-lit', src: '"abcde"', type: 'string' },
  { id: 'str-se', src: '(log.push("e"), "abcde")', type: 'string' },
];
// hop: { n: method, a: args, poly }. only a poly (polyfilled-instance) hop takes call-optional `?.()`.
// `type` gates the chain to a receiver type; a non-poly hop is a native method valid on that type
const C_CHAINS = [
  { id: 'flat-at', type: 'array', hops: [{ n: 'flat', a: '', poly: true }, { n: 'at', a: '0', poly: true }] },
  { id: 'slice-flat', type: 'array', hops: [{ n: 'slice', a: '' }, { n: 'flat', a: '', poly: true }] },
  { id: 'flatMap-flat', type: 'array', hops: [{ n: 'flatMap', a: 'x => [x]', poly: true }, { n: 'flat', a: '', poly: true }] },
  { id: 'flat-map', type: 'array', hops: [{ n: 'flat', a: '', poly: true }, { n: 'map', a: 'x => x' }] },
  { id: 'slice-flat-at', type: 'array', hops: [{ n: 'slice', a: '' }, { n: 'flat', a: '', poly: true }, { n: 'at', a: '0', poly: true }] },
  // string-method chains (the receiver-memo + optional-deopt path on a non-array type)
  { id: 'padStart-at', type: 'string', hops: [{ n: 'padStart', a: '8, "0"', poly: true }, { n: 'at', a: '0', poly: true }] },
  { id: 'trimEnd-padEnd', type: 'string', hops: [{ n: 'trimEnd', a: '', poly: true }, { n: 'padEnd', a: '8, "x"', poly: true }] },
  { id: 'slice-padStart', type: 'string', hops: [{ n: 'slice', a: '1' }, { n: 'padStart', a: '8, "0"', poly: true }] },
];
// per-hop optionality: `member` -> `?.method`, `call` -> `method?.(` (poly hops only)
const C_OPT = [
  { id: 'dot', at: () => ({}) },
  { id: 'member', at: () => ({ member: true }) },
  { id: 'call', at: h => h.poly ? { call: true } : {} },
  { id: 'first-opt', at: (h, i) => i === 0 ? { member: true } : {} },
  { id: 'member-call', at: h => h.poly ? { member: true, call: true } : { member: true } },
];
function renderChain(src, hops, opt) {
  let out = src;
  hops.forEach((h, i) => {
    const o = opt.at(h, i);
    out += `${ o.member ? '?.' : '.' }${ h.n }${ o.call ? '?.' : '' }(${ h.a })`;
  });
  return out;
}
function * generateChains() {
  for (const recv of C_RECEIVERS) {
    for (const chain of C_CHAINS) {
      // type-agnostic null receiver pairs with any chain (short-circuits before the first hop)
      if (recv.type !== null && recv.type !== chain.type) continue;
      for (const opt of C_OPT) {
        yield { ...snippet(`chain/${ recv.id }/${ chain.id }/${ opt.id }`, renderChain(recv.src, chain.hops, opt)), strip: true };
      }
    }
  }
}

// --- `in`-expression grammar (KEY in OBJECT) ---
// exercises `planInExpression` (symbol / fold / noop, + SE-harvest) - a decision path distinct from
// method calls. every key-kind x object-kind yields a boolean, so the runtime three-way checks the
// babel/unplugin parity of the in-rewrite directly. full-env only: `in` reads the prototype, and
// pure mode never patches it, so a stripped realm would flip the result for a benign reason.
const IN_KEYS = [
  { id: 'instance', src: '"flat"' },
  { id: 'static', src: '"from"' },
  { id: 'symbol', src: 'Symbol.iterator' },
  { id: 'nonpoly', src: '"foo"' },
  { id: 'se', src: '(log.push("k"), "flat")' },
];
const IN_OBJS = [
  { id: 'array', src: 'arr' },
  { id: 'array-lit', src: '[]' },
  { id: 'static', src: 'Array' },
  { id: 'proxy', src: 'globalThis' },
];
function * generateIn() {
  for (const key of IN_KEYS) {
    for (const obj of IN_OBJS) {
      yield snippet(`in/${ key.id }/${ obj.id }`, `${ key.src } in ${ obj.src }`);
    }
  }
}

// --- Mutated-static grammar (usage-pure MUST bail, keeping the user's monkey-patch) ---
// the corpus is otherwise non-mutating (a global write leaks across a shard's sequential imports). these
// snippets stay isolated by SELF-RESTORING in a `finally`, so the realm is clean the instant the IIFE
// returns - the only mutation window is the synchronous IIFE body. each patches a static to a sentinel
// (`() => "P"`), USES it, restores. usage-pure must DETECT the mutation (collectMutatedStaticMembers) and
// bail substitution, so the call keeps the patch: native == bailed-output == "P". a plugin that wrongly
// injected the pure static would return a real value (!= "P") -> runtime mismatch, AND carry an import the
// other side lacks -> import mismatch. full-env only (mutation, not a strip target)
const M_STATICS = [
  { recv: 'Array', key: 'from', use: 'Array.from([1, 2])' },
  { recv: 'Array', key: 'of', use: 'Array.of(1, 2)' },
  { recv: 'Object', key: 'fromEntries', use: 'Object.fromEntries([["a", 1]])' },
  { recv: 'Object', key: 'hasOwn', use: 'Object.hasOwn({ a: 1 }, "a")' },
  { recv: 'Number', key: 'isInteger', use: 'Number.isInteger(3)' },
];
const M_MUTATORS = [
  { id: 'assign', patch: s => `${ s.recv }.${ s.key } = () => "P";` },
  { id: 'defineprop', patch: s => `Object.defineProperty(${ s.recv }, "${ s.key }", { value: () => "P", writable: true, configurable: true });` },
  { id: 'reflect', patch: s => `Reflect.defineProperty(${ s.recv }, "${ s.key }", { value: () => "P", writable: true, configurable: true });` },
];
function * generateMutatedStatic() {
  for (const s of M_STATICS) {
    for (const mut of M_MUTATORS) {
      const body = `(() => { const _o = ${ s.recv }.${ s.key }; try { ${ mut.patch(s) } return ${ s.use }; } finally { ${ s.recv }.${ s.key } = _o; } })()`;
      yield { ...snippet(`mutated-static/${ mut.id }/${ s.recv }.${ s.key }`, body), strip: false };
    }
  }
}

// the bail is per-KEY: mutate ONE static, USE a DIFFERENT static of the same constructor - the used one
// must STILL inject (a regression to a whole-constructor bail would drop that import on one emitter only)
const M_SIBLINGS = [
  { recv: 'Array', mut: 'of', useKey: 'from', use: 'Array.from([1, 2])' },
  { recv: 'Array', mut: 'from', useKey: 'of', use: 'Array.of(1, 2)' },
  { recv: 'Object', mut: 'hasOwn', useKey: 'fromEntries', use: 'Object.fromEntries([["a", 1]])' },
];
function * generateMutatedSibling() {
  for (const s of M_SIBLINGS) {
    const body = `(() => { const _o = ${ s.recv }.${ s.mut }; try { ${ s.recv }.${ s.mut } = () => "P"; return ${ s.use }; } finally { ${ s.recv }.${ s.mut } = _o; } })()`;
    yield { ...snippet(`mutated-sibling/${ s.recv }/mut-${ s.mut }-use-${ s.useKey }`, body), strip: false };
  }
}

// the mutated static is consumed via DESTRUCTURE extraction (`const { from } = Array`) - a different
// consumption path that must also consult the mutation set and bail (keep the patch), not lift the pure
// static into a `const from = _Array$from` that would ignore the user's monkey-patch
const M_DESTRUCTURE = [
  { recv: 'Array', key: 'from', use: 'from([1])' },
  { recv: 'Object', key: 'fromEntries', use: 'fromEntries([["a", 1]])' },
];
function * generateMutatedDestructure() {
  for (const s of M_DESTRUCTURE) {
    const body = `(() => { const _o = ${ s.recv }.${ s.key }; try { ${ s.recv }.${ s.key } = () => "P"; const { ${ s.key } } = ${ s.recv }; return ${ s.use }; } finally { ${ s.recv }.${ s.key } = _o; } })()`;
    yield { ...snippet(`mutated-destructure/${ s.recv }.${ s.key }`, body), strip: false };
  }
}

// the mutated static is the chain ROOT: `Array.from = patch; Array.from([1]).flat()`. the static bails
// (mutation), but the static-call's return type still narrows to Array, so the TRAILING instance method
// must still inject - the bail decision and the return-type narrow are orthogonal, and both emitters must
// agree on emitting the instance helper while leaving the mutated static alone (patch returns an array so
// the chain stays runnable)
const M_NARROW = [
  { recv: 'Array', key: 'from', patch: '() => [9, [8]]', use: 'Array.from([1]).flat()' },
  { recv: 'Array', key: 'of', patch: '() => [3, [1]]', use: 'Array.of(1).at(0)' },
];
function * generateMutatedNarrowChain() {
  for (const s of M_NARROW) {
    const body = `(() => { const _o = ${ s.recv }.${ s.key }; try { ${ s.recv }.${ s.key } = ${ s.patch }; return ${ s.use }; } finally { ${ s.recv }.${ s.key } = _o; } })()`;
    yield { ...snippet(`mutated-narrow-chain/${ s.recv }.${ s.key }`, body), strip: false };
  }
}

// the patched static is reached through a const-aliased COMPUTED key (`const _k = "from";
// recv[_k] = ...`); the resolver must follow the const binding to the same slot. patch AND restore
// go through the SAME computed key, so the slot is only ever touched via the shape under test - a
// dotted restore would mark it on its own and mask whether the computed-key detection is what bailed
function * generateMutatedComputedKey() {
  for (const s of M_STATICS) {
    const body = `(() => { const _k = "${ s.key }"; const _o = ${ s.recv }[_k]; try { ${ s.recv }[_k] = () => "P"; return ${ s.use }; } finally { ${ s.recv }[_k] = _o; } })()`;
    yield { ...snippet(`mutated-computed-key/${ s.recv }.${ s.key }`, body), strip: false };
  }
}

// the patch arrives through a wrapper-fronted namespace (`(0, Object).assign(recv, { key: ... })`,
// a common minified shape) that still resolves to the global Object; restore via a computed key so
// neither touch is a plain dotted write the binding-blind path could detect on its own
function * generateMutatedWrapperAssign() {
  for (const s of M_STATICS) {
    const body = `(() => { const _k = "${ s.key }"; const _o = ${ s.recv }[_k]; try { (0, Object).assign(${ s.recv }, { ${ s.key }: () => "P" }); return ${ s.use }; } finally { ${ s.recv }[_k] = _o; } })()`;
    yield { ...snippet(`mutated-wrapper-assign/${ s.recv }.${ s.key }`, body), strip: false };
  }
}

// --- Side-effect ORDER through nested-instance body-extract ---
// distinct side-effecting siblings (`log.push("x")` / `"z"`) flank the body-extracted binding; the
// receiver is constant (memoize), an identifier (re-reference), or itself side-effecting (bail). every
// shape must keep source order x -> z and run each effect ONCE. the receiver memo / re-ref / bail decision
// must not pull a sibling effect out of order or duplicate it - `effects` is compared 3-way (native ==
// babel == unplugin), so any reorder / drop / double-eval surfaces. the `log.push` siblings are themselves
// polyfilled, so this also exercises SE-order with polyfilled siblings around the extracted receiver
const SE_LAYOUTS = [
  { id: 'before', lhs: '{ a, b: { flat: m } }', rhs: '{ a: log.push("x"), b: $R }', obs: '[a, typeof m]' },
  { id: 'after', lhs: '{ b: { flat: m }, c }', rhs: '{ b: $R, c: log.push("z") }', obs: '[c, typeof m]' },
  { id: 'flank', lhs: '{ a, b: { flat: m }, c }', rhs: '{ a: log.push("x"), b: $R, c: log.push("z") }', obs: '[a, c, typeof m]' },
];
const SE_RECVS = [
  { id: 'const', src: '[1, 2, 3]', strip: true },
  { id: 'ident', src: 'arr', strip: true },
  { id: 'se', src: '[log.push("y"), 1]', strip: false },
];
function * generateSeOrder() {
  for (const layout of SE_LAYOUTS) {
    for (const recv of SE_RECVS) {
      const body = `(() => { const ${ layout.lhs } = ${ layout.rhs.replace('$R', recv.src) }; return ${ layout.obs }; })()`;
      yield { ...snippet(`se-order/${ layout.id }/${ recv.id }`, body), strip: recv.strip };
    }
  }
}

// --- Optional short-circuit must SKIP a downstream call-ARGUMENT side effect ---
// `nul?.at(log.push("m"))`: the null receiver short-circuits BEFORE the argument runs, so `effects` stays
// empty; a live receiver runs it exactly ONCE. the argument is itself polyfilled (`log.push`), so the
// optional deopt must keep it INSIDE the short-circuited call - hoisting or pre-evaluating the arg would
// fire `log.push` on the null path. compared 3-way via `effects`
const ARG_SE_RECVS = [
  { id: 'null', src: 'nul' },
  { id: 'live', src: 'arr' },
];
const ARG_SE_CHAINS = [
  { id: 'at', tail: '?.at(log.push("m"))' },
  { id: 'flat-at', tail: '?.flat()?.at(log.push("m"))' },
  { id: 'includes', tail: '?.includes(log.push("m"))' },
];
function * generateOptionalArgSe() {
  for (const recv of ARG_SE_RECVS) {
    for (const chain of ARG_SE_CHAINS) {
      yield { ...snippet(`optional-arg-se/${ chain.id }/${ recv.id }`, `${ recv.src }${ chain.tail }`), strip: false };
    }
  }
}

// expression families (one valid + observable snippet each), weighted to fragile areas
const EXPR_FAMILIES = {
  'optional-chain': [
    'arr?.flat?.()',
    'nul?.flat()',
    'nul?.flat?.()',
    '(nul ?? arr).flat()',
    '(arr?.slice()).flat()',
    '(log.push("e"), arr)?.flat()',
  ],
  chained: [
    'arr.slice()?.flat().at(0)',
    'arr?.slice()?.flat()?.at(-1)',
  ],
  // two polyfillable instance calls separated by optional hops - the chain-combine path, the
  // most entangled B area (babel chain-combined emit vs unplugin threaded receiver)
  'inner-poly-chain': [
    'arr.flat?.().at(0)',
    'arr?.flat?.().at(0)',
    'arr?.slice()?.flatMap(x => [x])?.flat()',
    '[[1], [2]].flat()?.includes(1)',
    'arr.slice().flat?.().at(-1)',
    '(log.push("e"), arr).flat?.().at(0)',
  ],
  'proxy-global': [
    'globalThis.Array.from("ab")',
    'globalThis?.Array.from([1, 2])',
    '(globalThis).Array.from([1])',
    '(log.push("e"), globalThis).Array.from([1])',
  ],
  static: [
    'Array.from("ab")',
    'Object.assign({}, { a: 1 })',
  ],
  // key-kind x object-kind combinations live in `generateIn`; this family keeps only the
  // SE-bearing key shape (a sequence-expression LHS the grammar doesn't enumerate)
  'in-expr': [
    '(log.push("e"), "flat") in []',
  ],
  'symbol-iterator': [
    '[...arr]',
    '[...arr].length',
    'Array.from(arr[Symbol.iterator]())',
    '(() => { const it = arr[Symbol.iterator](); return it.next().value; })()',
  ],
  destructure: [
    '(() => { const [first] = arr; return first; })()',
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
  // static-FALLBACK receiver-only swap (member name NOT a known static, e.g. `.noSuchStatic`): the
  // receiver swaps to the pure ctor and its SE must be prepended. an IIFE / member-chain receiver's SE
  // was undercounted to 0 (a narrow emit-side recompute) and DROPPED in BOTH plugins - the build-time
  // receiver-effect count fixes the split. `log` records the receiver eval so a drop shows as length 0
  'static-fallback-receiver-se': [
    '(() => { const r = (() => { log.push("r"); return Promise; })().noSuchStatic; return [typeof r, log.length]; })()',
    '(() => { const r = globalThis[(log.push("r"), "Promise")].noSuchStatic; return [typeof r, log.length]; })()',
    '(() => { const r = (log.push("r"), Promise).noSuchStatic; return [typeof r, log.length]; })()',
    '(() => { const r = (() => (() => { log.push("r"); return Promise; })())().noSuchStatic; return [typeof r, log.length]; })()',
    '(() => { const r = (() => { log.push("r"); return Promise; })()[(log.push("k"), "noSuchStatic")]; return [typeof r, log.join("|")]; })()',
  ],
  'computed-symbol': [
    'arr[Symbol.iterator]?.().next().value',
    'arr[Symbol["iterator"]]().next().value',
    'arr[Symbol[(log.push("k"), "iterator")]]().next().value',
    'Symbol["iterator"] in arr',
  ],
  // IIFE-rooted proxy-global chain producing a static/well-known value (`(() => globalThis)().Symbol.iterator`,
  // `.Promise.resolve`, `.Array.from`): the chain folds to the pure import but the IIFE setup must survive
  // (theme-D harvest), and the inner globalThis must keep its own polyfill without overlapping the outer
  // collapse (theme-E - a bare-polyfilled receiver ctor like Symbol/Promise crashed unplugin's text queue).
  // intermediate hops use `.globalThis.` (Node-valid; `self`/`window` don't exist in the native oracle,
  // those hop spellings are covered by transpiler fixtures instead)
  'iife-proxy-static-se': [
    '(() => { const it = (() => { log.push("r"); return globalThis; })().Symbol.iterator; return [it === Symbol.iterator, log.length]; })()',
    '(() => { const p = (() => { log.push("r"); return globalThis; })().Promise.resolve(7); return [typeof p.then, log.length]; })()',
    '(() => { const a = (() => { log.push("r"); return globalThis; })().Array.from([1, 2]); return [a.join(","), log.length]; })()',
    '(() => { const m = arr[(() => { log.push("r"); return globalThis; })().Symbol.iterator]; return [typeof m, log.length]; })()',
    '(() => { const has = (() => { log.push("r"); return globalThis; })().Symbol.iterator in arr; return [has, log.length]; })()',
    '(() => { const it = (() => { log.push("r"); return globalThis; })().globalThis.Symbol.iterator; return [it === Symbol.iterator, log.length]; })()',
    '(() => { const p = (() => { log.push("r"); return globalThis; })().globalThis.Promise.resolve(7); return [typeof p.then, log.length]; })()',
    '(() => { let a; const it = (a = (() => { log.push("r"); return globalThis; })()).Symbol.iterator; return [it === Symbol.iterator, a === globalThis, log.length]; })()',
    '(() => { const it = (() => (() => { log.push("r"); return globalThis; })())().Symbol.iterator; return [it === Symbol.iterator, log.length]; })()',
    '(() => { const p = (() => { log.push("r"); return globalThis; })()?.Promise.resolve(7); return [typeof p.then, log.length]; })()',
    '(() => { const it = (() => globalThis)().globalThis.Symbol.iterator; return [it === Symbol.iterator, log.length]; })()',
  ],
  // string-key `in` FOLD with an SE-bearing RHS chain: the fold discards the RHS, so a chain-root
  // IIFE / inline call / buried chain-assignment must be harvested at detection and re-prepended -
  // and the rescued source must keep its inner rewrites (`globalThis -> _globalThis`) + imports.
  // the sequence case additionally locks the prefix-before-chain-root SE order
  'in-fold-rhs-se': [
    '(() => { const r = "from" in (() => { log.push("r"); return globalThis; })().Array; return [r, log.length]; })()',
    '(() => { const r = "resolve" in (() => { log.push("r"); return Promise; })(); return [r, log.length]; })()',
    '(() => { let a; const r = "from" in (a = (() => { log.push("r"); return globalThis; })()).Array; return [r, a === globalThis, log.length]; })()',
    '(() => { const r = "from" in (log.push("s"), (() => { log.push("r"); return globalThis; })().Array); return [r, log.join("|")]; })()',
  ],
  'deep-proxy': [
    'globalThis.globalThis.Array.from([1, 2])',
    'globalThis?.Array?.from?.([1, 2])',
    'globalThis["Array"].from([1, 2])',
    '(globalThis ?? {}).Array.from([1, 2])',
    'globalThis.Array.from(globalThis.Array.of(1, 2))',
  ],
  'destructure-edge': [
    // single-ctor-key hop ANCHOR: an unresolvable leaf re-anchors the residual to the ctor
    // binding (zero-extraction included - the re-anchored read IS the output), a resolvable
    // sibling still extracts; a multi-key outer keeps the proxy-root residual
    '(() => { const { Map: { noSuchStatic } } = globalThis; return typeof noSuchStatic; })()',
    '(() => { const { Map: { groupBy, noSuchStatic } } = globalThis; return [typeof groupBy, typeof noSuchStatic]; })()',
    '(() => { const { Map: { noSuchStatic }, Promise: p } = globalThis; return [typeof noSuchStatic, typeof p]; })()',
    '(() => { let n; ({ Map: { noSuchStatic: n } } = globalThis); return typeof n; })()',
    '(() => { const { from = null } = Array; return typeof from; })()',
    '(() => { const { nope = (log.push("d"), 5) } = Array; return nope; })()',
    '(() => { const { ["from"]: f } = Array; return typeof f; })()',
    // a side-effecting computed key in a CATCH param rides the catch extraction: the binding
    // takes the dispatcher, the key survives in the residual (effect once), a user default is
    // dead ("polyfill always wins") and rest still gathers the remaining props
    '(() => { try { throw [1, 2]; } catch ({ [(log.push("k"), "at")]: v }) { return typeof v; } })()',
    '(() => { try { throw [[1]]; } catch ({ [(log.push("k"), "flat")]: v, message }) { return [typeof v, typeof message]; } })()',
    '(() => { try { throw [1]; } catch ({ [(log.push("k"), "includes")]: v = (log.push("dead"), 7) }) { return typeof v; } })()',
    '(() => { try { throw { a: 1, b: 2 }; } catch ({ [(log.push("k"), "flatMap")]: v, ...rest }) { return [typeof v, Object.keys(rest).join(",")]; } })()',
    // a memo-bearing sibling claims the whole-declaration render; the SE-key pair's trailing
    // polyfill declarator must bake into the claimed render (key effect once, in source order)
    // regardless of which declarator slot hosts the SE key (last / first / middle / loop header)
    '(() => { const a = [1, 2], b = [[3]]; const { at } = (() => { log.push("r"); return a; })(), '
      + '{ [(log.push("k"), "flat")]: f } = b; return [typeof at, typeof f, log.join("|")]; })()',
    '(() => { const a = [1, 2], b = [[3]]; const { [(log.push("k"), "includes")]: i } = b, '
      + '{ at } = (() => { log.push("r"); return a; })(); return [typeof i, typeof at, log.join("|")]; })()',
    '(() => { const a = [1], b = [[2]], c = { tail: 9 }; const { at } = (() => { log.push("r"); return a; })(), '
      + '{ [(log.push("k"), "flat")]: f } = b, { tail } = c; return [typeof at, typeof f, tail, log.join("|")]; })()',
    '(() => { const a = [1], b = [[2]]; let out; for (const { at } = (() => { log.push("r"); return a; })(), '
      + '{ [(log.push("k"), "flat")]: f } = b; !out;) { out = [typeof at, typeof f]; } return [out, log.join("|")]; })()',
    // SE-bearing chain-root call in a flattenable init: the flatten harvests the discarded call
    // and re-emits it ahead of the extraction (setup runs once, polyfill still wins); the no-SE
    // twin flattens clean. covers the IIFE leaf, a member hop, and the proxy-global-receiver host
    '(() => { const [{ from }] = [(() => { log.push("r"); return Array; })()]; return [typeof from, log.length]; })()',
    '(() => { const [{ from }] = [(() => Array)()]; return [typeof from, log.length]; })()',
    '(() => { const [{ from }] = [(() => { log.push("r"); return globalThis; })().Array]; return [typeof from, log.length]; })()',
    '(() => { const [{ Array: { from } }] = [(() => { log.push("r"); return globalThis; })()]; return [typeof from, log.length]; })()',
    '(() => { const { Array: { from } } = (() => { log.push("r"); return globalThis; })(); return [typeof from, log.length]; })()',
    // SE-bearing IIFE in branchy / assignment-form destructure inits: the per-branch and
    // assignment-destructure machinery must keep the setup intact too
    '(() => { const { from } = cond ? (() => { log.push("r"); return Array; })() : Array; return [typeof from, log.length]; })()',
    '(() => { const { from } = (() => { log.push("r"); return Array; })() ?? Array; return [typeof from, log.length]; })()',
    '(() => { let from; ({ from } = (() => { log.push("r"); return Array; })()); return [typeof from, log.length]; })()',
    '(() => { const { from } = (log.push("s"), (() => Array)()); return [typeof from, log.join("|")]; })()',
    // conditional init with an inline-call branch: the taken branch synths to the polyfill and an
    // SE-bearing call is rescued (runs once, on its own branch only); the untaken branch must NOT run
    '(() => { const { from } = cond ? (() => { log.push("r"); return Array; })() : Array; return [typeof from, log.length]; })()',
    '(() => { const { from } = cond ? Array : (() => { log.push("r"); return Array; })(); return [typeof from, log.length]; })()',
    '(() => { const { from } = cond ? (() => { log.push("a"); return Array; })() : (() => { log.push("b"); return Array; })(); return [typeof from, log.join("|")]; })()',
    '(() => { const { from } = (() => (cond ? Array : Iterator))(); return [typeof from, log.length]; })()',
    // logical forms with an inline-call side: `&&` synths the call branch (rescued), `||` / `??`
    // lift the init statement whole; a renamed / computed-literal key flows through the same synth
    '(() => { const { from } = cond && (() => { log.push("r"); return Array; })(); return [typeof from, log.length]; })()',
    '(() => { const { from } = (() => { log.push("r"); return Array; })() || Iterator; return [typeof from, log.length]; })()',
    '(() => { const { from: f } = cond ? (() => { log.push("r"); return Array; })() : Array; return [typeof f, log.length]; })()',
    '(() => { const { ["from"]: f } = cond ? (() => { log.push("r"); return Array; })() : Array; return [typeof f, log.length]; })()',
    // a SE-bearing synth-swap receiver with an UNRESOLVED sibling key (`isArray` has no pure entry)
    // forces the receiver to be MEMOIZED (run once, the sibling reads the memo) instead of rescued
    // AND re-read. `log.length` pins effect-once; import parity + the 3-way value pin that both
    // emitters resolve `from` and read `isArray` identically (a clone of the discarded `|| Set` that
    // re-substituted to a pure ctor on one side only would leak a dead import). covers the flat
    // member, buried prefix, `||` fallback, and per-branch conditional registration sites
    '(() => { function g({ from, isArray } = (() => { log.push("r"); return globalThis; })().Array) { return [typeof from, typeof isArray, log.length]; } return g(); })()',
    '(() => { function g({ from, isArray } = (log.push("r"), globalThis).Array) { return [typeof from, typeof isArray, log.length]; } return g(); })()',
    '(() => { function g({ from, isArray } = (() => { log.push("r"); return globalThis; })().Array || Set) { return [typeof from, typeof isArray, log.length]; } return g(); })()',
    '(() => { function g(c, { from, isArray } = c ? (() => { log.push("r"); return globalThis; })().Array : Set) '
      + '{ return [typeof from, typeof isArray, log.length]; } return g(true); })()',
    '(() => { function g({ from, isArray } = cond && (() => { log.push("r"); return globalThis; })().Array) '
      + '{ return [typeof from, typeof isArray, log.length]; } return g(); })()',
    // assignment-destructure hosts beyond the expression statement: for-init, call-arg and
    // arrow-body positions, plus the nested / array-wrapper parameter DEFAULT. the param
    // emission is the LEAF inline default, so a caller-passed value keeps winning - exercised
    // below with an explicit custom-argument call
    '(() => { let f; for (({ Array: { from: f } } = globalThis), 0; false;) {} return typeof f; })()',
    '(() => { let f; const id = x => x; id(({ Array: { from: f } } = globalThis)); return typeof f; })()',
    '(() => { let f; const g = () => ({ Array: { from: f } } = globalThis); g(); return typeof f; })()',
    '(() => { function g([{ of }] = [Array]) { return typeof of; } return g(); })()',
    '(() => { function g({ Array: { from } } = globalThis) { return from; } return g({ Array: { from: "custom" } }); })()',
    '(() => { function g({ Array: { from: renamed } } = globalThis) { return renamed; } return g({ Array: { from: "custom" } }); })()',
    '(() => { function g({ Array: { from, ...rest } } = globalThis) { return [typeof from, typeof rest]; } return g(); })()',
    // an ABSENT leaf in a caller-supplied object stays undefined exactly as native - the
    // synthesized default fires only for the no-argument call
    '(() => { function g({ Array: { from } } = globalThis) { return typeof from; } return g({ Array: {} }); })()',
    '(() => { function g({ Array: { from } } = globalThis) { return typeof from; } return g({ Array: "str" }); })()',
    // a DECLARED function's params stay verbatim when no sound emission exists (rest sibling
    // blocks the synth default): caller-supplied values pass through natively
    '(() => { function g({ from, ...rest } = Array) { return [from, Object.keys(rest).length]; } return g({ from: "custom", x: 1 }); })()',
    '(() => { function g({ from: alias, dup = alias } = Array) { return [typeof alias, typeof dup]; } return g(); })()',
    // synth-default soundness limits: sibling BRANCHES and rest cannot be mirrored into the
    // literal - the shapes stay verbatim (a one-branch literal TypeErrors the other branch;
    // rest must keep collecting the real receiver's extra enumerable keys)
    '(() => { function g({ Array: { from }, Set: { union } } = globalThis) { return [typeof from, typeof union]; } return g(); })()',
    '(() => { Array.tmpDiffX = 1; function g({ Array: { from, ...rest } } = globalThis) { return rest.tmpDiffX; } const r = g(); delete Array.tmpDiffX; return r; })()',
    // full-mirror limits: an effectful default and a pattern-valued leaf stay verbatim - the
    // effect must run on the no-arg call; the leaf reads the native function's own props
    '(() => { const fxLog = []; function g({ Array: { from } } = (fxLog.push(1), globalThis)) { return [typeof from, fxLog.length]; } return g(); })()',
    '(() => { function g({ Array: { of: { name } } } = globalThis) { return name; } return g(); })()',
    // synth-default edges: duplicate destructure keys share one mirrored literal key; a
    // computed hop stays verbatim; a string leaf key normalizes; the IIFE form synths too
    '(() => { function g({ Array: { from, from: dup } } = globalThis) { return [typeof from, typeof dup]; } return g(); })()',
    '(() => { const r = (({ of, "of": alias } = Array) => [typeof of, typeof alias])(); return r; })()',
    '(() => { let c = true; const { from, from: g } = c ? Array : Array; return [typeof from, typeof g]; })()',
    // defaulted destructure bindings fold member x default: an unknown member keeps the
    // generic dispatch (runtime picks the flavor); a statically absent member takes the default
    '(() => { const { a = [] } = JSON.parse(String.fromCharCode(123, 34, 97, 34, 58, 34, 104, 105, 34, 125)); return a.at(0); })()',
    '(() => { const [b = "xy"] = []; return b.at(-1); })()',
    '(() => { const { c = [7, 8] } = {}; return c.at(-1); })()',
    '(() => { const [d = 0] = ["hi"]; return d.at(-1); })()',
    '(() => { const { g = "s" } = { get g() { return [9]; } }; return g.at(0); })()',
    '(() => { const [n = "x"] = [null]; return [n, typeof n]; })()',
    // per-key presence independence and reassignment-to-undefined parity
    '(() => { const { a = "", b = 0 } = { a: [1], get b() { return "s"; } }; return [a.at(0), b]; })()',
    '(() => { let x = "str"; x = undefined; try { return x.at(0); } catch (e) { return "throw"; } })()',
    // inline-array spread args expand positionally for the per-branch synth
    '(() => { let c = true; return ((x, { from }) => typeof from)(...[1, c ? Array : Iterator]); })()',
    // IIFE caller-arg wins over a non-receiver wrapper default (polyfill rides the live arg)
    '(() => (({ from } = []) => from([7]))(Array))()',
    // const-captured alias: an upstream reassignment AFTER the capture must not drop super statics
    '(() => { let G = globalThis; const B = G.Array; G = null; class C extends B { static m() { return super.of(3); } } return C.m()[0]; })()',
    // single-element array wrapper with inner rest keeps the residual (rest collects remaining keys)
    '(() => { const [{ from, ...rest }] = [Array]; return [typeof from, typeof rest]; })()',
    // for-init host: the polyfill rides a sibling declarator in the loop header
    '(() => { for (const [{ of, ...r }] = [Array]; ; ) { return [of(9)[0], "of" in r]; } })()',
    '(() => { for (let i = 0, [{ of, ...r }] = [Array]; i < 1; i++) { return [of(i)[0], "of" in r]; } })()',
    // spread position edges: receiver before / after the inline-array expansion, empty spread
    '(() => { let c = true; return (({ from }, x) => typeof from)(c ? Array : Iterator, ...[1]); })()',
    '(() => { let c = true; return ((x, { of }) => typeof of)(...[], 1, c ? Array : Iterator); })()',
    // in-loop upstream reassignment must keep the conservative native path (dominance blocks)
    '(() => { let G = globalThis; const out = []; for (let i = 0; i < 2; i++) { const B = G.Array; '
      + 'class C extends B { static m() { return typeof super.of; } } out.push(C.m()); G = { Array: function () { return 1; } }; } return out; })()',
    // SE-buried proxy root: the prefix runs exactly once and the static substitutes
    '(() => { let n = 0; const m = (n++, globalThis).Map.groupBy(["ab", "c"], s => s.length); return [m.get(1)[0], n]; })()',
    // alias-mutation canonicalization: the user patch through the alias wins over the polyfill
    // (the original static is RESTORED so the shared runtime stays clean for other cases;
    // the mutation marks Array.of, so the restore read stays native too)
    '(() => { const A2 = Array; const orig = A2.of; A2.of = function () { return "patched"; }; const out = A2.of(1); A2.of = orig; return out; })()',
    // a reassigned alias: reads of EVERY reachable canonical stay native (mutation honored,
    // original restored for runtime hygiene)
    '(() => { let R = Array; R = Map; const orig = R.of; R.of = function () { return "patched"; }; const out = [Map.of === R.of, typeof Array.of]; R.of = orig; return out; })()',
    // logical-assignment alias value: the mutation through it stays on the NATIVE constructor
    '(() => { let L = null; L ||= Map; const orig = L.of; L.of = function () { return "lp"; }; const out = [Map.of === L.of]; L.of = orig; return out; })()',
    // ternary alias value: the mutation through it stays on the NATIVE live branch
    '(() => { const T = 1 ? Map : Iterator; const orig = T.of; T.of = function () { return "tp"; }; const out = [Map.of === T.of]; T.of = orig; return out; })()',
    // IIFE-returned ctor alias: the mutation through it stays on the NATIVE constructor
    '(() => { const F = (() => Map)(); const orig = F.of; F.of = function () { return "fp"; }; const out = [Map.of === F.of]; F.of = orig; return out; })()',
    // bound-fn-returned and static-object-member aliases keep mutations on the NATIVE ctor
    '(() => { const fb = () => Map; const Fb = fb(); const orig = Fb.of; Fb.of = function () { return "bf"; }; const out = [Map.of === Fb.of]; Fb.of = orig; return out; })()',
    '(() => { const NSo = { M: Map }; const Mo = NSo.M; const orig = Mo.of; Mo.of = function () { return "so"; }; const out = [Map.of === Mo.of]; Mo.of = orig; return out; })()',
    // class-static-field alias keeps the mutation on the NATIVE constructor
    '(() => { class NSf { static M = Map; } const Mf = NSf.M; const orig = Mf.of; '
      + 'Mf.of = function () { return "cs"; }; const out = [Map.of === Mf.of]; Mf.of = orig; return out; })()',
    // duplicate container keys: the mutation lands on the LAST (live) value
    '(() => { const ND = { M: Array, M: Iterator }; const Md = ND.M; const orig = Md.from; '
      + 'Md.from = function () { return "dk"; }; const out = [Iterator.from === Md.from, typeof Array.from]; Md.from = orig; return out; })()',
    // assign-source computed static key: the patch wins over substitution
    '(() => { const orig = Array.of; Object.assign(Array, { ["of"]: function () { return "ac"; } }); '
      + 'const out = Array.of(1); Array.of = orig; return out; })()',
    // delete through an alias suppresses the in-check fold (restored for runtime hygiene)
    '(() => { const A = Array; const orig = A.of; delete A.of; const out = "of" in Array; A.of = orig; return out; })()',
    // SE-wrapped proxy-member destructure init: effect exactly once, polyfill binds
    '(() => { let n = 0; const { from } = (n++, globalThis.Array); return [from([3])[0], n]; })()',
    // a shadowed bound-fn alias: the mutation through the INNER twin keeps outer reads native
    '(() => { const fs = () => Map; const out = (function () { const fs2 = () => Iterator; const T = fs2(); '
      + 'const orig = T.from; T.from = function () { return "sh"; }; const r = [Iterator.from === T.from]; T.from = orig; return r; })(); return out; })()',
    // an IIFE-returned extends target resolves its super statics like the target itself
    '(() => { class Fi extends (() => globalThis.Array)() { static m() { return super.of(6); } } return Fi.m()[0]; })()',
    // an SE-buried extends target resolves its super statics (effect runs once at class-def)
    '(() => { let n = 0; class Ce extends (n++, globalThis).Array { static m() { return super.of(5); } } return [Ce.m()[0], n]; })()',
    // a mid-sequence destructure assignment splits and polyfills like a standalone statement
    '(() => { let from; (({ from } = Array), 0); return [from([7, 8]).at(-1), typeof from]; })()',
    // SE-static receiver: dropped effect-free prefix, preserved SE prefix, value intact
    '(() => { const calls = []; const r = (calls.push("a"), Iterator, Array).from([7, 8]); '
      + 'return [r.at(-1), calls.length]; })()',
    // inner-key SE + hop-key SE run in native order around the inner CALL
    '(() => { const calls = []; const a1 = () => calls.push("a1"); const a2 = () => calls.push("a2"); '
      + 'const arr = { flat() { calls.push("f"); return [7, 8]; } }; '
      + 'const r = arr[(a1(), "flat")]?.()[(a2(), "map")](v => v * 2)?.at(0); return [r, calls.join("-")]; })()',
    // an SE prefix on a poly hop key runs exactly once, in source order
    '(() => { const calls = []; const r = [[1], [2]].flat?.()[(calls.push("k"), "map")](v => v[0])?.at(0); '
      + 'return [r, calls.length]; })()',
    // an inner instance polyfill (ref-bake) combined with a droppable bare-constructor
    // tail across sibling declarators keeps every effect exactly once, in order
    '(() => { const calls = []; const eff = v => calls.push(v); '
      + 'const { from } = (eff([1].at(0)), (eff(2), Array)), { of: o8 } = (eff(3), Array); '
      + 'return [from([5]).length, o8(6).length, calls.join()]; })()',
    // a destructuring-assignment VALUE is the RHS proxy object, not the hop member -
    // the value-used host must keep it intact
    '(() => { let x; const v = ({ Map: { x } } = globalThis); return [v === globalThis, typeof x]; })()',
    // a single-key proxy-hop destructure reads a patched static through the routed
    // constructor (the original key state is restored for runtime hygiene)
    '(() => { const orig = Iterator.dispose; Iterator.dispose = () => 41; '
      + 'const { Iterator: { dispose: read } } = globalThis; const r = read(); '
      + 'if (orig === undefined) delete Iterator.dispose; else Iterator.dispose = orig; return [r]; })()',
    // a braceless case-consequent hosts the deferred destructure SE (the drain's
    // consequent-array branch); the effect lands before the extraction, once
    '(() => { const calls = []; switch (calls.push(1)) { case 1: const { of: o9 } = (calls.push(2), globalThis.Array); return [typeof o9, o9(7).length, calls.length]; } })()',
    // a lifted SE prefix keeps its effect; the dead proxy-member tail drops
    '(() => { const calls = []; const { of: o3 } = (calls.push(1), globalThis.Array); '
      + 'return [typeof o3, o3(7).length, calls.length]; })()',
    // a rest sibling excludes the consumed string-literal key (quoted sentinel)
    '(() => { const { "Array": { from: f8 }, ...others } = globalThis; '
      + 'return ["Array" in others, typeof f8, f8([3]).length]; })()',
    // a string-literal outer key flattens like the identifier form
    '(() => { const { "Array": { from } } = globalThis; return [from([8, 9]).at(0)]; })()',
    // an all-non-poly optional hop tail short-circuits through its own tokens
    '(() => { const o = { cA(v) { return { cB(w) { return [v, w]; } }; } }; '
      + 'const r = [[1]].flat?.()?.[0] && o.cA?.(1)?.cB(2)?.at(1); return [r]; })()',
    // a guarded non-poly optional computed hop stays syntactically valid and runs in order
    '(() => { const calls = []; const o = { customY(v) { calls.push("y"); return [v]; } }; '
      + 'const r = [[o]].flat?.()?.[(calls.push("k"), "at")](0)?.[0].customY(3); return [r[0], calls.join("-")]; })()',
    // optional-hop key SE replays once through the folded guard too
    '(() => { const calls = []; const r = [[5]].flat?.()?.[(calls.push("o"), "map")](v => v[0])?.at(0); '
      + 'return [r, calls.length]; })()',
    // a DYNAMIC-keyed call hop threads as a non-poly hop (raw text re-emitted)
    '(() => { const k = "map"; const r = [[3], [4]].flat?.()[k](v => v + 1)?.at(-1); return [r]; })()',
    // static-string-keyed call hop threads through the combined optional chain
    '(() => { const r = [[1], [2]].flat?.()["map"](v => v * 10)?.at(0); return [r]; })()',
    // healed compose-overlap shapes hold their runtime values
    '(() => { const a = { b: { c: () => [5, 6] } }; return [a?.b.c().at(0)]; })()',
    '(() => { const obj = { "a?.b": [9] }; return [obj?.["a?.b"].includes(9)]; })()',
    // a buried SE on a synth-swap receiver spine survives the literal swap
    '(() => { const calls = []; const eff = () => calls.push(1); '
      + 'function f({ from } = (eff(), globalThis).Array) { return typeof from; } '
      + 'return [f(), calls.length]; })()',
    // an optional delete pairs with reads on one routed object
    '(() => { Map.customOptKey = 3; const had = "customOptKey" in Map; delete Map?.customOptKey; '
      + 'return [had, "customOptKey" in Map]; })()',
    // for-init flatten sibling: every shape (rest / 2-instance) keeps its polyfill
    '(() => { const out = []; for (const { Array: { from } } = globalThis, { at, ...rest } = [4, 5]; out.length < 1; ) '
      + 'out.push([from([6]).at(0), at.call([7, 8], -1), "concat" in rest]); return out; })()',
    // a split product's alias keeps the typed dispatch downstream
    '(() => { let from; ("x", ({ from } = Array), 0); return [from([5, 6]).at(1)]; })()',
    // a nested-sequence-slot destructure splits through the fixpoint
    '(() => { let of2; ((0, ({ of: of2 } = Array)), 1); return [of2(9).at(0)]; })()',
    // assignment-destructure alias narrows the receiver type for the typed instance variant
    '(() => { let from; ({ from } = Array); return [from([5, 6]).at(0), from("ab").at(1)]; })()',
    // a prototype patch and the instances reading it live on ONE (routed) constructor
    '(() => { Map.prototype.customX = Map.prototype.customX || function () { return "mp"; }; '
      + 'const r = new Map().customX(); delete Map.prototype.customX; return [r]; })()',
    // a polyfillable-key or-shim stays DEAD: the key's entry is imported up front, the guard
    // finds it present on the routed constructor, and reads serve the implementation
    '(() => { Iterator.from ||= function () { return "dead"; }; return [Iterator.from([4].values()).next().value]; })()',
    '(() => { Promise.allSettled = Promise.allSettled || function () { return "dead"; }; return [typeof Promise.allSettled]; })()',
    '(() => { if (typeof Object.groupBy != "function") Object.groupBy = function () { return "dead"; }; '
      + 'return [Object.groupBy([5], x => x)[5].length]; })()',
    // third-party shim patterns: present-key guards keep the live implementation, a
    // missing-key or-shim assigns and serves the shim through the same routed object
    '(() => { if (!Array.from) Array.from = function () { return "dead"; }; return [Array.from([3])[0], typeof Array.from]; })()',
    '(() => { Map.customShimKey = Map.customShimKey || function () { return "served"; }; '
      + 'const r = Map.customShimKey(); delete Map.customShimKey; return [r]; })()',
    // method-aware routing precision: the patched key reads the patch, a CLEAN key on the
    // same constructor keeps its polyfilled receiver-less import
    '(() => { const orig = Iterator.from; Iterator.from = function () { return "mk"; }; '
      + 'const a = Iterator.from(0); const b = typeof [1].values().drop(0).toArray; Iterator.from = orig; return [a, b]; })()',
    // mutated-static routing: the patch and the read share the constructor object (native
    // or injected), so the patched value flows through reads, destructures and in-checks
    '(() => { const orig = Iterator.from; Iterator.from = function () { return "rt"; }; '
      + 'const a = Iterator.from(0); const { from } = Iterator; const b = from(0); '
      + 'const c = "from" in Iterator; Iterator.from = orig; return [a, b, c]; })()',
    // a pattern HOLE shifts nothing: the slot still pairs positionally for the mutation set
    '(() => { const orig = Iterator.from; let A = Array; [, A] = [0, Iterator]; '
      + 'A.from = function () { return "hs"; }; const out = [Iterator.from === A.from]; Iterator.from = orig; return out; })()',
    // a REASSIGNED alias reaching a proxy global keys the chain mutation under the ctor leaf
    '(() => { const orig = Array.of; let h; h = (() => false)() ? null : globalThis; '
      + 'h.Array.of = function () { return "tp"; }; const out = [Array.of(3)]; Array.of = orig; return out; })()',
    // alias-of-proxy chain mutation: the patch through `const g = globalThis` wins over reads
    '(() => { const orig = Array.of; const gp = globalThis; gp.Array.of = function () { return "ga"; }; '
      + 'const out = [Array.of(2)]; Array.of = orig; return out; })()',
    // a proxy-chain mutation (SE-buried root included) keeps the patch winning over reads
    '(() => { const orig = Array.of; let n = 0; (n++, globalThis).Array.of = function () { return "pc"; }; '
      + 'const out = [Array.of(1), n]; Array.of = orig; return out; })()',
    // the in-check fold keeps the receiver's SE prefix evaluating
    '(() => { let n = 0; const has = "groupBy" in (n++, globalThis).Map; return [has, n]; })()',
    // synth-literal receiver with an SE prefix: effect once, unpolyfilled key reads through
    '(() => { let n = 0; const r = (({ from, other }) => [typeof from, other])((n++, globalThis.Array)); return [r[0], r[1], n]; })()',
    // an SE wrapping a PARTIAL member chain stays structurally intact (both effects, in order)
    '(() => { const log = []; const { from, formatRangeToParts } = ((log.push(2), (log.push(1), globalThis).globalThis)).Array; '
      + 'return [typeof from, log.join("")]; })()',
    // a partial-consume residual with an SE-buried proxy-hop root must keep the effect
    '(() => { let n = 0; const { from, formatRangeToParts } = (n++, globalThis).globalThis.Array; return [typeof from, typeof formatRangeToParts, n]; })()',
    // gate agreement across prop shapes: defaults, aliases and computed keys all lift once
    '(() => { let n = 0; const { from = 0, ["of"]: o } = (n++, globalThis.Array); return [from([7])[0], o(8)[0], n]; })()',
    // SE prefix lifts once for a fully-consumed multi-prop destructure with a proxy tail
    '(() => { let n = 0; const { from, of } = (n++, globalThis.Array); return [from([3])[0], of(4)[0], n]; })()',
    // sibling statics through a shared static-object wrapper both resolve
    '(() => { const w = { a: Array, b: Promise }; const { a: { of }, b: { resolve } } = w; return [of(5)[0], typeof resolve]; })()',
    // a bound capitalized arg preempts (alias resolution), a shadowed constructor name keeps
    // its caller value - both paths must match native byte-for-byte
    '(() => { const A = Array; return (({ of } = Iterator) => typeof of)(A); })()',
    '(() => { const Iterator = { of: function () { return "shadow"; } }; return (({ of } = Array) => of(1))(Iterator); })()',
    // an unclassifiable live arg keeps native priority while the default-path polyfills
    '(() => { const v = { of: function () { return "caller"; } }; return (({ of } = Array) => of(1))(v); })()',
    '(() => (({ of } = Array) => of(5))(undefined))()',
    // synth-swap keeps the SE prefix of a wrapped live arg (effect runs exactly once)
    '(() => { let n = 0; const r = (({ from }) => from([5]))((n++, Array)); return [r[0], n]; })()',
    // cross-function capture: a top-level reassignment before the call must keep super native
    '(() => { let G = globalThis; function make() { const B = G.Array; class C extends B { static m() { return super.of(1); } } return C.m(); } '
      + 'G = { Array: { of: function () { return "custom"; } } }; return make(); })()',
    // aliased key + rest under a single-element array wrapper extracts and keeps rest exclusion
    '(() => { const [{ from: f, ...r }] = [Array]; return [f([8])[0], "from" in r]; })()',
    // assignment-form array wrap + rest flows through the rest-aware cascade on both plugins
    '(() => { let from, rest, x; [{ from, ...rest }, x] = [Array, 1]; return [typeof from, x]; })()',
    '(() => { let from, rest; [{ from, ...rest }] = [Array]; return [from([6])[0], "from" in rest]; })()',
    '(() => { let from, rest, n = 0; [{ from, ...rest }] = (n++, [Array]); return [from([4])[0], n]; })()',
    '(() => { let from, rest; [{ Array: { from, ...rest } }] = [globalThis]; return [from([2])[0], "from" in rest]; })()',
    // duplicate HOP keys merge their subtrees - both read the same receiver property
    '(() => { function g({ Array: { from }, Array: { of } } = globalThis) { return [typeof from, typeof of]; } return g(); })()',
    '(() => { function g({ Array: { from }, Array: { from: f2, of } } = globalThis) { return [typeof from, typeof f2, typeof of]; } return g(); })()',
    '(() => { function g({ ["Array"]: { from } } = globalThis) { return typeof from; } return g(); })()',
    '(() => { function g({ Array: { "from": f } } = globalThis) { return typeof f; } return g(); })()',
    '(() => (function ({ Array: { of } } = globalThis) { return typeof of; })())()',
    // an unpolyfilled SE computed key beside a polyfilled one: the synth literal reads the
    // receiver by the STATIC name - the key's prefix effect runs exactly once
    '(() => { let c = 0; const r = (({ from, [(c++, "custom")]: x } = Array) => [typeof from, x, c])(); return r; })()',
    // flat-entries edges: a numeric key falls back soundly; a per-branch literal re-reads the
    // unpolyfilled sibling through the branch receiver; a dynamic computed key runs once; a
    // pure SE-free call branch folds to its literal
    '(() => { const r = (({ from, 0: zero } = Array) => [typeof from, zero])(); return r; })()',
    '(() => { let cond = true; const r = (({ from, custom } = cond ? Array : Iterator) => [typeof from, custom])(); return r; })()',
    '(() => { let n = 0; const k = () => (n++, "from"); const r = (({ of, [k()]: x } = Array) => [typeof of, typeof x, n])(); return r; })()',
    '(() => { let cond = true; const r = (({ from } = cond ? (() => Array)() : Iterator) => typeof from)(); return r; })()',
    // multi-key call branches: all-polyfilled keys rescue the call once ahead of the literal;
    // an unresolved key reads the memoized call result - the call runs exactly once either way
    '(() => { let cond = true, c = 0; const { from, of } = cond ? (() => { c++; return Array; })() : Array; return [typeof from, typeof of, c]; })()',
    '(() => { let cond = true, c = 0; const { from, custom } = cond ? (() => { c++; return Array; })() : Array; return [typeof from, custom, c]; })()',
    '(() => { let cond = false, c = 0; const { from, custom } = cond ? (() => { c++; return Array; })() : Array; return [typeof from, custom, c]; })()',
    '(() => { let cond = true, c = 0; const r = (({ from, custom } = cond ? (() => { c++; return Array; })() : Array) => [typeof from, custom, c])(); return r; })()',
    // nested conditional with two memoized call leaves: only the taken branch's call runs,
    // exactly once; the all-plain path runs none
    '(() => { let a = true, b = false, c = 0; const { from, custom } = a ? (() => (c++, Array))() : (b ? (() => (c++, Iterator))() : Array); return [typeof from, custom, c]; })()',
    '(() => { let a = false, b = true, c = 0; const { from, custom } = a ? (() => (c++, Array))() : (b ? (() => (c++, Iterator))() : Array); return [typeof from, custom, c]; })()',
    '(() => { let a = false, b = false, c = 0; const { from, custom } = a ? (() => (c++, Array))() : (b ? (() => (c++, Iterator))() : Array); return [typeof from, c]; })()',
    '(() => { let _ref = "user", a = true; const { from, custom } = a ? (() => Array)() : Array; return [typeof from, custom, _ref]; })()',
    // full-tree mirror + fallback-logical collapse: sibling branches both mirror; the kept
    // effect prefix runs once on the no-arg call; logical defaults collapse left
    '(() => { function g({ Array: { from }, Object: { assign } } = globalThis) { return [typeof from, typeof assign]; } return g(); })()',
    '(() => { const fxq = []; function g({ Array: { of } } = (fxq.push(1), globalThis)) { return [typeof of, fxq.length]; } return [g(), fxq.length]; })()',
    '(() => { function g({ from } = Array || Iterator) { return typeof from; } return g(); })()',
    '(() => { function g({ from, custom } = Array || Iterator) { return [typeof from, custom]; } return g(); })()',
    '(() => { function g({ of } = Array ?? Iterator) { return typeof of; } return g(); })()',
    // logical roots of the mirror and the flatten: pure forms collapse (left for || / ??,
    // right for &&); an effectful operand keeps running - natively or in the residual
    '(() => { function g({ Array: { from } } = globalThis || self) { return typeof from; } return g(); })()',
    '(() => { let m = 1, c = 0; function g({ Array: { of } } = (c++, m) && globalThis) { return [typeof of, c]; } return [g(), c]; })()',
    '(() => { let m = 1, c = 0; const { Array: { from } } = (c++, m) && globalThis; return [typeof from, c]; })()',
    '(() => { let c = 0; const { Array: { of } } = (c++, globalThis) || self; return [typeof of, c]; })()',
    '(() => { let c = 0; const { Array: { from } } = globalThis || (c++, self); return [typeof from, c]; })()',
    // host-shape edges of the precise mirror: multi-declarator keeps the sibling and the
    // effect; the assignment-form cascade keeps the whole RHS statement
    '(() => { let c = 0, m = 1; const a = 2, { Array: { of } } = (c++, m) && globalThis; return [typeof of, a, c]; })()',
    '(() => { let from, c = 0, m = 1; ({ Array: { from } } = (c++, m) && globalThis); return [typeof from, c]; })()',
    '(() => { let c = 0, m = 1; for (const { Array: { of } } = (c++, m) && globalThis; false;) {} return c; })()',
    '(() => { const { Array: { of } } = globalThis || self; return typeof of; })()',
    '(() => { let m = 0; function g({ Array: { from } } = m && globalThis) { return from; } try { g(); return "no-throw"; } catch (e) { return "throw"; } })()',
    // mixed / chained logical roots: the mirror lands in either subtree; selection semantics
    // stay native on the kept paths
    '(() => { let m = 1; function g({ Array: { from } } = (m && globalThis) || self) { return typeof from; } return g(); })()',
    '(() => { let m = 0; function g({ Array: { from } } = (m && globalThis) || globalThis) { return typeof from; } return g(); })()',
    // BOTH reachable leaves of a guarded fallback unfold; an unmirrorable leaf stays native
    '(() => { let m = 1; function g({ Array: { of } } = (m && globalThis) || globalThis) { return typeof of; } return g(); })()',
    '(() => { const alt = { Array: { from: "alt" } }; let m = 0; function g({ Array: { from } } = (m && globalThis) || alt) { return from; } return g(); })()',
    // the flatten must NOT discard a guarded init: the falsy path's native TypeError survives
    // (the mirror swaps only the right operand); a guarded fallback in a declarator unfolds
    '(() => { let m = 0; try { const { Array: { from } } = m && globalThis; return typeof from; } catch (e) { return "throw"; } })()',
    '(() => { let m = 1; const { Array: { from } } = m && globalThis; return typeof from; })()',
    '(() => { let m = 0; const { Array: { of } } = (m && globalThis) || globalThis; return typeof of; })()',
    // ternary inits: a pure proxy-alias ternary flattens; an effectful test keeps running
    // once; a guarded branch keeps its native selection
    '(() => { let c = true; const { Array: { from } } = c ? globalThis : globalThis; return typeof from; })()',
    '(() => { let log = [], c = false; const { Array: { of } } = (log.push(1), c) ? globalThis : globalThis; return [typeof of, log.length]; })()',
    '(() => { let c = true; function g({ Array: { from } } = c ? globalThis : globalThis) { return typeof from; } return g(); })()',
    '(() => { let c = false, m = 0; try { const { Array: { from } } = c ? globalThis : m && globalThis; return typeof from; } catch (e) { return "throw"; } })()',
    // transparent IIFE inits: the call stays (body effects + selection native); a guarded
    // return keeps its falsy throw; identity / pure / SE-body shapes flatten with rescue
    '(() => { let m = 1; const { Array: { from } } = (() => m && globalThis)(); return typeof from; })()',
    '(() => { let m = 0; try { const { Array: { from } } = (() => m && globalThis)(); return typeof from; } catch (e) { return "throw"; } })()',
    '(() => { let c = 0; const { Array: { of } } = (() => { c++; return globalThis; })(); return [typeof of, c]; })()',
    '(() => { const { Array: { from } } = (g => g)(globalThis); return typeof from; })()',
    '(() => { function g({ Array: { of } } = (() => globalThis)()) { return typeof of; } return g(); })()',
    // IIFE composition: an effectful identity ARGUMENT runs exactly once (not discardable);
    // nested transparent IIFEs flatten; an IIFE leaf inside a fallback mirrors in place
    '(() => { let c = 0; const { Array: { from } } = (g => g)((c++, globalThis)); return [typeof from, c]; })()',
    '(() => { const { Array: { of } } = (() => (() => globalThis)())(); return typeof of; })()',
    '(() => { let m = 0; const { Array: { from } } = (m && globalThis) || (() => globalThis)(); return typeof from; })()',
    '(() => { let c = false; const { Array: { of } } = (() => c ? globalThis : globalThis)(); return typeof of; })()',
    // chain-assignment inits: the binding captures the NATIVE value (never a mirrored
    // literal); a guarded RHS keeps the falsy-path TypeError; a pure fallback flattens
    '(() => { let w; const { Array: { from } } = w = globalThis || globalThis; return [typeof from, w === globalThis]; })()',
    '(() => { let w, m = 1; const { Array: { of } } = w = m && globalThis; return [typeof of, w === globalThis]; })()',
    '(() => { let w, m = 0; try { const { Array: { from } } = w = m && globalThis; return typeof from; } catch (e) { return ["throw", w === 0]; } })()',
    // assignment-form fallback RHS: pure shapes are discarded, an IIFE keeps one native call;
    // an array element with a fallback flattens
    '(() => { let from; ({ Array: { from } } = globalThis || globalThis); return typeof from; })()',
    '(() => { let of, c = 0; ({ Array: { of } } = (() => { c++; return globalThis; })()); return [typeof of, c]; })()',
    '(() => { const [{ Array: { from } }] = [globalThis || globalThis]; return typeof from; })()',
    '(() => { function g({ Array: { of } } = globalThis || self || window) { return typeof of; } return g(); })()',
    '(() => { class K { m({ JSON: { stringify } } = globalThis) { return typeof stringify; } } return new K().m(); })()',
    // the call-site scan: a non-exported function whose every call leaves the default gets the
    // lossy emission back (nothing exists to lose); a real-arg caller and an escaping alias bail
    '(() => { function g({ from, ...rest } = Array) { return [typeof from, Object.keys(rest).length]; } return [g(), g(undefined)]; })()',
    '(() => { function g({ from } = Array) { return from; } return g({ from: "custom" }); })()',
    '(() => { function g({ from } = Array) { return typeof from; } const alias = g; return alias(); })()',
    // const-alias wrapper: the IIFE's setup runs at the ALIAS declaration, not in the discarded
    // read - the harvest must not re-emit it (a deref-escaped call once double-ran, log.length 2)
    '(() => { const wrapper = [(() => { log.push("r"); return Array; })()]; const [{ from }] = wrapper; return [typeof from, log.length]; })()',
    '(() => { const w1 = [(() => { log.push("r"); return Array; })()]; const w2 = w1; const [{ of }] = w2; return [typeof of, log.length]; })()',
    // a chain-assignment in the discarded init is rescued WHOLE: the binding captures, the
    // setup runs once, and the binding still gets the polyfill - for the array-leaf form too
    '(() => { let a; const [{ from }] = [(a = globalThis).Array]; return [typeof from, a === globalThis, log.length]; })()',
    '(() => { let a; const { Array: { of } } = (a = globalThis); return [typeof of, a === globalThis, log.length]; })()',
    '(() => { let a; const [{ from }] = [(a = (() => { log.push("r"); return Array; })())]; return [typeof from, typeof a, log.length]; })()',
    '(() => { let a; const [{ from }] = [(a = (() => { log.push("r"); return globalThis; })()).Array]; return [typeof from, a === globalThis, log.length]; })()',
    '(() => { let a = null; const [{ of }] = [(a ??= globalThis).Array]; return [typeof of, a === globalThis, log.length]; })()',
    // an ArrayPattern-wrapper whose leaf is a const-ALIAS of the constructor (`const A = Array; [A]`):
    // the leaf must be canonicalized back to Array, else `from` drops (babel usage-pure dropped while
    // unplugin rescued -> divergence). a 2-hop alias and an object-nested alias under the wrapper too
    '(() => { const A = Array; const [{ from }] = [A]; return JSON.stringify(from([1, 2])); })()',
    '(() => { const A = Array, B = A; const [{ of }] = [B]; return JSON.stringify(of(3, 4)); })()',
    '(() => { const A = Array; const [{ x: { from } }] = [{ x: A }]; return JSON.stringify(from([5, 6])); })()',
    // const-alias leaf canonicalization holds across more shapes: a pure OBJECT-nested destructure (the
    // sibling resolver, no array wrapper), an alias of a PROXY member, a `let` alias (no reassignment),
    // and a HOLE before the wrapper element. a non-global alias (`A = f`) must NOT polyfill
    '(() => { const A = Array; const { x: { from } } = { x: A }; return JSON.stringify(from([1, 2])); })()',
    '(() => { const A = globalThis.Array; const [{ of }] = [A]; return JSON.stringify(of(7, 8)); })()',
    '(() => { let A = Array; const [{ from }] = [A]; return JSON.stringify(from([1, 2])); })()',
    '(() => { const A = Array; const [, { of }] = [0, A]; return JSON.stringify(of(9)); })()',
    '(() => { function f() {} const A = f; const [{ from }] = [A]; return typeof from; })()',
  ],
  // side-effecting computed destructure key across different patterns - all must preserve the
  // effect (run once) and not crash. each is the shape that the static rewrite bails on
  'destructure-se-key': [
    '(() => { const { [(log.push("e"), "from")]: f } = Array; return [typeof f, log.length]; })()',
    '(() => { const { [(log.push("e"), "from")]: f } = globalThis.Array; return [typeof f, log.length]; })()',
    '(() => { const { x: { [(log.push("e"), "from")]: f } } = { x: Array }; return [typeof f, log.length]; })()',
    '(() => { const g = ({ [(log.push("e"), "from")]: f } = Array) => typeof f; return [g(), log.length]; })()',
    '(() => { const { [(log.push("e"), "fromEntries")]: f } = Object; return [typeof f, log.length]; })()',
    // a dead default carrying its OWN polyfillable call must be dropped (not run, not imported); an array-
    // pattern wrapper. both once mishandled the in-place lift (crash / double-run); the residual is uniform
    '(() => { const { [(log.push("e"), "from")]: f = (log.push("d"), 9) } = Array; return [typeof f, log.join(",")]; })()',
    '(() => { const [{ [(log.push("e"), "from")]: f }] = [Array]; return [typeof f, log.length]; })()',
    // `...rest` sibling: the key must stay in the residual for exclusion AND its effect run once (a lift
    // would double-run); aliased+default; a non-SE static sibling; assignment-target form
    '(() => { const { [(log.push("e"), "from")]: f, ...rest } = Array; return [typeof f, log.length, JSON.stringify(rest)]; })()',
    '(() => { const { [(log.push("e"), "from")]: f = 9 } = Array; return [typeof f, log.length]; })()',
    '(() => { const { of, [(log.push("e"), "from")]: f } = Array; return [typeof of, typeof f, log.length]; })()',
    '(() => { let f; ({ [(log.push("e"), "from")]: f } = Array); return [typeof f, log.length]; })()',
    '(() => { const { [(log.push("e"), "flat")]: m, ...rest } = arr; return [typeof m, log.length]; })()',
    // a side-effecting RECEIVER alongside the key effect (receiver runs first, then the key); a multi-
    // declarator with one SE-key sibling; a TEMPLATE-literal key; a polyfilled SE-key next to a non-
    // polyfilled one (`isArray` stays native here, but its effect must still run, in order)
    '(() => { const { [(log.push("k"), "from")]: f } = (log.push("r"), Array); return [typeof f, log.join(",")]; })()',
    '(() => { const z = 1, { [(log.push("e"), "from")]: f } = Array; return [z, typeof f, log.length]; })()',
    '(() => { const { [(log.push("e"), `from`)]: f } = Array; return [typeof f, log.length]; })()',
    '(() => { const { [(log.push("e"), "from")]: f, [(log.push("o"), "isArray")]: g } = Array; return [typeof f, typeof g, log.join(",")]; })()',
    // an INSTANCE-method SE-key with a non-Identifier (literal) receiver: the polyfill can\'t safely re-
    // reference the receiver, so it stays native - but the key effect must STILL run (babel once dropped
    // it by falling through to a receiver-discarding extraction)
    '(() => { const { [(log.push("e"), "flat")]: m } = [1, [2]]; return [typeof m, log.length]; })()',
    // an instance-method SE-key in a MULTI-declarator (Identifier receiver): the polyfill binds as a
    // trailing sibling declarator (a preceding statement could TDZ-fault an in-declaration receiver), the
    // effect runs once. once bailed to native by the planner
    '(() => { const z = 1, { [(log.push("e"), "flat")]: m } = arr; return [z, JSON.stringify(m.call(arr)), log.length]; })()',
  ],
  // multi-level nesting + static/instance combinations of side-effecting computed keys. each level's
  // effect must run in source order and every binding must survive. a static leaf is polyfilled; a NESTED
  // instance leaf is polyfilled too WHEN its receiver resolves to a bare Identifier (`_flatMaybeArray(arr)`,
  // resolved by walking the RHS along the nesting key), else it stays native (a literal / member receiver
  // can't be referenced twice without double-evaluating). the static+instance sibling shape once crashed
  // unplugin; nested+rest / nested+for-init once double-ran / crashed (lift in a place that can't lift)
  'destructure-se-key-nested': [
    '(() => { const { a: { [(log.push("e"), "from")]: f } } = { a: Array }; return [typeof f, log.length]; })()',
    '(() => { const { a: { b: { c: { [(log.push("e"), "from")]: f } } } } = { a: { b: { c: Array } } }; return [typeof f, log.length]; })()',
    '(() => { const { a: { [(log.push("e1"), "from")]: f, [(log.push("e2"), "of")]: g } } = { a: Array }; return [typeof f, typeof g, log.join(",")]; })()',
    '(() => { const { x: { [(log.push("s"), "from")]: f }, y: { [(log.push("i"), "flat")]: m } } = { x: Array, y: arr }; return [typeof f, typeof m, log.join(",")]; })()',
    '(() => { const { a: { b: { [(log.push("e"), "flat")]: m } } } = { a: { b: arr } }; return [typeof m, log.length]; })()',
    '(() => { const { a: { [(log.push("s"), "from")]: f }, b: { [(log.push("o"), "of")]: g } } = { a: Array, b: Array }; return [typeof f, typeof g, log.join(",")]; })()',
    '(() => { const { x: { [(log.push("e"), "from")]: f, ...rest } } = { x: Array }; return [typeof f, log.length, typeof rest]; })()',
    '(() => { let n = 0, t; for (const { x: { [(log.push("e"), "from")]: f } } = { x: Array }; n < 1; n++) t = typeof f; return [t, log.length]; })()',
    '(() => { const { p: { q: { [(log.push("s"), "from")]: f } }, r: { [(log.push("i"), "flat")]: m } } = { p: { q: Array }, r: arr }; return [typeof f, typeof m, log + ""]; })()',
    // a nested instance method with an IDENTIFIER receiver polyfills - verify the extracted polyfill works
    // (`m.call(arr)`), not just that a binding exists; a LITERAL receiver still bails to native consistently
    '(() => { const { y: { [(log.push("i"), "flat")]: m } } = { y: arr }; return [JSON.stringify(m.call(arr)), log.length]; })()',
    '(() => { const { y: { [(log.push("i"), "flat")]: m } } = { y: [5, [6]] }; return [typeof m, log.length]; })()',
  ],
  // nested INSTANCE method destructure WITHOUT a side-effect key. polyfills when the receiver resolves to
  // a bare Identifier (`_flatMaybeArray(arr)`, receiver walked from the RHS along the nesting key); a
  // side-effect-free LITERAL receiver ALSO polyfills - re-referencing it yields a fresh value of the same
  // type, so `_m`'s native-vs-polyfill pick is identical. a MEMBER (`o.arr` - getter) receiver bails to
  // native (re-referencing would re-fire the getter). verify the extracted (unbound) method works via
  // `m.call(...)`. the static+instance mix extracts both (pure binding order may differ - the 3-way runtime
  // + import-set parity hold regardless)
  'destructure-nested-instance': [
    '(() => { const { y: { flat: m } } = { y: arr }; return JSON.stringify(m.call(arr)); })()',
    '(() => { const { y: { flat: m } } = { y: [7, [8]] }; return JSON.stringify(m.call([3, [4]])); })()',
    '(() => { const o = { arr: [1, [2]] }; const { y: { flat: m } } = { y: o.arr }; return typeof m; })()',
    '(() => { const { a: { b: { flat: m } } } = { a: { b: arr } }; return JSON.stringify(m.call(arr)); })()',
    // re-referenceable literal receivers in more shapes: parens-wrapped, array-wrapped, and an
    // assignment host - all polyfill (re-referencing a side-effect-free literal is safe)
    '(() => { const { y: { flat: m } } = { y: ([1, [2]]) }; return JSON.stringify(m.call([3, [4]])); })()',
    '(() => { const [{ flat: m }] = [[1, [2]]]; return JSON.stringify(m.call([3, [4]])); })()',
    '(() => { let m; ({ y: { flat: m } } = { y: [5, [6]] }); return JSON.stringify(m.call([3, [4]])); })()',
    // a non-array literal receiver type (string method); a CONSTANT template is a string constant so it
    // polyfills (StringLiteral parity), but an INTERPOLATED template bails (re-running x's coercion)
    '(() => { const { y: { padStart: m } } = { y: "ab" }; return m.call("cd", 4, "x"); })()',
    '(() => { const { y: { padStart: m } } = { y: `ab` }; return m.call("cd", 4, "x"); })()',
    // eslint-disable-next-line no-template-curly-in-string -- snippets carry template-literal SOURCE as a string
    '(() => { const x = "z"; const { y: { padStart: m } } = { y: `a${ x }` }; return typeof m; })()',
    '(() => { const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr }; return [typeof f, JSON.stringify(m.call(arr))]; })()',
    // a for-init declarator AND a multi-declarator both route the instance binding to a TRAILING sibling
    // declarator in the same declaration (a preceding statement is impossible in a loop header / unsafe
    // when the receiver is bound earlier in the same declaration). the in-declaration-receiver case
    // (`const r = arr, { ... } = r`) is safe via the trailing sibling - no TDZ. babel once threw
    // "Duplicate declaration" on the for-init; the multi-declarator once bailed to native (unplugin) /
    // diverged (babel). verify the extracted method actually works (`m.call`)
    '(() => { let o = true, b; for (const { y: { flat: m } } = { y: arr }; o; o = false) b = m; return JSON.stringify(b.call(arr)); })()',
    '(() => { const z = 1, { y: { flat: m } } = { y: arr }; return [z, JSON.stringify(m.call(arr))]; })()',
    '(() => { const r = arr, { y: { flat: m } } = { y: r }; return JSON.stringify(m.call(r)); })()',
    // for-init combined with a multi-declarator; two destructure declarators in one declaration (static +
    // instance) - both polyfill, the instance via its sibling
    '(() => { let o = true, b; for (const z = 1, { y: { flat: m } } = { y: arr }; o; o = false) b = m; return JSON.stringify(b.call(arr)); })()',
    '(() => { const { a: { from: f } } = { a: Array }, { y: { flat: m } } = { y: arr }; return [typeof f, JSON.stringify(m.call(arr))]; })()',
    // an ArrayPattern wrapper around the nested instance: the receiver resolver walks array INDICES too
    // (`[0]`), not just object keys, so `[{ y: { flat } }] = [{ y: arr }]` polyfills - including a hole
    // before the element (index tracked, not assumed 0)
    '(() => { const [{ y: { flat: m } }] = [{ y: arr }]; return JSON.stringify(m.call(arr)); })()',
    '(() => { const [, { y: { flat: m } }] = [0, { y: arr }]; return JSON.stringify(m.call(arr)); })()',
    // a parenthesized RHS object literal AND a parenthesized receiver value: parens are transparent, so
    // both must resolve the receiver THROUGH them (babel folds parens into node `extra`; estree keeps a
    // `ParenthesizedExpression`). `resolveNestedReceiverNode` peels via `unwrapExpressionChain` - without
    // it babel polyfilled while unplugin bailed (import-set divergence)
    '(() => { const { y: { flat: m } } = ({ y: arr }); return JSON.stringify(m.call(arr)); })()',
    '(() => { const { y: { flat: m } } = { y: (arr) }; return JSON.stringify(m.call(arr)); })()',
    // a DOUBLY-array wrapper and a destructuring-ASSIGNMENT host (statement context, incl. array-wrapped):
    // both polyfill. the array case walks two array indices; the assignment has no declaration to extract a
    // `const` into, so the polyfill appends `m = _flatMaybeArray(recv)` AFTER the statement - the destructure
    // assigns m natively first (undefined where the method is absent), then this overwrite makes it win
    '(() => { const [[{ flat: m }]] = [[arr]]; return JSON.stringify(m.call(arr)); })()',
    '(() => { let m; ({ y: { flat: m } } = { y: arr }); return JSON.stringify(m.call(arr)); })()',
    '(() => { let m; ([{ y: { flat: m } }] = [{ y: arr }]); return JSON.stringify(m.call(arr)); })()',
    // assignment-overwrite edges: a top-level SIBLING binding survives the destructure; TWO nested instances
    // each get their own overwrite (independent bindings - the two emit in different orders across plugins,
    // but that is runtime-equivalent); a multi-element array mixes a static + an instance sibling
    '(() => { let m, z; ({ y: { flat: m }, z } = { y: arr, z: 9 }); return [z, JSON.stringify(m.call(arr))]; })()',
    '(() => { const a2 = [3, [4]]; let m, n; ({ y: { flat: m }, z: { flat: n } } = { y: arr, z: a2 }); return [JSON.stringify(m.call(arr)), JSON.stringify(n.call(a2))]; })()',
    '(() => { const [{ from: f }, { flat: m }] = [Array, arr]; return [typeof f, JSON.stringify(m.call(arr))]; })()',
    // KNOWN consistent bails (both leave native - regression guard against a future divergence): an array
    // spread (shifts the static index, not statically resolvable), an EXPRESSION-context assignment (no
    // statement to append the overwrite after, and the `(... = R)` value would need preserving), and a
    // non-Identifier (member) binding target (`o.m` - can't be safely re-bound by the overwrite)
    '(() => { const base = [{ y: arr }]; const [{ y: { flat: m } }] = [...base]; return JSON.stringify(m.call(arr)); })()',
    '(() => { let m, z; z = ({ y: { flat: m } } = { y: arr }); return [typeof m, typeof z]; })()',
    '(() => { const o = {}; ({ y: { flat: o.m } } = { y: arr }); return JSON.stringify(o.m.call(arr)); })()',
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
  // a polyfilled `key in obj` fold whose obj (or key) carries SE behind a TS wrapper: the fold must still
  // run the assignment / sequence SE and pull its import. babel's identity `unwrap` once dropped the
  // TS-wrapped SE (emitting a bare `true`) while unplugin's TS-peeling unwrap rescued it (divergence) -
  // the shared planner now peels TS via `unwrapRuntimeExpr` for both operands
  'ts-in-expression': [
    '(() => { let y; const r = "groupBy" in ((y = Map) as any); return [r, typeof y]; })()',
    '(() => { let n = 0; const r = "flat" in ((n++, []) as any); return [r, n]; })()',
    '(() => { let y; const r = ("groupBy" as string) in (y = Map)!; return [r, typeof y]; })()',
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
  // and must NOT be polyfilled as the constructor. (a braceless TS declaration in a switch CASE
  // shadows the whole switch block scope too, but `@babel/plugin-transform-typescript` cannot lower
  // that shape - "Unexpected enum parent SwitchCase" - so it has no runnable native baseline here and
  // is locked by `audit-switch-case-ts-runtime-binding-shadow` as a text/parity fixture instead)
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
  yield * generateDestructure();
  yield * generateProxyGlobalSEReceiver();
  yield * generateConditionalMirror();
  yield * generateChains();
  yield * generateIn();
  yield * generateMutatedStatic();
  yield * generateMutatedSibling();
  yield * generateMutatedDestructure();
  yield * generateMutatedNarrowChain();
  yield * generateMutatedComputedKey();
  yield * generateMutatedWrapperAssign();
  yield * generateSeOrder();
  yield * generateOptionalArgSe();
  for (const [family, exprs] of Object.entries(EXPR_FAMILIES)) {
    for (const expr of exprs) yield snippet(`${ family }: ${ expr }`, expr);
  }
  for (const [family, exprs] of Object.entries(TS_FAMILIES)) {
    for (const expr of exprs) yield { ...snippet(`${ family }: ${ expr }`, expr), ts: true };
  }
}

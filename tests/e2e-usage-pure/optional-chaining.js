// Optional chaining: various patterns with polyfilled methods

// basic
QUnit.test('optional: obj?.includes(x)', assert => {
  const arr = [1, 2, 3];
  assert.true(arr?.includes(2));
  assert.same(null?.includes(2), undefined);
});

QUnit.test('optional: obj?.at(i)', assert => {
  const arr = [10, 20, 30];
  assert.same(arr?.at(-1), 30);
  assert.same(null?.at(0), undefined);
});

QUnit.test('optional: obj?.trim()', assert => {
  assert.same('  hello  '?.trim(), 'hello');
  assert.same(null?.trim(), undefined);
});

QUnit.test('optional: obj?.startsWith(x)', assert => {
  assert.true('hello'?.startsWith('hel'));
  assert.same(null?.startsWith('hel'), undefined);
});

QUnit.test('optional: arr?.flat()', assert => {
  assert.deepEqual([[1], [2, 3]]?.flat(), [1, 2, 3]);
  assert.same(null?.flat(), undefined);
});

QUnit.test('optional: arr?.findIndex(fn)', assert => {
  assert.same([10, 20, 30]?.findIndex(x => x > 15), 1);
  assert.same(null?.findIndex(x => x > 15), undefined);
});

QUnit.test('optional: str?.padStart(n, ch)', assert => {
  assert.same('5'?.padStart(3, '0'), '005');
  assert.same(null?.padStart(3, '0'), undefined);
});

QUnit.test('optional: null?.reduce(fn, init)', assert => {
  assert.same(null?.reduce((a, b) => a + b, 0), undefined);
});

// chained
QUnit.test('optional chain: arr?.filter(fn)?.map(fn)', assert => {
  assert.deepEqual([1, 2, 3, 4]?.filter(x => x % 2)?.map(x => x * 10), [10, 30]);
  assert.same(null?.filter(x => x % 2)?.map(x => x * 10), undefined);
});

QUnit.test('optional chain: arr?.filter(fn)?.at(-1)', assert => {
  assert.same([1, 2, 3, 4, 5]?.filter(x => x > 3)?.at(-1), 5);
  assert.same(null?.filter(x => x > 3)?.at(-1), undefined);
});

// deep nesting
QUnit.test('deep optional: obj?.prop?.includes(x)', assert => {
  const data = { items: [1, 2, 3] };
  assert.true(data?.items?.includes(2));
  assert.same(null?.items?.includes(2), undefined);
  assert.same(data?.missing?.includes(2), undefined);
});

QUnit.test('deep optional: a?.b?.c?.includes(x)', assert => {
  const obj = { b: { c: [1, 2, 3] } };
  assert.true(obj?.b?.c?.includes(2));
  assert.same(null?.b?.c?.includes(2), undefined);
});

// mixed optional and non-optional
QUnit.test('mixed: data?.items.at(-1)', assert => {
  const data = { items: [10, 20, 30] };
  assert.same(data?.items.at(-1), 30);
  assert.true(data?.items.includes(20));
});

// optional on static
QUnit.test('optional static: Array?.from', assert => {
  assert.deepEqual(Array?.from('abc'), ['a', 'b', 'c']);
});

// optional call on stored reference
QUnit.test('optional call: fn?.call(ctx, arg)', assert => {
  const arr = [1, 2, 3];
  const fn = arr.includes;
  assert.true(fn?.call(arr, 2));
});

// chain continuation after polyfill - .valueOf() must stay inside guard
QUnit.test('optional chain continuation: arr?.flat().valueOf()', assert => {
  assert.deepEqual([1, [2]]?.flat().valueOf(), [1, 2]);
  assert.same(null?.flat().valueOf(), undefined);
});

// double optional with two polyfilled methods
QUnit.test('double optional: arr?.at(0)?.toString()', assert => {
  assert.same([42]?.at(0)?.toString(), '42');
  assert.same(null?.at(0)?.toString(), undefined);
});

// parenthesized optional callee - breaks chain
QUnit.test('parenthesized optional: (arr?.includes)(1)', assert => {
  // null case: (null?.includes) -> undefined, then (undefined)(2) -> TypeError
  const nil = null;
  // eslint-disable-next-line no-unsafe-optional-chaining -- testing this exact pattern
  assert.throws(() => (nil?.includes)(2), TypeError);
});

// parenthesized non-optional - this preserved
QUnit.test('parenthesized non-optional: (arr.at)(0)', assert => {
  const arr = [10, 20, 30];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing parenthesized callee
  assert.same((arr.at)(0), 10);
});

// nested optional with non-polyfillable first member
QUnit.test('nested optional: obj?.prop?.includes(x)', assert => {
  const obj = { list: [1, 2, 3] };
  assert.true(obj?.list?.includes(2));
  assert.same(null?.list?.includes(2), undefined);
  assert.same(obj?.missing?.includes(2), undefined);
});

// --- chained polyfills via optional call: inner chain + outer polyfill ---

// user method returning array, followed by non-optional polyfilled .at
QUnit.test('user method chain: a?.b?.().at(0)', assert => {
  const a = { b: () => [10, 20, 30] };
  assert.same(a?.b?.().at(0), 10);
  assert.same(null?.b?.().at(0), undefined);
  assert.same({ b: null }?.b?.().at(0), undefined);
});

// polyfillable instance method inside the chain + non-optional outer polyfill
QUnit.test('poly chain with side-effect receiver: (a())?.at?.(1).slice(0)', assert => {
  function nil() { return null; }
  assert.same(nil()?.at?.(1).slice(0), undefined);
  function arr() { return [[1], [2], [3]]; }
  assert.deepEqual(arr()?.at?.(1).slice(0), [2]);
});

// both inner and outer polyfilled, non-optional continuation
QUnit.test('poly chain: [].at?.(1).slice(0) with non-empty', assert => {
  const arr = [[1], [2], [3]];
  assert.deepEqual(arr.at?.(1).slice(0), [2]);
});

// inner returns value-undef (NOT short-circuit) and non-optional outer runs on it - native throws
QUnit.test('poly chain: [].at?.(1).slice(0) on empty throws like native', assert => {
  assert.throws(() => [].at?.(1).slice(0), TypeError);
});

// both-optional variant
QUnit.test('poly chain both optional: arr.at?.(i)?.slice(0)', assert => {
  const arr = [[1], [2], [3]];
  assert.deepEqual(arr.at?.(1)?.slice(0), [2]);
  assert.same([].at?.(5)?.slice(0), undefined);
});

// side-effect receiver + polyfill chain + polyfill outer
QUnit.test('poly chain: a()?.flat?.(1).at(0)', assert => {
  function nil() { return null; }
  assert.same(nil()?.flat?.(1).at(0), undefined);
  function nested() { return [[1], [2]]; }
  assert.same(nested()?.flat?.(1).at(0), 1);
});

// deeper user-chain with polyfill at the tail
QUnit.test('deep user chain: a?.b?.c?.().at(0)', assert => {
  const a = { b: { c: () => [10, 20] } };
  assert.same(a?.b?.c?.().at(0), 10);
  assert.same(null?.b?.c?.().at(0), undefined);
  assert.same({ b: null }?.b?.c?.().at(0), undefined);
  assert.same({ b: { c: null } }?.b?.c?.().at(0), undefined);
});

QUnit.test('optional: factory returning maybe-null array + .at / .includes chain', assert => {
  function make(n) {
    return n > 0 ? [1, 2, 3] : null;
  }
  assert.same(make(1)?.at(-1), 3);
  assert.same(make(0)?.at(-1), undefined);
  assert.same(make(1)?.includes?.(2), true);
});

// --- parenthesized lookup variations: (callee)(args) shapes ---

QUnit.test('paren lookup: (arr.at)(0) preserves this binding', assert => {
  // (arr.at)(0) - paren-wrapped MemberExpression callee. plugin must emit a form that
  // preserves the receiver binding so the polyfill receives `arr` as `this` (raw
  // `_at(arr).call(arr, 0)` - the `.call` is essential, bare `_at(arr)(0)` would lose it)
  const arr = [10, 20, 30];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing parenthesized callee
  assert.same((arr.at)(-1), 30);
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing parenthesized callee
  assert.true((arr.includes)(20));
});

QUnit.test('paren lookup: (arr?.at)(0) optional inside paren', assert => {
  // optional inside paren - the optional chain breaks at the paren, so calling on a nullish
  // receiver throws TypeError rather than short-circuiting to undefined
  const arr = [10, 20, 30];
  // eslint-disable-next-line no-unsafe-optional-chaining -- testing exact paren-optional pattern
  assert.same((arr?.at)(-1), 30);
  const nil = null;
  assert.throws(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining -- testing exact paren-optional pattern
    (nil?.at)(0);
  }, TypeError);
});

QUnit.test('paren lookup: array literal + (arr?.at)(args)', assert => {
  // direct array literal as receiver inside paren-optional: outer non-optional call must
  // still preserve `this`-binding so polyfill `at` receives the array as `this`
  // eslint-disable-next-line no-unsafe-optional-chaining -- testing exact paren-optional pattern
  assert.same(([1, 2, 3]?.at)(0), 1);
});

// --- optional method call preserves `this` (receiver binding through the call guard) ---

// `recv.m?.()` guards the method but must invoke it with `this === recv`; a method reading
// `this` throws if the receiver is lost (emitting `_ref()` instead of `_ref.call(recv)`)
QUnit.test('optional method call preserves this: obj.getArr?.().at(0)', assert => {
  const obj = {
    data: [10, 20, 30],
    getArr() { return this.data; },
  };
  assert.same(obj.getArr?.().at(0), 10);
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing
  assert.same(({ getArr: null }).getArr?.().at(0), undefined);
});

// side-effecting receiver: `this` preserved AND the receiver evaluated exactly once
QUnit.test('optional method call: side-effect receiver once + this kept', assert => {
  let calls = 0;
  function make() {
    calls += 1;
    return {
      data: [7, 8, 9],
      getArr() { return this.data; },
    };
  }
  assert.same(make().getArr?.().at(0), 7);
  assert.same(calls, 1);
});

// non-bare optional root + non-optional polyfilled hops: root memoized once, not re-read
QUnit.test('optional non-bare root single-eval: getO()?.p.slice(1).flat(2)', assert => {
  let calls = 0;
  function getO() {
    calls += 1;
    return { p: [[1], [2], [3]] };
  }
  assert.deepEqual(getO()?.p.slice(1).flat(2), [2, 3]);
  assert.same(calls, 1);
  assert.same(null?.p.slice(1).flat(2), undefined);
});

// combined chain: optional inner call reached through a side-effecting computed key, with a trailing
// hop. per ECMA the receiver object evaluates before the computed key, so `recv()` must run before
// the key effect. (was unplugin-only: key effect emitted ahead of the receiver memo)
QUnit.test('optional combined chain: receiver evaluates before computed-key SE', assert => {
  const log = [];
  function recv() {
    log.push('recv');
    return [[1]];
  }
  function key() {
    log.push('key');
    return 'flat';
  }
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const r = recv()[key(), 'flat']?.().map(x => x);
  assert.deepEqual(r, [1]);
  assert.deepEqual(log, ['recv', 'key']);
});

// poly-optional call -> non-optional member tail -> SURVIVING optional continuation, under an
// operator / unary / logical / ternary context. the guard ternary must be parenthesized over the
// deoptionalized prefix so the operator binds the guarded value; on a nullish root the whole chain
// short-circuits to undefined BEFORE the operator. (was unplugin-only: the unparenthesized guard
// flipped `-a == null` or applied the operator to the guard's nullish test / alternate)
QUnit.test('optional poly tail + surviving optional under operator: nullish short-circuit', assert => {
  // null root: each chain short-circuits to undefined, then the operator applies to undefined
  // eslint-disable-next-line @stylistic/no-extra-parens -- mirrors the exact grammar under test
  assert.true(Number.isNaN((null)?.at(-1).x?.y ** 2));
  // the unary case is the one that THREW pre-fix (`-a == null` flipped the guard, calling on null)
  assert.true(Number.isNaN(-null?.flat().x?.y));
  assert.same(null?.findLast(Boolean).x?.y || 7, 7);
  assert.same(null?.at(-1).x?.y ? 'then' : 'else', 'else');
  // live root: the chain runs; `.x` is absent so the surviving `?.y` short-circuits to undefined
  assert.true(Number.isNaN([2, 3]?.at(-1).x?.y ** 2));
  assert.same([2, 3]?.findLast(Boolean).x?.y || 7, 7);
});

// the same poly-optional tail + surviving optional in a PLAIN ASSIGNMENT (no operator). babel and
// unplugin render the guard ternary differently (`(guard.x)?.y` vs `guard.x?.y`, locked by the
// fixture sidecar) but both are runtime-equivalent: a nullish root short-circuits the whole chain
// to undefined, and a live root whose `.x` is absent short-circuits the surviving `?.y` too.
QUnit.test('optional poly tail + surviving optional in plain assignment: undefined on both paths', assert => {
  const nullRoot = null?.at(-1).x?.y;
  assert.same(nullRoot, undefined);
  const liveRoot = [2, 3]?.findLast(Boolean).x?.y;
  assert.same(liveRoot, undefined);
});

// optional CALL on a NON-static member of a polyfilled global (`Promise` / `Map` are in `globals`
// under the ie:11 leg). the `?.` guards the undefined member, NOT the always-defined global, so the
// whole chain short-circuits to undefined. deopting the guard as if the member were a real static
// calls a non-existent static and throws - this asserts the guard survives the rewrite.
QUnit.test('optional call on non-static member of polyfilled global short-circuits', assert => {
  // eslint-disable-next-line es/no-nonstandard-promise-properties -- the missing static IS the case
  assert.same(Promise.noSuchStatic?.().includes(0), undefined);
  // eslint-disable-next-line es/no-nonstandard-map-properties -- the missing static IS the case
  assert.same(globalThis.Map.notAMethod?.().at(0), undefined);
  // two trailing polys (multi-poly compose path) - the guard must still short-circuit the chain
  // eslint-disable-next-line es/no-nonstandard-promise-properties -- the missing static IS the case
  assert.same(Promise.noSuchStatic?.().flat().at(0), undefined);
  // proxy-global static receiver, multi-trailing (combined-chain path): the emitted receiver must
  // collapse to the pure ctor and the chain still short-circuit to undefined
  // eslint-disable-next-line es/no-nonstandard-map-properties -- the missing static IS the case
  assert.same(globalThis.Map.notAMethod?.().flat().at(0), undefined);
  // ALIASED proxy-global receiver: the alias must resolve to the proxy so the emitted receiver
  // collapses to the pure ctor and the chain short-circuits; mis-resolving the alias would deopt as a
  // real-static call and invoke a missing static (TypeError) instead of short-circuiting to undefined
  const aliasedGlobal = globalThis;
  // eslint-disable-next-line es/no-nonstandard-map-properties -- the missing static IS the case
  assert.same(aliasedGlobal.Map.notAMethod?.().flat().at(0), undefined);
  // positive control: a REAL static call IS deopted (the guard is genuinely redundant) and the
  // trailing polyfill still runs on its result
  assert.same(Array.of?.(3, 1, 2).at(-1), 2);
});

// a side-effecting receiver before the non-static-member optional call: the preserved guard must
// evaluate the receiver exactly once (not drop or double-run the side effect) and still short-circuit
QUnit.test('optional call on non-static global member: side-effect receiver runs once', assert => {
  let calls = 0;
  function recv() {
    calls += 1;
    return Promise;
  }
  assert.same((recv(), Promise).noSuchStatic?.().includes(0), undefined);
  assert.same(calls, 1);
  // SE-tail proxy-global static receiver, multi-trailing: the static collapses while the leading
  // effect stays ahead in eval order and runs exactly once, then the chain short-circuits
  let seq = 0;
  function bump() {
    seq += 1;
    return 0;
  }
  // eslint-disable-next-line es/no-nonstandard-map-properties -- the missing static IS the case
  assert.same((bump(), globalThis).Map.notAMethod?.().flat().at(0), undefined);
  assert.same(seq, 1);
  // chain-assign receiver of a proxy-global static: the assignment side effect must survive (the
  // collapse must not consume and drop it), so `a` is still bound after the chain short-circuits
  let a;
  // eslint-disable-next-line es/no-nonstandard-map-properties -- the missing static IS the case
  assert.same((a = globalThis).Map.notAMethod?.().flat().at(0), undefined);
  assert.same(a, globalThis);
});

// a non-identifier computed inner method-get in a combined optional chain must re-read the
// member from its bracket source (`obj['a-b']`), never `obj.a-b` (which computes subtraction).
// the chain resolves the runtime value, proving the emitted member access is a real read
QUnit.test('optional chain: computed non-identifier inner member reads through brackets', assert => {
  const obj = { 'a-b': () => [[1, 2], [3]] };
  assert.same(obj['a-b']?.().flat().at(0), 1);
  // a bare-identifier computed key on the same shape resolves the same runtime value
  const obj2 = { from: () => [[4], [5, 6]] };
  // eslint-disable-next-line dot-notation -- the computed key form IS the case under test
  assert.same(obj2['from']?.().flat().at(-1), 6);
  // a NUMERIC computed inner in a combined chain (two trailing polys) keeps the numeric index -
  // the runtime value proves the chain combined instead of crashing on overlapping transforms
  const arr = [() => [[7], [8, 9]]];
  assert.same(arr[0]?.().flat().at(0), 7);
  // a DYNAMIC key resolves the same runtime value
  const rec = { pick: () => [[10], [11]] };
  const key = 'pick';
  assert.same(rec[key]?.().flat().at(-1), 11);
});

// a trailing NON-optional member after an optional poly call is part of the SAME chain:
// a short-circuit anywhere before it must skip it and yield undefined - a severed emit
// (`(guard ? void 0 : dispatch).length`) would throw on the void 0 path instead
QUnit.test('optional chain: short-circuit skips trailing members after a poly call', assert => {
  function tailAfterCall(o) { return o?.rows.flat?.().length; }
  assert.same(tailAfterCall(undefined), undefined);
  assert.same(tailAfterCall({ rows: {} }), undefined);
  assert.same(tailAfterCall({ rows: [[1], [2, 3]] }), 3);
  // combined chain with an intermediate hop and a trailing member off the outer optional call
  function tailAfterCombined(o) { return o?.rows.flat?.().map(x => x + 1).filter?.(x => x > 1).length; }
  assert.same(tailAfterCombined(undefined), undefined);
  assert.same(tailAfterCombined({ rows: {} }), undefined);
  assert.same(tailAfterCombined({ rows: [[0], [1]] }), 1);
  // trailing optional CALL on a non-poly member keeps its pairing with the receiver
  function tailOptionalCall(o) { return o?.list.at?.(0).includes?.(2); }
  assert.same(tailOptionalCall(undefined), undefined);
  assert.same(tailOptionalCall({ list: {} }), undefined);
  assert.same(tailOptionalCall({ list: [[2], [3]] }), true);
  // computed trailing key after the outer optional call of a combined chain
  function tailComputed(o) { return o?.rows.flat?.().filter?.(x => x > 1)[0]; }
  assert.same(tailComputed(undefined), undefined);
  assert.same(tailComputed({ rows: {} }), undefined);
  assert.same(tailComputed({ rows: [[1], [2]] }), 2);
});

// a receiver carrying its OWN live `?.` short-circuits the whole chain natively: the combined
// dispatch must test it before the maybe-helper reads its member, or a nullish anywhere in the
// receiver throws where native yields undefined
QUnit.test('optional chain: receiver-level short-circuit reaches the combined dispatch', assert => {
  function twoLive(a) { return a?.b?.c.flat?.().map(x => x).length; }
  assert.same(twoLive(undefined), undefined);
  assert.same(twoLive({ b: undefined }), undefined);
  assert.same(twoLive({ b: { c: [[1], [2]] } }), 2);
  // the live `?.` may sit deeper than the root, and the root itself may be plain
  function deeperSeated(a) { return a.b?.c.flat?.().map(x => x).length; }
  assert.same(deeperSeated({ b: undefined }), undefined);
  assert.same(deeperSeated({ b: { c: [[1], [2]] } }), 2);
  // an optional CALL inside the receiver short-circuits the same way
  function callMid(a) { return a?.get?.().rows.flat?.().map(x => x).length; }
  assert.same(callMid({ get: undefined }), undefined);
  assert.same(callMid({ get: () => ({ rows: [[1], [2]] }) }), 2);
  // a polyfilled optional call as the receiver: a missing method short-circuits the outer chain
  function polyReceiver(a) { return a.flat?.().flat?.().includes(2); }
  assert.same(polyReceiver({}), undefined);
  assert.same(polyReceiver([[1], [2]]), true);
  // a NON-polyfilled inner method reads off the same receiver memo - its read short-circuits too
  function nonPolyInner(o) { return o?.b.c.notPolyfilled?.().map(x => x).length; }
  assert.same(nonPolyInner(undefined), undefined);
  assert.same(nonPolyInner({ b: { c: {} } }), undefined);
  assert.same(nonPolyInner({ b: { c: { notPolyfilled: () => [[1], [2]] } } }), 2);
  // NEGATIVE: parens END the chain, so a sealed `?.` must keep throwing past the barrier, and a
  // receiver with no live `?.` keeps throwing on its own member read
  // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed-chain throw IS the case
  function parenSealed(a) { return (a?.b).c.flat?.().map(x => x).length; }
  assert.throws(() => parenSealed(undefined), TypeError);
  function plainReceiver(arr) { return arr.flat?.().map(x => x).length; }
  assert.throws(() => plainReceiver(undefined), TypeError);
  // the receiver evaluates exactly once despite being tested and then read
  let reads = 0;
  const counted = {
    // eslint-disable-next-line es/no-accessor-properties -- the single-evaluation count IS the case
    get b() {
      reads += 1;
      return { c: [[1], [2]] };
    },
  };
  assert.same(twoLive(counted), 2);
  assert.same(reads, 1);
});

// a static reached through an OPAQUE inline-call proxy-nav root under an OUTER instance
// dispatch: the guard keeps the short-circuit (one root evaluation), and the guarded branch
// collapses the static onto the ponyfill - the value must be polyfill-backed on stripped
// engines for both the call and the FIELD static spellings. the pristine hop is `globalThis`
// (`window` does not exist in the Node runner; the window spelling is fixture-locked)
QUnit.test('optional chaining: opaque call root with outer-guarded static', assert => {
  function opaqueRoot() { return globalThis; }
  assert.same(opaqueRoot()?.globalThis?.Array.of(5).at(0), 5);
  assert.same(opaqueRoot()?.globalThis?.Number.MAX_SAFE_INTEGER.toFixed(0), '9007199254740991');
  let opaqueCalls = 0;
  function countedRoot() {
    opaqueCalls += 1;
    return globalThis;
  }
  assert.same(countedRoot()?.globalThis?.Array.of(7).at(-1), 7);
  assert.same(opaqueCalls, 1);
  function nullRoot() { return null; }
  assert.same(nullRoot()?.globalThis?.Array.of(5).at(0), undefined);
});

// DEEP pristine hops over the provably pure root read off the PONYFILL leaf: `self` does not
// exist in the Node runner, so this value is polyfill-backed or nothing. the detect-lowered leg
// sees the chain pre-lowered onto temp variables (`_root.self` off a local) - the hop is
// structurally unresolvable there and the raw read stays native, so the leg skips
const testUnlessDetectLowered = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;
testUnlessDetectLowered('optional chaining: deep pristine hops read the ponyfill leaf', assert => {
  function deepRoot() { return globalThis; }
  assert.same(deepRoot()?.self?.globalThis?.Array.of(3).at(0), 3);
});

// hops SWAPPED (the unresolvable `window` hop before the ponyfillable `self` hop): ONE nested
// test on the window prefix guards the chain. the browser legs have `window`, so the guard
// takes the ponyfill-backed branch; the Node runner does not, so the guard must fire
// (undefined) WITHOUT evaluating the branch - a guard that tested the always-defined
// ponyfill instead would run the branch on BOTH
const WINDOW_PRESENT = typeof window != 'undefined';
QUnit.test('optional chaining: swapped-hop guard fires on the raw prefix', assert => {
  let swapCalls = 0;
  function swappedRoot() {
    swapCalls += 1;
    return globalThis;
  }
  assert.same(swappedRoot()?.window?.self?.Array.of(12).at(0), WINDOW_PRESENT ? 12 : undefined);
  assert.same(swapCalls, 1);
});

// the same guard through a CONST-bound computed hop key, a CHAIN-ASSIGN root (the write
// still runs exactly once), and an SE-PREFIXED computed key (native evaluates the key ONLY
// past a present `window` - where it is absent the short-circuit precedes the key effect)
QUnit.test('optional chaining: swapped-hop guard variants keep native semantics', assert => {
  const hopKey = 'self';
  function computedRoot() { return globalThis; }
  assert.same(computedRoot()?.window?.[hopKey]?.Array.of(13).at(0), WINDOW_PRESENT ? 13 : undefined);
  let held;
  let assignCalls = 0;
  function assignRoot() {
    assignCalls += 1;
    return globalThis;
  }
  assert.same((held = assignRoot())?.window?.self?.Array.of(14).at(0), WINDOW_PRESENT ? 14 : undefined);
  assert.same(assignCalls, 1);
  assert.same(held, globalThis);
  let keyEffects = 0;
  function seKeyRoot() { return globalThis; }
  // eslint-disable-next-line @stylistic/no-extra-parens -- the SE-prefixed key IS the case
  assert.same(seKeyRoot()?.window?.[(keyEffects++, 'self')]?.Array.of(15).at(0), WINDOW_PRESENT ? 15 : undefined);
  assert.same(keyEffects, WINDOW_PRESENT ? 1 : 0);
});

// the BARE proxy-root probe (`globalThis.window` with no call / assignment around the root):
// the guard tests the raw `window` read, and past a present `window` the chain continues off
// the ponyfill-backed hop - a raw `self` read there would miss the ponyfill class
QUnit.test('optional chaining: bare proxy-root probe guards on the raw prefix', assert => {
  let keyEffects = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the SE-prefixed key IS the case
  assert.same(globalThis.window?.[(keyEffects++, 'self')]?.Array.of(21).at(0), WINDOW_PRESENT ? 21 : undefined);
  assert.same(keyEffects, WINDOW_PRESENT ? 1 : 0);
  assert.same(globalThis.window?.self?.Array.of(22).at(0), WINDOW_PRESENT ? 22 : undefined);
  // a PLAIN claimless tail after the guarded hop: the source `?.` short-circuits the WHOLE
  // chain, so past an absent `window` the tail read must not throw and the key effect must
  // not run
  let plainKeyEffects = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the SE-prefixed key IS the case
  assert.same(typeof globalThis.window?.[(plainKeyEffects++, 'self')].Number, WINDOW_PRESENT ? 'function' : 'undefined');
  assert.same(plainKeyEffects, WINDOW_PRESENT ? 1 : 0);
  assert.same(typeof globalThis.window?.self.JSON, WINDOW_PRESENT ? 'object' : 'undefined');
});

// a SECOND unresolvable hop past the probe (`window?.window` - the realm self-reference):
// the guard tests the DEEPER prefix, so the `?.` inside that test guards the probe itself and
// stays live. rendering the test with the whole spine plain read `.window` off the absent
// probe - a TypeError where the source yields undefined
QUnit.test('optional chaining: a second unresolvable hop keeps the inner guard live', assert => {
  assert.same(globalThis.window?.window?.self?.Array.of(31).at(0), WINDOW_PRESENT ? 31 : undefined);
  assert.same(globalThis?.window?.window?.self?.Array.of(32).at(0), WINDOW_PRESENT ? 32 : undefined);
  let hopCalls = 0;
  function deepRoot() {
    hopCalls += 1;
    return globalThis;
  }
  assert.same(deepRoot()?.window?.window?.self?.Array.of(33).at(0), WINDOW_PRESENT ? 33 : undefined);
  assert.same(hopCalls, 1);
});

// a CHAIN-ASSIGN root under an instance dispatch: the memo may bind only the assignment (the
// hops fold out of the test) ONLY while they are always defined - an unresolvable hop is the
// probe itself, so the memoized value must keep it. binding the bare write instead tested an
// always-defined global and ran the branch where the source short-circuits
QUnit.test('optional chaining: chain-assign root memo keeps the probe hop', assert => {
  let held;
  assert.same((held = globalThis)?.window?.self?.Array.of(34).at(0), WINDOW_PRESENT ? 34 : undefined);
  assert.same(held, globalThis);
  let deepHeld;
  assert.same((deepHeld = globalThis)?.window?.window?.self?.Array.of(35).at(0), WINDOW_PRESENT ? 35 : undefined);
  assert.same(deepHeld, globalThis);
  // the write runs exactly once even though the guard and the branch both mention the value
  let writes = 0;
  let counted;
  function countingRoot() {
    writes += 1;
    return globalThis;
  }
  assert.same((counted = countingRoot())?.window?.self?.Array.of(36).at(0), WINDOW_PRESENT ? 36 : undefined);
  assert.same(writes, 1);
  assert.same(counted, globalThis);
});

// a CONDITIONALLY proven callee: the unassigned path is exactly what the chain's `?.` guards,
// so neither the call's own `?.()` nor the `?.` over its value is vestigial. eating either one
// throws on the path where the callee was never assigned
QUnit.test('optional chaining: a conditionally proven callee keeps its guards', assert => {
  let never;
  if (typeof never === 'function') never = () => globalThis;
  assert.same(never?.()?.window?.self?.Array.of(37).at(0), undefined);
  let assigned;
  if (typeof globalThis.Array === 'function') assigned = () => globalThis;
  assert.same(assigned?.()?.window?.self?.Array.of(38).at(0), WINDOW_PRESENT ? 38 : undefined);
});

// hops the guard plan does not cover ride INSIDE its alternate while the rendered value is
// provably defined. that fold must keep the RECEIVER: invoked off the ternary instead, the
// callee reads as a bare value and `this` is lost - `performance.now()` rejects a foreign this
// with a TypeError in every browser leg, so the present-window branch is the oracle
QUnit.test('optional chaining: an unplanned tail keeps its receiver through the guard', assert => {
  assert.same(typeof globalThis.window?.self?.performance.now(), WINDOW_PRESENT ? 'number' : 'undefined');
  assert.same(typeof globalThis.window?.self?.performance?.now(), WINDOW_PRESENT ? 'number' : 'undefined');
  // a plain hop chain past the first one folds along with it. the tail is read as a VALUE, and
  // it names a member every target engine has - a property only newer engines carry would fail
  // the oldest browser leg on its own absence rather than on the fold
  assert.same(typeof globalThis.window?.self?.performance.now, WINDOW_PRESENT ? 'function' : 'undefined');
  // the continuation may sit PAST the span the fold started from - taking it is what keeps the
  // receiver; leaving it outside invokes the callee off the guard value, with `this` lost
  globalThis.e2eGuardMethod = function () {
    return { tag: this === globalThis ? 'kept' : 'lost' };
  };
  assert.same(globalThis.window?.self.e2eGuardMethod().tag, WINDOW_PRESENT ? 'kept' : undefined);
  assert.same(globalThis.window?.self?.e2eGuardMethod().tag, WINDOW_PRESENT ? 'kept' : undefined);
  // a render carrying a hop of its own (`self.window`) folds the tail the same way, and the
  // root effect still runs exactly once
  let hopCalls = 0;
  function hopRoot() {
    hopCalls += 1;
    return globalThis;
  }
  assert.same(hopRoot()?.window?.self.window.e2eGuardMethod().tag, WINDOW_PRESENT ? 'kept' : undefined);
  assert.same(hopCalls, 1);
  // an OPTIONAL call on the tail binds the same receiver - read off the guard value instead,
  // the callee would run with `this` undefined
  assert.same(globalThis.window?.self.e2eGuardMethod?.().tag, WINDOW_PRESENT ? 'kept' : undefined);
  // PARENS around the callee keep the chain's reference (`this` still binds) while ending the
  // short-circuit: past an absent probe the source calls `undefined` and throws
  /* eslint-disable no-unsafe-optional-chaining -- the parenthesized callee IS the case */
  if (WINDOW_PRESENT) assert.same((globalThis.window?.self.e2eGuardMethod)().tag, 'kept');
  else assert.throws(() => (globalThis.window?.self.e2eGuardMethod)(), TypeError);
  /* eslint-enable no-unsafe-optional-chaining -- back to the default */
  delete globalThis.e2eGuardMethod;
});

// `delete` needs the MEMBER, not its value: folded into the alternate the ternary evaluates and
// deletes nothing. and the navigation under it COLLAPSES - the named member is never read, so no `?.`
// over the nav is load-bearing and the slot is reached on either host.
// LOWERED legs are excluded by the second-pass class the area's AGENTS.md records
QUnit[typeof E2E_DETECT_LOWERED === 'undefined' ? 'test' : 'skip']('optional chaining: delete over a probe nav removes the property', assert => {
  globalThis.e2eGuardProbe = 'present';
  assert.same(delete globalThis.window?.self?.e2eGuardProbe, true);
  assert.same(globalThis.e2eGuardProbe, undefined, 'the slot is gone on either host');
  // a deeper tail deletes through the same collapse, and still as a REFERENCE
  globalThis.e2eGuardNest = { key: 'present' };
  assert.same(delete globalThis.window?.self.e2eGuardNest.key, true);
  assert.same(globalThis.e2eGuardNest.key, undefined, 'and so does a deeper tail');
  delete globalThis.e2eGuardNest;
  delete globalThis.e2eGuardProbe;
});

// a folded tail ENDS in the guard ternary, so an operator continuing the expression must not
// bind to its alternate - `?? 'absent'` has to see the guarded value, on both branches
QUnit.test('optional chaining: a carrier past the folded tail sees the guarded value', assert => {
  assert.same(globalThis.window?.self?.e2eGuardMissing ?? 'absent', 'absent');
  assert.same(globalThis.window?.self?.e2eGuardMissing || 'fallback', 'fallback');
});

// a PAREN-SEALED probe nav: the seal ends the chain, so a PLAIN read above it THROWS where
// the window probe is absent (the guarded render reproduces the source TypeError), and reads
// through the ponyfill where it is present; the sealed hop's key SE runs only past a present
// window
QUnit.test('optional chaining: sealed probe nav keeps the source throw', assert => {
  let k = 0;
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed throw IS the case
    assert.same((globalThis.window?.self).Array.of(31).at(0), 31);
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed SE-key IS the case
    assert.true((globalThis.window?.[(k++, 'self')]).Number.isInteger(5));
    assert.same(k, 1);
  } else {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed throw IS the case
    assert.throws(() => (globalThis.window?.self).Array.of(31), TypeError);
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed SE-key IS the case
    assert.throws(() => (globalThis.window?.[(k++, 'self')]).Number, TypeError);
    assert.same(k, 0);
  }
});

// a pattern-hop (anchored) destructure over an undefinable probe nav: destructuring the
// probe VALUE throws where `window` is absent - the anchored renders must keep that throw
// (an always-defined ctor binding would swallow it AND run the computed-key effect the
// source never reaches), and extract the polyfill where it is present
QUnit.test('optional chaining: anchored destructure over a probe nav keeps the source throw', assert => {
  let k = 0;
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed probe source IS the case
    const { Object: { [(k++, 'keys')]: pickedKeys } } = (globalThis.window?.self);
    assert.same(typeof pickedKeys, 'function');
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed probe source IS the case
    const { JSON: { stringify: pickedStringify } } = (globalThis.window?.self);
    assert.same(pickedStringify({ a: 1 }), '{"a":1}');
    assert.same(k, 1);
  } else {
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the probe throw IS the case
      const { Object: { [(k++, 'keys')]: pickedKeys } } = (globalThis.window?.self);
      return pickedKeys;
    }, TypeError);
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the probe throw IS the case
      const { JSON: { stringify: pickedStringify } } = (globalThis.window?.self);
      return pickedStringify;
    }, TypeError);
    assert.same(k, 0);
  }
});

// a REST sibling next to the pattern hop declines the anchor: the flat residual must keep
// the guard-value init - an always-defined receiver binding would erase the probe's throw
// AND hand rest the realm global's own keys where native throws
QUnit.test('optional chaining: rest sibling over a probe nav keeps the source throw', assert => {
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed probe source IS the case
    const { Math: { trunc: pickedTrunc }, ...restBag } = (globalThis.window?.self);
    assert.same(typeof pickedTrunc, 'function');
    assert.same(typeof restBag, 'object');
  } else {
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the probe throw IS the case
      const { Math: { trunc: pickedTrunc }, ...restBag } = (globalThis.window?.self);
      return [pickedTrunc, restBag];
    }, TypeError);
  }
});

// FULL consumes outside the anchor gate carry the same once-per-pattern probe: a flat
// single-level pattern re-reads its own key off the guarded value, an array wrapper probes
// the descended element - an absent `window` throws before any binding, a present one
// extracts the polyfills
QUnit.test('optional chaining: flat and wrapped full consumes keep the probe throw', assert => {
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the sealed probe source IS the case
    const { structuredClone: pickedClone } = (globalThis.window?.self);
    assert.same(typeof pickedClone, 'function');
    // eslint-disable-next-line @stylistic/no-extra-parens -- the sealed probe source IS the case
    const [{ Math: { hypot: pickedHypot } }] = [(globalThis.window?.self)];
    assert.same(pickedHypot(3, 4), 5);
  } else {
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the probe throw IS the case
      const { structuredClone: pickedClone } = (globalThis.window?.self);
      return pickedClone;
    }, TypeError);
    assert.throws(() => {
      // eslint-disable-next-line @stylistic/no-extra-parens -- the probe throw IS the case
      const [{ Math: { hypot: pickedHypot } }] = [(globalThis.window?.self)];
      return pickedHypot;
    }, TypeError);
  }
});

// a CALL-rooted probe nav: the guard test owns the SINGLE root-call run - a replayed
// harvest would double the call's effect against native, and an erased probe would drop
// the throw at an absent `window`
QUnit.test('optional chaining: call-rooted probe nav runs its root call exactly once', assert => {
  let calls = 0;
  function dhe() {
    calls++;
    return globalThis;
  }
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the probe source IS the case
    const { JSON: { parse: pickedParse } } = dhe().window?.self;
    assert.same(pickedParse('{"a":2}').a, 2);
  } else {
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the probe throw IS the case
      const { JSON: { parse: pickedParse } } = dhe().window?.self;
      return pickedParse;
    }, TypeError);
  }
  assert.same(calls, 1);
});

// an ALIAS-rooted sealed claim rides the same probe canon: the claim's throw probe re-reads
// the sealed value, throwing at an absent `window` where a plain erase would just run
QUnit.test('optional chaining: alias-rooted sealed claim keeps the source throw', assert => {
  const gAlias = globalThis;
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed throw IS the case
    assert.same((gAlias.window?.self).Array.of(41).at(0), 41);
  } else {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed throw IS the case
    assert.throws(() => (gAlias.window?.self).Array.of(41), TypeError);
  }
});

// an SE-carrying computed key on a collapsible hop MIGRATES with the collapse: the effect
// runs exactly once, in native order (test -> key effect -> leaf read). the globalThis-named
// key stays defined in the Node runner on every leg (`self` would read undefined on the
// modern-targets legs, where no ponyfill substitutes it)
QUnit.test('optional chaining: SE computed key keeps its single run through the collapse', assert => {
  let keyRuns = 0;
  function seKeyHost() { return globalThis; }
  // eslint-disable-next-line @stylistic/no-extra-parens -- the SE-prefixed key IS the case
  assert.same(seKeyHost()?.globalThis?.[(keyRuns++, 'globalThis')]?.Array.of(21).at(0), 21);
  assert.same(keyRuns, 1);
});

// an ALIAS holding an undefinable nav keeps its `?.` LIVE: the prefix walks see through the
// binding to the always-defined global, but the runtime VALUE is the nav's - undefined where
// `window` is absent (the read must short-circuit), the nav value where it is present
QUnit.test('optional chaining: alias of an undefinable nav keeps its guard', assert => {
  let held;
  // eslint-disable-next-line prefer-const -- the assignment-form alias IS the case
  held = globalThis.window?.self.window;
  assert.same(held?.Array.of(2).at(0), WINDOW_PRESENT ? 2 : undefined);
});

// a DESTRUCTURE over a guarded opaque chain: native destructuring of undefined THROWS -
// the extraction helper must receive the guarded value (and throw on void 0) instead of a
// guard swallowing the TypeError above it. the defined-path value still extracts the method
QUnit.test('optional chaining: destructure over a guarded chain keeps the native throw', assert => {
  function nullRoot() { return null; }
  assert.throws(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the native throw IS the case
    const { at: picked } = nullRoot()?.globalThis?.Array.of(9);
    return picked;
  }, TypeError);
  function liveRoot() { return globalThis; }
  // eslint-disable-next-line no-unsafe-optional-chaining -- provably live root
  const { at: pickedLive } = liveRoot()?.globalThis?.Array.of(9, 8);
  assert.same(typeof pickedLive, 'function');
});

// an IDENTITY-IIFE root: the buried global proves through the identity-param inline canon.
// where `window` is absent the whole chain must short-circuit to undefined - a claim sealed
// inside the instance helper slot would THROW there instead
QUnit.test('optional chaining: identity-IIFE root keeps the short-circuit', assert => {
  let idCalls = 0;
  assert.same((x => x)((idCalls++, globalThis))?.window?.self?.Array.of(16).at(0), WINDOW_PRESENT ? 16 : undefined);
  assert.same(idCalls, 1);
});

// a computed-key alias resolves in its own declaration scope: the inner function's same-name
// param must not swallow the outer alias value (the dispatch collapses to the pure static),
// hop by hop through a second alias
QUnit.test('optional chaining: key alias resolves through a use-site shadow', assert => {
  const from = 'from';
  const aliasedKey = from;
  // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name shadow IS the case
  function readViaOuterAlias(from) {
    return Array[aliasedKey]?.([7]);
  }
  assert.deepEqual(readViaOuterAlias('unused'), [7]);
  const twoHop = aliasedKey;
  assert.deepEqual(Array[twoHop]?.([9]), [9]);
});

// a callee ALIAS follows transitively to the provable arrow, keeping its body effect single-run;
// an alias of a PARAM-bound callee is the caller's value - the kept raw chain must read the
// caller's own object, which a wrong collapse would swap for the ponyfill
QUnit.test('optional chaining: callee alias follows transitively, param callee stays raw', assert => {
  let bodyRuns = 0;
  function mk() {
    bodyRuns++;
    return globalThis;
  }
  const aliasedMk = mk;
  assert.same(aliasedMk()?.window?.self?.Array.of(5).at(0), WINDOW_PRESENT ? 5 : undefined);
  assert.same(bodyRuns, 1);
  function readViaParamCallee(factory) {
    const inner = factory;
    return inner()?.window?.self?.WeakSet;
  }
  const fake = { window: { self: { WeakSet: 'callers-own' } } };
  assert.same(readViaParamCallee(() => fake), 'callers-own');
});

// the bare-global alias proof is scope-correct both ways: the module-side alias proves under a
// same-name param shadow (the guard short-circuits where `window` is absent, the branch reads
// the ponyfill ctor where it is present), while an alias of the PARAM keeps the raw chain
// reading the caller's own object
QUnit.test('optional chaining: bare-global alias proof respects scope', assert => {
  const globalAlias = globalThis;
  const held = globalAlias;
  // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name shadow IS the case
  function readUnderShadow(globalAlias) {
    return held.window?.self?.WeakMap;
  }
  assert.same(typeof readUnderShadow('shadow'), WINDOW_PRESENT ? 'function' : 'undefined');
  function readParamAlias(root) {
    const p = root;
    return p.window?.self?.WeakMap;
  }
  assert.same(readParamAlias({ window: { self: { WeakMap: 'callers-own' } } }), 'callers-own');
});

// a BLOCK shadow holding a DIFFERENT valid key must not swap the resolved method: the alias
// binds the outer 'from', so the dispatch stays Array.from - a use-site resolve would emit
// Array.of and yield a nested array
QUnit.test('optional chaining: key alias ignores a block shadow of its source name', assert => {
  const from = 'from';
  const aliasedKey = from;
  {
    // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name block shadow IS the case
    const from = 'of';
    assert.deepEqual(Array[aliasedKey]?.([6]), [6]);
  }
});

// a var-hoisted key alias resolves in its declarator's block (the later block shadow must not
// swap the key), and a callee-alias capture of a later-reassigned source bails to the raw
// chain reading the captured value
QUnit.test('optional chaining: hoisted key alias and reassigned-source capture', assert => {
  const sourceKey = 'from';
  // eslint-disable-next-line no-lone-blocks -- the hoisting block IS the case
  {
    // eslint-disable-next-line no-var -- the hoisted var IS the case
    var hoistedKey = sourceKey;
  }
  {
    // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name block shadow IS the case
    const sourceKey = 'of';
    // eslint-disable-next-line block-scoped-var -- the hoisted read IS the case
    assert.deepEqual(Array[hoistedKey]?.([3]), [3]);
  }
  let factory = () => ({ window: { self: { WeakMap: 'captured' } } });
  const capturedFactory = factory;
  // eslint-disable-next-line no-useless-assignment -- the post-capture reassignment IS the case
  factory = () => globalThis;
  assert.same(capturedFactory()?.window?.self?.WeakMap, 'captured');
});

// a PAREN-SEALED undefinable nav as a chain root: the outer `?.` guards the sealed VALUE -
// where `window` is absent the call and field claims must short-circuit (the eaten guard
// returned the branch value here), where it is present the branch reads the ponyfill
QUnit.test('optional chaining: paren-sealed nav root keeps its guard', assert => {
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren SEAL is the case
  assert.same((globalThis.window?.self.window)?.Array.of(3).at(0), WINDOW_PRESENT ? 3 : undefined);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren SEAL is the case
  assert.same((globalThis.window?.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(2), WINDOW_PRESENT ? '9007199254740991.00' : undefined);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren SEAL is the case
  function viaParamDefault(x = (globalThis.window?.self.window)?.Array.of(5).at(0)) {
    return x;
  }
  assert.same(viaParamDefault(), WINDOW_PRESENT ? 5 : undefined);
});

// the sealed-root claim family at runtime: where `window` is present the guarded branch reads
// ponyfills; where absent every spelling short-circuits, and the destructure keeps the native
// throw on the undefined path
QUnit.test('optional chaining: paren-sealed nav claim spellings', assert => {
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren SEAL is the case
  assert.deepEqual((globalThis.window?.self.window)?.Array.of?.(3), WINDOW_PRESENT ? [3] : undefined);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren SEAL is the case
  assert.same(typeof (globalThis.window?.self.window)?.Map, WINDOW_PRESENT ? 'function' : 'undefined');
  if (WINDOW_PRESENT) {
    // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- window-present branch
    const { at: picked } = (globalThis.window?.self.window)?.Array.of(9);
    assert.same(typeof picked, 'function');
  } else {
    assert.throws(() => {
      // eslint-disable-next-line no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the native throw IS the case
      const { at: picked } = (globalThis.window?.self.window)?.Array.of(9);
      return picked;
    }, TypeError);
  }
});

// a folded guard tail is a bare ternary - the loosest expression there is. an OPERAND slot
// (either side of a comparison / shift) swallows it, so the fold owes the consumer its parens:
// unparenthesized, `1 !== <guard>` re-parses as `(1 !== null) == window`, and the whole
// comparison silently returns the operand instead of a boolean. the emitters read that slot
// from the source text, where `=` and `>` also END operators (`===`, `>=`, `>>`)
QUnit.test('optional chaining: folded guard under an operand slot', assert => {
  /* eslint-disable yoda -- the guard on the RIGHT of the operator IS the case */
  assert.same(1 === globalThis.window?.self.Array.of(1).at(0), WINDOW_PRESENT);
  assert.same(1 !== globalThis.window?.self.Object.assign({}, { a: 1 }).a, !WINDOW_PRESENT);
  assert.same(2 > globalThis.window?.self.Math.trunc(1.5), WINDOW_PRESENT);
  assert.same(2 >= globalThis.window?.self.Number.parseFloat('1.5'), WINDOW_PRESENT);
  assert.same(1 <= globalThis.window?.self.Reflect.ownKeys({ a: 1 }).length, WINDOW_PRESENT);
  assert.same(4 >> globalThis.window?.self.Array.from([1]).length, WINDOW_PRESENT ? 2 : 4);
  /* eslint-enable yoda -- back to the default */
  // the guard on the LEFT of an operator is an operand too: an unparenthesized fold swallows
  // the operator into its own alternate branch
  assert.same(globalThis.window?.self.Promise.resolve(1).constructor.length === 1, WINDOW_PRESENT);
  assert.same(globalThis.window?.self.Number.parseInt('4', 10) >> 1, WINDOW_PRESENT ? 2 : 0);
});

// the negatives that pin the same classification: a slot which already delimits a whole
// expression keeps the fold BARE. `=` opens one only as a (compound) assignment and `>` only
// as an arrow, and a keyword operand (`of`, `case`, `return`) runs to the next delimiter
QUnit.test('optional chaining: folded guard in a delimited slot', assert => {
  let assigned;
  // eslint-disable-next-line prefer-const -- the standalone assignment slot IS the case
  assigned = globalThis.window?.self.Symbol.for('e2e').description;
  assert.same(assigned, WINDOW_PRESENT ? 'e2e' : undefined);
  let compound = 10;
  compound -= globalThis.window?.self.Math.cbrt(8);
  assert.same(compound, WINDOW_PRESENT ? 8 : NaN);
  // eslint-disable-next-line unicorn/consistent-function-style -- the arrow BODY slot IS the case
  const arrowBody = () => globalThis.window?.self.Object.entries({ a: 1 }).length;
  assert.same(arrowBody(), WINDOW_PRESENT ? 1 : undefined);
  function returned() {
    return globalThis.window?.self.Array.of(2).keys();
  }
  assert.same(returned()?.next().value, WINDOW_PRESENT ? 0 : undefined);
  const collected = [];
  // eslint-disable-next-line no-unsafe-optional-chaining -- the for-of head slot IS the case
  if (WINDOW_PRESENT) for (const item of globalThis.window?.self.Array.of(3, 4)) collected.push(item);
  assert.deepEqual(collected, WINDOW_PRESENT ? [3, 4] : []);
  let switched = 0;
  // eslint-disable-next-line sonarjs/no-small-switch -- the case-arm slot IS the case
  switch (1) {
    case 1: switched = globalThis.window?.self.Math.hypot(3, 4); break;
    default: break;
  }
  assert.same(switched, WINDOW_PRESENT ? 5 : undefined);
  // a ternary CONSEQUENT delimits a whole expression as well - the nested fold is read whole
  // before the parser looks for the `:`. after `??` the same character opens an OPERAND
  const pick = WINDOW_PRESENT || true;
  assert.same(pick ? globalThis.window?.self.Math.sign(-2) : 0, WINDOW_PRESENT ? -1 : undefined);
  assert.same(!pick ? 9 : globalThis.window?.self.Math.expm1(0), WINDOW_PRESENT ? 0 : undefined);
  const seed = null;
  assert.same(seed ?? globalThis.window?.self.Number.EPSILON, WINDOW_PRESENT ? Number.EPSILON : undefined);
});

// an `extends` clause takes a LeftHandSideExpression, so it parenthesizes the fold exactly as
// an operator does and the last tail step rides outside behind `?.`. past an absent probe the
// clause sees undefined and the class definition throws, as the source does
QUnit.test('optional chaining: folded guard under an extends clause', assert => {
  globalThis.e2eGuardBox = { Base: class { tag = 'base'; }, count: 2 };
  /* eslint-disable no-unsafe-optional-chaining -- the extends clause slot IS the case */
  if (WINDOW_PRESENT) {
    class Extended extends globalThis.window?.self.e2eGuardBox.Base {}
    assert.same(new Extended().tag, 'base');
  } else {
    assert.throws(() => {
      class Extended extends globalThis.window?.self.e2eGuardBox.Base {}
      return Extended;
    }, TypeError);
  }
  /* eslint-enable no-unsafe-optional-chaining -- back to the default */
  assert.same(-globalThis.window?.self.e2eGuardBox.count, WINDOW_PRESENT ? -2 : NaN);
  delete globalThis.e2eGuardBox;
});

// a guard render leading with `(` at the head of an ExpressionStatement fuses with an
// unterminated previous statement and turns it into a call (`sink = 1(...)` throws). the text
// emitter edits source in place, so it owes the separator the reprinting one gets for free
QUnit.test('optional chaining: a paren-leading guard at statement start keeps its separator', assert => {
  globalThis.e2eGuardAsi = {
    calls: 0,
    field: 'v',
    run() {
      this.calls += 1;
      return this.calls;
    },
  };
  /* eslint-disable @stylistic/semi -- the missing separator IS the case */
  let sink = 1
  globalThis.window?.self.e2eGuardAsi.run()
  assert.same(sink, 1);
  assert.same(globalThis.e2eGuardAsi.calls, WINDOW_PRESENT ? 1 : 0);
  sink = 2
  globalThis.window?.self.e2eGuardAsi.field
  assert.same(sink, 2);
  sink = 3
  globalThis.window?.self.e2eGuardAsi?.run?.()
  assert.same(sink, 3);
  assert.same(globalThis.e2eGuardAsi.calls, WINDOW_PRESENT ? 2 : 0);
  sink = 4
  globalThis.window?.self.Number.parseInt('4', 10) >> 1
  assert.same(sink, 4);
  /* eslint-enable @stylistic/semi -- back to the default */
  delete globalThis.e2eGuardAsi;
});

// a consumer that parenthesizes the guard wraps the WHOLE folded value, so every tail step rides
// inside it. stranding the last one behind a `?.` would introduce a short-circuit the source
// never had: where an intermediate is absent the source throws, and the guard must throw too
QUnit.test('optional chaining: a folded tail keeps the throw its source performs', assert => {
  globalThis.e2eGuardGap = { present: 1 };
  /* eslint-disable yoda -- the guard on the RIGHT of the operator IS the case */
  if (WINDOW_PRESENT) {
    assert.throws(() => -globalThis.window?.self.e2eGuardGap.missing.n, TypeError);
    assert.throws(() => 1 === globalThis.window?.self.e2eGuardGap.missing.n, TypeError);
  } else {
    assert.same(-globalThis.window?.self.e2eGuardGap.missing.n, NaN);
    assert.same(1 === globalThis.window?.self.e2eGuardGap.missing.n, false);
  }
  /* eslint-enable yoda -- back to the default */
  // the present path still reads through, so the row is not vacuous on either branch
  assert.same(-globalThis.window?.self.e2eGuardGap.present, WINDOW_PRESENT ? -1 : NaN);
  delete globalThis.e2eGuardGap;
});

// a TAGGED template reads its tag as a reference, so the tail stays outside the guard - but a
// PLAIN read there throws on the branch the guard proved absent, before the template's own
// substitutions run. the source short-circuits the whole tag and throws only at the call, so the
// substitution effect must still happen
QUnit.test('optional chaining: a guarded tagged tag keeps the source evaluation order', assert => {
  globalThis.e2eGuardTag = { tag(strings) { return `${ strings[0] }!`; } };
  let effects = 0;
  function eff() {
    effects += 1;
    return 'e';
  }
  /* eslint-disable no-unsafe-optional-chaining -- the paren-ended tag IS the case */
  if (WINDOW_PRESENT) {
    assert.same((globalThis.window?.self.e2eGuardTag.tag)`x${ eff() }`, 'x!');
  } else {
    assert.throws(() => (globalThis.window?.self.e2eGuardTag.tag)`x${ eff() }`, TypeError);
  }
  /* eslint-enable no-unsafe-optional-chaining -- back to the default */
  assert.same(effects, 1);
  delete globalThis.e2eGuardTag;
});

// an OPTIONAL instance dispatch memoizes its receiver: when that receiver IS the guarded nav the
// memo has to hold the rendered text, or the nav stays raw - a bare global on the oldest target
// and a native read where the ponyfill belongs. the value is the same either way, so the
// stripped-realm leg is what makes this row bite
QUnit.test('optional chaining: an optional dispatch memoizes the rendered nav', assert => {
  globalThis.e2eNavBox = { arr: [3, [1, 2]], str: 'a-a' };
  assert.deepEqual(globalThis.window?.self.e2eNavBox.arr?.flat(), WINDOW_PRESENT ? [3, 1, 2] : undefined);
  assert.same(globalThis.window?.self.e2eNavBox.arr?.at(0), WINDOW_PRESENT ? 3 : undefined);
  assert.same(globalThis.window?.self.e2eNavBox.str?.replaceAll('a', 'z'), WINDOW_PRESENT ? 'z-z' : undefined);
  assert.deepEqual(globalThis.window?.self.e2eNavBox?.arr?.flat(), WINDOW_PRESENT ? [3, 1, 2] : undefined);
  delete globalThis.e2eNavBox;
});

// two OPTIONAL polyfilled dispatches in a row: the outer memoizes the whole inner call, so the
// inner's rewrite has to land in that memo's value slot. landing at the bare guard ref instead
// spelled an assignment TO the inner call - output that does not parse at all
QUnit.test('optional chaining: chained optional dispatches memoize the inner emit', assert => {
  globalThis.e2eChainBox = { arr: [3, [1, 2]], str: 'a-a' };
  assert.same(globalThis.e2eChainBox.arr?.flat()?.at(0), 3);
  assert.same(globalThis.e2eChainBox.str?.replaceAll('a', 'z')?.at(0), 'z');
  assert.same(globalThis.e2eChainBox.arr?.flat()?.slice(0, 2)?.at(0), 3);
  assert.same(globalThis.e2eChainBox.arr?.flat()?.length, 3);
  assert.same(globalThis.window?.self.e2eChainBox.arr?.flat()?.at(0), WINDOW_PRESENT ? 3 : undefined);
  delete globalThis.e2eChainBox;
});

// a probe nav whose ROOT is a chain assignment: the hop the detector suppresses still has to be
// rendered, or the guard vanishes and `self` is read natively off the probe. the write must run
// exactly once either way, and the value follows the source on both branches
QUnit.test('optional chaining: a chain-assign root still renders its probe guard', assert => {
  globalThis.e2eAssignBox = { arr: [3, [1, 2]], n: 4 };
  let held;
  assert.deepEqual((held = globalThis)?.window?.self.e2eAssignBox.arr?.flat(), WINDOW_PRESENT ? [3, 1, 2] : undefined);
  assert.same(held, globalThis);
  let writes = 0;
  function counted() {
    writes += 1;
    return globalThis;
  }
  let heldCounted;
  assert.same((heldCounted = counted())?.window?.self.e2eAssignBox.n, WINDOW_PRESENT ? 4 : undefined);
  assert.same(writes, 1);
  assert.same(heldCounted, globalThis);
  delete globalThis.e2eAssignBox;
});

// a claimless probe nav in a VALUE position: no polyfill claim owns the chain, so the kept-nav
// render is the only thing that keeps the ponyfillable hop off a native read. the value follows
// the source on both branches and the assignment root still runs exactly once
QUnit.test('optional chaining: a claimless probe nav renders in value position', assert => {
  globalThis.e2eValueBox = { n: 4, inner: { n: 5 } };
  assert.same(globalThis.window?.self.e2eValueBox.n, WINDOW_PRESENT ? 4 : undefined);
  let held;
  assert.same((held = globalThis)?.window?.self.e2eValueBox.n, WINDOW_PRESENT ? 4 : undefined);
  assert.same(held, globalThis);
  let heldDeep;
  assert.same((heldDeep = globalThis)?.window?.self.e2eValueBox.inner.n, WINDOW_PRESENT ? 5 : undefined);
  assert.same(heldDeep, globalThis);
  delete globalThis.e2eValueBox;
});

// a paren layer BETWEEN the probe nav and its tail: the source dereferences the nav's value
// PLAINLY through those parens, so where the probe is absent it throws instead of answering
// undefined. the guard's own parens are that layer's once the render absorbs it, and nothing
// above may be folded inside them - a fold there would answer undefined and swallow the throw
/* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the paren layer over
   the nav and the plain dereference through it ARE the form under test */
QUnit.test('optional chaining: a paren layer over the probe nav keeps the plain dereference', assert => {
  globalThis.e2eParenBox = { arr: [3, [1, 2]], n: 7 };
  if (WINDOW_PRESENT) {
    assert.deepEqual((globalThis.window?.self.e2eParenBox).arr?.flat(), [3, 1, 2]);
    assert.deepEqual((globalThis.window?.self.e2eParenBox).arr, [3, [1, 2]]);
    assert.same((globalThis.window?.self.e2eParenBox.arr).length, 2);
  } else {
    assert.throws(() => (globalThis.window?.self.e2eParenBox).arr?.flat(), TypeError);
    assert.throws(() => (globalThis.window?.self.e2eParenBox).arr, TypeError);
    assert.throws(() => (globalThis.window?.self.e2eParenBox.arr).length, TypeError);
  }
  // the layer over the LEAF itself dereferences the guarded ponyfill the same plain way
  if (WINDOW_PRESENT) assert.same((globalThis.window?.self).e2eParenBox.n, 7);
  else assert.throws(() => (globalThis.window?.self).e2eParenBox.n, TypeError);
  // an OPTIONAL tail over the same layer short-circuits instead of throwing
  assert.deepEqual((globalThis.window?.self.e2eParenBox)?.arr, WINDOW_PRESENT ? [3, [1, 2]] : undefined);
  // parens around the WHOLE chain leave nothing between the nav and its tail, so the fold applies
  assert.deepEqual((globalThis.window?.self.e2eParenBox.arr?.flat()), WINDOW_PRESENT ? [3, 1, 2] : undefined);
  delete globalThis.e2eParenBox;
});
/* eslint-enable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the form under test ends here */

// a SEQUENCE evaluates to its last element, so a probe nav there IS the receiver's value. the
// prefixes must still run exactly once, and the guard must reach the nav even though the receiver
// text around it was built with the chain root already substituted
/* eslint-disable no-unsafe-optional-chaining -- dereferencing the guarded value through the
   sequence IS the form under test */
QUnit.test('optional chaining: a sequence receiver carries the probe nav through the guard', assert => {
  globalThis.e2eSeqBox = { arr: [3, [1, 2]], n: 7 };
  let effects = 0;
  function seen() {
    effects += 1;
    return 'x';
  }
  assert.same((seen(), globalThis.window?.self.e2eSeqBox.n), WINDOW_PRESENT ? 7 : undefined);
  assert.deepEqual((seen(), globalThis.window?.self.e2eSeqBox.arr)?.flat(), WINDOW_PRESENT ? [3, 1, 2] : undefined);
  assert.same(effects, 2);
  // the nav LEADS the sequence: its value is discarded, the last element decides
  assert.same((globalThis.window?.self.e2eSeqBox.n, 'tail'), 'tail');
  if (WINDOW_PRESENT) {
    assert.deepEqual((seen(), globalThis.window?.self.e2eSeqBox).arr?.flat(), [3, 1, 2]);
    assert.deepEqual((seen(), globalThis.window?.self.e2eSeqBox.arr).flat(), [3, 1, 2]);
  } else {
    assert.throws(() => (seen(), globalThis.window?.self.e2eSeqBox).arr?.flat(), TypeError);
    assert.throws(() => (seen(), globalThis.window?.self.e2eSeqBox.arr).flat(), TypeError);
  }
  assert.same(effects, 4);
  delete globalThis.e2eSeqBox;
});
/* eslint-enable no-unsafe-optional-chaining -- the form under test ends here */

// the probe nav as a WRITE target: the write must land on the object the guard yields, not on the
// short-circuit value. where the probe is absent the source throws on the reference itself, so the
// whole statement throws before any assignment happens
/* eslint-disable no-unsafe-optional-chaining -- writing through the guarded value IS the form under test */
QUnit.test('optional chaining: the probe nav as a write target', assert => {
  globalThis.e2eWriteBox = { n: 1, arr: [3, [1, 2]] };
  let held;
  let effects = 0;
  function seen() {
    effects += 1;
    return 'x';
  }
  if (WINDOW_PRESENT) {
    (globalThis.window?.self.e2eWriteBox).n = 2;
    assert.same(globalThis.e2eWriteBox.n, 2);
    (globalThis.window?.self.e2eWriteBox).n += 3;
    assert.same(globalThis.e2eWriteBox.n, 5);
    (globalThis.window?.self.e2eWriteBox).n++;
    assert.same(globalThis.e2eWriteBox.n, 6);
    ({ k: (globalThis.window?.self.e2eWriteBox).n } = { k: 7 });
    assert.same(globalThis.e2eWriteBox.n, 7);
    (seen(), globalThis.window?.self.e2eWriteBox).n = 8;
    assert.same(globalThis.e2eWriteBox.n, 8);
    ('y', (held = globalThis)?.window?.self.e2eWriteBox).n = 9;
    assert.same(globalThis.e2eWriteBox.n, 9);
    assert.same(held, globalThis);
    delete (globalThis.window?.self.e2eWriteBox).n;
    assert.same('n' in globalThis.e2eWriteBox, false);
  } else {
    assert.throws(() => { (globalThis.window?.self.e2eWriteBox).n = 2; }, TypeError);
    assert.throws(() => { (seen(), globalThis.window?.self.e2eWriteBox).n = 8; }, TypeError);
    assert.same(globalThis.e2eWriteBox.n, 1);
  }
  assert.same(effects, 1);
  delete globalThis.e2eWriteBox;
});
/* eslint-enable no-unsafe-optional-chaining -- the form under test ends here */

// SIDE-EFFECT ORDER across the shapes this canon collapses: the guard test, a computed key and the
// call arguments each run once and in source order, and everything BEHIND a short-circuit does not
// run at all. the two branches disagree on which effects happen, so both are asserted
QUnit.test('optional chaining: effect order through the collapsed guard', assert => {
  globalThis.e2eSeBox = { arr: [3, [1, 2]] };
  const log = [];
  function k(n) {
    log.push(n);
    return 0;
  }
  function key(name) {
    log.push(name);
    return name;
  }
  // a sequence prefix runs before the guard; the call argument only on the taken branch
  assert.deepEqual((k(1), globalThis.window?.self.e2eSeBox.arr)?.flat(k(2)),
    WINDOW_PRESENT ? [3, [1, 2]] : undefined);
  assert.deepEqual(log, WINDOW_PRESENT ? [1, 2] : [1]);
  log.length = 0;
  // a computed key sits BEHIND the probe's `?.`, so an absent probe skips it entirely
  assert.deepEqual(globalThis.window?.self.e2eSeBox[key('arr')]?.flat(),
    WINDOW_PRESENT ? [3, 1, 2] : undefined);
  assert.deepEqual(log, WINDOW_PRESENT ? ['arr'] : []);
  log.length = 0;
  // repeated navs under a chained consumer: each key runs on its own, in order
  assert.deepEqual(globalThis.window?.self.e2eSeBox[key('arr')]?.flat()
    .concat(globalThis.window?.self.e2eSeBox[key('arr')]?.flat() ?? []),
  WINDOW_PRESENT ? [3, 1, 2, 3, 1, 2] : undefined);
  assert.deepEqual(log, WINDOW_PRESENT ? ['arr', 'arr'] : []);
  log.length = 0;
  // an effectful ROOT rides the guard test and runs exactly once on both branches
  let held;
  assert.deepEqual((held = (k(9), globalThis))?.window?.self.e2eSeBox.arr?.flat(k(3)),
    WINDOW_PRESENT ? [3, [1, 2]] : undefined);
  assert.deepEqual(log, WINDOW_PRESENT ? [9, 3] : [9]);
  assert.same(held, globalThis);
  delete globalThis.e2eSeBox;
});

// ECMA evaluates a member call's RECEIVER before its computed KEY. no accessor is needed to see the
// order: let the key effect REPLACE the property the receiver was read from - the call then runs on
// whichever array the order picked, so the returned value is the discriminator
/* eslint-disable no-sequences -- a computed key that RESOLVES to a method name while carrying an
   effect is exactly the form under test; a fully dynamic key resolves to no polyfill at all */
QUnit.test('optional chaining: the receiver runs before a harvested computed key', assert => {
  globalThis.e2eOrderBox = { list: ['first'] };
  function swap() {
    globalThis.e2eOrderBox.list = ['second'];
    return 0;
  }
  // the key must RESOLVE to a method name while carrying the effect - a fully dynamic key resolves
  // to no polyfill at all and would leave the source untouched, testing nothing
  // receiver read BEFORE the swap -> the call sees the original array
  assert.same(globalThis.e2eOrderBox.list[swap(), 'at'](0), 'first');
  globalThis.e2eOrderBox.list = ['first'];
  // the same through the collapsed guard; where the probe is absent the whole chain short-circuits
  // and the key effect never runs, so the property keeps its value
  assert.same(globalThis.window?.self.e2eOrderBox.list[swap(), 'at'](0),
    WINDOW_PRESENT ? 'first' : undefined);
  assert.deepEqual(globalThis.e2eOrderBox.list, WINDOW_PRESENT ? ['second'] : ['first']);
  delete globalThis.e2eOrderBox;
});
/* eslint-enable no-sequences -- the form under test ends here */

// a nested nav in an ARGUMENT rides the enclosing guard only while nothing between the two reads of
// the root could have replaced it; where something can, the inner test is owed. both spellings have
// to answer what native answers, and an absent probe must skip the argument's effect outright
QUnit.test('optional chaining: a nested nav in an argument keeps its own test past a call', assert => {
  let hops = 0;
  function bump() {
    hops += 1;
    return 0;
  }
  assert.deepEqual(globalThis.window?.self.Array.of(globalThis.window?.self.Math.trunc(1.5)),
    WINDOW_PRESENT ? [1] : undefined);
  assert.deepEqual(globalThis.window?.self.Array.of(bump(), globalThis.window?.self.Math.trunc(1.5)),
    WINDOW_PRESENT ? [0, 1] : undefined);
  assert.deepEqual(globalThis.window?.self.Array.of(hops += 1, globalThis.window?.self.Math.trunc(2.5)),
    WINDOW_PRESENT ? [2, 2] : undefined);
  // the guard short-circuits BEFORE the arguments, so an absent probe leaves both effects unrun
  assert.same(hops, WINDOW_PRESENT ? 2 : 0);
});

// PARENTHESIZED optional call feeding an instance dispatch: the parens end the chain, so the
// dispatch reads off the guard's value. the two emitters put the guard on different sides of the
// receiver memo, which is only acceptable while both answer what native answers - the value on the
// present branch and the TypeError off void 0 on the absent one
/* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- reading off a
   short-circuited chain is exactly the form under test: the parens end the chain, so the throw is
   the expected answer, and they stay even where they change no value - they are what forces the
   receiver memo the two emitters spell differently */
QUnit.test('optional chaining: a parenthesized optional call feeds an instance dispatch', assert => {
  const src = [3, [1, 2]];
  function run(absent) {
    const recv = absent ? null : src;
    try {
      return (recv?.slice()).flat().join(',');
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  assert.same(run(false), '3,1,2');
  assert.same(run(true), 'TypeError');
  // a MEMBER receiver under the same parens needs no memo at all
  assert.same((src?.at(0)).toString(), '3');
  // a LIVE `?.` on the dispatch short-circuits instead of throwing - the branch that proves the
  // spelling above is safe because native throws there, not because a nullish is harmless
  function runOptional(absent) {
    const recv = absent ? null : src;
    return (recv?.slice())?.flat() ?? 'none';
  }
  assert.deepEqual(runOptional(false), [3, 1, 2]);
  assert.same(runOptional(true), 'none');
});
/* eslint-enable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the form under test ends here */

// `in` THROWS on a nullish right operand, so a receiver that can short-circuit must keep the test.
// the fold reads the call's return type, which says nothing about the optional link above it -
// folding there would answer `true` on the very branch native throws on, and would erase the
// receiver's evaluation with it
/* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- an `in` over a
   short-circuiting operand IS the form under test, and the parens are what the source wrote */
QUnit.test('optional chaining: `in` keeps its test over a short-circuiting receiver', assert => {
  const src = [3, [1, 2]];
  let reads = 0;
  function run(absent) {
    const arr = absent ? null : src;
    try {
      return 'flat' in (arr?.slice(reads += 1, undefined));
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  // the fold answers the polyfilled world's constant on the present branch, and the kept test
  // carries the throw on the absent one - both properties at once
  assert.same(run(false), true);
  assert.same(reads, 1);
  assert.same(run(true), 'TypeError');
  // the receiver short-circuits before its own argument runs, exactly as native does
  assert.same(reads, 1);
  // a receiver that cannot short-circuit still folds - the control that keeps the fold reachable
  assert.same('at' in src.slice(), true);
  // the STATIC host behind a proxy hop asks the same question: where the probe is absent the hop
  // short-circuits and `in` throws, where it resolves the answer is the polyfilled constant
  function runStatic() {
    try {
      return 'from' in globalThis.window?.Array;
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  assert.same(runStatic(), WINDOW_PRESENT ? true : 'TypeError');
  // a plain hop cannot short-circuit, so it keeps folding
  assert.same('of' in globalThis.Array, true);
});
/* eslint-enable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the form under test ends here */

// a guarded receiver whose source text REPEATS in the guarded branch: the memo slot belongs to the
// ROOT, and the twin occurrence keeps its own dispatch. picking the slot by text alone memoized the
// twin's result, so the guard held an INDEX and `at` ran on a number
QUnit.test('optional chain: a look-alike twin does not take the guard memo slot', assert => {
  const o = { items: ['ax', 'bx', 'cx'], itemsExtra: ['xx', 'yx'] };
  assert.same(o.items?.at(o.items.findLastIndex(v => v.startsWith('b'))), 'bx');
  assert.same(o.items?.at(o.items.findLastIndex(v => v.startsWith('a')) + o.items.findIndex(v => v.startsWith('b'))), 'bx');
  // the twin runs its own nested dispatch, which composes inside the argument
  assert.same(o.items?.at(o.items.findLastIndex(v => v.startsWith('c')) - o.items.flat().findIndex(v => v.startsWith('c'))), 'ax');
  // a sibling key sharing only a PREFIX of the root text is a different receiver
  assert.same(o.items?.at(o.itemsExtra.findLastIndex(v => v.startsWith('y'))), 'bx');
  // the receiver still short-circuits, and the argument never runs
  let reads = 0;
  const absent = null;
  assert.same(absent?.at(o.items.findLastIndex(() => {
    reads += 1;
    return true;
  })), undefined);
  assert.same(reads, 0);
});

QUnit.test('optional chain: twin slot in a class receiver', assert => {
  class Box {
    constructor(items) {
      this.items = items;
    }
    pick(fn) {
      return this.items?.at(this.items.findLastIndex(fn));
    }
  }
  assert.same(new Box(['ax', 'bx', 'cx']).pick(v => v.startsWith('b')), 'bx');
  assert.same(new Box(null).pick(() => true), undefined);
});

// the parens around the RECEIVER seal the chain there: a `?.` inside them short-circuits only the
// sealed value, and the dispatch above reads it plainly and throws. lifting a guard out of the
// dispatch instead answers `undefined` on the very branch the source throws on
QUnit.test('optional chain: a sealed receiver throws instead of short-circuiting the dispatch', assert => {
  const host = {};
  const filled = { items: [[1], [2]] };
  /* eslint-disable no-unsafe-optional-chaining, sonarjs/no-redundant-parentheses -- the parens around
     the receiver ARE the form under test: they end the chain before the dispatch */
  assert.throws(() => (host.items?.missing).flat?.().at(0), TypeError, 'sealed receiver, optional call');
  assert.throws(() => (host.items?.missing).at?.(0), TypeError, 'sealed receiver, optional dispatch call');
  assert.throws(() => (host.items?.missing).flat().at(0), TypeError, 'sealed receiver, plain call');
  assert.throws(() => ((host.items?.missing)).flat?.(), TypeError, 'a doubled wrapper seals the same');
  // unsealed control: the same `?.` now guards the whole chain and the dispatch never runs
  assert.same(host.items?.missing.flat?.().at(0), undefined, 'unsealed spelling short-circuits');
  // a defined sealed value runs the dispatch for real
  assert.deepEqual((filled.items?.at(0)).flat?.(), [1], 'a present sealed value dispatches');
  /* eslint-enable no-unsafe-optional-chaining, sonarjs/no-redundant-parentheses -- end of the sealed receiver forms */
});

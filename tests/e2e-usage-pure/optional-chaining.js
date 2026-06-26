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

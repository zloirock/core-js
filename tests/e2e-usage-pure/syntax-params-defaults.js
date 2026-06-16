// Function parameters and defaults around polyfill injection. The interesting transform here is
// SYNTH-SWAP: a param-default destructure `function f({ m } = Receiver)` becomes
// `{ m } = { m: _polyfill }`, which scopes the polyfill to the no-arg default WHILE preserving a
// caller-passed receiver. Every test is DISTINGUISHING: a caller-passed receiver must still win
// (a regression to body-extract would make the polyfill always win), the receiver/default side
// effect must run ONLY when the default fires, and the scope-gate / per-branch paths must stay
// runtime-correct. Generic "default value works" tests are intentionally absent.

// --- Synth-swap: a caller-passed receiver overrides the polyfilled default ---

QUnit.test('params: param-default no-arg uses the polyfill, caller receiver overrides it', assert => {
  const fn = function ({ of } = Array) {
    return of(1);
  };
  assert.deepEqual(fn(), [1]);
  const custom = { of: (...a) => ['custom', ...a] };
  assert.deepEqual(fn(custom), ['custom', 1]);
});

QUnit.test('params: caller receiver overrides BOTH polyfilled props', assert => {
  const fn = function ({ from, of } = Array) {
    return [from('ab'), of(9)];
  };
  assert.deepEqual(fn(), [['a', 'b'], [9]]);
  const custom = { from: () => 'F', of: () => 'O' };
  assert.deepEqual(fn(custom), ['F', 'O']);
});

QUnit.test('params: aliased binding still overridden by caller receiver', assert => {
  const fn = function ({ of: make } = Array) {
    return make(2);
  };
  assert.deepEqual(fn(), [2]);
  assert.same(fn({ of: () => 'aliased' }), 'aliased');
});

// --- Side effect in the synth default fires ONLY when the default is used ---

QUnit.test('params: destructure-default receiver effect runs only when no receiver is passed', assert => {
  let calls = 0;
  const fn = function ({ of } = (calls += 1, Array)) {
    return of(7);
  };
  assert.deepEqual(fn(), [7]);
  assert.same(calls, 1);
  const custom = { of: () => ['c'] };
  assert.deepEqual(fn(custom), ['c']);
  assert.same(calls, 1);
});

QUnit.test('params: plain default value effect runs only when the argument is omitted', assert => {
  let calls = 0;
  const fn = function (x = (calls += 1, Array.of(1, 2))) {
    return x;
  };
  assert.deepEqual(fn(), [1, 2]);
  assert.same(calls, 1);
  assert.deepEqual(fn([9]), [9]);
  assert.same(calls, 1);
});

QUnit.test('params: undefined explicitly passed still triggers the default polyfill effect', assert => {
  let calls = 0;
  const fn = function ({ of } = (calls += 1, Array)) {
    return of(0);
  };
  assert.deepEqual(fn(undefined), [0]);
  assert.same(calls, 1);
});

// --- Default referencing an earlier param: polyfill applied to the live earlier value ---

QUnit.test('params: default references an earlier param and polyfills it', assert => {
  const fn = function (seed, list = Array.from(seed)) {
    return list;
  };
  assert.deepEqual(fn('abc'), ['a', 'b', 'c']);
  assert.deepEqual(fn('x', [1, 2]), [1, 2]);
});

QUnit.test('params: second default builds on the first via a polyfill', assert => {
  const fn = function (a = Array.of(1, 2), b = a.at(-1)) {
    return [a, b];
  };
  assert.deepEqual(fn(), [[1, 2], 2]);
  assert.deepEqual(fn([5, 6, 7]), [[5, 6, 7], 7]);
});

// --- Per-branch synth: a conditional receiver, caller still overrides ---

QUnit.test('params: per-branch default selects a branch; caller receiver overrides both', assert => {
  const run = function (cond, { from } = cond ? Array : { from: () => 'iter' }) {
    return from('xy');
  };
  assert.deepEqual(run(true), ['x', 'y']);
  assert.same(run(false), 'iter');
  assert.same(run(true, { from: () => 'caller' }), 'caller');
});

QUnit.test('params: per-branch default effect runs once for the taken branch only', assert => {
  let left = 0;
  let right = 0;
  const run = function (cond, { of } = cond ? (left += 1, Array) : (right += 1, { of: () => 'R' })) {
    return of(1);
  };
  assert.deepEqual(run(true), [1]);
  assert.same(left, 1);
  assert.same(right, 0);
});

// --- Scope-gate: a computed key reading a sibling binding stays single-read and correct ---

QUnit.test('params: computed key reading a sibling binding stays correct', assert => {
  const fn = function ({ of, [of]: picked } = Array) {
    return [typeof of, picked];
  };
  const [ofType, picked] = fn();
  assert.same(ofType, 'function');
  assert.same(picked, undefined);
});

QUnit.test('params: computed const-key param overridden by caller receiver', assert => {
  const k = 'of';
  const fn = function ({ [k]: of } = Array) {
    return of(3);
  };
  assert.deepEqual(fn(), [3]);
  assert.same(fn({ of: () => 'c' }), 'c');
});

// --- IIFE param-default: the live caller-arg wins over a member-expression default ---

QUnit.test('params: IIFE member-default overridden by the caller-arg receiver', assert => {
  const result = (function ({ of } = globalThis.Array) {
    return of(5);
  })({ of: (...a) => ['caller', ...a] });
  assert.deepEqual(result, ['caller', 5]);
});

QUnit.test('params: IIFE no-arg falls back to the polyfilled default', assert => {
  const out = (function ({ from } = Array) {
    return from('hi');
  })();
  assert.deepEqual(out, ['h', 'i']);
});

// --- Rest params / spread: the rest is gathered once, then fed to a polyfill ---

QUnit.test('params: rest param spread into a static polyfill once', assert => {
  let mapper = 0;
  const fn = function (...args) {
    return Array.from(args, x => {
      mapper += 1;
      return x * 2;
    });
  };
  assert.deepEqual(fn(1, 2, 3), [2, 4, 6]);
  assert.same(mapper, 3);
});

QUnit.test('params: rest gathered into Object.fromEntries', assert => {
  const fn = function (...pairs) {
    return Object.fromEntries(pairs);
  };
  assert.deepEqual(fn(['a', 1], ['b', 2]), { a: 1, b: 2 });
});

// --- Destructured param defaults: member default fires only on a missing property ---

QUnit.test('params: destructured object param member default polyfills only when absent', assert => {
  let calls = 0;
  const fn = function ({ list = (calls += 1, Array.of(1, 2)) } = {}) {
    return list;
  };
  assert.deepEqual(fn(), [1, 2]);
  assert.same(calls, 1);
  assert.deepEqual(fn({ list: [9] }), [9]);
  assert.same(calls, 1);
});

QUnit.test('params: destructured array param feeds a polyfill', assert => {
  const fn = function ([head, ...tail] = []) {
    return Array.of(head, ...tail).at(-1);
  };
  assert.same(fn([1, 2, 3]), 3);
  assert.same(fn(), undefined);
});

QUnit.test('params: rest sibling next to a polyfilled binding excludes that key', assert => {
  const fn = function ({ from, ...rest } = Array) {
    return [typeof from, 'from' in rest];
  };
  const [fromType, inRest] = fn();
  assert.same(fromType, 'function');
  assert.false(inRest);
});

// --- Generator / async params with polyfill defaults ---

QUnit.test('params: generator param default polyfilled, caller overrides', assert => {
  const gen = function * ({ of } = Array) {
    yield * of(1, 2);
  };
  assert.deepEqual([...gen()], [1, 2]);
  assert.deepEqual([...gen({ of: () => [8, 9] })], [8, 9]);
});

QUnit.test('params: default param polyfill flows through a returned promise', assert => {
  const async = assert.async();
  const run = function (list = Array.from('ab')) {
    return Promise.resolve(list);
  };
  run().then(v => {
    assert.deepEqual(v, ['a', 'b']);
    async();
  });
});

QUnit.test('params: arrow default param polyfill, caller overrides', assert => {
  const fn = ({ of } = Array) => of(4);
  assert.deepEqual(fn(), [4]);
  assert.same(fn({ of: () => 'a' }), 'a');
});

// --- Default param sourced from an outer polyfill alias ---

QUnit.test('params: default param uses an outer const polyfill alias', assert => {
  const { from } = Array;
  const fn = function (input, build = from) {
    return build(input);
  };
  assert.deepEqual(fn('ab'), ['a', 'b']);
  assert.deepEqual(fn('zz', x => `<${ x }>`), '<zz>');
});

// a destructure param default with a `||` fallback whose LEFT carries a side-effect prefix: the
// synth-swap collapses the fallback to the polyfilled literal, but the left's SE prefix must still
// run when the default fires. (was dropping the prefix in BOTH emitters)
QUnit.test('params: fallback default side-effect prefix runs when default fires', assert => {
  const log = [];
  const eff = () => { log.push('se'); };
  const fn = ({ from } = (eff(), Array) || Set) => from([1, 2]);
  assert.deepEqual(fn(), [1, 2]);
  assert.deepEqual(log, ['se']);
});

// a flat (non-fallback) param default that is a member chain rooted at a side-effecting IIFE: the
// synth literal discards the chain, so the IIFE setup must be rescued (run exactly once) when the
// default fires - it was being dropped entirely (and crashed the text emitter)
QUnit.test('params: call-rooted member default rescues the IIFE setup once', assert => {
  let calls = 0;
  const fn = ({ from } = (() => {
    calls++;
    return globalThis;
  })().Array) => from([1, 2]);
  assert.deepEqual(fn(), [1, 2]);
  assert.same(calls, 1);
  // caller-passed value beats the synth default; the default (and its IIFE) does not evaluate
  assert.same(fn({ from: () => 'x' }), 'x');
  assert.same(calls, 1);
});

// a `||` fallback default whose resolved LEFT is a member chain rooted at a side-effecting IIFE: the
// fallback collapses to the polyfilled literal, but the left's chain-root call must be rescued (run
// exactly once) - the structural prefix harvest alone stopped at the chain root and dropped it
QUnit.test('params: fallback default call-rooted left rescues the chain-root call once', assert => {
  let calls = 0;
  const fn = ({ from } = (() => {
    calls++;
    return globalThis;
  })().Array || Set) => from([3, 4]);
  assert.deepEqual(fn(), [3, 4]);
  assert.same(calls, 1);
  assert.same(fn({ from: () => 'y' }), 'y');
  assert.same(calls, 1);
});

// a `||` fallback default whose LEFT prefix is itself a polyfillable instance call: narrowing the
// collapse skip to the dead right + resolved-left tail keeps the prefix live (it runs, and on ie:11
// is itself polyfilled) rather than swallowed whole
QUnit.test('params: fallback default polyfillable left prefix still runs', assert => {
  const seen = [];
  const fn = ({ from } = (seen.push([9].at(0)), Array) || Set) => from([5, 6]);
  assert.deepEqual(fn(), [5, 6]);
  assert.deepEqual(seen, [9]);
});

// a SE-bearing synth-swap receiver with an UNRESOLVED sibling key (`isArray` has no pure entry): the
// receiver is memoized (run once) so the unresolved key reads the memo rather than re-running it -
// rescuing AND re-reading would run the effect twice
QUnit.test('params: SE receiver with an unresolved sibling key runs the effect once', assert => {
  let calls = 0;
  const fn = ({ from, isArray } = (() => {
    calls++;
    return globalThis;
  })().Array) => [from([1]), isArray([])];
  const result = fn();
  assert.deepEqual(result[0], [1]);
  assert.true(result[1]);
  assert.same(calls, 1);
  // caller-passed values beat the synth default; the default (and its IIFE) does not evaluate
  assert.deepEqual(fn({ from: () => 'z', isArray: () => 'w' }), ['z', 'w']);
  assert.same(calls, 1);
});

// the same memoize-once contract through the per-branch conditional registration site: the taken
// branch is a SE-rooted member with an unresolved sibling key, so it memoizes (runs once) rather
// than rescue-and-re-read
QUnit.test('params: conditional branch SE receiver with unresolved sibling runs once', assert => {
  let calls = 0;
  const fn = (cond, { from, isArray } = cond ? (() => {
    calls++;
    return globalThis;
  })().Array : Set) => [from([1]), isArray([])];
  const result = fn(true);
  assert.deepEqual(result[0], [1]);
  assert.true(result[1]);
  assert.same(calls, 1);
});

// a `||` fallback receiver (call-rooted left) with an unresolved sibling key: the memo argument is
// the resolved LEFT only, so the IIFE runs once, the unresolved key reads the memo, and the dead
// right operand is dropped - the result is identical to the non-fallback receiver
QUnit.test('params: fallback SE receiver with unresolved sibling memoizes the left', assert => {
  let calls = 0;
  const fn = ({ from, isArray } = (() => {
    calls++;
    return globalThis;
  })().Array || Set) => [from([1]), isArray([])];
  const result = fn();
  assert.deepEqual(result[0], [1]);
  assert.true(result[1]);
  assert.same(calls, 1);
});

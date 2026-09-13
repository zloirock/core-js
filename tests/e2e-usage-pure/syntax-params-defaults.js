// Function parameters and defaults around polyfill injection. The interesting transform here is
// SYNTH-SWAP: a param-default destructure `function f({ m } = Receiver)` becomes
// `{ m } = { m: _polyfill }`, which scopes the polyfill to the no-arg default WHILE preserving a
// caller-passed receiver. Every test is DISTINGUISHING: a caller-passed receiver must still win
// (a regression to body-extract would make the polyfill always win), the receiver/default side
// effect must run ONLY when the default fires, and the scope-gate / per-branch paths must stay
// runtime-correct. Generic "default value works" tests are intentionally absent.

// --- Synth-swap: a caller-passed receiver overrides the polyfilled default ---

const nativeArrayFrom = Object.getOwnPropertyDescriptor(Array, 'from')?.value;

QUnit.test('params: param-default no-arg uses the polyfill, caller receiver overrides it', assert => {
  function fn({ of } = Array) {
    return of(1);
  }
  assert.deepEqual(fn(), [1]);
  const custom = { of: (...a) => ['custom', ...a] };
  assert.deepEqual(fn(custom), ['custom', 1]);
});

QUnit.test('params: caller receiver overrides BOTH polyfilled props', assert => {
  function fn({ from, of } = Array) {
    return [from('ab'), of(9)];
  }
  assert.deepEqual(fn(), [['a', 'b'], [9]]);
  const custom = { from: () => 'F', of: () => 'O' };
  assert.deepEqual(fn(custom), ['F', 'O']);
});

QUnit.test('params: aliased binding still overridden by caller receiver', assert => {
  function fn({ of: make } = Array) {
    return make(2);
  }
  assert.deepEqual(fn(), [2]);
  assert.same(fn({ of: () => 'aliased' }), 'aliased');
});

// --- Side effect in the synth default fires ONLY when the default is used ---

QUnit.test('params: destructure-default receiver effect runs only when no receiver is passed', assert => {
  let calls = 0;
  function fn({ of } = (calls += 1, Array)) {
    return of(7);
  }
  assert.deepEqual(fn(), [7]);
  assert.same(calls, 1);
  const custom = { of: () => ['c'] };
  assert.deepEqual(fn(custom), ['c']);
  assert.same(calls, 1);
});

QUnit.test('params: plain default value effect runs only when the argument is omitted', assert => {
  let calls = 0;
  function fn(x = (calls += 1, Array.of(1, 2))) {
    return x;
  }
  assert.deepEqual(fn(), [1, 2]);
  assert.same(calls, 1);
  assert.deepEqual(fn([9]), [9]);
  assert.same(calls, 1);
});

QUnit.test('params: undefined explicitly passed still triggers the default polyfill effect', assert => {
  let calls = 0;
  function fn({ of } = (calls += 1, Array)) {
    return of(0);
  }
  assert.deepEqual(fn(undefined), [0]);
  assert.same(calls, 1);
});

// --- Default referencing an earlier param: polyfill applied to the live earlier value ---

QUnit.test('params: default references an earlier param and polyfills it', assert => {
  function fn(seed, list = Array.from(seed)) {
    return list;
  }
  assert.deepEqual(fn('abc'), ['a', 'b', 'c']);
  assert.deepEqual(fn('x', [1, 2]), [1, 2]);
});

QUnit.test('params: second default builds on the first via a polyfill', assert => {
  function fn(a = Array.of(1, 2), b = a.at(-1)) {
    return [a, b];
  }
  assert.deepEqual(fn(), [[1, 2], 2]);
  assert.deepEqual(fn([5, 6, 7]), [[5, 6, 7], 7]);
});

// --- Per-branch synth: a conditional receiver, caller still overrides ---

QUnit.test('params: per-branch default selects a branch; caller receiver overrides both', assert => {
  function run(cond, { from } = cond ? Array : { from: () => 'iter' }) {
    return from('xy');
  }
  assert.deepEqual(run(true), ['x', 'y']);
  assert.same(run(false), 'iter');
  assert.same(run(true, { from: () => 'caller' }), 'caller');
});

QUnit.test('params: per-branch default effect runs once for the taken branch only', assert => {
  let left = 0;
  let right = 0;
  function run(cond, { of } = cond ? (left += 1, Array) : (right += 1, { of: () => 'R' })) {
    return of(1);
  }
  assert.deepEqual(run(true), [1]);
  assert.same(left, 1);
  assert.same(right, 0);
});

// --- Scope-gate: a computed key reading a sibling binding stays single-read and correct ---

QUnit.test('params: computed key reading a sibling binding stays correct', assert => {
  function fn({ of, [of]: picked } = Array) {
    return [typeof of, picked];
  }
  const [ofType, picked] = fn();
  assert.same(ofType, 'function');
  assert.same(picked, undefined);
});

QUnit.test('params: computed const-key param overridden by caller receiver', assert => {
  const k = 'of';
  function fn({ [k]: of } = Array) {
    return of(3);
  }
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
  function fn(...args) {
    return Array.from(args, x => {
      mapper += 1;
      return x * 2;
    });
  }
  assert.deepEqual(fn(1, 2, 3), [2, 4, 6]);
  assert.same(mapper, 3);
});

QUnit.test('params: rest gathered into Object.fromEntries', assert => {
  function fn(...pairs) {
    return Object.fromEntries(pairs);
  }
  assert.deepEqual(fn(['a', 1], ['b', 2]), { a: 1, b: 2 });
});

// --- Destructured param defaults: member default fires only on a missing property ---

QUnit.test('params: destructured object param member default polyfills only when absent', assert => {
  let calls = 0;
  function fn({ list = (calls += 1, Array.of(1, 2)) } = {}) {
    return list;
  }
  assert.deepEqual(fn(), [1, 2]);
  assert.same(calls, 1);
  assert.deepEqual(fn({ list: [9] }), [9]);
  assert.same(calls, 1);
});

QUnit.test('params: destructured array param feeds a polyfill', assert => {
  function fn([head, ...tail] = []) {
    return Array.of(head, ...tail).at(-1);
  }
  assert.same(fn([1, 2, 3]), 3);
  assert.same(fn(), undefined);
});

QUnit.test('params: rest sibling next to a native binding excludes that key', assert => {
  function fn({ from, ...rest } = Array) {
    return [typeof from, 'from' in rest];
  }
  const [fromType, inRest] = fn();
  assert.same(fromType, typeof nativeArrayFrom);
  assert.false(inRest);
});

// --- Generator / async params with polyfill defaults ---

QUnit.test('params: generator param default polyfilled, caller overrides', assert => {
  function * gen({ of } = Array) {
    yield * of(1, 2);
  }
  assert.deepEqual([...gen()], [1, 2]);
  assert.deepEqual([...gen({ of: () => [8, 9] })], [8, 9]);
});

QUnit.test('params: default param polyfill flows through a returned promise', assert => {
  const async = assert.async();
  function run(list = Array.from('ab')) {
    return Promise.resolve(list);
  }
  run().then(v => {
    assert.deepEqual(v, ['a', 'b']);
    async();
  });
});

QUnit.test('params: arrow default param polyfill, caller overrides', assert => {
  function fn({ of } = Array) {
    return of(4);
  }
  assert.deepEqual(fn(), [4]);
  assert.same(fn({ of: () => 'a' }), 'a');
});

// --- Default param sourced from an outer polyfill alias ---

QUnit.test('params: default param uses an outer const polyfill alias', assert => {
  const { from } = Array;
  function fn(input, build = from) {
    return build(input);
  }
  assert.deepEqual(fn('ab'), ['a', 'b']);
  assert.deepEqual(fn('zz', x => `<${ x }>`), '<zz>');
});

// a destructure param default with a `||` fallback whose LEFT carries a side-effect prefix: the
// synth-swap collapses the fallback to the polyfilled literal, but the left's SE prefix must still
// run when the default fires. (was dropping the prefix in BOTH emitters)
QUnit.test('params: fallback default side-effect prefix runs when default fires', assert => {
  const log = [];
  function eff() { log.push('se'); }
  function fn({ from } = (eff(), Array) || Set) {
    return from([1, 2]);
  }
  assert.deepEqual(fn(), [1, 2]);
  assert.deepEqual(log, ['se']);
});

// a flat (non-fallback) param default that is a member chain rooted at a side-effecting IIFE: the
// synth literal discards the chain, so the IIFE setup must be rescued (run exactly once) when the
// default fires - it was being dropped entirely (or crashed the transform)
QUnit.test('params: call-rooted member default rescues the IIFE setup once', assert => {
  let calls = 0;
  function fn({ from } = (() => {
    calls++;
    return globalThis;
  })().Array) {
    return from([1, 2]);
  }
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
  function fn({ from } = (() => {
    calls++;
    return globalThis;
  })().Array || Set) {
    return from([3, 4]);
  }
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
  function fn({ from } = (seen.push([9].at(0)), Array) || Set) {
    return from([5, 6]);
  }
  assert.deepEqual(fn(), [5, 6]);
  assert.deepEqual(seen, [9]);
});

// a SE-bearing synth-swap receiver with an UNRESOLVED sibling key (`isArray` has no pure entry): the
// receiver is memoized (run once) so the unresolved key reads the memo rather than re-running it -
// rescuing AND re-reading would run the effect twice
QUnit.test('params: SE receiver with an unresolved sibling key runs the effect once', assert => {
  let calls = 0;
  function fn({ from, isArray } = (() => {
    calls++;
    return globalThis;
  })().Array) {
    return [from([1]), isArray([])];
  }
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
  function fn(cond, { from, isArray } = cond ? (() => {
    calls++;
    return globalThis;
  })().Array : Set) {
    return [from([1]), isArray([])];
  }
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
  function fn({ from, isArray } = (() => {
    calls++;
    return globalThis;
  })().Array || Set) {
    return [from([1]), isArray([])];
  }
  const result = fn();
  assert.deepEqual(result[0], [1]);
  assert.true(result[1]);
  assert.same(calls, 1);
});

// --- Instance param-default synth: `{ at } = Array.prototype` -> `= { at: _atMaybeArray(Array.prototype) }` ---

QUnit.test('params: instance param-default no-arg binds the polyfill, caller receiver overrides it', assert => {
  function fn({ at } = Array.prototype) {
    return at;
  }
  // no-arg call: the synth default fires and the bound method reads through the receiver
  assert.same(typeof fn(), 'function');
  assert.same(fn().call([7, 8, 9], -1), 9);
  // caller-passed receiver: its own `at` wins over the synth default
  const custom = { at: () => 'CALLER' };
  assert.same(fn(custom)(), 'CALLER');
  // caller object WITHOUT the method: native undefined, the default must not leak in
  assert.same(typeof fn({}), 'undefined');
});

QUnit.test('params: instance param-default getter receiver reads once on default, zero on arg', assert => {
  let reads = 0;
  const host = {};
  // defineProperty getter, not literal accessor syntax - the pure suite forbids ES5 accessors
  Object.defineProperty(host, 'g', { get() {
    reads++;
    return Array.prototype;
  } });
  function fn({ flat } = host.g) {
    return flat;
  }
  assert.same(typeof fn(), 'function');
  assert.same(reads, 1);
  fn({ flat: 1 });
  assert.same(reads, 1);
});

QUnit.test('params: instance param-default literal receiver keeps value semantics', assert => {
  function fn({ includes } = [4, 5, 6]) {
    return includes;
  }
  assert.same(fn().call([1, 2], 2), true);
  assert.same(fn().call([1, 2], 3), false);
});

QUnit.test('params: instance multi-key member receiver stays native (double-read protection)', assert => {
  function fn({ at, flat } = Array.prototype) {
    return [at, flat];
  }
  const viaCaller = fn({ at: 'A', flat: 'F' });
  assert.deepEqual(viaCaller, ['A', 'F']);
});

// --- Self-reference bails the caller-lossy body-extract ---
// A `{ from, ...rest } = Array` default cannot be caller-correct SYNTH (the rest key set is open),
// so a no-invisible-caller function gets a caller-lossy body-extract that binds `from` to the
// injected polyfill on EVERY entry. That is unsound the moment a caller can pass a receiver: a
// self-call, an escaped reference, or a re-entering param-default callback. Each test passes a
// distinct sentinel receiver through such an invisible caller and asserts IT wins - a regression to
// the lossy extract would bind `_Array$from` (a function on every engine, including IE) instead.

QUnit.test('params: a named IIFE with rest retains the native slot', assert => {
  // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
  const bound = (function keep({ from, ...rest } = Array) {
    return from;
  })();
  assert.same(bound, nativeArrayFrom);
});

QUnit.test('params: named self-referencing IIFE - the self-call receiver wins over the polyfill', assert => {
  const results = [];
  // the named function re-invokes itself with a receiver, an invisible caller the lossy extract
  // would clobber; the receiver stays raw so the passed value wins
  // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
  (function f({ from, ...rest } = Array) {
    results.push(from);
    if (results.length === 1) f({ from: 'self-call' });
  })();
  assert.same(results[1], 'self-call');
});

QUnit.test('params: a named reference that escapes - the external receiver wins over the polyfill', assert => {
  const results = [];
  let escaped;
  // the name escapes, so an unseen caller may pass a receiver: the lossy extract is unsound and
  // the receiver must stay raw
  // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
  (function g({ from, ...rest } = Array) {
    escaped = g;
    results.push(from);
  })();
  escaped({ from: 'external' });
  assert.same(results[1], 'external');
});

QUnit.test('params: self-reference in a param default - the re-entry receiver wins over the polyfill', assert => {
  const seen = [];
  // the self-reference lives in the `cb` param default, not the body: detection must scan param
  // defaults too, or the extract wrongly clobbers the re-entry receiver
  // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
  (function h({ from, ...rest } = Array, cb = () => h({ from: 'via-default' })) {
    seen.push(from);
    if (seen.length === 1) cb();
  })();
  assert.same(seen[1], 'via-default');
});

// a string-keyed destructure default is replayed as a synthesized literal, which the caller's own
// argument still beats - the default only evaluates when the argument is omitted. regression: the
// key shape fell back to a body binding instead, and that binding ignored what the caller passed
QUnit.test('params: string-keyed destructure default keeps the caller value', assert => {
  // eslint-disable-next-line no-useless-rename, @stylistic/quote-props -- the quoted key is the shape under test
  const seen = (function ({ 'from': from } = Array) {
    return from;
  })({ from: 'CUSTOM' });
  assert.same(seen, 'CUSTOM');
  // eslint-disable-next-line no-useless-rename, @stylistic/quote-props -- the quoted key is the shape under test
  const omitted = (function ({ 'of': of } = Array) {
    return of;
  })();
  assert.same(typeof omitted, 'function');
});

// a self-reference is an extra, invisible caller, which rules out binding the polyfill in the body.
// the synthesized default has no such limit: it only evaluates when the argument is omitted, so the
// recursive call's own argument still wins. regression: the shape bailed to the native global here,
// leaving the parameter unpolyfilled on the very engines the target list names
QUnit.test('params: self-referencing function keeps its synthesized default', assert => {
  const seen = [];
  // a FOLDED key on the self-referencing shape is the combination that bailed to the native global
  // eslint-disable-next-line no-useless-concat, unicorn/no-useless-concat -- the fold is under test
  const out = (function r({ ['o' + 'f']: of } = Array, depth = 0) {
    seen.push(typeof of);
    return depth ? of : r({ of: 'FROM_CALLER' }, 1);
  })();
  assert.same(seen[0], 'function');
  assert.same(out, 'FROM_CALLER');
});

// a key folds to its name through concatenation and interpolation as well, and an effect-bearing
// fold must still run its effect exactly once - the key node stays on the pattern, and only the
// resolved name is mirrored into the synthesized literal
QUnit.test('params: a folded computed key resolves and runs its effect once', assert => {
  let effects = 0;
  // eslint-disable-next-line no-useless-concat, unicorn/no-useless-concat -- the fold is the shape under test
  const concatenated = (function ({ ['fr' + 'om']: from } = Array) {
    return from;
  })();
  assert.same(typeof concatenated, 'function');
  const interpolated = (function ({ [`isArr${ 'ay' }`]: isArray } = Array) {
    return isArray;
  })();
  assert.same(interpolated([]), true);
  // eslint-disable-next-line prefer-template -- the effect must sit in the concat's left operand
  const withEffect = (function ({ [(effects++, 'i') + 'sArray']: isArray } = Array) {
    return isArray;
  })();
  assert.same(effects, 1);
  assert.same(withEffect([]), true);
});

// several props may name one slot. the synthesized literal carries it once, so both bindings must
// still see the polyfill. regression: the duplicate handed the whole pattern to the body fallback,
// which binds in the body and ignores whatever the caller passed
QUnit.test('params: duplicate slots collapse and keep every polyfill', assert => {
  /* eslint-disable @stylistic/quote-props -- the second spelling of the slot is the shape under test */
  const omitted = (function ({ of: of1, 'of': of2 } = Array) {
    return [of1, of2];
  })();
  assert.same(typeof omitted[0], 'function');
  assert.same(omitted[0], omitted[1]);
  const passed = (function ({ of: a, 'of': b } = Array) {
    return [a, b];
  })({ of: 'FROM_CALLER' });
  /* eslint-enable @stylistic/quote-props -- back to the default beyond the shape under test */
  assert.same(passed[0], 'FROM_CALLER');
  assert.same(passed[1], 'FROM_CALLER');
});

// the key's resolved name is what picks the polyfill, so every spelling of one slot must reach it.
// regression: only a bare Identifier did - a string or folded key probed the receiver with nothing
// and left the parameter holding whatever the engine natively had, which on the target list is
// nothing at all. the binding holds the UNBOUND dispatcher, exactly like the native extraction
QUnit.test('params: instance default synth resolves every key spelling', assert => {
  // eslint-disable-next-line @stylistic/quote-props -- the quoted spelling is the shape under test
  const viaString = (function ({ 'flat': f } = [1, [2]]) {
    return f;
  })();
  assert.same(typeof viaString, 'function');
  assert.deepEqual(viaString.call([1, [2]]), [1, 2]);
  // eslint-disable-next-line no-useless-concat, unicorn/no-useless-concat -- the fold is under test
  const viaFolded = (function ({ ['fl' + 'at']: f } = [3, [4]]) {
    return f;
  })();
  assert.deepEqual(viaFolded.call([3, [4]]), [3, 4]);
});

// a numeric key is never polyfillable itself, but it must not stop the receiver choice from
// enumerating the OTHER keys - a polyfill-dead default would otherwise win and take their
// polyfills down with it
QUnit.test('params: a numeric sibling key does not sink the receiver choice', assert => {
  const deadDefault = { entries: null };
  const seen = (function ({ 0: z, entries: e } = deadDefault) {
    return [z, e];
  })(globalThis.Object);
  assert.same(typeof seen[1], 'function');
  assert.deepEqual(seen[1]({ a: 1 }), [['a', 1]]);
});

// --- A function expression's own name does not enumerate its callers ---
// The caller-lossy emissions are sound only where every call site is visible, and the scan for those
// sites runs over the NAMES that bind the function. A function EXPRESSION standing in an expression
// position has none that carry the outside: its own name binds INSIDE it, so an empty reference set
// for it says only that the function never recurses. The callers arrive through the VALUE instead -
// the invocation the expression stands in, a `.call` hop, an argument slot, the property it is
// stored in - and every one of them may pass a receiver a body-extract would clobber. Each body
// reports the polyfill as a STRING rather than handing it to the assertion: a function value crashes
// the TAP reporter mid-run, which would hide the rows below the first regression.

QUnit.test('params: a tagged-template caller fills slot 0 - the polyfill must not overwrite it', assert => {
  const seen = (function tag({ from, ...rest } = Array) {
    return [typeof from === 'function' ? 'the polyfill' : String(from), rest[0]];
  })`the-strings-array`;
  // the tag hands its strings array over, so the parameter default never fires and the leaf reads
  // off that array - which carries no `from` at all
  assert.same(seen[0], 'undefined');
  assert.same(seen[1], 'the-strings-array');
});

QUnit.test('params: a `.call` hop is an invisible caller - its receiver wins over the polyfill', assert => {
  // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
  const seen = function hop({ from, ...rest } = Array) {
    return typeof from === 'function' ? 'the polyfill' : from;
  }.call(null, { from: 'via-call' });
  assert.same(seen, 'via-call');
});

QUnit.test('params: a function expression handed to a call - the caller receiver wins', assert => {
  function invoke(fn) {
    return fn({ from: 'via-argument' });
  }
  // eslint-disable-next-line prefer-arrow-callback, no-unused-vars -- a NAMED expression with a rest sibling is the shape under test
  const seen = invoke(function given({ from, ...rest } = Array) {
    return typeof from === 'function' ? 'the polyfill' : from;
  });
  assert.same(seen, 'via-argument');
});

QUnit.test('params: a function expression stored in a property - the caller receiver wins', assert => {
  const holder = {
    // eslint-disable-next-line no-unused-vars -- the rest sibling forces the caller-lossy extract
    run: function stored({ from, ...rest } = Array) {
      return typeof from === 'function' ? 'the polyfill' : from;
    },
  };
  assert.same(holder.run({ from: 'via-property' }), 'via-property');
});

// the same scan decides whether a slot default's TYPE describes the param, so a caller reached
// through the value has to widen the dispatch too: narrowing to the default's Array forwards a
// string receiver to the array-specific helper, which a realm without the native cannot serve
QUnit.test('params: a value-reached caller keeps a slot default from narrowing the dispatch', assert => {
  const hopped = function hop(x = [1, 2]) {
    return x.at(0);
  }.call(null, 'hello');
  assert.same(hopped, 'h');
  function invoke(fn) {
    return fn('hello');
  }
  // eslint-disable-next-line prefer-arrow-callback -- a NAMED expression in an argument slot is the shape under test
  const passed = invoke(function given(x = [1, 2]) {
    return x.at(0);
  });
  assert.same(passed, 'h');
});

// --- The call is not one spelling: what the census reads as a call site ---

// A call site is not only `f(...)`. `new f()`, `f.call(t)`, `f.apply(t, [x])`, a `bind` invoked on
// the spot and an IIFE all invoke the function, each putting its arguments somewhere of its own -
// and reading none of them left every such function's defaulted param dispatching the generic
// helper. The pair per spelling is what makes each row distinguishing: the no-argument form takes
// the default's own family, and a real argument at the same slot still overrides it

QUnit.test('params: a `.call` with no argument past the receiver keeps the default\'s dispatch', assert => {
  function target(x = [1, 2]) {
    return x.at(0);
  }
  assert.same(target.call(null), 1);
});

QUnit.test('params: an `.apply` reads its inline argument array', assert => {
  function target(x = [1, 2]) {
    return x.at(0);
  }
  assert.same(target.apply(null, []), 1);
});

QUnit.test('params: a bind invoked on the spot carries the arguments it captured', assert => {
  function target(x = [1, 2]) {
    return x.at(0);
  }
  assert.same(target.bind(null)(), 1);
});

QUnit.test('params: an IIFE is its own whole caller set', assert => {
  assert.same((function (x = [1, 2]) {
    return x.at(0);
  })(), 1);
  assert.same(((x = [1, 2]) => x.at(0))(), 1);
});

// a `new` reads the same slots a call does, and the construction here is DROPPED - the object it
// makes goes nowhere, so nothing can reach the constructor back through `inst.constructor`
QUnit.test('params: a dropped construction accounts for its own arguments', assert => {
  let seen;
  function Target(x = [1, 2]) {
    seen = x.at(0);
  }
  new Target();
  assert.same(seen, 1);
  new Target('hello');
  assert.same(seen, 'h');
});

// a CONSTRUCTOR spells its callers through the CLASS, the one name they can write
QUnit.test('params: a constructor default takes the dispatch its class\'s callers leave it', assert => {
  let seen;
  class Held {
    constructor(x = [1, 2]) {
      seen = x.at(0);
    }
  }
  new Held();
  assert.same(seen, 1);
  new Held('hello');
  assert.same(seen, 'h');
});

// a reference that only reads a FACT about the function - here its type - reaches nothing
// afterwards and adds no caller, so the one real call still decides
QUnit.test('params: a `typeof` reference adds no caller to the census', assert => {
  function target(x = [1, 2]) {
    return x.at(0);
  }
  assert.same(typeof target, 'function');
  assert.same(target(), 1);
});

// --- A `new` hands the constructor out with every object it builds ---

// `inst.constructor` IS the constructor, so a HELD instance is a caller channel spelling no name -
// re-entered here in this very file. Narrowing the slot on the visible `new` alone would send the
// string to the array-specific helper, which throws in a realm without the native
QUnit.test('params: a held instance re-entered through `.constructor` widens the dispatch', assert => {
  class Reentered {
    constructor(x = [1, 2]) {
      this.r = x.at(0);
    }
    again(value) {
      // eslint-disable-next-line new-cap -- `.constructor` is the channel under test, and it is spelled lowercase
      return new this.constructor(value).r;
    }
  }
  const held = new Reentered();
  assert.same(held.r, 1);
  assert.same(held.again('hello'), 'h');
});

// ... and the plain-function form of the same channel
QUnit.test('params: a held construction of a function widens it the same way', assert => {
  function Built(x = [1, 2]) {
    this.r = x.at(0);
  }
  const held = new Built();
  assert.same(held.r, 1);
  // eslint-disable-next-line new-cap -- `.constructor` is the channel under test, and it is spelled lowercase
  assert.same(new held.constructor('hello').r, 'h');
});

/* eslint-disable no-sequences, no-unused-vars -- preserve the unread store and effectful optional key under test */
// Synthesized destructure receivers preserve the host guard and the fallback it selects.
QUnit.test('destructure synth: kept optional receiver guards key effects', assert => {
  let hits = 0;
  let held;
  const method = (({ of } = {}) => of)((held = globalThis.window)?.[hits++, 'self'].Array ?? {});
  const present = typeof window === 'object';
  assert.same(hits, present ? 1 : 0);
  if (present) assert.deepEqual(method(3, 7), [3, 7]);
  else assert.same(method, undefined);
});

QUnit.test('destructure synth: unresolved sibling shares the guarded memo', assert => {
  let hits = 0;
  let held;
  const result = (({ from, customZ } = {}) => [from, customZ])((held = globalThis.window)?.[hits++, 'self'].Array ?? {});
  const present = typeof window === 'object';
  assert.same(hits, present ? 1 : 0);
  assert.same(result[1], undefined);
  if (present) assert.deepEqual(result[0]([4, 9]), [4, 9]);
  else assert.same(result[0], undefined);
});

QUnit.test('destructure synth: prefix and fallback run on their own branches', assert => {
  let prefix = 0;
  let keys = 0;
  let fallbacks = 0;
  let held;
  const method = (({ values } = {}) => values)(
    (prefix++, held = globalThis.window)?.[keys++, 'self'].Object ?? (fallbacks++, {}),
  );
  const present = typeof window === 'object';
  assert.same(prefix, 1);
  assert.same(keys, present ? 1 : 0);
  assert.same(fallbacks, present ? 0 : 1);
  if (present) assert.deepEqual(method({ answer: 42 }), [42]);
  else assert.same(method, undefined);
});

QUnit.test('destructure synth: caller-correct defaults keep their method literal', assert => {
  // eslint-disable-next-line no-unsafe-optional-chaining -- the accepted default-slot exception is under test
  function overAHop({ of, from } = globalThis.window?.self.Array) {
    return [of, from];
  }
  // Standalone post sees ordinary assignments after lowering, without a default slot to synthesize.
  if (typeof E2E_DETECT_LOWERED !== 'undefined' && typeof window === 'undefined') {
    assert.throws(() => overAHop(), TypeError);
  } else {
    const result = overAHop();
    assert.deepEqual(result[0](3, 7), [3, 7]);
    assert.deepEqual(result[1]([4, 9]), [4, 9]);
  }
  assert.deepEqual(overAHop({}), [undefined, undefined]);
});

QUnit.test('destructure synth: guarded deep IIFE keeps methods and native throw', assert => {
  let result;
  let error;
  try {
    result = (({ entries, customZ }) => [entries, customZ])(globalThis.window?.self.Object);
  } catch (error_) {
    error = error_;
  }
  if (typeof window === 'object') {
    assert.same(error, undefined);
    assert.deepEqual(result[0]({ answer: 42 }), [['answer', 42]]);
    assert.same(result[1], undefined);
  } else assert.same(error?.name, 'TypeError');
});

QUnit.test('destructure synth: deferred class field keeps its own guard', assert => {
  function run(C = class {
    field = (({ of }) => of)(globalThis.window?.Array);
  }) {
    return new C().field;
  }
  let result;
  let error;
  try {
    result = run();
  } catch (error_) {
    error = error_;
  }
  if (typeof window === 'object') {
    assert.same(error, undefined);
    assert.deepEqual(result(3, 7), [3, 7]);
  } else assert.same(error?.name, 'TypeError');
});
/* eslint-enable no-sequences, no-unused-vars -- end of the source forms above */

/* eslint-disable no-sequences -- receiver and key effects must remain on their source branches */
// A synthesized logical left keeps the nullish value that selects the fallback.
QUnit.test('destructure logical synth: parameter fallback and caller value', assert => {
  function read({ of } = globalThis.window?.Array ?? { of: 'fallback' }) { return of; }
  const method = read();
  if (typeof window === 'object') assert.deepEqual(method(2, 5), [2, 5]);
  else assert.same(method, 'fallback');
  assert.same(read({ of: 'caller' }), 'caller');
});

QUnit.test('destructure logical synth: both selected constructors carry their method', assert => {
  const { of } = globalThis.window?.Array ?? Array;
  assert.deepEqual(of(3, 8), [3, 8]);
  const method = (({ from }) => from)(globalThis.window?.self.Array || Array);
  assert.deepEqual(method([4, 7]), [4, 7]);
});

QUnit.test('destructure logical synth: effects and unknown sibling keep their branches', assert => {
  let prefix = 0;
  let keys = 0;
  let fallbacks = 0;
  function read({ of, customZ } = (prefix++, globalThis).window?.[keys++, 'self'].Array
    || (fallbacks++, { of: 'fallback', customZ: 'other' })) { return [of, customZ]; }
  const result = read();
  const present = typeof window === 'object';
  assert.same(prefix, 1);
  assert.same(keys, present ? 1 : 0);
  assert.same(fallbacks, present ? 0 : 1);
  if (present) assert.deepEqual(result[0](1, 9), [1, 9]);
  else assert.same(result[0], 'fallback');
  assert.same(result[1], present ? undefined : 'other');
});

QUnit.test('destructure logical synth: a shadowed realm remains the caller object', assert => {
  function read(globalThis) {
    const { of } = globalThis.window?.Array ?? { of: 'fallback' };
    return of;
  }
  assert.same(read({ window: { Array: { of: 'custom' } } }), 'custom');
  assert.same(read({}), 'fallback');
});
/* eslint-enable no-sequences -- end of the source forms above */

/* eslint-disable prefer-rest-params -- arguments identity is the form under test */

QUnit.test('consumed parameters: named nested defaults preserve every argument branch', assert => {
  function read([{ from } = Array]) { return from; }
  function ownFrom(value) { return ['custom', value]; }
  const first = read([Array]);
  const second = read([Array]);
  assert.deepEqual(first({ 0: 3, length: 1 }), [3]);
  assert.deepEqual(second({ 0: 4, length: 1 }), [4]);
  assert.same(first, second);
  assert.deepEqual(read([])({ 0: 5, length: 1 }), [5]);
  assert.deepEqual(read([undefined])({ 0: 6, length: 1 }), [6]);
  const custom = read([{ from: ownFrom }]);
  assert.same(custom, ownFrom);
  assert.deepEqual(custom(7), ['custom', 7]);
  assert.same(read([{}]), undefined);
});

QUnit.test('consumed parameters: named flat defaults preserve supplied and missing arguments', assert => {
  function read({ from } = Array) { return from; }
  function ownFrom(value) { return ['custom', value]; }
  assert.deepEqual(read(Array)({ 0: 3, length: 1 }), [3]);
  assert.deepEqual(read()({ 0: 4, length: 1 }), [4]);
  assert.deepEqual(read(undefined)({ 0: 5, length: 1 }), [5]);
  const custom = read({ from: ownFrom });
  assert.same(custom, ownFrom);
  assert.deepEqual(custom(6), ['custom', 6]);
  assert.same(read({}), undefined);
});

QUnit.test('consumed parameters: nested IIFEs select their own defaults', assert => {
  const supplied = (function ([{ from } = Array]) { return from; })([Array]);
  const missing = (([{ from } = Array]) => from)([]);
  const explicitUndefined = (([{ from } = Array]) => from)([undefined]);
  function ownFrom(value) { return value; }
  const custom = (([{ from } = Array]) => from)([{ from: ownFrom }]);
  assert.deepEqual(supplied({ 0: 3, length: 1 }), [3]);
  assert.deepEqual(missing({ 0: 4, length: 1 }), [4]);
  assert.deepEqual(explicitUndefined({ 0: 5, length: 1 }), [5]);
  assert.same(custom, ownFrom);
  assert.same(custom(6), 6);
});

QUnit.test('consumed parameters: extracting a static preserves Array call and constructor identity', assert => {
  function read([{ from } = Array]) { return from; }
  assert.deepEqual(read([Array])({ 0: 3, length: 1 }), [3]);
  assert.same(Array, [].constructor);
  assert.deepEqual(Array(4, 5), [4, 5]);
  assert.deepEqual(new Array(6, 7), [6, 7]);
  assert.deepEqual(Array.call(null, 8, 9), [8, 9]);
});

QUnit.test('consumed parameters: defaults resolve in the parameter scope', assert => {
  function read([{ from } = Array]) { return from; }
  function caller(Array) { return [read([]), read([Array])]; }
  function parameter(Array, [{ from } = Array]) { return from; }
  function ownFrom(value) { return ['custom', value]; }
  const custom = { from: ownFrom };
  const result = caller(custom);
  assert.deepEqual(result[0]({ 0: 3, length: 1 }), [3]);
  assert.same(result[1], ownFrom);
  assert.same(parameter(custom, []), ownFrom);
  assert.same(parameter(custom, [undefined]), ownFrom);
  assert.deepEqual(parameter(custom, [])(4), ['custom', 4]);
});

QUnit.test('consumed parameters: all arguments run before property extraction and defaults', assert => {
  const events = [];
  function read([{ from } = (events.push('default'), Array)], ignored) {
    events.push('body', ignored);
    return from;
  }
  function argument(label, value) {
    events.push(label);
    return value;
  }
  function ownFrom(value) { return value; }
  const custom = {};
  Object.defineProperty(custom, 'from', {
    get() { events.push('from'); return ownFrom; },
  });
  const result = read([argument('receiver', custom)], argument('later', 0));
  assert.deepEqual(events, ['receiver', 'later', 'from', 'body', 0]);
  assert.same(result, ownFrom);
  events.length = 0;
  const fallback = read([], argument('later', 0));
  assert.deepEqual(events, ['later', 'default', 'body', 0]);
  assert.deepEqual(fallback({ 0: 3, length: 1 }), [3]);
});

QUnit.test('consumed parameters: arguments retains the original supplied object and length', assert => {
  function read([{ from } = Array]) { return [arguments[0], from, arguments.length]; }
  function referenced({ from } = Array) {
    const original = arguments;
    return [original, from];
  }
  function ownFrom(value) { return value; }
  const custom = { from: ownFrom };
  const input = [custom];
  const result = read(input);
  assert.same(result[0], input);
  assert.same(result[1], ownFrom);
  assert.same(result[2], 1);
  const reference = referenced(custom);
  assert.same(reference[0][0], custom);
  assert.same(reference[0].length, 1);
  assert.same(reference[1], ownFrom);
  const supplied = [Array];
  assert.same(read(supplied)[0], supplied);
  assert.same(read(supplied)[0][0], [].constructor);
});

export function readExportedConsumedArgument([{ from } = Array]) { return from; }

QUnit.test('consumed parameters: escaped and reassigned callees preserve custom receivers', assert => {
  function read([{ from } = Array]) { return from; }
  const escaped = { read };
  let reassigned = ([{ from } = Array]) => from;
  function ownFrom(value) { return value; }
  const input = [{ from: ownFrom }];
  assert.same(escaped.read(input), ownFrom);
  assert.same(readExportedConsumedArgument(input), ownFrom);
  assert.same(escaped.read([{}]), undefined);
  assert.same(readExportedConsumedArgument([{}]), undefined);
  assert.same(reassigned(input), ownFrom);
  reassigned = value => value;
  assert.same(reassigned(input), input);
});

QUnit.test('consumed parameters: rest and spread preserve custom method identity', assert => {
  function rest(...[{ from } = Array]) { return from; }
  function read([{ from } = Array]) { return from; }
  function spread(args) { return read(...args); }
  function ownFrom(value) { return ['custom', value]; }
  const custom = { from: ownFrom };
  assert.same(rest(custom), ownFrom);
  assert.same(spread([[custom]]), ownFrom);
  assert.deepEqual(rest(custom)(3), ['custom', 3]);
  assert.deepEqual(spread([[custom]])(4), ['custom', 4]);
  assert.same(rest({}), undefined);
  assert.same(spread([[{}]]), undefined);
});
/* eslint-enable prefer-rest-params -- end of the source forms above */

QUnit.test('consumed parameters: a returned receiver keeps the returning function intact', assert => {
  let saved;
  function read([{ from } = Array]) { return typeof from; }
  read([(function source() {
    saved = source;
    return Array;
  })()]);
  assert.same(saved(), Array);
});

QUnit.test('consumed parameters: a returning function owns its internal name', assert => {
  function read([{ from } = Array]) { return typeof from; }
  assert.same(read([(function Array() { return Array; })()]), 'undefined');
});

QUnit.test('consumed parameters: captured receivers keep their original values', assert => {
  let saved;
  function read([{ from } = Array]) { return typeof from; }
  read(saved = [Array]);
  assert.same(saved[0], Array);
  read([saved = Array]);
  assert.same(saved, Array);
});

QUnit.test('consumed parameters: a sealed absent realm hop still throws', assert => {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line default-param-last, es/no-nonstandard-object-properties, no-unused-vars -- the dead default and shadow pin the receiver frame
    assert.throws(() => (function ({ from } = Object, globalThis) {
      return from;
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed receiver must preserve this throw
    })((globalThis.window?.self).Array), TypeError);
    // eslint-disable-next-line default-param-last, es/no-nonstandard-object-properties, no-unused-vars -- a non-polyfilled sibling must preserve the same receiver throw
    assert.throws(() => (function ({ from, other } = Object, globalThis) {
      return [from, other];
    // eslint-disable-next-line no-unsafe-optional-chaining -- the mixed pattern still observes the sealed receiver
    })((globalThis.window?.self).Array), TypeError);
  } else {
    assert.same(globalThis.window.self, globalThis.window);
  }
});

QUnit.test('consumed parameters: static arguments need no parameter default', assert => {
  function flat({ from }) { return from; }
  function nested([{ from }]) { return from; }
  function deep({ slot: [{ from }] }) { return from; }
  function ownFrom(value) { return ['custom', value]; }
  assert.deepEqual(flat(Array)({ 0: 1, length: 1 }), [1]);
  assert.deepEqual(nested([Array])({ 0: 2, length: 1 }), [2]);
  assert.deepEqual(deep({ slot: [Array] })({ 0: 3, length: 1 }), [3]);
  assert.same(flat({ from: ownFrom }), ownFrom);
  assert.same(nested([{ from: ownFrom }]), ownFrom);
  assert.same(deep({ slot: [{ from: ownFrom }] }), ownFrom);
  assert.same(flat({}), undefined);
  assert.same(nested([{}]), undefined);
  assert.same(deep({ slot: [{}] }), undefined);
});

QUnit.test('consumed parameters: supplied receivers resolve in their caller scope', assert => {
  function read(Array, [{ from }]) { return from; }
  function outer([{ from }]) { return from; }
  function ownFrom(value) { return value; }
  assert.deepEqual(read(null, [Array])({ 0: 1, length: 1 }), [1]);
  {
    const Array = { from: ownFrom };
    assert.same(outer([Array]), ownFrom);
  }
  assert.deepEqual(outer([Array])({ 0: 2, length: 1 }), [2]);
});

QUnit.test('consumed parameters: later arguments and wrappers keep their effects', assert => {
  const events = [];
  function read([{ from }], other) {
    events.push('body', other);
    return from;
  }
  const from = read([(events.push('receiver'), Array)], (events.push('later'), 1));
  assert.deepEqual(events, ['receiver', 'later', 'body', 1]);
  assert.deepEqual(from({ 0: 2, length: 1 }), [2]);
  assert.same(Array, [].constructor);
});

// Exported results retain a closed caller set for private functions inside their initializer.
export const privateParameterResult = (() => {
  function read({ from } = Array) { return from; }
  return read(Array)([7]);
})();
export const reflectedParameterResult = Reflect.apply(readReflectedParameter, null, [Array])([8]);
function readReflectedParameter({ from } = Array) { return from; }

QUnit.test('consumed parameters: private exported result and earlier Reflect.apply', assert => {
  assert.deepEqual(privateParameterResult, [7]);
  assert.deepEqual(reflectedParameterResult, [8]);
});

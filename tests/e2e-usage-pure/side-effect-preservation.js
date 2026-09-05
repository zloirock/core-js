/* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens, sonarjs/no-extra-arguments, prefer-template --
   these tests intentionally exercise optional-chain short-circuits, paren-terminated optional lookups,
   side-effecting inline-call arguments, and `+`-concat computed keys to count the resulting runtime effects */
// Side-effect preservation across polyfill rewrites: an effect (counter increment) carried in a computed
// key / call argument that the rewrite folds or collapses must run the SAME number of times as it does
// natively. Counting the effect at runtime is the direct oracle - a dropped effect leaves the count at 0.

// SE1: a polyfilled instance method reached via a parenthesized OPTIONAL member with a side-effecting
// computed key. The key effect fires once on a non-null receiver, and NOT at all when the optional chain
// short-circuits - native evaluates the key only after the receiver is confirmed non-null.
QUnit.test('side effect: paren-lookup optional computed-key fires once on a non-null receiver', assert => {
  let probe = 0;
  const arr = [1, 2, 3];
  const result = (arr?.[(probe++, 'includes')])(2);
  assert.true(result);
  assert.strictEqual(probe, 1);
});

QUnit.test('side effect: paren-lookup optional computed-key is skipped on a nullish short-circuit', assert => {
  let probe = 0;
  const arr = null;
  assert.throws(() => (arr?.[(probe++, 'includes')])(2));
  assert.strictEqual(probe, 0);
});

// SE2: an inline-resolvable call `(() => Array)(arg)` folds to its returned receiver `Array`, but the call
// ARGUMENT still runs at call time and must be preserved alongside the folded receiver.
QUnit.test('side effect: inline-call argument runs once when the call folds to its receiver', assert => {
  let calls = 0;
  const has = 'from' in (() => Array)(calls++);
  assert.true(has);
  assert.strictEqual(calls, 1);
});

// SE5: a side-effecting computed key in a destructure evaluates at destructure time. The static-extract
// rewrite folds the key effect into the emitted value so it still runs exactly once.
QUnit.test('side effect: destructure computed-key effect runs exactly once', assert => {
  let keyEval = 0;
  const { [(keyEval++, 'from')]: build } = Array;
  assert.deepEqual(build([1, 2, 3]), [1, 2, 3]);
  assert.strictEqual(keyEval, 1);
});

// SE6: an effect BURIED in a `+`-concat or template fold of a computed key (not a top-level sequence
// prefix). The fold resolves the key to a static name and collapses the member to a polyfill, so the
// buried effect must still be harvested and run exactly once - a fold-blind harvest drops it (count 0).
QUnit.test('side effect: buried plus-fold computed-key effect runs once on static dispatch', assert => {
  let probe = 0;
  const result = Array[(probe++, 'fr') + 'om']([1, 2, 3]);
  assert.deepEqual(result, [1, 2, 3]);
  assert.strictEqual(probe, 1);
});

QUnit.test('side effect: buried plus-fold computed-key effect runs once on instance dispatch', assert => {
  let probe = 0;
  const result = [3, 4][(probe++, 'a') + 't'](0);
  assert.strictEqual(result, 3);
  assert.strictEqual(probe, 1);
});

QUnit.test('side effect: buried template-fold computed-key effect runs once', assert => {
  let probe = 0;
  const result = Object[`ent${ (probe++, 'r') }ies`]({ x: 1 });
  assert.deepEqual(result, [['x', 1]]);
  assert.strictEqual(probe, 1);
});

// SE7: a static-collapse discards the whole receiver and re-emits its effects as a sequence prefix. They
// must run in SOURCE-EVAL order: the chain-root CALL (deepest object) BEFORE the shallower computed hop-key.
// A harvest that appended the call last reversed the order. The polyfill collapses to `_Array$of`, so the
// `.self` hop is dropped and never reached at runtime - only the effect ORDER is observable.
QUnit.test('side effect: static-collapse chain-root call runs before the hop-key effect', assert => {
  const log = [];
  (() => {
    log.push('call');
    return globalThis;
  })()[(log.push('key'), 'self')].Array.of(1);
  assert.deepEqual(log, ['call', 'key']);
});

// SE9: a `.name` (MaybeFunction memoizing-get) on a proxy-global hop chain memoizes the receiver. The
// receiver's own buried hop-key effect must run EXACTLY once - the memo `_ref = receiver` already
// evaluates it, so the rewrite must not ALSO re-emit it as a prefix (which double-ran it on both emitters).
// the polyfill collapses `globalThis.self.Map` to the pure `_Map`, so the `.self` hop is never reached.
QUnit.test('side effect: .name memoizing-get receiver effect runs once on a proxy-hop chain', assert => {
  let probe = 0;
  const result = globalThis[(probe++, 'self')].Map.name;
  assert.strictEqual(result, 'Map');
  assert.strictEqual(probe, 1);
});

// SE10: a NESTED sequence inside the proxy-hop computed key (`globalThis[(a, (b, 'self'))].Map`). Folding the
// key to its tail name must recurse PAST the inner parenthesized sequence, harvesting BOTH buried effects in
// source order - a peel that stops at the inner paren leaves the hop raw (`_globalThis.self`, undefined
// off-engine) and loses the outer effect. The collapse drops the `.self` hop, so the two harvested effects
// (logged in order) are the only observable - a dropped or reordered level shows directly in the log.
QUnit.test('side effect: nested-sequence proxy-hop key harvests both buried effects once, in order', assert => {
  const log = [];
  const result = globalThis[(log.push('a'), (log.push('b'), 'self'))].Map.name;
  assert.strictEqual(result, 'Map');
  assert.deepEqual(log, ['a', 'b']);
});

// SE8: a destructure-default receiver rooted in a proxy-global hop, forced through the MEMO path by an
// unresolved sibling (`length`). The collapse drops the hop and re-roots on the pure global, so the dropped
// prefix's chain-root call AND its buried computed hop-key effect must BOTH re-emit. Calling with the param
// omitted runs the default once; harvesting only the chain-root call lost the hop-key effect.
QUnit.test('side effect: memo-path proxy-hop default re-emits chain-root and hop-key effects', assert => {
  let c = 0;
  function withDefault({ of, length } = (() => {
    c += 1;
    return globalThis;
  })()[(c += 10, 'self')].Array) {
    return [of(1), length];
  }
  withDefault();
  assert.strictEqual(c, 11);
});

// SE11: a `.name` memo on a proxy chain-root-call receiver leaves the call body visitor-rewritten, so its
// inner proxy-global member chain (`globalThis.self`) and polyfillable member (`[1].flat()`) resolve through
// the polyfill exactly as the natural visitor resolves them, and the body's own effect still runs once.
// a bare-identifier re-emit stranded the inner member chain / polyfill - here the `.name` value + effect count
// pin the inner resolution and single evaluation.
QUnit.test('side effect: .name memo resolves chain-root call inner content and runs its effect once', assert => {
  let m = 0;
  const memberChain = (() => {
    m += 1;
    return globalThis.self;
  })().window.Map.name;
  assert.strictEqual(memberChain, 'Map');
  assert.strictEqual(m, 1);
  let p = 0;
  const polyfillable = (() => {
    p += [1].flat()[0];
    return globalThis;
  })().self.Set.name;
  assert.strictEqual(polyfillable, 'Set');
  assert.strictEqual(p, 1);
});

// SE12: OPTIONAL `.name` on a chain-root-CALL receiver `(call)?.Ctor.name`. the `?.` guard memoizes the call
// and RUNS its receiver-SE there - the body must not re-emit it (it double-ran the call on both emitters
// before this fix). a computed key-SE folds into the non-null branch (runs once). the call always returns the
// global, so `?.` never short-circuits; value + effect counts pin single evaluation. a bare `.Ctor` (no
// `.self` hop) is used so the optional rebind's kept `_ref.Ctor` resolves in Node, which lacks `globalThis.self`.
QUnit.test('side effect: optional .name on a chain-root-call receiver runs receiver + key effects once', assert => {
  let r = 0;
  const bareRoot = (() => {
    r += 1;
    return globalThis;
  })()?.Map.name;
  assert.strictEqual(bareRoot, 'Map');
  assert.strictEqual(r, 1);
  let k = 0;
  const keySe = (() => {
    r += 10;
    return globalThis;
  })()?.[(k += 1, 'Set')].name;
  assert.strictEqual(keySe, 'Set');
  assert.strictEqual(r, 11);
  assert.strictEqual(k, 1);
});

// SE13: a side-effecting proxy-global HOP key sitting DEEPER than an immediate collapse - under
// `.Array.prototype` on an instance-method receiver. the redundant hop collapses to the pure root and the
// buried effect harvests ahead of it; before the fix the deep hop survived as a dead `_globalThis.self`
// (TypeError off the undefined property in Node) and the effect risked being dropped. the transformed output
// reads off `_globalThis.Array.prototype`, so it runs in Node despite the `self` / `window` source hops.
QUnit.test('side effect: deep proxy-hop key under .Array.prototype harvests its effect once and collapses', assert => {
  let k = 0;
  const single = globalThis[(k += 1, 'self')].Array.prototype.flat.call([1, [2, 3]]);
  assert.deepEqual(single, [1, 2, 3]);
  assert.strictEqual(k, 1);
  let a = 0;
  let b = 0;
  const double = globalThis[(a += 1, 'self')][(b += 1, 'window')].Array.prototype.at.call([5, 6], 0);
  assert.strictEqual(double, 5);
  assert.strictEqual(a, 1);
  assert.strictEqual(b, 1);
});

// SE14: an OPTIONAL chain-ASSIGN root storing a CALL that inline-resolves to globalThis, navigating a `.self`
// proxy hop into a static call with a trailing instance method (`((w = f()))?.self.Array.of(5).at(0)`). the
// call is always-defined, so the dead `?.` guard ERASES and the receiver collapses to the pure static; the
// assign SE (the call) folds ONCE into that static - not left in a kept guard (which re-ran the call on
// unplugin) nor a raw `.self.Array.of` (a missed polyfill that throws in the stripped realm). the `.self` hop
// is dropped, so it never reads in Node. value + effect count + the assigned binding pin single evaluation.
QUnit.test('side effect: optional call-assign proxy-hop root folds its SE once into the collapsed static', assert => {
  let calls = 0;
  let w;
  function f() {
    calls += 1;
    return globalThis;
  }
  const result = (w = f())?.self.Array.of(5).at(0);
  assert.strictEqual(result, 5);
  assert.strictEqual(calls, 1);
  assert.strictEqual(w, globalThis);
});

// SE15: the NO-HOP twin of SE14 - an OPTIONAL chain-assign root storing a CALL to globalThis with no proxy
// hop, straight into a static call + trailing instance (`(w = f())?.Array.of(5).at(0)`). the `?.` guards only
// the always-defined receiver, so it erases regardless of the non-hop member that follows; the receiver-
// independent collapse folds the call ONCE. before, a kept dead guard let unplugin re-run the call in the fold
// (SE twice) and read a raw native static on a `.name` twin - the erasure now matches the static-call canon.
QUnit.test('side effect: optional no-hop call-assign root folds its SE once under an erased guard', assert => {
  let calls = 0;
  let w;
  function f() {
    calls += 1;
    return globalThis;
  }
  const result = (w = f())?.Array.of(5).at(0);
  assert.strictEqual(result, 5);
  assert.strictEqual(calls, 1);
  assert.strictEqual(w, globalThis);
});

// SE: a side-effecting destructure key in a BODYLESS control body (`if (c) var {...} = R`). the polyfill
// extract is emitted as a statement before the surviving residual, so the two must share a block - else the
// residual escapes the guard and runs the key effect even when the branch is not taken. `var` is required:
// a lexical declaration cannot be a bodyless body
QUnit.test('side effect: bodyless-if destructure key stays under the guard when not taken', assert => {
  function branch(taken) { return taken; }
  let keyEval = 0;
  // eslint-disable-next-line no-var -- bodyless control body must use `var`
  if (branch(false)) var { [(keyEval++, 'from')]: build } = Array;
  assert.strictEqual(keyEval, 0, 'key effect did not run on the untaken branch');
  assert.strictEqual(typeof build, 'undefined', 'binding stayed unassigned (the extract did not escape the guard)');
});

QUnit.test('side effect: bodyless-if destructure runs the key once and binds the polyfill when taken', assert => {
  function branch(taken) { return taken; }
  let keyEval = 0;
  // eslint-disable-next-line no-var -- bodyless control body must use `var`
  if (branch(true)) var { [(keyEval++, 'from')]: build } = Array;
  assert.strictEqual(keyEval, 1, 'key effect ran once on the taken branch');
  assert.deepEqual(build([7, 8]), [7, 8], 'static polyfill bound and working under the guard');
});

// SE: a bodyless do-while body with a side-effecting key on a CONSTANT-literal receiver. the memoized `_ref`
// hoist runs before the residual too, so all three statements share the body block - and a do-while body can
// hold only one statement, so without the block it was unparsable. this shape crashed the build before the fix
QUnit.test('side effect: bodyless do-while memoized-receiver destructure builds and runs the key once', assert => {
  function again() { return false; }
  let keyEval = 0;
  // eslint-disable-next-line no-var -- bodyless control body must use `var`
  do var { [(keyEval++, 'at')]: pick } = [10, 20, 30]; while (again());
  assert.strictEqual(keyEval, 1, 'key effect ran once on the single do-while pass');
  assert.strictEqual(typeof pick, 'function', 'instance method extracted to the memoized receiver (build did not crash)');
});

// SE: a bodyless for-of body runs its block-wrapped extract + residual EACH iteration, so the key effect fires
// once per pass and the binding re-extracts per element (a single-pass `if`/do-while can't exercise this)
QUnit.test('side effect: bodyless for-of body destructure runs the key effect once per iteration', assert => {
  let keyEval = 0;
  // eslint-disable-next-line no-var -- bodyless control body must use `var`
  for (const row of [[1, 2], [3, 4]]) var { [(keyEval++, 'flat')]: pick } = row;
  assert.strictEqual(keyEval, 2, 'key effect ran once per loop iteration');
  // eslint-disable-next-line block-scoped-var -- `var` is function-scoped; reading the binding after the bodyless loop is the point
  assert.strictEqual(typeof pick, 'function', 'instance method re-extracted each iteration');
});

// a call-rooted fallback LEFT (`(() => globalThis)()[(key, 'self')].Array || Set`) discarded by
// the param-default synth-collapse re-emits its effects in SOURCE order: the chain-root call
// runs BEFORE the hop-key effect (object evaluates before its computed key) - an append-last
// harvest reversed them on both emitters
QUnit.test('fallback-collapse: root call runs before the hop-key effect', assert => {
  const log = [];
  function f({ from } = (() => {
    log.push('call');
    return globalThis;
  })()[(log.push('key'), 'self')].Array || Set) {
    return from;
  }
  const from = f();
  assert.same(typeof from, 'function');
  assert.deepEqual(log, ['call', 'key']);
});

// a paren-wrapped callee over a guarded refused-alias member keeps `this` on the raw branch
// exactly like the bare form: the guard's untaken side reads the user's own method bound to
// the user's receiver
QUnit.test('refused-alias guard: paren-wrapped callee keeps this on the raw branch', assert => {
  function via(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    M = {
      groupBy() {
        return this === M ? 'bound' : 'unbound';
      },
    };
    return (M.groupBy)([1, 2]);
  }
  assert.same(via(false), 'bound');
});

// a call-rooted Symbol chain in a computed KEY (`arr[IIFE()[(key, 'Symbol')].iterator]`) collapses
// to the iterator helper; the discarded receiver's effects re-emit in SOURCE order - the chain-root
// call BEFORE the buried hop-key effect (a walk-then-append harvest reversed them on both emitters)
QUnit.test('computed symbol key: root call runs before the hop-key effect', assert => {
  const log = [];
  const method = [1, 2][(() => {
    log.push('call');
    return globalThis;
  })()[(log.push('key'), 'Symbol')].iterator];
  assert.same(typeof method, 'function');
  assert.deepEqual(log, ['call', 'key']);
});

// BOTH effects around a folded SE-key static extraction: the receiver's sequence prefix runs
// first (with the init), the plus-fold computed-key effect second (in the kept residual key) -
// native destructure order
QUnit.test('SE-key fold: receiver prefix and key effect run once each, in native order', assert => {
  const e = [];
  const { [(e.push('k'), 'fr') + 'om']: from } = (e.push('r'), Array);
  assert.same(typeof from, 'function');
  assert.deepEqual(e, ['r', 'k']);
});

// an SE-computed-key leaf under an ARRAY-wrapPED receiver still extracts; the key effect runs
// exactly once in the kept residual
QUnit.test('SE-key under array wrapper: extraction wins, key effect runs once', assert => {
  let c1 = 0;
  const [{ [(c1++, 'from')]: from }, other] = [Array, {}];
  assert.same(typeof from, 'function');
  assert.same(typeof other, 'object');
  assert.same(c1, 1);
});

QUnit.test('SE-key nested plus-fold: key effect runs once, instance extraction binds', assert => {
  let c2 = 0;
  const arr = [1];
  const { y: { [(c2++, 'a') + 't']: at } } = { y: arr };
  // receiver-less call would throw natively (a destructured method loses `this`)
  assert.same(at.call(arr, 0), 1);
  assert.same(c2, 1);
});

// assignment-cascade PARTIAL consume: a rest / non-consumed sibling keeps the residual, so the
// init's side-effecting sequence prefix must run exactly once - a full-consume-style discard
// would silently drop it
QUnit.test('cascade partial consume: rest sibling keeps the init effect', assert => {
  let effectRan;
  let rest;
  let from;
  // eslint-disable-next-line prefer-const -- the assignment CASCADE (not a declaration) is the case under test
  ({ Array: { from }, ...rest } = (effectRan = true, globalThis).self);
  assert.same(typeof from, 'function');
  assert.same(typeof rest, 'object');
  assert.true(effectRan);
});

QUnit.test('cascade partial consume: non-consumed sibling keeps the init effect', assert => {
  let counted = 0;
  let keep;
  let of;
  // eslint-disable-next-line prefer-const -- the assignment CASCADE (not a declaration) is the case under test
  ({ Array: { of }, keep } = (counted++, globalThis).self);
  assert.same(typeof of, 'function');
  assert.same(counted, 1);
  assert.same(keep, undefined);
});

// an SE buried at an INTERMEDIATE array-wrapper level lifts exactly once; the consumed wrapper
// level is stripped from the residual, so no copy re-runs the effect
QUnit.test('array-wrapper intermediate SE lifts and runs once', assert => {
  let mid = 0;
  function midEffect() { mid++; }
  const [[{ Array: { from }, keep }]] = [(midEffect(), [globalThis])];
  assert.same(typeof from, 'function');
  assert.same(keep, undefined);
  assert.same(mid, 1);
});

QUnit.test('array-wrapper single-level SE prefix lifts and runs once', assert => {
  let e1 = 0;
  const [{ Array: { of }, tail }] = (e1++, [globalThis]);
  assert.same(typeof of, 'function');
  assert.same(tail, undefined);
  assert.same(e1, 1);
});

// the SE-key trailing pair lands immediately AFTER its consumed declarator: a later declarator
// of the SAME declaration reads the extracted binding - an end-of-declaration append would hand
// it TDZ (const) or hoisted-undefined (var)
QUnit.test('SE-key pair: later sibling declarator reads the extracted binding', assert => {
  const log = [];
  const arr = [1, [2]];
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the same-declaration sibling read IS the case under test
  const { [(log.push(1), 'flat')]: flat } = arr, viaFlat = flat;
  assert.same(typeof viaFlat, 'function');
  // receiver-less call would throw natively (a destructured method loses `this`)
  assert.deepEqual(viaFlat.call(arr), [1, [2]].flat());
  assert.same(log.length, 1);
});

// outer computed-key SE on a chain-combined emit: ECMA evaluates the receiver chain (hop) BEFORE
// the computed key (key) - the fold must memoize the threaded receiver ahead of the key effect
QUnit.test('chain-combined outer key: receiver chain effect runs before the key effect', assert => {
  const order = [];
  function hop() {
    order.push('hop');
    return 0;
  }
  function eff() {
    order.push('key');
  }
  const a = [[1], [2]];
  const r = a.flat?.().slice(hop())[(eff(), 'includes')](2);
  assert.true(r);
  assert.deepEqual(order, ['hop', 'key']);
});

// a guarded non-polyfill method call with a folded outer key SE: the CALL evaluates inside the
// guard's alternate and must still run BEFORE the computed key, like native evaluation order
QUnit.test('guarded call with outer key SE: call runs before the key effect', assert => {
  const order = [];
  const holder = {
    list() {
      order.push('call');
      return [5, 6];
    },
  };
  function eff() {
    order.push('key');
  }
  const r = holder.list?.()[(eff(), 'at')](0);
  assert.same(r, 5);
  assert.deepEqual(order, ['call', 'key']);
});

// for-init SE-sink with a tail hiding a nested effect below the top-level sequence peel: the
// sink keeps the whole tail, so BOTH effects run exactly once in source order
QUnit.test('for-init sink: outer and buried effects each run once, in order', assert => {
  const seen = [];
  function eff(t) {
    seen.push(t);
    return t;
  }
  let out;
  for (const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]); !out;) out = from;
  assert.same(typeof out, 'function');
  assert.deepEqual(seen, ['outer', 'inner']);
});

// a receiver peeled from under an SE-bearing sequence prefix: the prefix must run BEFORE the
// receiver is read for the extraction (whole-init memo), exactly once
QUnit.test('SE-sequence init: prefix runs before the extraction reads the receiver', assert => {
  const order = [];
  const arr = [7, [8]];
  function se1() { order.push('prefix'); }
  function k1() { order.push('key'); }
  // eslint-disable-next-line no-var, es/no-nonstandard-array-prototype-properties -- the multi-binding var host with a plain sibling key IS the shape under test
  var { [(k1(), 'at')]: at, tail } = (se1(), arr);
  assert.same(typeof at, 'function');
  assert.same(tail, undefined);
  assert.same(order.filter(x => x === 'prefix').length, 1);
  assert.same(order.filter(x => x === 'key').length, 1);
  assert.same(order[0], 'prefix');
});

// the pre+post transform leg lowers these destructures between its phases: the post pass then
// soundly polyfills the plain member read the single-pass shape-bail protects (SE order is
// already fixed by the lowering itself), so the value channel serves the ponyfill even where
// the native is absent. single-pass legs keep the bail-to-native contract
const POST_LOWERED = typeof E2E_POST_LOWERED !== 'undefined';

// NESTED fragment under an SE prefix beside a surviving sibling: the slot memoizes ahead of the
// declaration (`const _ref = (ran++, arr2)`), so the ponyfill lands, the sibling still binds and
// the prefix runs exactly once
QUnit.test('SE-sequence nested fragment: prefix runs once, the ponyfill lands', assert => {
  let ran = 0;
  const arr2 = [1, [2]];
  const { y: { flat: m }, q } = { y: (ran++, arr2), q: 1 };
  assert.same(typeof m, 'function');
  assert.deepEqual(m.call(arr2), [1, 2]);
  assert.same(q, 1);
  assert.same(ran, 1);
});

// a literal receiver nesting a member READ is never emitted twice: with a surviving residual
// sibling the slot memoizes and both readers take the ref, so the getter behind the read fires
// exactly once, like the native single evaluation - and the ponyfill lands
QUnit.test('literal receiver with member read: source getter fires once', assert => {
  let fires = 0;
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter behind the member read IS the case under test
    get p() {
      fires++;
      return [1, [2]];
    },
  };
  const { y: { flat: m }, q } = { y: [holder.p], q: 1 };
  assert.same(typeof m, 'function');
  assert.same(q, 1);
  assert.same(fires, 1);
});

// class-EVAL-TIME positions (a static field initializer) inside a literal receiver are
// re-eval-observable: the literal is never emitted twice, so the getter behind the static
// init fires exactly once, like the native single class evaluation
QUnit.test('literal receiver with class static member read: getter fires once', assert => {
  let fires = 0;
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter behind the static init IS the case under test
    get p() {
      fires++;
      return 1;
    },
  };
  // eslint-disable-next-line unicorn/no-static-only-class -- the class-eval-time static init IS the case under test
  const { y: { at: m }, q } = { y: [class K { static p = holder.p; }], q: 1 };
  // bail-to-native: `m` mirrors native availability; the invariant is the single getter fire
  const nativeAt = POST_LOWERED || Object.getOwnPropertyDescriptor(Array.prototype, 'at') ? 'function' : 'undefined';
  assert.same(typeof m, nativeAt);
  assert.same(q, 1);
  assert.same(fires, 1);
});

// an SE-computed key on an ARRAY-WRAPPED param default: the synthesized default replaces the
// receiver wholesale, the key effect runs once per no-arg call, a caller-passed arg still
// destructures natively (caller args win)
QUnit.test('wrapped param default with SE key: effect once, caller arg wins', assert => {
  let keyEval = 0;
  function f([{ [(keyEval++, 'from')]: from }] = [Array]) { return from; }
  const viaDefault = f();
  assert.same(typeof viaDefault, 'function');
  assert.same(keyEval, 1);
  function custom() { return 'mine'; }
  assert.same(f([{ from: custom }]), custom);
  assert.same(keyEval, 2);
});

// an SE computed key AND a symbol pattern on ONE memoized member receiver: the getter
// behind the receiver fires exactly once (shared `_ref`), both effects observable
QUnit.test('shared memo: SE key and symbol pattern read the receiver once', assert => {
  let fires = 0;
  let keyEval = 0;
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter behind the shared memo IS the case under test
    get p() {
      fires++;
      return [3, [4]];
    },
  };
  const { [(keyEval++, 'toSorted')]: ts, [Symbol.iterator]: { length: mixArity } } = holder.p;
  assert.same(typeof ts, 'function');
  assert.same(mixArity, 0);
  assert.same(fires, 1);
  assert.same(keyEval, 1);
});

// SOLE binding over the same member-nesting literal: the residual is eliminated, so the
// single-read extraction still emits the polyfill - and the getter still fires exactly once
QUnit.test('literal receiver with member read: sole binding extracts, getter fires once', assert => {
  let fires = 0;
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter behind the member read IS the case under test
    get p() {
      fires++;
      return [1, [2]];
    },
  };
  const { y: { flat: m } } = { y: [holder.p] };
  assert.same(typeof m, 'function');
  assert.deepEqual(m.call([1, [2]]), [1, 2]);
  assert.same(fires, 1);
});

// SE10: a collapse that discards the hops BELOW its leaf discards their computed keys with them, so
// the effects buried in those keys have to be re-emitted alongside the leaf's own. harvesting only
// the leaf's key dropped the increment outright.
QUnit.test('side effect: a hop key below a collapsed ctor-static leaf still runs', assert => {
  let keyEval = 0;
  let root;
  const digits = (root = globalThis)?.[(keyEval++, 'Number')].MAX_SAFE_INTEGER.toFixed(2);
  assert.strictEqual(digits, Number.MAX_SAFE_INTEGER.toFixed(2));
  assert.strictEqual(keyEval, 1);
  assert.strictEqual(root, globalThis);
});

// SE11: the same collapse through a SEQUENCE-tail receiver, where the prefix effect and the dropped
// hop key both have to survive, in source order.
QUnit.test('side effect: a sequence prefix and a dropped hop key both run once, in order', assert => {
  const order = [];
  const map = (order.push('prefix'), globalThis)[(order.push('key'), 'self')].Map;
  assert.same(typeof map, 'function');
  assert.deepEqual(order, ['prefix', 'key']);
});

// SE12: a flatten slot that already renders its declarator's init - through a routed receiver memo or
// a rendered sibling - must not have that init's sequence prefix lifted a second time.
QUnit.test('side effect: a flatten sibling init runs once, not once per channel', assert => {
  let evaluated = 0;
  const source = [1, 2, 3];
  const { Array: { from } } = globalThis,
        { at, concat } = (evaluated++, source);
  assert.strictEqual(evaluated, 1);
  assert.deepEqual(from([4]), [4]);
  assert.same(at.call(source, 0), 1);
  assert.deepEqual(concat.call(source, 4), [1, 2, 3, 4]);
});

QUnit.test('side effect: a flatten sibling with an SE key keeps the plain sibling polyfilled', assert => {
  let keyEval = 0;
  const source = [[1], [2]];
  const { Array: { of } } = globalThis,
        { indexOf, [(keyEval++, 'flat')]: flat } = source;
  assert.strictEqual(keyEval, 1);
  assert.deepEqual(of(9), [9]);
  assert.same(indexOf.call(source, source[1]), 1);
  assert.deepEqual(flat.call(source), [1, 2]);
});

QUnit.test('side effect: an SE-key pair routed into a flatten slot leaves the init one evaluation', assert => {
  let evaluated = 0;
  let keyEval = 0;
  const { Array: { isArray } } = globalThis,
        { [(keyEval++, 'of')]: of, ...rest } = (evaluated++, Array);
  assert.strictEqual(evaluated, 1);
  assert.strictEqual(keyEval, 1);
  assert.true(isArray([]));
  assert.deepEqual(of(1), [1]);
  assert.same(typeof rest, 'object');
});

// the hop-free forms of the chain-assign collapse: `self` / `window` do not exist in Node, so the
// navigating shapes stay fixture-only and these assert the two properties that survive here - the
// value's prefix keeps its polyfill and runs once, and a parenthesized value stays parseable
QUnit.test('side effect: a chain-assign value copied into a collapse keeps its own polyfills', assert => {
  let q;
  const source = [3, 1, 2];
  let calls = 0;
  function counted() {
    calls += 1;
    return source;
  }
  const viaPrefix = (q = (counted().at(0), globalThis)).Map.name;
  assert.strictEqual(calls, 1);
  assert.same(viaPrefix, 'Map');
  assert.same(q, globalThis);
  let p;
  const viaParenValue = (p = (globalThis)).Map.name;
  assert.same(viaParenValue, 'Map');
  assert.same(p, globalThis);
});

// a static claimed off a chain-assign VALUE needs proof that the value is the global, not just that
// the chain is rooted at one: a step onto anything else leaves a value the source dereferences and
// throws on, and answering the ponyfill there would turn that throw into a working read
QUnit.test('side effect: a chain-assign value that is not the global keeps the native throw', assert => {
  let q;
  assert.throws(() => (q = globalThis.noSuchSlot).Map, TypeError);
  assert.same(q, undefined);
  let p;
  assert.throws(() => (p = globalThis.Math).Map.name.length, TypeError);
  assert.same(p, Math);
  // the value that IS the global still collapses
  let g;
  assert.same(typeof new ((g = globalThis).Map)([[1, 1]]).size, 'number');
  assert.same(g, globalThis);
});

// a slot the SE-key flatten claims still renders its own init in place, so the lift and the for-init
// sink must not re-emit that init's sequence prefix on top of it - the prefix effect would run twice
QUnit.test('side effect: an SE-key flatten slot leaves its init one evaluation', assert => {
  let evaluated = 0;
  let keyEval = 0;
  function source() {
    evaluated += 1;
    return Array;
  }
  const { [(keyEval++, 'of')]: of } = (source(), Array),
        { Array: { from } } = globalThis;
  assert.strictEqual(evaluated, 1);
  assert.strictEqual(keyEval, 1);
  assert.deepEqual(of(5), [5]);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// SE: a constant-literal receiver with a side-effecting key on SIBLING-declarator hosts. the
// receiver memo joins the declaration as a preceding comma declarator at the source slot, so the
// extraction reads a declared ref and the key effect runs exactly once per destructure
QUnit.test('side effect: SE-key const-literal receiver on a multi-declarator host', assert => {
  let keyEval = 0;
  // eslint-disable-next-line no-var, @stylistic/one-var-declaration-per-line, es/no-nonstandard-array-prototype-properties -- multi-declarator host under test
  var { [(keyEval++, 'at')]: pick, other } = [10, 20], z = 1;
  assert.strictEqual(keyEval, 1, 'key effect ran once');
  assert.strictEqual(pick.call([10, 20], 1), 20, 'instance method extracted off the declared memo ref');
  assert.strictEqual(typeof other, 'undefined', 'sibling binding untouched');
  assert.strictEqual(z, 1, 'later declarator untouched');
});

QUnit.test('side effect: SE-key const-literal receiver in a for-init host', assert => {
  let keyEval = 0;
  let seen = '';
  // eslint-disable-next-line no-var -- the for-init comma-list host is under test
  for (var { [(keyEval++, 'flat')]: pick } = [[1], 2], i = 0; i < 1; i++) seen = typeof pick;
  assert.strictEqual(keyEval, 1, 'key effect ran once');
  assert.strictEqual(seen, 'function', 'instance method extracted inside the loop header');
  // eslint-disable-next-line block-scoped-var -- `var` is function-scoped; reading the binding after the loop is the point
  assert.deepEqual(pick.call([[5]]), [5], 'extraction reads the declared memo ref');
});

// SE buried in a computed-MEMBER receiver of a fully-consumed declarator beside a nested-proxy
// flatten sibling: the lifted init re-emits as a bare expression statement (the effect runs once),
// while both bindings still get their polyfills
QUnit.test('side effect: computed-member receiver SE lifts once beside a flatten sibling', assert => {
  const bag = { A: Array };
  let e = 0;
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the flatten-sibling pairing is under test
  const { from: m1 } = bag[(e++, 'A')], { Array: { of: of2 } } = globalThis;
  assert.strictEqual(e, 1, 'receiver member-key effect ran once');
  assert.deepEqual(m1([1, 2]), [1, 2], 'consumed declarator got the static polyfill');
  assert.deepEqual(of2(3), [3], 'flatten sibling got its polyfill');
});

// SE: an effectful SEQUENCE receiver whose residual SURVIVES the destructure. natively the prefix
// runs before the pattern binds anything, so an effect that READS one of those bindings sees the
// value it had before - the extraction may not be emitted ahead of the read that feeds it
QUnit.test('side effect: sequence-receiver prefix runs before an assignment destructure binds', assert => {
  let seen = 'unset';
  let picked = 'before';
  let other;
  function eff() {
    seen = typeof picked;
  }
  ({ Map: picked, other } = (eff(), globalThis));
  assert.strictEqual(seen, 'string', 'the prefix ran while the target still held its own value');
  assert.strictEqual(typeof picked, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

QUnit.test('side effect: sequence-receiver prefix runs before a var destructure binds', assert => {
  let seen = 'unset';
  function eff() {
    seen = typeof hoisted;
  }
  // eslint-disable-next-line no-var -- the hoisted binding the prefix reads is the point
  var { Map: hoisted, other } = (eff(), globalThis);
  assert.strictEqual(seen, 'undefined', 'the prefix ran while the hoisted binding was still empty');
  assert.strictEqual(typeof hoisted, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

// SE: the same order where the host has no statement slot - a bodyless control slot, a
// multi-declarator host whose sibling init runs first, and a for-init header. each carries the
// prefix its own way (bracing, splitting, riding the first extraction's value) and none of them
// may let the effect observe a binding the destructure has already written
QUnit.test('side effect: sequence-receiver prefix runs first in a bodyless control slot', assert => {
  let seen = 'unset';
  function eff() {
    seen = typeof slotted;
  }
  // eslint-disable-next-line no-var -- the bodyless slot is the host under test
  if (assert) var { Map: slotted, other } = (eff(), globalThis);
  assert.strictEqual(seen, 'undefined', 'the prefix ran while the hoisted binding was still empty');
  assert.strictEqual(typeof slotted, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

QUnit.test('side effect: sequence-receiver prefix runs after a preceding declarator init', assert => {
  const order = [];
  function pre() {
    order.push('pre');
    return 'first';
  }
  function eff() {
    order.push(typeof sibling);
  }
  // eslint-disable-next-line no-var, @stylistic/one-var-declaration-per-line -- the multi-declarator host is under test
  var first = pre(), { Set: sibling, other } = (eff(), globalThis);
  assert.deepEqual(order, ['pre', 'undefined'], 'the sibling init ran first, then the prefix');
  assert.strictEqual(first, 'first', 'the preceding declarator kept its own binding');
  assert.strictEqual(typeof sibling, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

QUnit.test('side effect: sequence-receiver prefix runs first in a for-init header', assert => {
  let seen = 'unset';
  function eff() {
    // eslint-disable-next-line block-scoped-var -- the loop header declares it; reading it here is the point
    seen = typeof header;
  }
  let spins = 0;
  // eslint-disable-next-line no-var -- the loop header is the host under test
  for (var { WeakMap: header, other } = (eff(), globalThis); spins < 2; spins++);
  assert.strictEqual(seen, 'undefined', 'the prefix ran while the hoisted binding was still empty');
  assert.strictEqual(spins, 2, 'the header ran its loop, and the init exactly once');
  /* eslint-disable block-scoped-var -- same header-declared bindings, read after the loop */
  assert.strictEqual(typeof header, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
  /* eslint-enable block-scoped-var -- back to the file's own scoping */
});

// SE: the extracted prop's OWN computed key carries an effect, and the receiver sits behind a
// sequence prefix. natively the prefix runs first, the key second, and the binding only then - so
// the extraction may not be emitted ahead of either. the key is a SEQUENCE ending in a literal:
// that is the shape the emitter can fold, and a call-valued key would leave the row native and
// vacuous. the multi-declarator twin adds a sibling init the prefix may not hoist over
QUnit.test('side effect: extracted-key effect keeps its place behind the receiver prefix', assert => {
  const order = [];
  function prefix() {
    order.push(typeof keyed);
  }
  // eslint-disable-next-line no-var -- the hoisted binding the prefix reads is the point
  var { [(order.push('key'), 'from')]: keyed, other } = (prefix(), Array);
  assert.deepEqual(order, ['undefined', 'key'], 'prefix first, key second, binding last');
  assert.strictEqual(typeof keyed, 'function', 'the extraction bound the polyfilled static');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

QUnit.test('side effect: extracted-key effect stays behind an effectful sibling init', assert => {
  const order = [];
  function sibling() {
    order.push('sibling');
    return 1;
  }
  function prefix() {
    order.push(typeof picked);
  }
  // eslint-disable-next-line no-var, @stylistic/one-var-declaration-per-line -- the multi-declarator host is under test
  var lead = sibling(), { [(order.push('key'), 'of')]: picked, other } = (prefix(), Array);
  assert.deepEqual(order, ['sibling', 'undefined', 'key'], 'sibling init, prefix, key - source order');
  assert.strictEqual(lead, 1, 'the preceding declarator kept its own binding');
  assert.strictEqual(typeof picked, 'function', 'the extraction bound the polyfilled static');
  assert.strictEqual(typeof other, 'undefined', 'the surviving residual still reads the receiver');
});

// SE: the receiver behind a sequence prefix, destructured through an ARRAY WRAPPER. the wrapper's
// literal stays in the residual, so the extraction lands ahead of it - and the prefix ahead of both,
// where the source ran it
QUnit.test('side effect: sequence-receiver prefix runs before an array-wrapped extraction binds', assert => {
  let seen = 'unset';
  function eff() {
    seen = typeof wrapped;
  }
  // eslint-disable-next-line no-var -- the hoisted binding the prefix reads is the point
  var [{ Map: wrapped }, neighbour] = (eff(), [globalThis, 7]);
  assert.strictEqual(seen, 'undefined', 'the prefix ran while the hoisted binding was still empty');
  assert.strictEqual(typeof wrapped, 'function', 'the extraction bound the polyfilled constructor');
  assert.strictEqual(neighbour, 7, 'the wrapper neighbour still binds its own element');
});

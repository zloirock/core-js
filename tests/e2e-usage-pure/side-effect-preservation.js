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

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

// NESTED fragment under an SE prefix bails to native (an extraction would reorder the prefix);
// the prefix still runs exactly once
QUnit.test('SE-sequence nested fragment: bails native, prefix runs once', assert => {
  let ran = 0;
  const arr2 = [1, [2]];
  const { y: { flat: m }, q } = { y: (ran++, arr2), q: 1 };
  assert.same(typeof m, 'function');
  assert.same(q, 1);
  assert.same(ran, 1);
});

// a literal receiver nesting a member READ is never emitted twice: with a surviving residual
// sibling the extraction backs off entirely, so the getter behind the read fires exactly once,
// like the native single evaluation
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
  assert.same(typeof m, 'function');
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

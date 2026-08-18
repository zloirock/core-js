// Global proxies: globalThis - accessing globals and statics through it

// standalone-post transform leg: detection ran on the fully-lowered text, where babel already
// rewrote optional chains / chain-assign inits into temp-var ternaries - the proxy-hop fold
// these tests assert never fires there and the code keeps its native-faithful behavior
// (a raw `.self` hop read throws in Node). the fold itself stays locked by the other legs
const testUnlessDetectLowered = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

// === globalThis ===
QUnit.test('globalThis.Promise', assert => {
  const async = assert.async();
  new globalThis.Promise(resolve => resolve(1)).then(v => {
    assert.same(v, 1);
    async();
  });
});

QUnit.test('globalThis.Map', assert => {
  const map = new globalThis.Map([['a', 1]]);
  assert.same(map.get('a'), 1);
});

QUnit.test('globalThis.Set', assert => {
  const set = new globalThis.Set([1, 2, 3]);
  assert.same(set.size, 3);
});

QUnit.test('globalThis.Symbol.iterator', assert => {
  assert.notSame(globalThis.Symbol.iterator, undefined);
});

QUnit.test('globalThis.Array.from', assert => {
  assert.deepEqual(globalThis.Array.from([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('globalThis.Object.assign', assert => {
  assert.deepEqual(globalThis.Object.assign({}, { a: 1 }), { a: 1 });
});

QUnit.test('globalThis.Object.keys', assert => {
  assert.deepEqual(globalThis.Object.keys({ a: 1, b: 2 }), ['a', 'b']);
});

QUnit.test('globalThis.parseInt', assert => {
  assert.same(globalThis.parseInt('42', 10), 42);
});

QUnit.test('globalThis.parseFloat', assert => {
  assert.same(globalThis.parseFloat('3.14'), 3.14);
});

QUnit.test('globalThis.URL', assert => {
  const url = new globalThis.URL('https://example.com');
  assert.same(url.hostname, 'example.com');
});

QUnit.test('globalThis.structuredClone', assert => {
  const obj = { a: [1, 2] };
  const clone = globalThis.structuredClone(obj);
  assert.deepEqual(clone, obj);
  assert.notSame(clone.a, obj.a);
});

QUnit.test('globalThis.WeakMap', assert => {
  const wm = new globalThis.WeakMap();
  const key = {};
  wm.set(key, 'val');
  assert.same(wm.get(key), 'val');
});

// === IIFE-rooted proxy chains: side-effect preservation ===
// the receiver chain folds to the polyfilled global, but an IIFE chain root carries observable
// setup that must survive the fold (and the inner globalThis must keep its own polyfill without
// crashing the text-transform queue)
QUnit.test('IIFE-proxy Symbol.iterator value-ref: side effect runs once', assert => {
  let calls = 0;
  const it = (() => {
    calls++;
    return globalThis;
  })().Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

QUnit.test('IIFE-proxy Promise.resolve: side effect runs once', assert => {
  const async = assert.async();
  let calls = 0;
  (() => {
    calls++;
    return globalThis;
  })().Promise.resolve(7).then(v => {
    assert.same(calls, 1);
    assert.same(v, 7);
    async();
  });
});

QUnit.test('IIFE-proxy Array.from: side effect runs once', assert => {
  let calls = 0;
  const out = (() => {
    calls++;
    return globalThis;
  })().Array.from([1, 2, 3]);
  assert.same(calls, 1);
  assert.deepEqual(out, [1, 2, 3]);
});

QUnit.test('IIFE-proxy Symbol.iterator as computed key: side effect runs once', assert => {
  let calls = 0;
  const arr = [10, 20];
  const method = arr[(() => {
    calls++;
    return globalThis;
  })().Symbol.iterator];
  assert.same(calls, 1);
  assert.same(typeof method, 'function');
  assert.deepEqual(Array.from(method.call(arr)), [10, 20]);
});

QUnit.test('IIFE-proxy Symbol.iterator in operator: side effect runs once', assert => {
  let calls = 0;
  const arr = [1];
  const has = (() => {
    calls++;
    return globalThis;
  })().Symbol.iterator in arr;
  assert.same(calls, 1);
  assert.true(has);
});

// intermediate hops use `.globalThis.` - `self` / `window` don't exist in Node, those hop
// spellings are covered by transpiler fixtures instead
QUnit.test('IIFE-proxy with intermediate hop: side effect runs once', assert => {
  let calls = 0;
  const it = (() => {
    calls++;
    return globalThis;
  })().globalThis.Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

// the same IIFE root under an UNPOLYFILLED hop (`window`): nothing collapses, so the guard test
// KEEPS the call and the buried global has to carry its polyfill inside it - a raw one is a
// reference to a binding the stripped realm does not have. the hop decides the value, so assert
// against the environment's own `window` (absent in Node, present in a browser)
QUnit.test('global-proxy: buried IIFE root polyfills inside the kept guard test', assert => {
  const windowValue = globalThis.window;
  assert.same((() => globalThis)()?.window?.Array.of(5).at(0), windowValue === undefined ? undefined : 5);
  assert.same((x => x)(globalThis)?.window?.Array.of(6).at(0), windowValue === undefined ? undefined : 6);
  assert.same((function () {
    return globalThis;
  })()?.window?.Array.of(7).at(0), windowValue === undefined ? undefined : 7);
});

// the buried root under an effect-bearing body: the guard test runs the call exactly once, so the
// substituted global rides the same single evaluation
QUnit.test('global-proxy: buried root under an effectful body runs its call once', assert => {
  const windowValue = globalThis.window;
  let calls = 0;
  const out = (() => {
    calls++;
    return globalThis;
  })()?.window?.Array.of(8).at(0);
  assert.same(calls, 1);
  assert.same(out, windowValue === undefined ? undefined : 8);
});

// a computed key with its own effect past the guarded root: the key effect belongs to the branch,
// the buried global to the test, and both survive
QUnit.test('global-proxy: buried root keeps a trailing computed-key effect', assert => {
  const windowValue = globalThis.window;
  let keys = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: its effect rides the guarded branch
  const out = (() => globalThis)()?.window?.Array[(keys++, 'of')](9).at(0);
  assert.same(out, windowValue === undefined ? undefined : 9);
  assert.same(keys, windowValue === undefined ? 0 : 1);
});

// a chain-assign root navigating a redundant hop into a KEYLESS computed leaf: the hop-root
// collapse owns the whole span - before the fix a swallowed hop fired its own value-canon
// claim and the build CRASHED on the compose (this file would not even bundle). `.globalThis.`
// hop spelling keeps it runnable in Node (self / window do not exist here)
QUnit.test('global-proxy: chain-assign hop with keyless computed leaf collapses', assert => {
  let x;
  const method = (x = globalThis).globalThis[Symbol.iterator];
  assert.same(x, globalThis);
  assert.same(method, undefined);
  let y;
  // eslint-disable-next-line prefer-destructuring -- the numeric-literal computed KEYLESS leaf is the subject
  const numeric = (y = globalThis).globalThis[0];
  assert.same(y, globalThis);
  assert.same(numeric, undefined);
  let z;
  const keyLog = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: its SE must survive the collapse
  const seKey = (z = globalThis).globalThis[(keyLog.push('k'), 0)];
  assert.same(z, globalThis);
  assert.same(seKey, undefined);
  assert.deepEqual(keyLog, ['k']);
});

// a KEPT chain-assign root (value navigates the absent-in-Node `window`) under a live `?.`
// with a sequence-prefix SE: the SE must run exactly once and the guard must short-circuit
// (the helper THROWS on undefined where native yields it) - one emitter used to drop both
QUnit.test('global-proxy: kept-root symbol access keeps its SE and guard', assert => {
  let a;
  let sc = 0;
  const method = (sc++, a = globalThis.window)?.self[Symbol.iterator];
  assert.same(sc, 1);
  assert.same(a, globalThis.window);
  assert.same(method, globalThis.window === undefined ? undefined : method);
});

// well-known-symbol receiver folding by CONTEXT: the GET folds the `window.self` nav to the
// pure self entry (`window` is absent here, so the raw nav was a ReferenceError) and yields
// undefined without throwing; a write host (`++` / `delete`) folds its receiver like the
// plain-key member channel (the raw `globalThis.self` receiver was a TypeError)
QUnit.test('global-proxy: symbol-iterator receiver folds by context', assert => {
  // eslint-disable-next-line unicorn/prefer-global-this -- the unresolvable `window` root is the form under test
  assert.same(typeof window.self[Symbol.iterator], 'undefined');
  try {
    globalThis.self[Symbol.iterator]++;
    assert.same(typeof Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator).value, 'number');
  } finally {
    delete globalThis.self[Symbol.iterator];
  }
  assert.same(Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator), undefined);
  // the `in` probe folds the same unresolvable-root nav (raw `window` was a ReferenceError)
  // eslint-disable-next-line unicorn/prefer-global-this -- the unresolvable `window` root is the form under test
  assert.false(Symbol.iterator in window.self);
});

// a for-x aliased body read serves the per-iteration slot value instead of re-collapsing into
// the get-iterator helper (which throws on the non-callable slot value the head just wrote).
// the lowered leg desugars for-of into an ES5 loop - no for-x head survives, so the alias
// deopt legitimately does not apply there
testUnlessDetectLowered('global-proxy: for-x aliased symbol slot read stays raw', assert => {
  try {
    let last;
    for (globalThis.self[Symbol.iterator] of [[1], [2]]) {
      last = globalThis.self[Symbol.iterator];
    }
    assert.deepEqual(last, [2]);
  } finally {
    delete globalThis.self[Symbol.iterator];
  }
  assert.same(Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator), undefined);
});

QUnit.test('IIFE-proxy behind chain assignment: assignment and side effect preserved', assert => {
  let calls = 0;
  let captured;
  const it = (captured = (() => {
    calls++;
    return globalThis;
  })()).Symbol.iterator;
  assert.same(calls, 1);
  assert.same(captured, globalThis);
  assert.same(it, Symbol.iterator);
});

QUnit.test('nested IIFE-proxy: side effect runs once', assert => {
  let calls = 0;
  const it = (() => (() => {
    calls++;
    return globalThis;
  })())().Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

QUnit.test('IIFE-proxy with optional hop: side effect runs once', assert => {
  const async = assert.async();
  let calls = 0;
  (() => {
    calls++;
    return globalThis;
  })()?.Promise.resolve(11).then(v => {
    assert.same(calls, 1);
    assert.same(v, 11);
    async();
  });
});

// a proxy-global constructor-static consumed by an outer hop before an instance method
// (`(eff(), globalThis).Set.length.toFixed(2)`): the receiver collapses `globalThis.Set -> _Set` and the
// instance dispatch nests AROUND it. the SE prefix runs once and the chain yields a value - a flat .length
// hop keeps this engine-independent (ctor arity is ES1). guards the unplugin compose crash on the buried
// `globalThis.Set` needle when the mid-chain ctor-static was wrongly collapsed into the instance receiver
QUnit.test('global-proxy: mid-chain ctor-static under SE prefix composes with instance method', assert => {
  const log = [];
  function eff() {
    return log.push('e');
  }
  const r = (eff(), globalThis).Set.length.toFixed(2);
  assert.same(typeof r, 'string');
  assert.true(/\.00$/.test(r));
  assert.deepEqual(log, ['e']);
});

// an effectful IIFE buried in a sequence below a forwarder member and a static
// (`(0, (() => { c++; return globalThis; })().self).Array.from(...)`): the subsumption walk must peel the
// buried sequence to reach + mark the IIFE root, else unplugin queues a parallel rewrite the static
// collapse cannot compose. the IIFE carries an effect so it is PRESERVED and runs; the dead `0` prefix
// drops and the receiver collapses to the pure static
QUnit.test('global-proxy: effectful IIFE buried below a forwarder runs, receiver collapses', assert => {
  let c = 0;
  const r = (0, (() => {
    c++;
    return globalThis;
  })().self).Array.from([1, 2, 3]);
  assert.deepEqual(r, [1, 2, 3]);
  assert.same(c, 1);
});

// proxy-hop collapse for a NON-pure leaf (the `Array` constructor / `Array.isArray`, neither pure-
// substituted): the redundant `.self` / `.window` hop must be DROPPED at compile time
// (`globalThis.self.Array` -> `_globalThis.Array`). `self` / `window` do not exist in Node, so this
// runs ONLY because the hop was collapsed - a surviving `_globalThis.self` would read undefined and
// throw here. the runtime oracle for the direct-root collapse across dotted / multi-hop / static shapes
QUnit.test('global-proxy: non-pure leaf collapses its .self / .window hop (runs without it in Node)', assert => {
  assert.same(new globalThis.self.Array(3).length, 3);
  assert.same(new globalThis.self.window.Array(2).length, 2);
  assert.true(globalThis.self.Array.isArray([1]));
  // oxc preserves a paren that babel folds; the hop must still collapse (a residual `.self` throws here).
  // the parens are the point of the test - the proxy navigation is parenthesized on purpose
  /* eslint-disable @stylistic/no-extra-parens -- the parens are the test subject (paren-wrapped proxy navigation) */
  assert.same(new (globalThis.self).Array(4).length, 4);
  assert.same(new (globalThis).self.Array(5).length, 5);
  /* eslint-enable @stylistic/no-extra-parens -- restore after the deliberately parenthesized cases */
});

// the same collapse for an ALIAS root (`const g = globalThis; g.self.Array` -> `g.Array`): the chain has
// no `kind:'global'` trigger on the local `g`, so the hop must be dropped through the alias root, keeping
// `g`. `self` / `window` do not exist in Node, so a surviving `g.self.Array` would read an undefined hop
// and throw - this runs ONLY because the alias hop collapsed. covers ctor / static / multi-hop / `self` alias
QUnit.test('global-proxy: alias-rooted .self / .window hop collapses (runs without it in Node)', assert => {
  const g = globalThis;
  assert.same(new g.self.Array(3).length, 3);
  assert.same(new g.self.window.Array(2).length, 2);
  assert.true(g.self.Array.isArray([1]));
  // a COMPUTED const-binding hop (`g[k]`, k = 'self') resolves binding-aware and collapses too
  const k = 'self';
  assert.same(new g[k].Array(6).length, 6);
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- a `self` alias is the test subject
  const s = self;
  assert.same(new s.window.Array(4).length, 4);
});

// a CHAIN-ASSIGNMENT-rooted proxy navigation (`(a = globalThis).self.X`): the emit-side root walk
// must step through the assignment exactly like the canonical descent, dropping the redundant hop
// and keeping the assignment as a harvested prefix. `self` does not exist in Node, so every read
// here runs ONLY because the hop was dropped - a surviving `.self` would read undefined and throw.
// the assignment target must still observe the global object (the pure root it was rewritten to)
QUnit.test('global-proxy: chain-assign-rooted .self hop collapses (runs without it in Node)', assert => {
  let a, b, m, n, d;
  assert.same(typeof (a = globalThis).self.Math.floor, 'function');
  assert.same(a, globalThis);
  assert.same(new (b = globalThis).self.Array(3).length, 3);
  assert.same(b, globalThis);
  assert.same(typeof (m = n = globalThis).self.JSON.stringify, 'function');
  assert.same(m, globalThis);
  assert.same(n, globalThis);
  const g = globalThis;
  assert.true((d = g).self.Array.isArray([1]));
  assert.same(d, g);
  // an instance-method destructure off the assign-rooted chain: the receiver renderer (not the
  // hop drive, which defers to the claimed pattern) must drop the hop; the collapsed receiver
  // stays the method's this-arg
  let w;
  const { flat } = (w = globalThis).self.Array.prototype;
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  assert.same(w, globalThis);
});

// a SEQUENCE-wrapped root (`(e++, globalThis).self.X`): the climb from the root identifier must
// mirror the canonical descent through the sequence tail (and a mixed sequence-then-assignment),
// dropping the hop while the prefix effects run in source order. `self` does not exist in Node,
// so these run ONLY because the hop was dropped
QUnit.test('global-proxy: sequence-wrapped root .self hop collapses (runs without it in Node)', assert => {
  let e = 0;
  let q;
  assert.same(typeof (e++, globalThis).self.Math.max, 'function');
  assert.same(e, 1);
  assert.true((e++, q = globalThis).self.Array.isArray([]));
  assert.same(e, 2);
  assert.same(q, globalThis);
  // the inverse nesting order - a SE-bearing sequence INSIDE the assignment RHS - must peel to the
  // same root (the chain-root peel alternates the two peels to fixpoint, not a single pass)
  let r;
  assert.same(typeof (r = (e++, globalThis)).self.JSON.parse, 'function');
  assert.same(e, 3);
  assert.same(r, globalThis);
});

// a `?.` whose subject is entirely proxy navigation over a chain-assign root is dead: the subject
// collapses to the always-defined pure root and the guard drops. `self` does not exist in Node, so
// a kept guard would memoize the raw `.self` hop (undefined) and silently swallow the value
testUnlessDetectLowered('global-proxy: dead optional over chain-assign proxy subject (runs without self in Node)', assert => {
  let q1, q2, q3;
  let c = 0;
  assert.same((q1 = globalThis).self?.Array.prototype.findLast.call([1, 2], it => it < 2), 1);
  assert.same(q1, globalThis);
  assert.same((q2 = globalThis).self?.Array.prototype.at.call([5], 0), 5);
  assert.same(q2, globalThis);
  assert.deepEqual((c++, (q3 = globalThis).self)?.Array.prototype.flat.call([[1], 2]), [1, 2]);
  assert.same(c, 1);
  assert.same(q3, globalThis);
  // bare chain-assign subject with the hop after the `?.`: same collapse, assignment preserved
  let q4;
  assert.true((q4 = globalThis)?.self.Array.prototype.includes.call([7], 7));
  assert.same(q4, globalThis);
  // alias subject: keeps its identifier, drops the hop
  const g = globalThis;
  const flat = g?.self.Array.prototype.flat;
  assert.deepEqual(flat.call([[3], 4]), [3, 4]);
});

// an alias-rooted chain as a method-EXTRACT receiver (no call, no unresolved sibling usage to
// trigger the fallback): the redundant hop must still collapse - `self` does not exist in Node
QUnit.test('global-proxy: alias-rooted method-extract receiver .self hop collapses (runs without it in Node)', assert => {
  const g = globalThis;
  const extractedFindLast = g.self.Array.prototype.findLast;
  assert.same(extractedFindLast.call([1, 2, 3], it => it < 3), 2);
});

// a for-init destructure over a provably-PURE call-rooted proxy chain leaves no effects to sink:
// the discarded sink must not clone the raw `.self` hop (undefined in Node - reading `.Array` off
// it would throw at loop init)
QUnit.test('global-proxy: for-init destructure over pure-call-rooted proxy chain (runs without self in Node)', assert => {
  let out;
  for (const { from } = (() => globalThis)().self.Array; !out;) out = from;
  assert.same(typeof out, 'function');
  assert.deepEqual(out('ab'), ['a', 'b']);
  let out2;
  for (const { groupBy } = (() => globalThis)().self.Map; !out2;) out2 = groupBy;
  assert.same(typeof out2, 'function');
});

// a SEQUENCE-wrapped write host over a raw `.window` hop: the write-target collapse must peel the
// sequence tail and drop the hop - `window` does not exist in Node, so an uncollapsed host is an
// undefined write target (TypeError at the assignment)
// the SE-tail write host reads `.window` RAW - source-faithful: with `window` present the
// write lands on the realm global; without it the host is undefined and the write THROWS
// exactly as the untranspiled source does. the sequence SE runs first either way
QUnit.test('global-proxy: SE-tail write host .window hop keeps the source throw', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  let c = 0;
  if (WINDOW_PRESENT) {
    (c++, globalThis.window).seTailWriteProbeKey = 42;
    assert.same(globalThis.seTailWriteProbeKey, 42);
    assert.same(c, 1);
    delete (0, globalThis.window).seTailWriteProbeKey;
  } else {
    assert.throws(() => {
      (c++, globalThis.window).seTailWriteProbeKey = 42;
    }, TypeError);
    assert.same(c, 1);
  }
  assert.false('seTailWriteProbeKey' in globalThis);
});

// a destructure pattern hop that is itself a proxy-global alias peels onto the always-defined
// pure root - `self` does not exist in Node, so an unpeeled residual is a destructure TypeError
QUnit.test('global-proxy: destructure pattern proxy hop peels (runs without self in Node)', assert => {
  const { self: { x } } = globalThis;
  assert.same(x, undefined);
  const { self: { window: { y } } } = globalThis;
  assert.same(y, undefined);
  const { self: { Math: { PI: pi } } } = globalThis;
  assert.same(pi, Math.PI);
});

// a chain-assign optional subject whose VALUE is a proxy-hop navigation: the guard's memoized
// root replaces the raw hop, and the tail's redundant trailing hop must be dropped - `self` /
// `window` do not exist in Node, so an unpeeled re-read off the memo is a TypeError
testUnlessDetectLowered('global-proxy: chain-assign optional value hop tail drops (runs without self in Node)', assert => {
  let q;
  const flat = (q = globalThis.self)?.self.Array.prototype.flat;
  assert.same(typeof flat, 'function');
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  assert.same(q, globalThis);
  let w;
  const included = (w = globalThis.self)?.self.Array.prototype.includes.call([1, 2], 2);
  assert.true(included);
  assert.same(w, globalThis);
});

// the same shape whose assigned VALUE ends at a hop core-js does NOT ponyfill (`window`, unlike `self`).
// rooting the collapse THROUGH the assignment reaches the always-defined `globalThis` and says nothing
// about what the assignment stored, so the span must not collapse: the `?.` stays live and the target
// keeps the raw value. erasing the guard ran the tail on the pure root and returned a VALUE where the
// source yields undefined.
// unlike the collapse tests above, the ANSWER here is environment-dependent - `window` is absent in Node
// and present in a browser, and the whole point is that the guard DECIDES rather than being pre-decided.
// so assert against the environment's own `window`, which is what the untouched source would have read
QUnit.test('global-proxy: chain-assign optional value over an unpolyfilled hop keeps its guard', assert => {
  const hasWindow = globalThis.window !== undefined;
  let w;
  const included = (w = globalThis.window)?.self.Array.prototype.includes.call([1, 2], 2);
  assert.same(included, hasWindow ? true : undefined);
  assert.same(w, globalThis.window);
  let f;
  const flat = (f = globalThis.window)?.self.Array.prototype.flat;
  assert.same(typeof flat, hasWindow ? 'function' : 'undefined');
  assert.same(f, globalThis.window);
});

// the receiver-guard channel (a STATIC claim with a tail member above it) builds its own guard and
// used to freeze the kept value with its pristine hops RAW - `_globalThis.self.window` reads `.window`
// off an undefined `.self` and the guard TEST itself throws in Node, where the sibling shapes one line
// apart (instance claim, or the same static with no tail) collapse the hop and yield undefined
// the fold is what is under test, so the standalone-post leg (detection on already-lowered text,
// where the chain-assign + `?.` shape no longer exists) stays out, like its siblings above
testUnlessDetectLowered('global-proxy: static claim under a tail collapses the kept value hops', assert => {
  const hasWindow = globalThis.window !== undefined;
  let k;
  const size = (k = globalThis.self.window)?.Map.length;
  assert.same(size, hasWindow ? globalThis.Map.length : undefined);
  assert.same(k, globalThis.window);
  // the sibling with no tail above the static, and the instance-claim sibling: same receiver,
  // and the three must agree on what the guard stored
  let m;
  const ctor = (m = globalThis.self.window)?.Map;
  assert.same(ctor, hasWindow ? globalThis.Map : undefined);
  assert.same(m, globalThis.window);
  let n;
  const fixed = (n = globalThis.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(1);
  assert.same(fixed, hasWindow ? Number.MAX_SAFE_INTEGER.toFixed(1) : undefined);
  assert.same(n, globalThis.window);
  // the hop order reversed: `.window` is the UNRESOLVABLE hop, so the collapse keeps its own
  // guard around it instead of reading the ponyfill unconditionally
  let r;
  const reversed = (r = globalThis.window.self)?.Map.length;
  assert.same(reversed, hasWindow ? globalThis.Map.length : undefined);
  assert.same(r, hasWindow ? globalThis : undefined);
});

// the assigned VALUE of a chain-assign receiver follows the flat value rule: a fully ponyfilled
// navigation stores the leaf's own ponyfill (the global object either way - what the assertion
// checks is that the claim above it still resolves and the assignment still runs), a sequence
// value runs its prefix exactly once, and a value stepping onto a NON-global keeps the raw read
QUnit.test('global-proxy: static claim over a chain-assign value keeps the assignment and its effects', assert => {
  let q;
  const Ctor = (q = globalThis.self).Map;
  assert.same(typeof Ctor, 'function');
  const stored = new Ctor();
  stored.set(1, 2);
  assert.same(stored.get(1), 2);
  assert.same(q, globalThis);
  // the claimed static under a tail: the claim rides the collapsed value, the assignment stays
  let t;
  assert.same((t = globalThis.self).Number.MAX_SAFE_INTEGER.toFixed(1), globalThis.Number.MAX_SAFE_INTEGER.toFixed(1));
  assert.same(t, globalThis);
  // a sequence value: the prefix effect runs exactly once, ahead of the leaf
  const log = [];
  let s;
  const seqCtor = (s = (log.push('e'), globalThis.self)).Map;
  assert.same(typeof seqCtor, 'function');
  assert.deepEqual(log, ['e']);
  assert.same(s, globalThis);
  // a value navigating onto a NON-global (`Math`) is not the global object: the member read
  // stays raw and answers what the source answers
  let v;
  const notGlobal = (v = globalThis.Math).Map;
  assert.same(notGlobal, undefined);
  assert.same(v, globalThis.Math);
});

// the same value ending at a hop core-js does NOT ponyfill: the erasable `.self` hop collapses
// to its ponyfill and the `.window` read stays - the value the assignment stores is what the
// ENVIRONMENT's `window` slot holds (the guarded twin one test up keeps the same spelling), never
// the collapsed root. the probe reads `window`, which has no ponyfill and answers the REAL
// environment; every runner realm pairs `self` with `window`
QUnit.test('global-proxy: chain-assign value collapses the erasable hop and keeps the tail read', assert => {
  const hasWindow = globalThis.window !== undefined;
  let u;
  const viaWindow = (u = globalThis.self.window).Map;
  assert.same(typeof viaWindow, 'function');
  assert.same(u, hasWindow ? globalThis.window : undefined);
  // the mid-chain write survives the collapse beside the outer one
  let a, b;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren-wrapped inner write IS the form under test
  const nested = (a = (b = globalThis.self.window)).Map;
  assert.same(typeof nested, 'function');
  assert.same(a, hasWindow ? globalThis.window : undefined);
  assert.same(b, a);
  // an inner write BELOW a hop of the outer value: the innermost collapses to the ponyfill,
  // the outer stores the raw read off it
  let m, n;
  const belowHop = (m = (n = globalThis.self).window)?.Map;
  assert.same(typeof belowHop, hasWindow ? 'function' : 'undefined');
  assert.same(n, globalThis);
  assert.same(m, hasWindow ? globalThis.window : undefined);
  // a static VALUE claim leaves the `=` buried under the claim's receiver hops: the collapse
  // digs the assignment out - the claim resolves through the ponyfill, the assignment stores
  // the tail read, and a sequence prefix still runs exactly once
  let c;
  assert.same((c = globalThis.self.window).Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  assert.same(c, hasWindow ? globalThis.window : undefined);
  const log = [];
  let d;
  assert.deepEqual((d = (log.push('p'), globalThis).self.window).Array.of(7), [7]);
  assert.deepEqual(log, ['p']);
  assert.same(d, hasWindow ? globalThis.window : undefined);
  // the fallback rewrite (a member outside the known statics) re-emits the same buried
  // assignment beside the receiver swap, collapsed by the same rule
  let e;
  assert.same((e = globalThis.self.window).Promise.noSuchStatic, undefined);
  assert.same(e, hasWindow ? globalThis.window : undefined);
  // a sequence AROUND the assignment (not inside its value): the claim still fires through
  // the kept assignment, and the prefix effect runs exactly once
  log.length = 0;
  let f;
  // eslint-disable-next-line sonarjs/no-redundant-parentheses -- the paren-sealed sequence IS the form under test
  const aroundCtor = ((log.push('s'), f = globalThis.self.window)).Map;
  assert.same(typeof aroundCtor, 'function');
  assert.deepEqual(log, ['s']);
  assert.same(f, hasWindow ? globalThis.window : undefined);
});

// the seq-around shape under a LIVE guard: the test reads the collapsed value (never a raw
// hop), short-circuits exactly where the environment lacks the slot, and runs the prefix once.
// the lowering rewrites the `?.` into a temp-var ternary whose memoized test is a claimless
// value position - the open claimless-value canon - so the lowered leg sits this one out
testUnlessDetectLowered('global-proxy: guarded seq-around chain-assign value collapses in the test (runs without self in Node)', assert => {
  const hasWindow = globalThis.window !== undefined;
  const log = [];
  let g;
  const aroundGuardCtor = (log.push('g'), g = globalThis.self.window)?.Map;
  assert.same(typeof aroundGuardCtor, hasWindow ? 'function' : 'undefined');
  assert.deepEqual(log, ['g']);
  assert.same(g, hasWindow ? globalThis.window : undefined);
});

// a stored target the module also READS takes the same value canon as the unread twin: the
// reads classify through the stored guard conditional, so their own claims and guards survive
// the collapse. a claim ABSENT from the definitions (`BigInt` has no pure entry) leaves the
// ride guarded off the stored value instead of folding it onto a defined read; the plain-nav
// ride without an assignment guards identically. an ALIAS root stores the same canon, and a
// destructure host replays the kept assignment through it
testUnlessDetectLowered('global-proxy: read-target stored values, absent-claim rides, alias and destructure hosts', assert => {
  const hasWindow = globalThis.window !== undefined;
  let k1;
  const proto = (k1 = globalThis.window.self)?.Object.getPrototypeOf({});
  assert.same(proto, hasWindow ? Object.getPrototypeOf({}) : undefined);
  assert.same(k1, hasWindow ? globalThis : undefined);
  // the read-then-claim twin: the alias read resolves its statics through the stored value
  let nav;
  // eslint-disable-next-line prefer-const -- the assignment-form write IS the shape under test
  nav = globalThis.window?.self.window;
  assert.same(nav?.Array.of(31).at(0), hasWindow ? 31 : undefined);
  // the definitions-absent leaf claim, assigned and plain
  /* eslint-disable es/no-bigint -- the definitions-ABSENT claim is the shape under test; the
     value is only read and compared, never invoked, so absent engines compare undefined */
  let kv;
  const big = (kv = globalThis.window.self.window)?.BigInt;
  assert.same(big, hasWindow ? globalThis.BigInt : undefined);
  assert.same(kv, hasWindow ? globalThis : undefined);
  assert.same(globalThis.window.self.window?.BigInt, hasWindow ? globalThis.BigInt : undefined);
  /* eslint-enable es/no-bigint -- end of the absent-claim forms */
  // the alias-rooted stored value
  const galias = globalThis;
  let ka;
  const aliased = (ka = galias.window.self)?.Object.isExtensible({});
  assert.same(aliased, hasWindow ? true : undefined);
  assert.same(ka, hasWindow ? globalThis : undefined);
  // the destructure host over a stored value: the lift replays the kept assignment through
  // the same canon instead of freezing raw hops into what the binding stores
  let kd;
  const Extracted = (() => {
    const { Map: M } = kd = globalThis.self;
    return M;
  })();
  assert.same(typeof Extracted, 'function');
  assert.same(kd, globalThis);
  // reads in a braced-if body and a later function body claim through the rendered value
  // exactly like the raw source classifies them - the render IS the navigation it replaced
  let kf;
  // eslint-disable-next-line prefer-const -- the assignment-form write IS the shape under test
  kf = globalThis.window?.self.window;
  let branched;
  if (kf) {
    branched = kf.Array.from('cd');
  }
  assert.deepEqual(branched, hasWindow ? ['c', 'd'] : undefined);
  function readsLater() {
    return kf.Object.entries({ q: 1 });
  }
  if (hasWindow) assert.deepEqual(readsLater(), [['q', 1]]);
});

// the effect pipeline decides WHO re-emits an effect the fold discards, and only running the output
// says whether the order survived. these are the four consumer shapes the decision has: an effect in
// a computed key under a guard, effects on both sides of a claimed call, a receiver effect paired
// with a key effect, and two keyed hops in one chain
QUnit.test('global-proxy: discarded effects keep their source order', assert => {
  const log = [];
  const o = { list: [1, [2]] };
  // eslint-disable-next-line @stylistic/no-extra-parens -- the sequence receiver IS the form under test
  const folded = (log.push('r'), o).list[(log.push('k'), 'flat')]();
  assert.deepEqual(folded, [1, 2]);
  assert.deepEqual(log, ['r', 'k']);

  log.length = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the sequence keys ARE the form under test
  const two = globalThis[(log.push('g'), 'Array')][(log.push('o'), 'of')](7).at(0);
  assert.same(two, 7);
  assert.deepEqual(log, ['g', 'o']);

  log.length = 0;
  const both = globalThis.self.Array.of(log.push('a')).at(log.push('b') - 2);
  assert.same(both, 1);
  assert.deepEqual(log, ['a', 'b']);

  log.length = 0;
  let held;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the chain-assign receiver IS the form under test
  const keyed = (held = globalThis.self)[(log.push('key'), 'Array')].from([1, 2]).at(-1);
  assert.same(keyed, 2);
  assert.deepEqual(log, ['key']);
  assert.same(held, globalThis);
});

// nested instance dispatch on a polyfillable-global chain: the inner `.name` GET sits inside the
// receiver of an outer instance dispatch, and the outer's receiver collapse must recompose the
// inner rewrite - this class used to crash the build or silently drop the inner polyfill
QUnit.test('global-proxy: nested instance dispatch composes', assert => {
  assert.same(globalThis.self.Array.prototype.at.name.at(0), 'a');
  assert.true(globalThis?.Array.prototype.includes.name.includes('incl'));
  // optional on a mid hop: an absent namespace short-circuits, and the chain root's rename
  // must survive into the guard rather than leak a raw global
  assert.same(globalThis.absentNs?.name.at(0), undefined);
});

// kept-assign roots with nested dispatch: the memo re-reads a blind tail verbatim (short-
// circuiting where the environment lacks the hop), and a claimable static under a NON-optional
// kept assignment reads through the ponyfill - the claim shape has no `?.`, so it survives
// transpile-lowering intact and runs in every leg. each line used to crash the build, strand a
// dead import, or read a raw global off-engine
QUnit.test('global-proxy: kept-assign root nested dispatch and claims', assert => {
  const hasWindow = globalThis.window !== undefined;
  let t;
  const triple = (t = globalThis.window)?.self.Array.prototype.at.name.at(0);
  assert.same(triple, hasWindow ? 'a' : undefined);
  assert.same(t, globalThis.window);
  let c;
  const fromTail = (c = globalThis.window)?.self.Array.from([2]).at(0);
  assert.same(fromTail, hasWindow ? 2 : undefined);
  assert.same(c, globalThis.window);
  let s;
  const ctorLeaf = (s = globalThis.window)?.self.Set.name.includes('S');
  assert.same(ctorLeaf, hasWindow ? true : undefined);
  assert.same(s, globalThis.window);
  // non-optional kept assignment: the claim reads the ponyfill under the shared collapse
  // assumption even where the environment has no `window` value to navigate
  let m;
  const claimed = (m = globalThis.window).self.Map.name;
  assert.same(claimed, 'Map');
  assert.same(m, globalThis.window);
  // DOUBLE proxy hop with an instance-GET tail: the claim's guard must climb above the outer
  // instance wrappers - a guard left inside the wrapper argument hands `void 0` to the helper
  // and throws exactly where the native chain short-circuits
  let d;
  const doubleHop = (d = globalThis.window)?.self?.self.Set.name;
  assert.same(doubleHop, hasWindow ? 'Set' : undefined);
  assert.same(d, globalThis.window);
  let e;
  const doubleHopTail = (e = globalThis.window)?.self?.self.Map.name.at(0);
  assert.same(doubleHopTail, hasWindow ? 'M' : undefined);
  assert.same(e, globalThis.window);
  // computed key-SE must NOT run when the chain short-circuits (native skips the key eval)
  let f;
  let keyRuns = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: its SE must ride the guard
  const doubleHopKeySe = (f = globalThis.window)?.self?.self.Set[(keyRuns++, 'name')];
  assert.same(doubleHopKeySe, hasWindow ? 'Set' : undefined);
  assert.same(keyRuns, hasWindow ? 1 : 0);
  assert.same(f, globalThis.window);
  // STACKED keys: the outer key SE observes the fully-evaluated inner receiver (k1 before k2);
  // on short-circuit neither runs
  let g;
  const keyLog = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEYS are the subject: their order is asserted
  const doubleHopKeyStack = (g = globalThis.window)?.self?.self.Map[(keyLog.push('k1'), 'name')][(keyLog.push('k2'), 'at')](0);
  assert.same(doubleHopKeyStack, hasWindow ? 'M' : undefined);
  assert.deepEqual(keyLog, hasWindow ? ['k1', 'k2'] : []);
  assert.same(g, globalThis.window);
  // combined optional-call chain over the claim: the root guard hoists into the outer test -
  // fed to the helper it would throw exactly on this short-circuit path
  let h;
  const combinedTail = (h = globalThis.window)?.self?.self.Array.of(1).flat?.().at?.(0);
  assert.same(combinedTail, hasWindow ? 1 : undefined);
  assert.same(h, globalThis.window);
  let i;
  const optionalAccessTail = (i = globalThis.window)?.self?.self.Array.of(2)?.flat?.();
  assert.deepEqual(optionalAccessTail, hasWindow ? [2] : undefined);
  assert.same(i, globalThis.window);
  // nested combined chains: every inner guard hoists transitively - each level would throw
  // on this short-circuit path if left inside a helper argument
  let j;
  const nestedCombined = (j = globalThis.window)?.self?.self.Array.of(5).flat?.().map?.(x => x + 1).at?.(0);
  assert.same(nestedCombined, hasWindow ? 6 : undefined);
  assert.same(j, globalThis.window);
});

// value-RESOLVABLE captured roots (a kept assignment storing the global itself, an IIFE returning
// it): the guard passes and the tail claims through the ponyfill. transpile-lowering desugars the
// `?.` into a ternary alias, and the trusted-write follow resolves the alias through the ternary
// test (structural read-after-write proof), so the LOWERED legs run this too - each line used to
// throw on the raw `.self` tail there
QUnit.test('global-proxy: resolvable captured roots claim through the ponyfill', assert => {
  let g;
  assert.same((g = globalThis)?.self.Set.name, 'Set');
  assert.same(g, globalThis);
  let f;
  assert.same((f = globalThis)?.self.Array.from([3]).at(-1), 3);
  assert.same(f, globalThis);
  assert.same((() => globalThis)()?.self.Array.from([1]).at(0), 1);
  assert.same((() => globalThis)()?.self.Array.prototype.includes.name.at(0), 'i');
  // return-hosted spelling: lowering leaves the guard inside a ReturnStatement, which the
  // placement walk accepts as an unconditional host
  let q;
  function viaReturn() {
    return (q = globalThis)?.self.WeakMap.name;
  }
  assert.same(viaReturn(), 'WeakMap');
  assert.same(q, globalThis);
});

// the COMPUTED-leaf twin of the kept guard: the erased optional hops re-hang their `?.` onto a
// `['Array']` leaf, and the connector must keep the computed spelling - a bare `?[` does not even
// parse, so getting this wrong is a build break rather than a wrong value. the answer stays
// environment-dependent exactly like the dotted twin above
QUnit.test('global-proxy: kept optional guard re-hung on a computed leaf', assert => {
  const hasWindow = globalThis.window !== undefined;
  let a;
  // eslint-disable-next-line dot-notation -- the computed spelling IS the subject here
  const indexed = (a = globalThis.window)?.self?.self['Array'].prototype.indexOf.call([2], 2);
  assert.same(indexed, hasWindow ? 0 : undefined);
  assert.same(a, globalThis.window);
  let b;
  // eslint-disable-next-line dot-notation -- the computed spelling IS the subject here
  const made = (b = globalThis.window)?.self['Array'].from([3]);
  assert.same(hasWindow ? made[0] : made, hasWindow ? 3 : undefined);
  assert.same(b, globalThis.window);
});

// the UNGUARDED twin of the same value: with no `?.` there is nothing to short-circuit, so an off-browser
// read throws exactly as the source does - the collapse must decline rather than rescue it off the pure
// root. the ponyfilled twin (`(s = globalThis.self)`) still collapses and still runs in Node: core-js
// DEFINES `self`, so its value provably is the global. that split is the whole rule
testUnlessDetectLowered('global-proxy: unguarded chain-assign over an unpolyfilled hop stays faithful', assert => {
  const hasWindow = globalThis.window !== undefined;
  let n;
  function readWindowValued() {
    return (n = globalThis.window).self.Array.prototype.flat.call([1, [2]]);
  }
  if (hasWindow) assert.deepEqual(readWindowValued(), [1, 2]);
  else assert.throws(readWindowValued, TypeError);
  assert.same(n, globalThis.window);
  // the ponyfilled value collapses in both environments
  let s;
  assert.same((s = globalThis.self).self.Array.prototype.at.call([9], 0), 9);
  assert.same(s, globalThis);
  let m, k;
  assert.true((m = k = globalThis).self.Array.prototype.includes.call([7], 7));
  assert.same(m, globalThis);
  assert.same(k, globalThis);
  // the DESTRUCTURE-source shape does NOT keep the root: the receiver value is never read, only the static
  // `Array.of` is extracted - invariant of which global names it - so the whole nav drops and the chain-assign
  // survives alone. unlike the value-use reads above there is nothing to throw off-browser; the dropped nav is
  // dead weight and the static resolves the same in every environment. this is the one exception to the split
  let d;
  function destructureWindowValued() {
    const { of } = (d = globalThis.window).self.Array;
    return of;
  }
  assert.same(typeof destructureWindowValued(), 'function');
  assert.same(d, globalThis.window);
  // an effect the sequence around a kept root carries is not the assignment: the root re-emits itself, but
  // that effect still has to run, exactly once, before the guard tests the value
  let count = 0;
  let sq;
  function seAroundKeptRoot() {
    return (count++, sq = globalThis.window)?.self.Array.prototype.findIndex.call([1], x => x === 1);
  }
  assert.same(seAroundKeptRoot(), hasWindow ? 0 : undefined);
  assert.same(count, 1);
  assert.same(sq, globalThis.window);
  // every OTHER place an effect can sit around a kept root: inside the assigned value, and in a computed
  // hop key. the root re-emits itself and must not double-run; everything else runs once, in source order
  let log = [];
  let va;
  function effectInsideValue() {
    return (va = (log.push('v'), globalThis.window)).self.Array.prototype.flat.call([1, [2]]);
  }
  if (hasWindow) assert.deepEqual(effectInsideValue(), [1, 2]);
  else assert.throws(effectInsideValue, TypeError);
  assert.deepEqual(log, ['v']);
  assert.same(va, globalThis.window);
  log = [];
  let kb;
  function effectInHopKey() {
    // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: only a foldable key migrates
    return (kb = globalThis.window)?.[(log.push('k'), 'self')].Array.prototype.at.call([5], 0);
  }
  // a SE-bearing hop key MIGRATES into the surviving leaf key (`_ref[(c++, 'self')].Array` ->
  // `_ref[c++, "Array"]`): the hop is rescued like its plain twin, and the key effect still evaluates
  // exactly where the native order puts it - past the guard, before the read
  if (hasWindow) assert.same(effectInHopKey(), 5);
  else assert.same(effectInHopKey(), undefined);
  assert.same(kb, globalThis.window);
  // the key only evaluates past the guard - absent window short-circuits before it, as the source does
  assert.deepEqual(log, hasWindow ? ['k'] : []);
  // a wrapper SEALS an optional chain: what follows it reads unconditionally off the guarded result, so an
  // absent window throws rather than short-circuits. re-hanging the guard onto the collapsed root must keep
  // that seal - letting the rest of the chain go optional too would swallow a throw the source performs
  let wd;
  function sealedByWrapper() {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the throw-on-short-circuit IS the subject here
    return ((wd = globalThis.window)?.self).Array.prototype.findLast.call([1], x => x === 1);
  }
  if (hasWindow) assert.same(sealedByWrapper(), 1);
  else assert.throws(sealedByWrapper, TypeError);
  assert.same(wd, globalThis.window);
  // the well-known-symbol strand collapses the same receiver on its own: it must answer for the object the
  // source named, not read the symbol off OUR global and discard the assigned one
  let it;
  function symbolOffWindowValued() {
    return (it = globalThis.window).self[Symbol.iterator];
  }
  if (hasWindow) assert.same(symbolOffWindowValued(), globalThis.window[Symbol.iterator]);
  else assert.throws(symbolOffWindowValued, TypeError);
  assert.same(it, globalThis.window);
});

// an SE-bearing init no longer blocks the proxy-hop fold: the effect replays exactly once
// ahead of the re-anchored read, and the folded `self` hop answers where the raw residual
// read `.self` off the pure root would throw (self is absent in Node)
testUnlessDetectLowered('proxy-hop: SE-prefixed init folds the self hop and replays the effect once', assert => {
  let calls = 0;
  function eff() { calls += 1; }
  const { self: { totallyCustomKeyA: v } } = (eff(), globalThis);
  assert.same(typeof v, 'undefined');
  assert.same(calls, 1);
  // chain-assignment init: the binding update replays whole and the hop still folds
  let q;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren-wrapped chain-assignment INIT is the form under test
  const { self: { totallyCustomKeyB: v2 } } = (q = globalThis);
  assert.same(typeof v2, 'undefined');
  assert.same(q, globalThis);
  // ctor-key zero-extraction residual: the prefix runs before the re-anchored read, once
  const order = [];
  const { Set: { totallyCustomKeyC: v3 } } = (order.push('se'), globalThis);
  order.push('after');
  assert.same(typeof v3, 'undefined');
  assert.deepEqual(order, ['se', 'after']);
  // assignment-form host: the cascade lifts the prefix once and the hop still folds
  let v4;
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ self: { totallyCustomKeyD: v4 } } = (eff(), globalThis));
  assert.same(typeof v4, 'undefined');
  assert.same(calls, 2);
  // assignment-form + chain-assignment: the rescued assignment replays whole
  let q5, v5;
  // eslint-disable-next-line prefer-const, @stylistic/no-extra-parens -- the destructuring WRITE with a paren-wrapped chain-assignment INIT is the form under test
  ({ self: { totallyCustomKeyE: v5 } } = (q5 = globalThis));
  assert.same(typeof v5, 'undefined');
  assert.same(q5, globalThis);
  // deferred host buried in a consumed init's prefix: the fold reaches it and the chain
  // setup survives on both the binding and the effect count
  let q6, v6;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host + chain INIT are the forms under test
  const { keys: pickedKeys } = (({ self: { totallyCustomKeyF: v6 } } = (q6 = globalThis)), Object);
  assert.same(typeof pickedKeys, 'function');
  assert.same(typeof v6, 'undefined');
  assert.same(q6, globalThis);
  // bodyless-if host: the effect stays CONDITIONAL - the untaken branch runs nothing
  let v7;
  const before = calls;
  if (globalThis.neverSetFlagSeInit) ({ self: { totallyCustomKeyG: v7 } } = (eff(), globalThis));
  assert.same(calls, before);
  assert.same(typeof v7, 'undefined');
  // for-init-buried host: the fold reaches the sink's re-embedded slot - the self hop
  // answers off-engine and the chain setup lands on the binding
  let q8, v8, out8;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host + chain INIT are the forms under test
  for (const { keys: fk } = (({ self: { totallyCustomKeyH: v8 } } = (q8 = globalThis)), Object); !out8;) out8 = fk;
  assert.same(typeof out8, 'function');
  assert.same(typeof v8, 'undefined');
  assert.same(q8, globalThis);
  // multi-declarator host: the replayed effect stays BETWEEN sibling inits (a lift to the
  // declaration would hoist it above the pre-sibling, reordering the native evaluation)
  const ord = [];
  function mark(tag) {
    ord.push(tag);
    return tag;
  }
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator HOST is the form under test
  const sA = mark('a'), { self: { totallyCustomKeyI: v9 } } = (mark('se'), globalThis), sB = mark('b');
  assert.deepEqual(ord, ['a', 'se', 'b']);
  assert.same(typeof v9, 'undefined');
  assert.same(sA, 'a');
  assert.same(sB, 'b');
  // a symbol-iterator leaf in a buried host folds to the synth read off the anchored ctor
  // (a WeakSet constructor is not iterable - undefined on any engine), with the residual
  // sibling read first and the prefix effect exactly once
  let it10, cWS10;
  const preSym = calls;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  const { keys: symKeys } = (({ WeakSet: { [Symbol.iterator]: it10, totallyCustomKeyJ: cWS10 } } = (eff(), globalThis)), Object);
  assert.same(typeof symKeys, 'function');
  assert.same(typeof it10, 'undefined');
  assert.same(typeof cWS10, 'undefined');
  assert.same(calls, preSym + 1);
  // FULL consume with an SE-bearing init: the prefix runs exactly once ahead of the synth
  // assign, and a chain-assignment target keeps its write
  let it11;
  const preFull = calls;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  const { values: symVals } = (({ Map: { [Symbol.iterator]: it11 } } = (eff(), globalThis)), Object);
  assert.same(typeof symVals, 'function');
  assert.same(typeof it11, 'undefined');
  assert.same(calls, preFull + 1);
  let q12, it12;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host + chain INIT are the forms under test
  const { entries: symEnts } = (({ Set: { [Symbol.iterator]: it12 } } = (q12 = globalThis)), Object);
  assert.same(typeof symEnts, 'function');
  assert.same(typeof it12, 'undefined');
  assert.same(q12, globalThis);
  // a DEFAULTED symbol leaf keeps the key-swap: the constructor has no own iterator method,
  // so the user default FIRES (an extraction dropping the default would leave undefined)
  let it13, bnd13;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  const { assign: symAsg } = (({ WeakMap: { [Symbol.iterator]: it13 = 'fallback' } } = globalThis), Object);
  assert.same(typeof symAsg, 'function');
  assert.same(it13, 'fallback');
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ Promise: { [Symbol.iterator]: { bind: bnd13 } = { bind: 'patternFallback' } } } = globalThis);
  assert.same(bnd13, 'patternFallback');
  // a scope-shadowed `Symbol` keeps the user's own key: 'constructor' IS defined on the
  // ctor where the iterator method is not - an extraction would read the wrong slot
  {
    const Symbol = { iterator: 'constructor' };
    const { WeakSet: { [Symbol.iterator]: sh14 } } = globalThis;
    assert.same(typeof sh14, 'function');
  }
  // an SE-BEARING symbol key on an anchored host keeps the key-swap: the effect runs
  // exactly once through the kept key, values and defaults on raw-read semantics
  let se15, se16;
  const preKey = calls;
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ WeakSet: { [(eff(), Symbol.iterator)]: se15 } } = globalThis);
  assert.same(calls, preKey + 1);
  assert.same(typeof se15, 'undefined');
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ Map: { [(eff(), Symbol.iterator)]: se16 = 'keyFallback' } } = globalThis);
  assert.same(calls, preKey + 2);
  assert.same(se16, 'keyFallback');
  // a consumed static beside a verbatim computed sibling binds the PURE implementation,
  // not the (possibly buggy) native one
  let av17, fv17, o17;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  for (const { getOwnPropertyDescriptor: g17 } = (({ Array: { [Symbol.asyncIterator]: av17, from: fv17 } } = globalThis), Object); !o17;) o17 = g17;
  assert.same(typeof o17, 'function');
  assert.same(typeof av17, 'undefined');
  // the polyfill-vs-native TIER is unobservable here (the pure entry delegates to a
  // compliant native), so the binding itself is what this locks; the tier is locked by
  // the fixtures and the cross-parser import sets
  assert.same(typeof fv17, 'function');
  assert.same(fv17([7]).length, 1);
  // a ctor-alias host buried in a consumed init folds to the pure ctor binding
  let m18;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  const { getOwnPropertyNames: gop18 } = (({ Map: m18 } = globalThis), Object);
  assert.same(typeof gop18, 'function');
  const M18 = m18;
  assert.same(new M18([[1, 2]]).get(1), 2);
  // a REST sibling in a folded buried host: value locks only - this pipeline desugars the
  // rest before the plugin sees it, so the sentinel-declaration guarantee is locked at the
  // fixture level, not here
  let fv19, rv19, ov19;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the buried assignment host is the form under test
  for (const { defineProperty: dp19 } = (({ Promise: { allSettled: fv19, ...rv19 } } = globalThis), Object); !ov19;) ov19 = dp19;
  assert.same(typeof ov19, 'function');
  assert.same(typeof fv19, 'function');
  assert.same(typeof rv19, 'object');
});

QUnit.test('lagged alias binding: sibling redeclarations and for-of head write', assert => {
  // a redecl-with-init after the ctor-alias write: the member binds the redecl value's variant
  // eslint-disable-next-line no-var -- the var redeclaration is the form under test
  var M;
  // eslint-disable-next-line no-useless-assignment -- the overwritten alias write is the form under test
  ({ Map: M } = globalThis);
  // eslint-disable-next-line no-var, no-redeclare -- the var redeclaration is the form under test
  var M = [1, 2];
  assert.same(M.at(0), 1);
  // a bare redecl writes no value and keeps the alias narrow
  // eslint-disable-next-line no-var -- the var redeclaration is the form under test
  var B;
  ({ Map: B } = globalThis);
  // eslint-disable-next-line no-var, no-redeclare -- the var redeclaration is the form under test
  var B;
  assert.same(B.groupBy([1], it => it).get(1)[0], 1);
  // a for-of head write past the alias: the member reads the loop's last value
  let F;
  ({ Map: F } = globalThis);
  let laps = 0;
  for (F of [[[3]]]) laps++;
  assert.same(laps, 1);
  assert.deepEqual(F.flat(), [3]);
});

testUnlessDetectLowered('global-proxy: parens seal the chain and the call throws on the absent root', assert => {
  // the parens end the chain, so the call runs on whatever it produced. this suite runs in Node AND
  // in browsers, and the host decides which half is observable: absent, the sealed value is
  // undefined and the call throws where the unsealed spelling short-circuits it away; present,
  // nothing short-circuits and every spelling runs
  /* eslint-disable no-unsafe-optional-chaining, sonarjs/no-redundant-parentheses,
     @stylistic/no-extra-parens -- the parens around the chain ARE the form under test: they seal
     it, so what the call does on the short-circuited value is the asserted behavior */
  const WINDOW_PRESENT = typeof window != 'undefined';
  if (WINDOW_PRESENT) {
    assert.deepEqual((globalThis.window?.Array.of)(5), [5], 'sealed static call runs on a present host');
    assert.same((globalThis.window?.self.Math.trunc)(1.5), 1, 'sealed deep nav call runs');
    assert.deepEqual(((globalThis.window?.Array.of))(5), [5], 'a doubled wrapper seals the same');
    assert.deepEqual((globalThis.window?.Array.of)?.(5), [5], 'sealed optional call runs');
    assert.deepEqual(globalThis.window?.Array.of(5), [5], 'in-chain call runs');
  } else {
    assert.throws(() => (globalThis.window?.Array.of)(5), TypeError, 'sealed static call throws');
    assert.throws(() => (globalThis.window?.self.Math.trunc)(1.5), TypeError, 'sealed deep nav call throws');
    assert.throws(() => ((globalThis.window?.Array.of))(5), TypeError, 'a doubled wrapper seals the same');
    // the user's own optional call short-circuits on the guarded undefined instead of throwing
    assert.same((globalThis.window?.Array.of)?.(5), undefined, 'sealed optional call short-circuits');
    // unsealed control: the call is inside the chain and never happens
    assert.same(globalThis.window?.Array.of(5), undefined, 'in-chain call short-circuits');
  }
  // a defined root runs the sealed call for real
  assert.deepEqual((globalThis.globalThis?.Array.of)(5), [5], 'sealed call on a present root runs');
  /* eslint-enable no-unsafe-optional-chaining, sonarjs/no-redundant-parentheses,
     @stylistic/no-extra-parens -- end of the sealed-chain forms */
});

testUnlessDetectLowered('global-proxy: a wrapper between the rewrites still composes', assert => {
  // the outer rewrite renders its spans off peeled nodes while the nested one's range carries the
  // grouping parens the source wrote - the value has to come out the same as without them
  function getArr() {
    return [[1]];
  }
  /* eslint-disable @stylistic/no-extra-parens, no-unsafe-optional-chaining -- the wrapper between
     the two rewrites IS the form under test, and so is the call it terminates */
  assert.same((getArr().flat?.()?.flatMap)(x => x)?.at(0), 1, 'wrapped callee at statement start');
  assert.same((globalThis).Array.of(3, 4).at(-1), 4, 'wrapped plain root');
  assert.same((globalThis.window)?.self.Array.of(2).at(0), typeof window == 'undefined' ? undefined : 2,
    'wrapped chain root follows its host');
  assert.same((globalThis.globalThis)?.Array.of(2).at(0), 2, 'wrapped chain root on a present hop');
  /* eslint-enable @stylistic/no-extra-parens, no-unsafe-optional-chaining -- end of the wrapped forms */
});

// a legacy self-guard (`var P = P || fallback`) declares a name the file also binds as a destructure
// alias of the global. resolving the inner name re-enters the resolver through the adapter, which
// carries no cycle state - the recursion used to blow the stack and abort the build. the outer alias
// keeps the polyfill; the inner name is the LOCAL var, so it must read the caller's value.
QUnit.test('global-proxy: a self-guarded redeclaration beside a destructure alias', assert => {
  const { Promise: Outer } = globalThis;
  assert.same(typeof Outer.allSettled, 'function', 'the outer alias resolves to the polyfilled global');
  function guarded(fallback) {
    // eslint-disable-next-line no-shadow, no-var -- the self-guard IS the form under test
    var Outer = Outer || fallback;
    return Outer;
  }
  const shim = { tag: 'user' };
  assert.same(guarded(shim), shim, 'the guarded local reads the fallback, not the global');
  assert.same(guarded(shim).tag, 'user', "the local's value is the user's object");
});

// a seal whose sealed value the collapse ABSORBS: the hop right above the parens is itself a proxy
// hop (`.self`), so it folds away and the paren goes with it. the read at that hop is the source's
// own throw - it must survive the fold, in every consumer position, and it must not come back as a
// `?.` the source never wrote. the host decides which half is observable, as everywhere here
testUnlessDetectLowered('global-proxy: a seal under an absorbed proxy hop keeps its read', assert => {
  /* eslint-disable @stylistic/no-extra-parens, no-unsafe-optional-chaining -- the parens ARE
     the form under test: they seal the chain so the hop above them reads a possibly-absent value */
  const WINDOW_PRESENT = typeof window != 'undefined';
  function paramDefault({ at } = ((globalThis.window?.self).self.missingBox) ?? { at: 'fallback' }) {
    return at;
  }
  let stored = 'unwritten';
  function chainAssign() {
    return (stored = (globalThis.window?.self).self.missingBox).at;
  }
  function deleted() {
    return delete (globalThis.window?.self).self.missingBox.at;
  }
  if (WINDOW_PRESENT) {
    assert.same(paramDefault(), 'fallback', 'a present host reads the absent box and takes the default');
    // the host being present only moves WHERE the throw comes from: the box itself is absent, so the
    // read and the delete land on `undefined` one hop later instead of on the short-circuited nav
    assert.throws(chainAssign, TypeError, 'the assignment stores the absent box, then the read off it throws');
    assert.same(stored, undefined, 'and the store is observable - it ran before the throw');
    assert.throws(deleted, TypeError, 'the delete operand reads off the absent box and throws too');
  } else {
    assert.throws(paramDefault, TypeError, 'the sealed read throws instead of folding to the default');
    assert.throws(chainAssign, TypeError, 'the sealed read throws before the assignment');
    assert.same(stored, 'unwritten', 'so nothing is stored');
    assert.throws(deleted, TypeError, 'the delete operand is read plainly, no `?.` invented');
  }
  // the OPPOSITE polarity: the `?.` sits OUTSIDE the seal, so the sealed value is what it produced
  // and the plain read above it throws on either host - the negative that must not follow the fix
  let held = 'unwritten';
  assert.throws(() => ((held = globalThis.window)?.self).self.missingBox.at(0), TypeError,
    'a `?.` outside the seal still leaves a plain read above it');
  assert.same(held, globalThis.window, 'the write below the seal still ran');
  /* eslint-enable @stylistic/no-extra-parens, no-unsafe-optional-chaining -- end of the sealed forms */
});

// the same seal under a claim the RECEIVER channel erases: `(nav).Map` collapses to the ponyfill
// ctor, and the instance dispatch above it reads off that ctor. the read the source performs on the
// sealed value has to be re-emitted as a throw probe, exactly as the claim channel already does for
// the shapes that keep the receiver
testUnlessDetectLowered('global-proxy: a sealed nav under an instance dispatch keeps its probe', assert => {
  /* eslint-disable no-unsafe-optional-chaining -- the seal is the form under test */
  const WINDOW_PRESENT = typeof window != 'undefined';
  if (WINDOW_PRESENT) {
    assert.same(typeof (globalThis.window?.self).Map.name, 'string', 'a present host reads the ctor name');
    assert.same(typeof (globalThis.window?.self).Promise.name, 'string', 'and any other ponyfilled ctor');
    assert.same(typeof (globalThis.window?.self).Map.name.length, 'number', 'a tail above it reads too');
    assert.same(typeof (globalThis.window?.Map).name, 'string', 'the seal over the ctor itself reads too');
  } else {
    assert.throws(() => (globalThis.window?.self).Map.name, TypeError, 'the sealed read throws');
    assert.throws(() => (globalThis.window?.self).Promise.name, TypeError, 'for every ponyfilled ctor');
    assert.throws(() => (globalThis.window?.self).Map.name.length, TypeError, 'and through a tail');
    // the consumers that always kept the probe stay put - one per shape family
    assert.throws(() => (globalThis.window?.self).Map.prototype, TypeError, 'prototype read');
    assert.throws(() => (globalThis.window?.self).Array.of(1), TypeError, 'static call');
    assert.throws(() => (globalThis.window?.self).Number.MAX_SAFE_INTEGER, TypeError, 'ctor static');
    // the seal one level further out: the nav ENDS at the ponyfilled ctor, so the collapse keeps
    // the guard around the value instead of a probe ahead of it - the read above still throws
    assert.throws(() => (globalThis.window?.Map).name, TypeError, 'seal over the claimed ctor itself');
    assert.throws(() => (globalThis.window?.self.Map).name, TypeError, 'and one hop deeper');
    // a seal over a nav that ends AT the claim keeps the read too - the guard is built from the
    // erase verdict's own `?.` object where the nav plan has no hop leaf to render
    assert.throws(() => (globalThis.window?.self.Promise).resolve, TypeError, 'sealed nav ending at the claim');
    // a WRITE host is a member access like any other: the seal keeps its read, so the collapse
    // may not target the live realm global
    assert.throws(() => { (globalThis.self.window?.self).Box = 1; }, TypeError, 'sealed write host');
    assert.throws(() => delete (globalThis.self.window?.self).Box, TypeError, 'sealed delete host');
    assert.throws(() => (globalThis.self.window?.self).n++, TypeError, 'sealed update host');
    // a leaf core-js ponyfills no constructor for still gets its read reproduced, off the global's
    // own name - the claim beside it keeps the polyfill
    assert.throws(() => (globalThis.window?.Array).of(1), TypeError, 'sealed nav ending at an unponyfilled ctor');
    // a sealed CALLEE: the seal ends the chain, so the call applies to whatever the chain produced
    // and has to throw on the short-circuited value. folded into the guarded branch it would answer
    // undefined instead - the call must stay OUTSIDE the guard, in each invoking position
    assert.throws(() => (globalThis.window?.self)(1), TypeError, 'sealed callee');
    // eslint-disable-next-line new-cap -- the lowercase callee IS the form: a sealed nav in `new` position
    assert.throws(() => new (globalThis.window?.self)(), TypeError, 'sealed callee under new');
    assert.throws(() => (globalThis.window?.self)`x`, TypeError, 'sealed callee as a template tag');
    let assigned;
    assert.throws(() => ((assigned = globalThis.window)?.self)(1), TypeError, 'sealed callee over a chain-assign root');
    assert.same(assigned, globalThis.window, 'and the assignment below the seal still ran');
  }
  // the effects the source wrote BEFORE the nav run before the read the probe reproduces, on
  // either host - a sequence prefix is not part of the guarded value
  let seq = 0;
  try {
    /* eslint-disable-next-line sonarjs/no-redundant-parentheses -- the seal over the sequence IS the form */
    ((seq++, globalThis.window?.self)).Array.of(1);
  } catch { /* the sealed read throws off-window; the prefix still ran */ }
  assert.same(seq, 1, 'the sequence prefix runs exactly once, ahead of the sealed read');
  /* eslint-enable no-unsafe-optional-chaining -- end of the probe forms */
});

// an ALL-proxy chain as a destructure SOURCE drops every hop to the root - but only when the chain
// really is the invariant realm global. one whose VALUE short-circuits (a live `?.`, or one hidden
// under a seal) is not: dropping the hops there answers a defined object where the source
// destructures undefined and throws
testUnlessDetectLowered('global-proxy: an all-proxy destructure source keeps its short-circuit', assert => {
  /* eslint-disable no-unsafe-optional-chaining -- the seal is the form under test */
  const WINDOW_PRESENT = typeof window != 'undefined';
  // the pattern names NO polyfillable prop on purpose: a claimed one is owned by the synth-swap
  // channel, and only an unclaimed pattern (and an array pattern) reaches the hop-dropping collapse
  function sealedSource() {
    const { at } = (globalThis.window?.self).window;
    return typeof at;
  }
  function optionalSource() {
    const { at } = globalThis.window?.self.window;
    return typeof at;
  }
  function arraySource() {
    const [first] = (globalThis.window?.self).window;
    return typeof first;
  }
  if (WINDOW_PRESENT) {
    assert.same(sealedSource(), 'undefined', 'a present host destructures the realm global');
    assert.same(optionalSource(), 'undefined', 'and so does the unsealed spelling');
  } else {
    assert.throws(sealedSource, TypeError, 'the sealed read throws where the hops would have dropped');
    assert.throws(optionalSource, TypeError, 'and the short-circuited value cannot be destructured');
    assert.throws(arraySource, TypeError, 'an array pattern reaches the same collapse');
  }
  // the accepted boundary stays: an ALL-PLAIN deep nav collapses whole, `self` being erasable anywhere
  const { Map: Plain } = globalThis.self.window;
  assert.same(typeof Plain, 'function', 'an all-plain deep nav still collapses to the root');
  /* eslint-enable no-unsafe-optional-chaining -- end of the source forms */
});

// a receiver the emit RE-EMITS keeps its own proxy-global substitution. the marking that tells the
// text emitter "no second rewrite inside my span" was read as "my render consumes this global", and
// an instance claim's render does not: it hands the receiver to the helper as an argument. every
// shape that memoizes such a receiver then froze a raw `globalThis` (ReferenceError in the stripped
// realm) - and a `delete` target, which renders nothing at all, froze one with no render to blame
QUnit.test('global-proxy: a re-emitted sequence receiver keeps its own substitution', assert => {
  let effects = 0;
  const arr = [7, 8];
  // the DIRECT call is the shape that memoizes the receiver; `.call` on the same claim wraps it
  // plainly and never did leak - both are here so the pair stays discriminating
  assert.same((effects++, globalThis).Array.prototype.at(0), undefined, 'instance call through a sequence receiver');
  assert.same((effects++, globalThis).String.prototype.at(0), undefined, 'the same shape on another family');
  assert.same((effects++, globalThis).Array.prototype.at?.(0), undefined, 'optional call form');
  assert.same((effects++, globalThis).Array.prototype.at.call(arr, -1), 8, 'and the plainly-wrapped `.call` beside it');
  assert.same(typeof (effects++, globalThis).Array.prototype.at, 'function', 'the receiver without a call');
  assert.same(effects, 5, 'every sequence prefix ran exactly once');
});

// the kept guard memo substitutes its probe root through the canonical chain-root descent, which
// peels a sequence tail at EVERY hop. a hand-rolled walk stopped at a NESTED sequence and froze the
// raw global inside `null == (_ref = (d++, c++, globalThis)) ? ...`
QUnit.test('global-proxy: a nested-sequence probe root substitutes in the guard memo', assert => {
  let outer = 0;
  let inner = 0;
  const arr = [4, 5];
  /* eslint-disable @stylistic/no-extra-parens -- the NESTED sequence is the form under test */
  assert.same(typeof (outer++, (inner++, globalThis))?.Array.prototype.at, 'function', 'nested sequence under an optional receiver');
  assert.same((outer++, (inner++, globalThis))?.Array.prototype.at.call(arr, -1), 5, 'and its call form');
  assert.same((outer++, (inner++, (outer++, globalThis)))?.Array.prototype.at.call(arr, 0), 4, 'three levels deep');
  /* eslint-enable @stylistic/no-extra-parens -- end of the nested-sequence forms */
  assert.same(inner, 3, 'the inner prefixes ran once each');
  assert.same(outer, 4, 'and so did the outer ones');
});

// an effect the source wrote AHEAD of a guarded claim's root has a home of its own: it runs before
// the guard test, wrapping the whole claim. the SE classifier knew only two regions - inside the
// test and between the root and the claim - so a sequence prefix left the claim standing down RAW,
// shipping both an unpolyfilled static and a raw global read
testUnlessDetectLowered('global-proxy: a leading effect keeps its guarded claim', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  let effects = 0;
  const staticClaim = (effects++, globalThis.window?.self)?.Array.of(5);
  const ctorClaim = (effects++, globalThis.window?.self)?.Map;
  const navClaim = (effects++, globalThis.window?.self)?.window.Array.of(6);
  if (WINDOW_PRESENT) {
    assert.deepEqual(staticClaim, [5], 'the claim answers through its polyfill where the host is present');
    assert.same(typeof ctorClaim, 'function', 'and a constructor claim resolves too');
    assert.deepEqual(navClaim, [6], 'a hop above the probe rides the same guard');
  } else {
    assert.same(staticClaim, undefined, 'an absent host short-circuits the claim, as the source does');
    assert.same(ctorClaim, undefined, 'the constructor claim short-circuits with it');
    assert.same(navClaim, undefined, 'and so does the one behind an extra hop');
  }
  assert.same(effects, 3, 'each leading effect ran exactly once, on either branch');
});

// a KEPT chain-assign VALUE collapses its pony hops whatever claim stands above it - the spelling
// the static claim beside it already read through. an instance claim used to leave the hop raw, so
// the stored value and the read went through a native `self` off the global instead of its ponyfill
testUnlessDetectLowered('global-proxy: a kept chain-assign value collapses under every claim', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  let stored;
  function instanceCall() {
    return (stored = globalThis.self.window).Array.prototype.at.call([1, 2], -1);
  }
  function instanceGet() {
    return typeof (stored = globalThis.self.window).Array.prototype.at;
  }
  function staticClaim() {
    return (stored = globalThis.self.window).Array.of(3);
  }
  if (WINDOW_PRESENT) {
    assert.same(instanceCall(), 2, 'the instance claim reads through the collapsed value');
    assert.same(instanceGet(), 'function', 'and so does its get form');
    assert.deepEqual(staticClaim(), [3], 'the static claim beside them is unchanged');
    // compared by IDENTITY through a boolean: the realm global itself is not a value the reporter
    // can serialize when an assertion around it fails
    assert.true(stored === globalThis, 'the assignment stored the realm global');
  } else {
    assert.throws(instanceCall, TypeError, 'off-window the collapsed value is undefined and the read throws');
    assert.throws(instanceGet, TypeError, 'the get form throws with it');
    // the STATIC claim is receiver-less by canon: its read erases, so it answers on either host -
    // the accepted divergence this suite already records, kept here as the pair's boundary
    assert.deepEqual(staticClaim(), [3], 'the static claim erases its receiver read and still answers');
    assert.same(typeof stored, 'undefined', 'the assignment stored the short-circuited value');
  }
});

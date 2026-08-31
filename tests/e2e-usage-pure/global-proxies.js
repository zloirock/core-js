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
// setup that must survive the fold (and the inner globalThis must keep its own polyfill)
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

// a SEQUENCE-wrapped write host over a raw `.window` hop: the write-target collapse peels the
// sequence tail and drops the hop, exactly as the comma-less spelling does - `window` does not exist
// in Node, so an uncollapsed host is an undefined write target (TypeError at the assignment) where
// the plain spelling silently wrote to the global. one source, one answer, whatever the comma says.
// the sequence SE runs first either way, and exactly once
QUnit.test('global-proxy: SE-tail write host collapses like its comma-less twin', assert => {
  let c = 0;
  (c++, globalThis.window).seTailWriteProbeKey = 42;
  assert.same(globalThis.seTailWriteProbeKey, 42, 'the write lands on the realm global');
  assert.same(c, 1, 'the sequence effect ran once');
  globalThis.window.seTailWritePlainKey = 43;
  assert.same(globalThis.seTailWritePlainKey, 43, 'and the comma-less spelling lands in the same slot');
  delete (0, globalThis.window).seTailWriteProbeKey;
  delete globalThis.seTailWritePlainKey;
  assert.false('seTailWriteProbeKey' in globalThis, 'the delete host collapses too');
  assert.false('seTailWritePlainKey' in globalThis);
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

// the receiver-guard channel (a STATIC claim with a tail member above it) builds its own guard, and
// the kept value follows the realm-hop canon like every other channel: `.window` READ THROUGH the
// `self` ponyfill folds onto it, so all three shapes one line apart - static with a tail, static
// with none, instance claim - store that ponyfill and read off it on every realm
// the fold is what is under test, so the standalone-post leg (detection on already-lowered text,
// where the chain-assign + `?.` shape no longer exists) stays out, like its siblings above
testUnlessDetectLowered('global-proxy: static claim under a tail collapses the kept value hops', assert => {
  const hasWindow = globalThis.window !== undefined;
  let k;
  const size = (k = globalThis.self.window)?.Map.length;
  assert.same(size, globalThis.Map.length);
  assert.same(k, globalThis);
  // the sibling with no tail above the static, and the instance-claim sibling: same receiver,
  // and the three must agree on what the guard stored
  let m;
  const ctor = (m = globalThis.self.window)?.Map;
  assert.same(ctor, globalThis.Map);
  assert.same(m, globalThis);
  let n;
  const fixed = (n = globalThis.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(1);
  assert.same(fixed, Number.MAX_SAFE_INTEGER.toFixed(1));
  assert.same(n, globalThis);
  // the hop order reversed: `.window` is the UNRESOLVABLE hop, so the collapse keeps its own
  // guard around it instead of reading the ponyfill unconditionally
  let r;
  const reversed = (r = globalThis.window.self)?.Map.length;
  assert.same(reversed, hasWindow ? globalThis.Map.length : undefined);
  assert.same(r, hasWindow ? globalThis : undefined);
});

// a NESTED sequence value stays unproven, so the `?.` reading it keeps its guard and the kept
// slots follow the kept-value canon: a tail through the probe onto a backed hop takes the guarded
// value render - the test decides on the probe, so the claim runs exactly where the environment
// has `window` - while a backed-only tail folds to its own ponyfill and the claim runs everywhere.
// each prefix effect runs exactly once, on both branches of the guard
testUnlessDetectLowered('global-proxy: kept-sequence tail follows the kept-value canon', assert => {
  const hasWindow = globalThis.window !== undefined;
  let c = 0;
  let d = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the nested sequence shape is under test
  const at = (d++, (c++, globalThis.window.self))?.Array.prototype.at;
  assert.same(typeof at, hasWindow ? 'function' : 'undefined');
  assert.same(c, 1);
  assert.same(d, 1);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the nested sequence shape is under test
  const backed = (d++, (c++, globalThis.self))?.Array.prototype.at;
  assert.same(typeof backed, 'function');
  assert.same(c, 2);
  assert.same(d, 2);
  // a static-FALLBACK tail over the sequence-carried probe: the guard decides on the probe, so
  // the tail read runs exactly where the environment has `window` - erasing it ran the read on
  // the branch native skips
  // eslint-disable-next-line @stylistic/no-extra-parens -- the nested sequence shape is under test
  const arity = (d++, (c++, globalThis.window))?.Map.length;
  assert.same(typeof arity, hasWindow ? 'number' : 'undefined');
  assert.same(c, 3);
  assert.same(d, 3);
  // a kept STORE in the probe tail spells the guarded value where the ctor claim's test is its
  // only reader: off-window the store hands on `undefined` and the claim skips, exactly where
  // the source's own read short-circuits the chain
  let k;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the nested sequence shape is under test
  const stored = (d++, (c++, k = globalThis.window.self))?.Map.name;
  assert.same(k, hasWindow ? globalThis : undefined);
  if (!hasWindow) assert.same(stored, undefined);
  assert.same(c, 4);
  assert.same(d, 4);
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

// the same value ending at a hop core-js does NOT ponyfill: that hop is READ THROUGH the `self`
// ponyfill, so it folds onto it and the assignment stores the ponyfill - not the environment's own
// `window` slot, which a window-less realm answers `undefined` for. an inner write BELOW the hop is
// the exception: what the outer stores is the read off THAT write, and the environment answers it
QUnit.test('global-proxy: chain-assign value collapses the erasable hop and keeps the tail read', assert => {
  const hasWindow = globalThis.window !== undefined;
  let u;
  const viaWindow = (u = globalThis.self.window).Map;
  assert.same(typeof viaWindow, 'function');
  assert.same(u, globalThis);
  // the mid-chain write survives the collapse beside the outer one
  let a, b;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren-wrapped inner write IS the form under test
  const nested = (a = (b = globalThis.self.window)).Map;
  assert.same(typeof nested, 'function');
  assert.same(a, globalThis);
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
  assert.same(c, globalThis);
  const log = [];
  let d;
  assert.deepEqual((d = (log.push('p'), globalThis).self.window).Array.of(7), [7]);
  assert.deepEqual(log, ['p']);
  assert.same(d, globalThis);
  // the fallback rewrite (a member outside the known statics) re-emits the same buried
  // assignment beside the receiver swap, collapsed by the same rule
  let e;
  assert.same((e = globalThis.self.window).Promise.noSuchStatic, undefined);
  assert.same(e, globalThis);
  // a sequence AROUND the assignment (not inside its value): the claim still fires through
  // the kept assignment, and the prefix effect runs exactly once
  log.length = 0;
  let f;
  // eslint-disable-next-line sonarjs/no-redundant-parentheses -- the paren-sealed sequence IS the form under test
  const aroundCtor = ((log.push('s'), f = globalThis.self.window)).Map;
  assert.same(typeof aroundCtor, 'function');
  assert.deepEqual(log, ['s']);
  assert.same(f, globalThis);
});

// the seq-around shape under a LIVE guard: the test reads the collapsed value (never a raw
// hop), the realm hop above the ponyfill folds like everywhere else, and the prefix runs once.
// the lowering rewrites the `?.` into a temp-var ternary whose memoized test is a claimless
// value position - the open claimless-value canon - so the lowered leg sits this one out
testUnlessDetectLowered('global-proxy: guarded seq-around chain-assign value collapses in the test (runs without self in Node)', assert => {
  const log = [];
  let g;
  const aroundGuardCtor = (log.push('g'), g = globalThis.self.window)?.Map;
  assert.same(typeof aroundGuardCtor, 'function');
  assert.deepEqual(log, ['g']);
  assert.same(g, globalThis);
});

// a stored target the module also READS takes the same value canon as the unread twin: the
// reads classify through the stored guard conditional, so their own claims and guards survive
// the collapse. a claim ABSENT from the definitions (`BigInt` has no pure entry) leaves the
// ride guarded off the stored value instead of folding it onto a defined read; the plain-nav
// ride without an assignment guards identically. an ALIAS root stores the same canon, and a
// destructure host replays the kept assignment through it
testUnlessDetectLowered('global-proxy: read-target stored values, absent-claim rides, alias and destructure hosts', assert => {
  const hasWindow = globalThis.window !== undefined;
  // a PLAIN stored nav is the proxy global it navigates, so the store holds that global on either
  // host and the `?.` above it never fires - the same answer the bare read of the same nav gives, and
  // the same one on every pipeline (pre / post / pre+post). only a nav carrying a live `?.` keeps a
  // conditional store (the rows below)
  let k1;
  const proto = (k1 = globalThis.window.self)?.Object.getPrototypeOf({});
  assert.same(proto, Object.getPrototypeOf({}), 'the claim runs off the collapsed store');
  assert.same(k1, globalThis, 'and the store holds the realm global');
  // the read-then-claim twin: the alias read resolves its statics through the stored value
  let nav;
  // eslint-disable-next-line prefer-const -- the assignment-form write IS the shape under test
  nav = globalThis.window?.self.window;
  assert.same(nav?.Array.of(31).at(0), hasWindow ? 31 : undefined);
  // the definitions-absent leaf claim, assigned and plain
  /* eslint-disable es/no-bigint -- the definitions-ABSENT claim is the shape under test; the
     value is only read and compared, never invoked, so absent engines compare undefined */
  let kv;
  // this nav's PLAIN hops collapse whole and the realm hop above the ponyfill folds onto it, so
  // the store holds the global on every host - a plain read has no `?.` for the environment to
  // answer, and reproducing its off-window throw is not what the collapse is for
  const big = (kv = globalThis.window.self.window)?.BigInt;
  assert.same(big, globalThis.BigInt);
  assert.same(kv, globalThis);
  // the BARE twin of the same nav answers the realm on every host: with no write observing the
  // read, the plain hops collapse whole and the `?.` over the folded value guards nothing - the
  // proxy-collapse assumption, which the STORE above is the one exception to
  assert.same(globalThis.window.self.window?.BigInt, globalThis.BigInt);
  /* eslint-enable es/no-bigint -- end of the absent-claim forms */
  // the alias-rooted stored value
  const galias = globalThis;
  let ka;
  const aliased = (ka = galias.window.self)?.Object.isExtensible({});
  assert.same(aliased, true, 'an alias-rooted store collapses the same way');
  assert.same(ka, globalThis, 'and holds the same global');
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
    // a `?.` over a DEEPER unbacked hop guards a read the collapse assumption defines (`globalThis
    // .self.window` IS the realm), so the nav folds whole on every host and the seal hides nothing:
    // write, delete and update all address the realm's own slot instead of throwing
    (globalThis.self.window?.self).Box = 1;
    assert.same(globalThis.Box, 1, 'the sealed write host folds onto the realm slot');
    assert.true(delete (globalThis.self.window?.self).Box, 'and the delete host reaches the same slot');
    assert.same(globalThis.Box, undefined, 'which the delete emptied');
    globalThis.n = 1;
    assert.same((globalThis.self.window?.self).n++, 1, 'the update host reads and writes it too');
    assert.same(globalThis.n, 2, 'leaving the incremented value behind');
    delete globalThis.n;
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

// a receiver the emit RE-EMITS keeps its own proxy-global substitution. the marking that says
// "no second rewrite inside my span" was read as "my render consumes this global", and
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

// the hop that NAMES the polyfilled constructor decides one claim, and the claim has to answer the
// same however that key is written. the folded spellings under-resolved: the swap read the ctor raw
// off the global (`_globalThis[(keys++, 'Set')]` - the method's target engines have no `Set` there),
// and where the swap did fire it DROPPED the key's own effect. `.add` is deliberately
// a prototype method with no pure entry of its own - one WITH an entry resolves as an instance claim
// and never reaches the constructor swap this locks. `.globalThis.` spells the redundant hop, so the
// chain runs in Node too, where `self` / `window` do not exist
QUnit.test('global-proxy: a ctor hop claims the same in every key spelling', assert => {
  let keys = 0;
  const dotted = globalThis.globalThis.Set.prototype.add;
  // eslint-disable-next-line dot-notation -- the computed STRING spelling of the key is the subject
  const computed = globalThis.globalThis['Set'].prototype.add;
  // eslint-disable-next-line dot-notation, @stylistic/quotes -- as above, for the single-quasi TEMPLATE spelling
  const template = globalThis.globalThis[`Set`].prototype.add;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: its effect must survive the swap
  const sequence = globalThis.globalThis[(keys++, 'Set')].prototype.add;
  const iife = globalThis.globalThis[(() => 'Set')()].prototype.add;
  assert.same(typeof dotted, 'function', 'the dotted spelling reaches the ponyfilled prototype');
  assert.same(computed, dotted, 'a static-string computed key names the same constructor');
  assert.same(template, dotted, 'and so does a single-quasi template key');
  assert.same(sequence, dotted, 'and a key whose sequence prefix carries an effect');
  assert.same(iife, dotted, 'and one folded out of a pure zero-argument call');
  assert.same(keys, 1, 'the effect buried in that key ran exactly once');
  // the same claim under a receiver-WRAPPING helper, the other owner of this route
  let names = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- as above: the KEY carries the effect
  const wrapped = globalThis.globalThis[(names++, 'Set')].prototype.add.name;
  assert.same(typeof wrapped, 'string', 'the wrapped read resolves through the same claim');
  assert.same(names, 1, 'and runs its key effect exactly once');
});

// the chain-assign root of that same claim is a RECEIVER effect: the source runs it BEFORE the key
// it precedes. it re-emits through the swap's own absorber, which APPENDED it - past the key effect
// harvested from the same sub-receiver. both emitters agreed on that order, so nothing but a runtime
// observable catches it: the key reads what the assignment stored, and read the wrong thing
QUnit.test('global-proxy: a chain-assign root evaluates before the key it precedes', assert => {
  let target;
  // eslint-disable-next-line no-useless-assignment -- the initial value is what a key evaluated too EARLY would leave
  let seenAtKey = 'unset';
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject
  const method = (target = globalThis).globalThis[(seenAtKey = target, 'Set')].prototype.add;
  assert.same(typeof method, 'function', 'the claim still reaches the ponyfilled prototype');
  assert.same(target, globalThis, 'the assignment stored the realm global');
  assert.same(seenAtKey, globalThis, 'and it had already run when the key was evaluated');
});

// a BARE probed nav as a destructure source (`{ structuredClone } = (globalThis.window?.self)`): the
// collapse consumes the whole pattern, so the read native performs off the probe VALUE is re-emitted
// as a throw probe. the slot was read as an Identifier key only, so the same slot spelled as a static
// string or a template lost that probe and ANSWERED where native throws. every spelling names one slot
// and owes one behaviour; a computed SE key is the deliberate exception - it keeps its residual channel
testUnlessDetectLowered('global-proxy: a bare probed nav throws in every spelling of its slot', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  /* eslint-disable @stylistic/no-extra-parens, no-unsafe-optional-chaining, no-useless-computed-key, @stylistic/quotes -- the SUBJECT is a sealed
     probe nav destructured by one slot in three spellings: the parens are the seal, the short-circuit is
     the throw under test, and the computed / template keys are the spellings that used to lose it */
  function dotted() {
    const { structuredClone: sc } = (globalThis.window?.self);
    return typeof sc;
  }
  function computed() {
    const { ['structuredClone']: sc } = (globalThis.window?.self);
    return typeof sc;
  }
  function template() {
    const { [`structuredClone`]: sc } = (globalThis.window?.self);
    return typeof sc;
  }
  /* eslint-enable @stylistic/no-extra-parens, no-unsafe-optional-chaining, no-useless-computed-key, @stylistic/quotes -- end of the three-spelling subject */
  if (WINDOW_PRESENT) {
    assert.same(dotted(), 'function', 'a present host binds the polyfilled slot');
    assert.same(computed(), 'function', 'and the computed spelling of the same slot binds it too');
    assert.same(template(), 'function', 'and the template spelling');
  } else {
    assert.throws(dotted, TypeError, 'an absent host throws destructuring the probe value');
    assert.throws(computed, TypeError, 'the computed spelling of the same slot throws with it');
    assert.throws(template, TypeError, 'and so does the template spelling');
  }
});

// a chain-assign root is the OBJECT being read, so the source evaluates it before any key above it.
// three channels used to place the key first: the provider withheld the slot from a static READ,
// an emitter fallback never received it, and a claim render took over only the effects sitting
// BEFORE the assignment - a key from a hop the collapse had already dropped got wrapped around the
// whole render. the key reads what the assignment stored, which is what makes the order observable
testUnlessDetectLowered('global-proxy: a chain-assign root evaluates before every key above it', assert => {
  function staticRead() {
    let t;
    /* eslint-disable-next-line @stylistic/no-extra-parens, es/no-nonstandard-set-properties -- the parenthesized sequence
       KEY is the subject; the absent static `Set.size` is the read that keeps this route on the fallback swap */
    const v = (t = globalThis)[(order.push(t === undefined ? 'key-first' : 'assign-first'), 'Set')].size;
    return [typeof v, order.pop()];
  }
  function droppedHopKey() {
    let p;
    // eslint-disable-next-line @stylistic/no-extra-parens -- as above: the key sits on a hop the collapse DROPS
    const v = (p = globalThis)[(order.push(p === undefined ? 'key-first' : 'assign-first'), 'globalThis')].Map.name;
    return [typeof v, order.pop()];
  }
  function claimHopKey() {
    let m;
    // eslint-disable-next-line @stylistic/no-extra-parens -- as above: the key sits on the CLAIM hop
    const v = (m = globalThis).globalThis[(order.push(m === undefined ? 'key-first' : 'assign-first'), 'Set')].name;
    return [typeof v, order.pop()];
  }
  const order = [];
  assert.deepEqual(staticRead(), ['undefined', 'assign-first'], 'a static READ runs the assignment first');
  assert.deepEqual(droppedHopKey(), ['string', 'assign-first'], 'and so does a key on a hop the collapse drops');
  assert.deepEqual(claimHopKey(), ['string', 'assign-first'], 'and a key on the claim hop itself');
  assert.same(order.length, 0, 'each row observed exactly one key evaluation');
});

// a KEPT chain-assign VALUE collapses its pony hops whatever claim stands above it, and the realm
// hop it is READ THROUGH folds onto the ponyfill leaf - so the three claim shapes below store the
// same realm global and read through it on every host, window-less realms included
testUnlessDetectLowered('global-proxy: a kept chain-assign value collapses under every claim', assert => {
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
  assert.same(instanceCall(), 2, 'the instance claim reads through the collapsed value');
  assert.same(instanceGet(), 'function', 'and so does its get form');
  assert.deepEqual(staticClaim(), [3], 'the static claim beside them is unchanged');
  // compared by IDENTITY through a boolean: the realm global itself is not a value the reporter
  // can serialize when an assertion around it fails
  assert.true(stored === globalThis, 'the assignment stored the realm global');
});

// a guard ROOT reading through a seal over a PLAIN nav collapses with it: the seal hides no
// short-circuit, so the value canon reads the nav as the proxy global it navigates and the claim needs
// no test at all. spelling the probe there read the host environment off the ponyfill - undefined in
// exactly the realms the polyfill exists for, so the claim answered `void 0` or threw one hop later
testUnlessDetectLowered('global-proxy: a sealed guard root collapses onto its ponyfill', assert => {
  const order = [];
  /* eslint-disable @stylistic/no-extra-parens -- the parens ARE the seal under test: they terminate
     the chain, so the read above them is plain */
  function plainRead() {
    return ((globalThis.window).self)?.window.Promise.resolve(1);
  }
  function bareClaim() {
    return ((globalThis.window).self)?.Promise.resolve(1);
  }
  function seqPrefix() {
    return ((order.push('prefix'), globalThis.window).self)?.window.Promise.resolve(1);
  }
  function claimSideEffect() {
    return ((globalThis.window).self)?.window.Promise.resolve(order.push('claim'));
  }
  /* eslint-enable @stylistic/no-extra-parens -- the seal ends here; the assertions below are plain */
  // OFF-WINDOW IS THE POINT: the ponyfill exists so this code runs on a host WITHOUT `window`, so a
  // seal over a PLAIN navigation collapses with it and the claim runs on either host. an emit that
  // kept the source read - in the guard test or anywhere else - threw INSIDE the polyfilled output.
  // `instanceof Promise` is not the probe here: the stripped realm removes the native class, and the
  // ponyfill's thenable is the whole point - so the assertion asks what the value IS, not whose it is
  for (const fn of [plainRead, bareClaim, claimSideEffect, seqPrefix]) {
    assert.same(typeof fn()?.then, 'function', 'the claim answers a thenable on either host');
  }
  assert.same(order.filter(entry => entry === 'prefix').length, 1, 'the sequence prefix ran exactly once');
  assert.same(order.filter(entry => entry === 'claim').length, 1, "and the claim's own argument ran once");
});

// the guard TEST an optional claim renders is the render's own spelling, not source: left for the
// visitors, a claim collapsed it to the leaf ponyfill and erased the read a seal makes observable,
// while without a probe under the seal it kept a native `self` read where the ponyfill is the point
testUnlessDetectLowered('global-proxy: an optional claim spells its own guard test', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  /* eslint-disable @stylistic/no-extra-parens -- the parens ARE the seal under test: they end the
     chain, so the read under them is observable */
  function probeUnderSeal() {
    return (globalThis.window.self)?.Promise?.resolve(1);
  }
  function erasableUnderSeal() {
    return (globalThis.self).window?.Array.of(5);
  }
  /* eslint-enable @stylistic/no-extra-parens -- seal ends here */
  // the erasable hop is a DEEP one - a realm self-reference the collapse assumes present - so the
  // seal over it changes nothing and the claim answers on either host
  assert.deepEqual(erasableUnderSeal(), [5], 'the erasable hop collapses and the claim answers');
  if (WINDOW_PRESENT) {
    assert.true(probeUnderSeal() instanceof Promise, 'on-window the claim runs through its ponyfill');
  } else {
    // the probe row's observable is NOT stable across legs by design - a `pre+post` pass
    // re-collapses the kept read (the accepted class this suite's area records), so its TEXT is what
    // the fixture locks, not a runtime value here
    assert.same(typeof probeUnderSeal, 'function', 'the probe row builds on every leg');
  }
});

// an INSTANCE dispatch reading through a sealed nav: the receiver render owns a span of its own, and
// the claim splices that text into its argument slot - a render that walked past the node's end there
// left a dangling `?.` behind, which is not a program at all. so this row locks the BUILD as much as
// the values, and it locks them on the host the ponyfill exists for
testUnlessDetectLowered('global-proxy: a sealed nav feeding an instance dispatch still builds', assert => {
  /* eslint-disable @stylistic/no-extra-parens -- the parens ARE the seal under test */
  assert.same((globalThis.window).self?.Array.prototype.at.call([7], 0), 7, 'a sealed nav under a prototype dispatch');
  assert.same(((globalThis.window).self).Array.prototype.at.call([8], 0), 8, 'and with the seal one layer out');
  assert.same(typeof (globalThis.window).self?.Array.prototype.at, 'function', 'the bare method read answers too');
  /* eslint-enable @stylistic/no-extra-parens -- seal ends here */
});

// an INVOKED claim is not a delete target at all (the operand is a call), so it keeps its polyfill and
// its prefix effect instead of standing down raw. the DELETE-TARGET row of the family - a claim NAME
// under the delete, whose nav collapses whole while the delete still reaches the REALM slot - lives in
// mutated-slots.js: deleting a claim slot WRITES that name, and a slot write deopts the name for the
// whole file (area AGENTS.md). hosted here it left every `WeakSet` read in this module raw, which is
// not what the fold rows above are about and throws outright on an engine with no native WeakSet
// LOWERED legs are excluded by the second-pass class the area's AGENTS.md records: an already-lowered
// input carries no `?.` for the rule to reach and keeps its own `== null ||` short-circuit
testUnlessDetectLowered('global-proxy: an invoked claim under a delete keeps its polyfill', assert => {
  let n = 0;
  /* eslint-disable @stylistic/no-extra-parens, sonarjs/no-redundant-parentheses -- the `?.` under
     the delete IS the form under test, and so are the parens that carry it */
  const invoked = delete ((globalThis.window).self?.Array?.of(5));
  assert.true(invoked, 'an invoked claim under the delete answers true');
  const invokedSeq = delete (((n++, globalThis.window)).self?.Array?.of(6));
  assert.true(invokedSeq, 'and so does its sequence-rooted twin');
  /* eslint-enable @stylistic/no-extra-parens, sonarjs/no-redundant-parentheses -- end of the forms */
  assert.same(n, 1, 'the sequence prefix ran exactly once');
});

// an INSTANCE dispatch memoizes its receiver: when that receiver is a proxy nav carrying the probe,
// the memo must hold the COLLAPSED value. spelled raw it read `.window` off the ponyfill and then the
// next hop off the undefined that answers - a throw inside the polyfilled output, on the very branch
// the source short-circuits past
testUnlessDetectLowered('global-proxy: an instance memo over a probe nav holds the collapsed value', assert => {
  // the nav's LEAF is a hop pure can spell, so its value is the realm on every host and the `?.`
  // over it guards nothing: the memo holds the collapsed value and the dispatch runs everywhere,
  // exactly as the probe-less twin below does
  const flat = globalThis.window.self?.Array?.prototype.flat;
  assert.same(typeof flat, 'function', 'the memo holds the collapsed value');
  const called = globalThis.window.self?.Array?.prototype.flat.call([[7]]);
  assert.deepEqual(called, [7], 'and the dispatch through it runs');
  assert.same(globalThis.self?.Array?.prototype.flat.call([[8]])[0], 8, 'the probe-less twin always runs');
});

// TWO live `?.` over a SEALED short-circuiting value: both take their undefinedness from the same
// probe under the seal, so ONE test expresses them. counted as two sources the claim stood DOWN and
// shipped a NATIVE static, which off-target is no polyfill at all. the one test both legs render is
// the probe itself - the same shape the unsealed spelling gets, and the only one that still answers
// through the ponyfill in a stripped realm
testUnlessDetectLowered('global-proxy: two optionals over a sealed short-circuit still polyfill', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  /* eslint-disable @stylistic/no-extra-parens -- the seal over the live `?.` IS the form under test */
  const made = ((globalThis.window?.self)?.Array?.of(5));
  const method = ((globalThis.window?.self)?.Promise?.resolve);
  const bare = globalThis.window?.self?.Array?.of(5);
  /* eslint-enable @stylistic/no-extra-parens -- end of the sealed forms */
  assert.deepEqual(made, WINDOW_PRESENT ? [5] : undefined, 'the static answers its host');
  assert.same(typeof method, WINDOW_PRESENT ? 'function' : 'undefined', 'and so does the method read');
  // the sealed spelling and the bare one answer the SAME thing - the seal decides where a `?.`
  // guards, never whether the claim keeps its polyfill
  assert.deepEqual(made, bare, 'the seal changes nothing the unsealed spelling does not');
});

// a nav whose LEAF is the environment probe (`globalThis.self.window?.X`): the hops BELOW the probe
// collapse onto their ponyfill and the probe read keeps its own `?.`, so off-window the chain
// short-circuits to `undefined` instead of throwing. kept raw, the emit read a NATIVE `self` off the
// ponyfill - undefined in Node - and the next hop threw INSIDE the polyfilled output
testUnlessDetectLowered('global-proxy: a nav whose leaf is the probe collapses its hops below it', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  // the leaf is `document`, not a modern ctor: it has to be a name core-js has no module for - so the
  // read stays RAW off the probe value - and present on every karma browser alike. `WeakRef` is not:
  // IE11 has `window` and no `WeakRef`, and the row read `undefined` off a host it called present
  // a DEEPER unbacked hop is a realm self-reference the collapse assumption defines, so the `?.`
  // over it guards nothing and the whole nav folds: the raw leaf read answers the realm's own slot
  // (absent in Node, present in a browser) and a claim above it answers its ponyfill on every host
  assert.same(typeof globalThis.self.window?.document, WINDOW_PRESENT ? 'object' : 'undefined',
    'the folded leaf read answers the realm, and never throws');
  assert.same(globalThis.self.window?.Symbol?.iterator, Symbol.iterator,
    'a claim above the folded nav answers through its ponyfill');
  // the `?.`-free twin of the same nav collapses whole - the multihop canon, unchanged by this
  globalThis.deepNavProbeKey = 'here';
  assert.same(globalThis.self.window.deepNavProbeKey, 'here', 'the plain spelling collapses whole');
  delete globalThis.deepNavProbeKey;
});

// the member a `delete` NAMES is never read, so it is never polyfilled - swapped, the operand became a
// CALL (`delete _nameMaybeFunction(...)`) and the delete stopped deleting anything. the members BELOW
// it are read on the way there and keep their claims
testUnlessDetectLowered('global-proxy: a deleted member is not polyfilled, the ones below it are', assert => {
  const box = { fn() { return 1; } };
  Object.defineProperty(box.fn, 'name', { value: 'named', configurable: true });
  assert.same(box.fn.name, 'named', 'the own name is there to start with');
  assert.true(delete globalThis.self.Object.getOwnPropertyDescriptor(box, 'fn').enumerable,
    'a delete through a collapsed nav answers true');
  // the claim BELOW the deleted member still runs through its ponyfill
  assert.same(typeof globalThis.self.Array.prototype.flat, 'function', 'the read below it keeps its polyfill');
});

// a KEPT chain-assign holds the probe read, and the hop above it is read PLAIN: evaluating it THROWS
// off-window, exactly as the source does. anchoring the dispatch guard one hop lower tested the probe
// value instead and answered `undefined` where the source throws - a swallowed exception, on the leg
// that spells it differently from the other
testUnlessDetectLowered('global-proxy: a kept assign keeps the throw of the plain hop above it', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  let w;
  function read() {
    return (w = globalThis.window).self?.Array?.prototype.flat.name;
  }
  if (WINDOW_PRESENT) {
    assert.same(read(), 'flat', 'on a host with the probe the read answers through the ponyfill');
  } else assert.throws(read, TypeError, 'off-window the plain hop throws, as the source does');
  assert.same(w, globalThis.window, 'and the kept assign stored what the source stores');
});

// a WRITE below the probe hops is the source's own first act. the guard base substitutes the whole
// prefix for an always-defined ponyfill (the owner-decided price of that base), and the write went with
// it - a compensating re-emit above the test then ran AFTER a read that throws, leaving it unwritten
testUnlessDetectLowered('global-proxy: a write below the probe hops runs where the source runs it', assert => {
  let w;
  function read() {
    return (w = globalThis).self.window?.self?.Array.of(5);
  }
  // every `?.` in the run reads a value the collapse assumption defines (its leaf is a hop pure can
  // spell), so the nav folds whole and the claim answers on every host. the WRITE is what this row
  // is about: it survives the fold as the sequence prefix, where the source performs it
  assert.same(read()[0], 5, 'the claim answers through its ponyfill on every host');
  assert.same(w, globalThis, 'and the write below the hops stored what the source stores');
});

// the guard a dispatch renders under a `delete` must be PARENTHESIZED: spelled bare, `delete null ==
// _ref ? ...` parses as `(delete null) == _ref ? ...` - a comparison, not a deletion, and the operand
// the source names is never touched
testUnlessDetectLowered('global-proxy: a delete over a rendered guard keeps its parens', assert => {
  globalThis.deleteGuardBox = { list: [[1]] };
  const dropped = delete globalThis.window?.self.deleteGuardBox.list.at.name;
  assert.same(typeof dropped, 'boolean', 'the operand is a delete, not a comparison');
  assert.same(globalThis.deleteGuardBox.list.at(0)[0], 1, 'and the object below it survives');
  delete globalThis.deleteGuardBox;
});

// every hop RESOLVES (no probe in the nav): the whole navigation collapses onto the root ponyfill, so
// the dispatch memo holds it. left raw, the memo read `self` off the ponyfill root - undefined in a
// realm without one - and the chain short-circuited where the collapsed spelling answers
testUnlessDetectLowered('global-proxy: a fully resolving nav collapses inside the dispatch memo', assert => {
  assert.same(globalThis.self?.Array?.prototype.flat.name, 'flat', 'the memo answers through the ponyfill');
  assert.deepEqual(globalThis.self?.Array?.prototype.flat.call([[3]]), [3], 'and the dispatch through it runs');
});

// a CONDITIONALLY-assigned optional callee short-circuits through its own `?.()` - the yield
// is a source of undefined nothing above re-tests. host-independent: the flag is never set
QUnit.test('global-proxy: an optional call on a conditionally-assigned callee keeps its guard', assert => {
  /* eslint-disable no-unsafe-optional-chaining -- the short-circuited yield IS the form under test */
  let unsetFn;
  if (globalThis.thisFlagIsNeverSet) unsetFn = () => globalThis;
  assert.same(unsetFn?.()?.Array.of(1), undefined, 'the static call short-circuits');
  assert.same(unsetFn?.()?.Array.of, undefined, 'the static read short-circuits');
  assert.same(unsetFn?.()?.Number.MAX_SAFE_INTEGER, undefined, 'the static field short-circuits');
  assert.same(typeof unsetFn?.()?.Array.of, 'undefined', 'typeof reads the short-circuit');
  assert.same(unsetFn?.()?.self.Array.of(2), undefined, 'a deep hop short-circuits');
  assert.throws(() => new (unsetFn?.()?.Map)(), TypeError, 'new on the short-circuited value throws');
  assert.throws(() => unsetFn()?.Array.of(3), TypeError, 'the plain call throws on the unassigned binding');
  const { of } = unsetFn?.()?.Array ?? {};
  assert.same(of, undefined, 'the destructured static reads the fallback');
  function definedFn() {
    return globalThis;
  }
  assert.deepEqual(definedFn?.()?.Array.of(4), [4], 'control: a proven callee keeps the collapse');
  /* eslint-enable no-unsafe-optional-chaining -- end of the short-circuited forms */
});

// an ALIAS holding an absent-able value: the PLAIN member read is the source's own throw and
// must survive the claim; the OPTIONAL twin short-circuits. host decides which half runs
QUnit.test('global-proxy: a plain read off an alias holding a probe nav', assert => {
  const held = globalThis.window?.Array;
  if (typeof window == 'undefined') {
    assert.throws(() => held.of(1), TypeError, 'the plain read throws where the alias is undefined');
    assert.throws(() => held.from, TypeError, 'the plain property read throws the same way');
    assert.same(held?.of(2), undefined, 'the optional twin short-circuits');
  } else {
    assert.deepEqual(held.of(1), [1], 'a present host runs the claim');
    assert.same(held?.of(2).length, 1, 'the optional twin runs too');
  }
  const allPlain = globalThis.globalThis.Array;
  assert.deepEqual(allPlain.of(3), [3], 'control: a defined held value keeps the collapse');
});

// a call root FORWARDING the real global through an object literal: the shorthand binding IS
// the constructor, so the claim polyfills; a user object with its own method stays untouched
QUnit.test('global-proxy: a literal-forwarded global keeps its polyfill', assert => {
  function forwards() {
    return { window: { Array } };
  }
  assert.deepEqual(forwards()?.window?.Array.of(13), [13], 'the forwarded constructor answers the static');
  function custom() {
    return { Array: { of: x => [x, 'custom'] } };
  }
  assert.deepEqual(custom()?.Array.of(14), [14, 'custom'], "control: the user's own method runs");
});

// wrapped twins of the plain alias read: a paren seal over the bare alias hides no
// short-circuit, and an SE sequence peels to the tail with its prefix running BEFORE the
// probe - native order on both hosts
QUnit.test('global-proxy: wrapped twins of the alias probe read', assert => {
  const held = globalThis.window?.Array;

  let effects = 0;
  if (typeof window == 'undefined') {
    // eslint-disable-next-line @stylistic/no-extra-parens -- the seal IS the form under test
    assert.throws(() => (held).of(1), TypeError, 'the paren-sealed read throws');
    assert.throws(() => (effects++, held).of(2), TypeError, 'the sequence-wrapped read throws');
    assert.same(effects, 1, 'the sequence prefix ran before the throw, as native does');
  } else {
    // eslint-disable-next-line @stylistic/no-extra-parens -- the seal IS the form under test
    assert.deepEqual((held).of(1), [1], 'the paren-sealed read runs');
    assert.deepEqual((effects++, held).of(2), [2], 'the sequence-wrapped read runs');
    assert.same(effects, 1, 'the sequence prefix ran exactly once');
  }
});

// a nav kept by a user WRITE owns its short-circuit whatever stands above it: the store is the
// source's own act, so folding the guard away hands the variable the ponyfill where native stores
// `undefined`. the rows are the shapes that reach the store through a different channel each -
// a `delete` consumer (whose own navigation folds, the store below it does not) and the write
// BELOW the hops (its value is the bare root, so the outer store carries the navigation). the
// STACKED prefix opening them is the boundary: every realm hop in it is READ THROUGH a ponyfill,
// so the whole spine folds and there is no short-circuit left for the store to keep
testUnlessDetectLowered('global-proxy: a kept write keeps the short-circuit its value spells', assert => {
  const hasWindow = globalThis.window !== undefined;
  let stacked;
  const fixed = (stacked = globalThis.self?.window?.self).Number.MAX_SAFE_INTEGER;
  assert.same(fixed, Number.MAX_SAFE_INTEGER, 'the claim answers its ponyfill either way');
  assert.same(stacked, globalThis, 'the read-through spine folded onto the ponyfill');
  let deleted;
  const gone = delete (deleted = globalThis.window?.self)?.Promise.noSuchStatic;
  assert.same(gone, true, 'the delete answers true on both hosts');
  assert.same(deleted, hasWindow ? globalThis : undefined, 'the delete folded its own nav, not the store');
  let below;
  const missing = (below = globalThis).window?.self.noSuchStatic;
  assert.same(missing, undefined, 'the claimless read answers undefined on both hosts');
  assert.same(below, globalThis, 'the write below the hops stored the bare root');
  let outer;
  let inner;
  const nested = (outer = (inner = globalThis).window?.self)?.Array.of(3);
  assert.deepEqual(nested, hasWindow ? [3] : undefined, 'the doubly-kept nav answers through the guard');
  assert.same(inner, globalThis, 'the inner write stored the root');
  assert.same(outer, hasWindow ? globalThis : undefined, 'the outer write stored the short-circuit');
  let alias;
  let seqKept;
  const rooted = (alias = globalThis, seqKept = alias.window?.self)?.Array.of(4);
  assert.deepEqual(rooted, hasWindow ? [4] : undefined, 'a sequence-rooted store answers the same way');
  assert.same(seqKept, hasWindow ? globalThis : undefined, 'and stores the same short-circuit');
  let seqDeleted;
  const seqGone = delete (alias = globalThis, seqDeleted = alias.window?.self)?.Promise.noSuchStatic;
  assert.same(seqGone, true, 'the delete over that store answers true');
  assert.same(seqDeleted, hasWindow ? globalThis : undefined, 'and the store keeps its short-circuit under it');
});

// a `delete` reads nothing over its navigation, so the ctor below the deleted member folds with it
// and the slot is reached off the PONYFILL - the deleted member's own claim renders nothing, so it
// subsumes no receiver. left raw, the ctor is read off the realm, which a stripped one does not have
QUnit.test('global-proxy: a delete reaches its slot off the ponyfilled ctor', assert => {
  assert.same(delete globalThis.Map.prototype.noSuchMethod, true, 'the plain ctor receiver deletes');
  assert.same(delete globalThis.window?.self?.Map.prototype.noSuchMethod, true, 'and so does the navigated one');
  assert.same(typeof new globalThis.Map().has, 'function', 'the ctor the delete reached is still whole');
});

// a constructor below a COMPUTED key is the claim it spells: the key names no claim of its own, so
// stopping the walk there left the ctor reading off the environment surface - `undefined[key]` in a
// realm with no native. under a `delete` the navigation folds whole, so the read lands on the
// ponyfill on every host and the assertion runs in Node too
QUnit.test('global-proxy: a constructor below a computed key keeps its polyfill', assert => {
  const key = String.fromCharCode(112, 114, 111, 116, 111, 116, 121, 112, 101);
  assert.same(delete globalThis.window?.self?.Promise[key].noSuchSlot, true, 'the folded delete reaches the ponyfill');
  assert.same(typeof globalThis.Promise[key].then, 'function', 'and the ctor it reached is still whole');
});

// a `?.` over a chain-assign STORE weighs the value the store hands on, not the write: off-window the
// store holds undefined and destructuring it throws exactly as the source does. reading the write as
// opaque called the init defined and answered the polyfill where native throws
QUnit.test('global-proxy: a stored probe keeps the destructure read', assert => {
  const hasWindow = globalThis.window !== undefined;
  let held;
  function read() {
    // eslint-disable-next-line no-unsafe-optional-chaining -- destructuring the short-circuit IS the case under test
    const { trunc } = (held = globalThis.window?.self)?.window.Math;
    return trunc;
  }
  if (hasWindow) assert.same(typeof read(), 'function', 'on a window host the read answers the polyfill');
  else assert.throws(read, TypeError, 'off-window the destructure of the short-circuit throws');
  assert.same(held, hasWindow ? globalThis : undefined, 'and the store kept the value the source wrote');
});

// a SEAL ends nothing for the hop run reading THROUGH it: the paren is printer trivia, and stopping
// the collapse's upward climb on it left the run half-folded - the surviving `window` read then threw
// on a host that has none, where the unsealed twin answers the folded value
QUnit.test('global-proxy: a sealed nav folds the hop above it', assert => {
  /* eslint-disable @stylistic/no-extra-parens -- the seal IS the form under test */
  assert.same((globalThis.window.self)?.window.noSuchStatic, undefined, 'the sealed run answers the fold');
  assert.same(globalThis.window.self?.window.noSuchStatic, undefined, 'and its unsealed twin answers the same');
  assert.same((globalThis.window.self).window.Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
    'a backed claim above the seal still lands');
  /* eslint-enable @stylistic/no-extra-parens -- end of the sealed forms */
});

// a realm hop reading a KEPT STORE folds onto the guarded value the store hands on, whichever
// spelling roots the probe - the probe's own `?.` slides one member up and still short-circuits a
// void store. a PLAIN hop instead erases the `?.` above: a void store then throws on the member
// above exactly where the source threw on the hop, and the hop at the CHAIN END keeps its shape
QUnit.test('global-proxy: a realm hop over a kept store folds on every root spelling', assert => {
  const hasWindow = globalThis.window !== undefined;
  const alias = globalThis;
  let aliased, bare, plained, ended;
  assert.same((aliased = alias.window?.self)?.window.noSuchStatic, undefined, 'the alias-rooted store folds');
  assert.same((bare = globalThis.window?.self)?.window.noSuchStatic, undefined, 'and the bare-rooted one the same');
  function plainHop() {
    return (plained = alias.window?.self).window?.noSuchStatic;
  }
  function chainEnd() {
    return (ended = alias.window?.self).window;
  }
  if (hasWindow) {
    assert.same(plainHop(), undefined, 'on a window host the plain hop reads the realm');
    assert.same(chainEnd(), globalThis, 'and the chain-end hop answers the realm');
  } else {
    assert.throws(plainHop, TypeError, 'off-window the plain hop still throws on the read above');
    assert.throws(chainEnd, TypeError, 'and the chain-end hop keeps the source throw');
  }
  const expected = hasWindow ? globalThis : undefined;
  assert.same(aliased, expected, 'each store kept the value the source wrote');
  assert.same(bare, expected, '... the bare-rooted one too');
  assert.same(plained, expected, '... under the plain hop too');
  assert.same(ended, expected, '... and at the chain end');
});

// the `?.` over a CONSTRUCTOR read off the realm is dead - the static below it substitutes an
// always-defined binding - but the deopt named its host through the proxy-HOP resolver, which
// answers for `self` and not for `Number`. with no name the guard stayed live and the static read
// natively off the ponyfill, which a realm without it answers `undefined` for. the PROBE-store twin
// stays out of the runtime assertion: on the POST leg the chain arrives already lowered, so no `?.`
// reaches this verdict and the read throws off-window as the source does - its shape is fixed by
// the fixture instead
QUnit.test('global-proxy: a constructor read names its static host', assert => {
  let held;
  const stored = (held = globalThis.self).Number?.MAX_SAFE_INTEGER;
  assert.same(stored, Number.MAX_SAFE_INTEGER, 'the static below the dead guard keeps its polyfill');
  assert.same(held, globalThis, 'and the store kept the surface the source wrote');
});

// a realm hop READ THROUGH a ponyfill folds onto it: the source names the realm that ponyfill
// already is, and off-browser the ponyfill cannot answer the slot - so the store lands the
// ponyfill, where a raw `.window` read off it answers `undefined` and the read above it throws.
// the environment PROBE reading off the source ROOT keeps its guard beside it, and that branch is
// the realm's own answer. lowered input carries no `?.` for either verdict to reach
testUnlessDetectLowered('global-proxy: a realm hop read through a ponyfill folds onto it', assert => {
  let held;
  const value = (held = globalThis.self.window)?.Number.MAX_SAFE_INTEGER;
  assert.same(held, globalThis, 'the store lands the ponyfill the fold leaves behind');
  assert.same(value, Number.MAX_SAFE_INTEGER, 'and the read off it keeps its polyfill');
  const windowValue = globalThis.window;
  assert.same(globalThis.window?.self.window.Number.MAX_SAFE_INTEGER,
    windowValue === undefined ? undefined : Number.MAX_SAFE_INTEGER,
    'the probe still discriminates a window-less realm');
});

// an alias write proven in the SAME execution region is trusted for the read beside it, whatever
// host defers that region: the store lands the ponyfill on every one of them, where a raw `g.self`
// read answers `undefined` in a realm without `self` and the read above it throws. the conditional
// write beside them dominates nothing and keeps its raw read
testUnlessDetectLowered('global-proxy: an alias write is trusted for the read in its own region', assert => {
  let v;
  let g1;
  const atTop = (g1 = globalThis, v = g1.self).Array.prototype.at;
  assert.same(typeof atTop, 'function', 'the statement-level store reads through the ponyfill');
  assert.true(v === globalThis, 'and stored the realm global');
  let g2;
  assert.same(typeof [() => (g2 = globalThis, v = g2.self).Array.prototype.at][0](), 'function',
    'an arrow body proves the same write');
  let g3;
  function inBody() {
    return (g3 = globalThis, v = g3.self).Array.prototype.at;
  }
  assert.same(typeof inBody(), 'function', 'and so does a function body');
  let g4;
  class WithField {
    f = (g4 = globalThis, v = g4.self).Array.prototype.at;
  }
  assert.same(typeof new WithField().f, 'function', 'and a class-field initializer');
});

// a `??` / `||` DEFAULT over a guaranteed realm name is dead on its right side - `globalThis` by
// the language, `self` by its own ponyfill entry - so a static read THROUGH the carrier collapses
// to its polyfill and answers on a realm without the native. `window` has no entry and stays the
// probe: its spelling is raw, so a window-less realm throws on the bare name exactly like the
// source, and a SHADOWED name is the user's binding with a genuinely live right side
QUnit.test('global-proxy: a logical default over a guaranteed realm name is dead', assert => {
  assert.same((globalThis ?? {}).Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 'the realm spelling reads the polyfilled static');
  // the `self` rows read statics the stripped realm removes, so a missed collapse fails there
  // instead of riding the surviving native
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  assert.true((self ?? {}).Number.isInteger(5), 'the ponyfill-backed `self` reads the polyfilled static');
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  assert.deepEqual((self ?? {}).Array.from('ab'), ['a', 'b'], '... a second static family too');
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  assert.true((self || {}).Object.hasOwn({ k: 1 }, 'k'), '... under the `||` spelling too');
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  assert.deepEqual(((self ?? {}) || {}).Array.of(9), [9], '... and at a nested level of the default');
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  const map = new (self ?? {}).Map([['k', 1]]);
  assert.same(map.get('k'), 1, 'and a ctor claim through the carrier constructs the ponyfill');
  const marker = {};
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the case under test
  const weak = new (self ?? {}).WeakSet([marker]);
  assert.true(weak.has(marker), '... including a ctor the stripped realm removes whole');
});

QUnit.test('global-proxy: a logical default keeps its boundaries', assert => {
  const hasWindow = globalThis.window !== undefined;
  if (hasWindow) {
    // eslint-disable-next-line unicorn/prefer-global-this -- the raw `window` probe is the case under test
    assert.same(typeof (window ?? {}).Math.floor, 'function', 'a window host answers the raw probe natively');
  } else {
    // eslint-disable-next-line unicorn/prefer-global-this -- the raw `window` probe is the case under test
    assert.throws(() => (window ?? {}).Math, ReferenceError, 'a window-less realm throws on the raw probe');
  }
  function shadowed(self) {
    return (self ?? { Number: { MAX_SAFE_INTEGER: 'dead-arm' } }).Number.MAX_SAFE_INTEGER;
  }
  assert.same(shadowed({ Number: { MAX_SAFE_INTEGER: 'user' } }), 'user', 'a shadowed name reads the user binding');
  assert.same(shadowed(null), 'dead-arm', '... and its right side is genuinely live');
});

// an alias holding a probe-hop READ (`const { window: W } = globalThis`) is as absent-able as the
// nav spelling of the same value: the `?.` over it is load-bearing and must short-circuit where
// the realm has no `window`, instead of the collapse answering the ponyfill there
QUnit.test('global-proxy: a destructured probe alias keeps its own guard', assert => {
  const { window: W } = globalThis;
  const viaAlias = W?.Array.from([1]);
  const viaNav = globalThis.window?.Array.from([1]);
  if (globalThis.window === undefined) {
    assert.same(viaAlias, undefined, 'a window-less realm short-circuits the alias spelling');
    assert.same(viaNav, undefined, '... exactly like the nav spelling');
  } else {
    assert.deepEqual(viaAlias, [1], 'a window host runs the claim through the alias');
    assert.deepEqual(viaNav, [1], '... and through the nav');
  }
  // an ENTRY-BACKED alias stays erasable - `self` is the realm object by its ponyfill
  const { self: S } = globalThis;
  assert.deepEqual(S?.Array.of(2), [2], 'an entry-backed alias claim always answers');
});

// a computed key on a guarded probe alias evaluates only past the guard: native short-circuits
// at `W?.` before ever reaching the key, so its effect must not run on the nullish path
QUnit.test('global-proxy: a dropped key effect over a probe alias runs only past the guard', assert => {
  const { window: W } = globalThis;
  let keyRuns = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence KEY is the subject: its SE must ride the guard
  const value = W?.[(keyRuns++, 'Array')].of(1);
  if (globalThis.window === undefined) {
    assert.same(keyRuns, 0, 'the nullish path never evaluates the key');
    assert.same(value, undefined, 'and the claim short-circuits');
  } else {
    assert.same(keyRuns, 1, 'a window host evaluates the key once');
    assert.deepEqual(value, [1], 'and answers the claim');
  }
});

// a proxy root captured through a CALL is the realm the callee returns, so a static read off the
// alias resolves like the bare form. resolving the alias by name alone gave the read a `*/constructor`
// binding - statics-free by construction - and every static off it threw where the source works
QUnit.test('global-proxy: a call-captured realm alias serves its statics', assert => {
  function makeRealm() { return globalThis; }
  const viaCall = makeRealm();
  assert.deepEqual(viaCall.Map.groupBy([1, 2, 3], x => x % 2).get(1), [1, 3], 'a static off a call-captured realm');
  assert.deepEqual(viaCall.Array.from('ab'), ['a', 'b'], '... and a second static family');
  function identity(value) { return value; }
  const viaIdentity = identity(globalThis);
  assert.deepEqual(viaIdentity.Map.groupBy([4, 5], x => x % 2).get(0), [4], 'an identity-call capture answers the same');
  const marker = {};
  const weak = new viaCall.WeakSet([marker]);
  assert.true(weak.has(marker), 'and a ctor claim through the capture constructs the ponyfill');
});

// a namespace CONTAINER reached through an alias or a member hop indexes the same as the bare
// literal: `super.<static>` off such a base resolves the inherited static, where a walk that
// handed the alias init back verbatim indexed nothing and left the call native
QUnit.test('global-proxy: a container reached through hops serves its inherited statics', assert => {
  const direct = { Base: Map };
  const viaAlias = direct;
  const outer = { inner: { Base: Map } };
  const viaMember = outer.inner;
  class FromAlias extends viaAlias.Base {
    static grouped() { return super.groupBy([1, 2], x => x % 2); }
  }
  class FromMember extends viaMember.Base {
    static grouped() { return super.groupBy([3], x => x % 2); }
  }
  assert.deepEqual(FromAlias.grouped().get(1), [1], 'an alias hop to the container');
  assert.deepEqual(FromMember.grouped().get(1), [3], '... and a member hop to it');
  let effects = 0;
  class FromEffectfulBase extends (effects++, direct.Base) {
    static grouped() { return super.groupBy([6], x => x % 2); }
  }
  assert.deepEqual(FromEffectfulBase.grouped().get(0), [6], 'an effect-wrapped base names the same statics');
  assert.same(effects, 1, '... and its effect ran exactly once');
});

// the `?.` over a store of a defined realm value is dead, so the guard erases and the store folds
// into the collapsed receiver. what the emitted TEXT cannot say is that the fold keeps the effects:
// the assignment - and any sequence prefix around it - must still run EXACTLY once, and the binding
// must still end up holding the realm. the probe-valued twin keeps its guard and short-circuits
QUnit.test('global-proxy: an erased store guard folds its effects exactly once', assert => {
  const realm = globalThis;
  let effects = 0;
  let stored;
  const named = (effects++, stored = realm)?.self.Set.prototype.add.name;
  assert.same(effects, 1, 'the sequence prefix ran once');
  assert.same(stored, globalThis, 'and the store left the realm in the binding');
  assert.same(typeof named, 'string', '... while the read answered off the ponyfill');
  let held;
  assert.same((held = realm)?.Array.of(5).at(0), 5, 'a receiver-DEPENDENT tail erases the same way');
  assert.same(held, globalThis, '... and its store is just as observable');
  // the environment PROBE keeps its guard: where `window` is absent the whole chain short-circuits
  // and the store never runs, and where it is present the read answers through it
  const probe = globalThis.window;
  let overProbe;
  const probed = (overProbe = probe)?.self.Map.prototype.has.name;
  if (probe === undefined) {
    assert.same(overProbe, undefined, 'a probe-valued store short-circuits before assigning');
    assert.same(probed, undefined, '... and yields undefined, as the source does');
  } else {
    assert.same(overProbe, probe, 'with a window present the store runs');
    assert.same(typeof probed, 'string', '... and the read answers through it');
  }
});

// the base of a dropped backed hop can be a CALL the inline canon proves (`() => globalThis`):
// the hop's `?.` is then dead and the collapse folds onto the ponyfill, keeping the base's
// observable work - a sequence prefix, an effectful body or argument - exactly once. the value
// is 1 where the fold ran and `undefined` on a leg whose input arrived already lowered (no `?.`
// left for the rules to reach - the documented sandwich boundary); what no leg may do is THROW
// on the raw realm hop, and the effects run exactly once everywhere. the claimless deep
// receiver folds its raw `.window` hop away, so the read answers `undefined` on every host
QUnit.test('global-proxy: a proven call root under a live optional folds onto the ponyfill', assert => {
  function foldedOrLowered(value) {
    return value === 1 || value === undefined;
  }
  // eslint-disable-next-line unicorn/consistent-function-style -- the proven arrow callee IS the case under test
  const dh = () => globalThis;
  assert.same(foldedOrLowered((0, dh())?.self?.window.Array.of(1).at(0)), true,
    'the sequence-wrapped proven base folds, and never throws on the raw hop');
  assert.same(foldedOrLowered(dh()?.self?.window.Array.of(1).at(0)), true,
    'the bare proven base folds the same way');
  let effects = 0;
  // eslint-disable-next-line unicorn/consistent-function-style -- the proven arrow callee IS the case under test
  const eff = () => {
    effects++;
    return globalThis;
  };
  assert.same(foldedOrLowered(eff()?.self?.window.Array.of(1).at(0)), true, 'an effectful body still folds');
  assert.same(effects, 1, '... and runs exactly once');
  // eslint-disable-next-line sonarjs/no-extra-arguments -- the effect in the unused argument slot is the case
  assert.same(foldedOrLowered(dh(effects++)?.self?.window.Array.of(1).at(0)), true, 'an effectful argument folds too');
  assert.same(effects, 2, '... running once as well');
  assert.same(foldedOrLowered((effects++, dh())?.self?.window.Array.of(1).at(0)), true, 'a live sequence prefix folds');
  assert.same(effects, 3, '... with the prefix running once');
  // the claimless deep receiver: folded it answers `undefined`, and a lowered-input leg
  // reproduces the native off-window throw instead - the fixture locks WHICH legs fold;
  // what no leg may produce is a third outcome (a leaked value off the raw hop)
  let deep;
  try {
    deep = typeof (() => globalThis)().window.foo?.[Symbol.iterator];
  } catch {
    deep = 'native-throw';
  }
  assert.same(deep === 'undefined' || deep === 'native-throw', true,
    'the claimless deep receiver folds away or keeps the native throw');
  // eslint-disable-next-line unicorn/consistent-function-style -- the probe-yielding arrow callee IS the case
  const dw = () => globalThis.window;
  const hasWindow = globalThis.window !== undefined;
  assert.same(dw()?.self?.window.Array.of(1)?.at(0), hasWindow ? 1 : undefined,
    'a probe-yielding call keeps its own guard');
});

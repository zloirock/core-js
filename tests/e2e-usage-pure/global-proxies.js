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
QUnit.test('global-proxy: SE-tail write host .window hop collapses (runs without it in Node)', assert => {
  let c = 0;
  (c++, globalThis.window).seTailWriteProbeKey = 42;
  assert.same(globalThis.seTailWriteProbeKey, 42);
  assert.same(c, 1);
  delete (0, globalThis.window).seTailWriteProbeKey;
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
  // the DESTRUCTURE-source shape of the same kept root: the text emitter splices source instead of cloning
  // nodes, so it renders the root its own way - the kept value must still get its raw root polyfilled
  let d;
  function destructureWindowValued() {
    const { of } = (d = globalThis.window).self.Array;
    return of;
  }
  if (hasWindow) assert.same(typeof destructureWindowValued(), 'function');
  else assert.throws(destructureWindowValued, TypeError);
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

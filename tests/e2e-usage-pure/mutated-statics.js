// Monkey-patched statics live in their OWN module: the mutation pre-pass is per-FILE, so a
// patch here would poison the key for every sibling test in a shared module and reroute
// their emissions (an unpolyfilled native read breaks engines missing the static natively).
// each test restores what it patches - the shared runtime stays clean

// alias-mutation canonicalization at runtime: a patch through a const alias must win over
// the polyfill substitution for reads of the same static (restored afterwards)
QUnit.test('mutated-statics: alias mutation wins over substitution', assert => {
  const A = Array;
  const had = 'of' in A;
  const original = A.of;
  A.of = function patched() {
    return 'patched';
  };
  assert.same(A.of(1), 'patched');
  assert.same(Array.of(2), 'patched');
  // precise restore: assigning `undefined` back would leave an own undefined property
  if (had) A.of = original;
  else delete A.of;
});

// a patch through a DESTRUCTURE-LEAF alias (`const { Iterator: I } = globalThis; I.range = ...`) names the same
// global static as a dotted patch - the pre-pass must follow the destructure KEY (I -> Iterator) via the read-side
// canon, not the raw declarator init (`globalThis`). before the fix the patch was mis-keyed and the read of
// `Iterator.range` routed to the injected polyfill, ignoring the user patch. uses Iterator.range: Iterator is not
// ctor-slot-replaced here and `range` is patched by no sibling (the sibling tests patch Iterator.from), so the
// static is only touched via the path under test and its destructure binding routes through the same pure ctor
QUnit.test('mutated-statics: destructure-leaf alias mutation wins over substitution', assert => {
  const { Iterator: I } = globalThis;
  const had = 'range' in I;
  const original = I.range;
  I.range = function patched() {
    return 'destructure-leaf-patched';
  };
  try {
    assert.same(Iterator.range(0, 3), 'destructure-leaf-patched');
  } finally {
    if (had) I.range = original;
    else delete I.range;
  }
});

// a patch through a COMPUTED const-aliased key (`const k = 'from'; Array[k] = ...`) names the
// same slot as a dotted patch; the resolver follows the const binding, so the later read keeps
// the user patch instead of routing to the polyfill. patch AND restore go through the const-key
// so `Array.from` is only ever touched via the path under test - a dotted restore would mark the
// slot mutated on its own and mask whether the const-key shape is the thing detected
QUnit.test('mutated-statics: computed const-key mutation wins over substitution', assert => {
  const key = 'from';
  const had = 'from' in Array;
  const original = Array[key];
  Array[key] = function patched() {
    return 'cck-patched';
  };
  try {
    assert.same(Array.from([1]), 'cck-patched');
  } finally {
    if (had) Array[key] = original;
    else delete Array[key];
  }
});

// the same const-key resolution applies when the patch arrives through Object.defineProperty
// with a const-aliased key argument (restored through the same key)
QUnit.test('mutated-statics: defineProperty const-key mutation wins over substitution', assert => {
  const key = 'fromEntries';
  const original = Object[key];
  Object.defineProperty(Object, key, {
    value: function patched() { return 'dp-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.fromEntries([['a', 1]]), 'dp-patched');
  } finally {
    Object[key] = original;
  }
});

// a wrapper-fronted namespace (`(0, Object).assign(...)`, a common minified shape) still
// resolves to the global Object, so the assign-installed patch wins over the substitution.
// restore through a computed key so the slot is only ever touched via untracked-by-the-old-code
// shapes - a dotted restore would mark it mutated and mask the wrapper-peel under test
QUnit.test('mutated-statics: wrapper-fronted assign mutation wins over substitution', assert => {
  const key = 'fromAsync';
  const had = 'fromAsync' in Array;
  const original = Array[key];
  (0, Object).assign(Array, { fromAsync: function patched() { return 'wf-patched'; } });
  try {
    assert.same(Array.fromAsync([1]), 'wf-patched');
  } finally {
    if (had) Array[key] = original;
    else delete Array[key];
  }
});

// a monkey-patched static routes every surface through one constructor object: the patch,
// the member read, the destructure extraction and the in-check all observe the same value
QUnit.test('mutated-statics: mutated static routes all surfaces through one object', assert => {
  const orig = Iterator.from;
  Iterator.from = function () { return 'patched'; };
  try {
    assert.same(Iterator.from(0), 'patched');
    const { from } = Iterator;
    assert.same(from(0), 'patched');
    assert.true('from' in Iterator);
  } finally {
    Iterator.from = orig;
  }
});

// the patch flows through aliasing and class inheritance off the routed constructor
QUnit.test('mutated-statics: mutated static flows through alias and super', assert => {
  const orig = Iterator.from;
  Iterator.from = function () { return 'flow'; };
  try {
    const I = Iterator;
    assert.same(I.from(0), 'flow');
    class K extends Iterator {
      static make() { return super.from(0); }
    }
    assert.same(K.make(), 'flow');
  } finally {
    Iterator.from = orig;
  }
});

// popular shim patterns at runtime: the mutated key's entry is imported up front
// (polyfill-then-patch), so a guard finds the key PRESENT on the routed constructor and the
// shim stays dead code - on every target, including engines missing the global natively
QUnit.test('mutated-statics: guarded shims stay dead on the enriched constructor', assert => {
  Iterator.from ||= function () { return 'dead-shim'; };
  assert.same(Iterator.from([5].values()).next().value, 5);
  Promise.allSettled = Promise.allSettled || function () { return 'dead-shim'; };
  assert.same(typeof Promise.allSettled, 'function');
  return Promise.allSettled([Promise.resolve(7)]).then(rs => {
    assert.same(rs[0].value, 7);
  });
});

/* eslint-disable es/no-nonstandard-map-properties -- the or-shim pattern targets a deliberately missing key */
QUnit.test('mutated-statics: or-shim on a missing key assigns and serves the shim', assert => {
  Map.customShimKey = Map.customShimKey || function () { return 'served'; };
  try {
    assert.same(Map.customShimKey(), 'served');
  } finally {
    delete Map.customShimKey;
  }
});
/* eslint-enable es/no-nonstandard-map-properties -- end of the missing-key shim pattern */

// a prototype patch lands on the ponyfill prototype that routed instances actually use
/* eslint-disable es/no-nonstandard-iterator-prototype-properties, no-extend-native -- the prototype patch IS the case under test */
QUnit.test('mutated-statics: prototype patch flows through routed instances', assert => {
  Iterator.prototype.customDrop = function () { return 'proto-patch'; };
  try {
    assert.same(Iterator.from([1].values()).customDrop(), 'proto-patch');
  } finally {
    delete Iterator.prototype.customDrop;
  }
});
/* eslint-enable es/no-nonstandard-iterator-prototype-properties, no-extend-native -- end of the prototype-patch case */

// the up-front instance-entry import pins the CORE-JS implementation: a third-party
// prototype patch is not adopted, dispatch helpers keep serving the real polyfill
QUnit.test('mutated-statics: prototype patch does not displace the instance polyfill', assert => {
  /* eslint-disable no-extend-native -- the prototype patch IS the case under test */
  const had = 'at' in String.prototype;
  const orig = String.prototype.at;
  String.prototype.at = function () { return 'bogus'; };
  try {
    assert.same('abc'.at(0), 'a');
  } finally {
    if (had) String.prototype.at = orig;
    else delete String.prototype.at;
  }
  /* eslint-enable no-extend-native -- end of the prototype-patch case */
});

// a whole-constructor replacement on the global object owns EVERY read surface: bare
// constructor references re-route through the global-object binding, so the file-wide
// replacement constructs where a module-cached ponyfill binding would have ignored it
QUnit.test('mutated-statics: ctor-slot replacement owns bare constructor reads', assert => {
  const orig = globalThis.Map;
  function FakeMap() { this.fake = true; }
  globalThis.Map = FakeMap;
  try {
    const m = new Map([[1, 2]]);
    // eslint-disable-next-line es/no-nonstandard-map-prototype-properties -- the shim marker IS the case under test
    assert.true(m.fake);
    assert.true(m instanceof FakeMap);
  } finally {
    globalThis.Map = orig;
  }
});

// an optional-member delete is a mutation like any other: it routes through the same
// constructor object the reads use, so the pair stays consistent
/* eslint-disable es/no-nonstandard-map-properties -- the custom-key mutation IS the case under test */
QUnit.test('mutated-statics: optional delete routes through the constructor', assert => {
  Map.customOptDel = 7;
  assert.same(Map.customOptDel, 7);
  delete Map?.customOptDel;
  assert.false('customOptDel' in Map);
});
/* eslint-enable es/no-nonstandard-map-properties -- end of the optional-delete case */

// the ctor-slot replacement test above mutates `globalThis.Map`, making (globalThis, Map)
// a mutated pair FILE-WIDE: bare writes and through-global reads then share the LIVE slot,
// so a key patch lands exactly where the raw destructure read looks
QUnit.test('mutated-statics: slot-mutated ctor shares one object across surfaces', assert => {
  function patched() { return 'patched'; }
  Map.groupBy = patched;
  try {
    assert.same(Map.groupBy(), 'patched');
    const { Map: { groupBy: rawRead } } = globalThis;
    assert.same(rawRead, patched);
  } finally {
    delete Map.groupBy;
  }
});

// a NESTED proxy-hop value read of the slot-mutated ctor anchors on the raw global member:
// the user's replacement wins through the hop exactly like the flat destructure above
QUnit.test('mutated-statics: slot-mutated ctor wins through a nested proxy hop', assert => {
  const orig = globalThis.Map;
  function ShimMap() { return null; }
  globalThis.Map = ShimMap;
  try {
    const { self: { Map: viaHop } } = globalThis;
    assert.same(viaHop, ShimMap);
  } finally {
    globalThis.Map = orig;
  }
});

// the nested-mirror default (a param default forced alive by a polyfill sibling) swaps to a
// synthesized object: the mutated slot stays a raw global member (the shim constructs), the
// sibling still extracts its ponyfill. the sibling pair must be UNTAINTED file-wide - a
// mutated sibling pair (this file deletes `Array.from`) correctly declines extraction and
// keeps the whole default raw, which strands the sibling on engines missing the native
QUnit.test('mutated-statics: mirror passthrough keeps the slot-mutated ctor', assert => {
  const orig = globalThis.Map;
  function ShimMap() { this.shim = true; }
  globalThis.Map = ShimMap;
  try {
    function read({ Object: { entries }, Map: M } = globalThis) { return [entries({ a: 1 }), new M()]; }
    const [pairs, m] = read();
    assert.deepEqual(pairs, [['a', 1]]);
    assert.true(m.shim);
  } finally {
    globalThis.Map = orig;
  }
});

// with NO slot mutation on the ctor, the nested-proxy destructure normalizes to a flat
// read off the routed constructor - the patch and the read share one object, so the
// patched static is visible through the destructured binding
QUnit.test('mutated-statics: nested-proxy destructure reads through the routed constructor', assert => {
  function patched() { return 'patched'; }
  Iterator.zip = patched;
  try {
    const { Iterator: { zip: routedRead } } = globalThis;
    assert.same(routedRead, patched);
  } finally {
    delete Iterator.zip;
  }
});

// A value-fan mutation receiver names a built-in through any branch. each shape (ternary / logical /
// inline chain-assign / computed const-key) must be detected so the patch and the read route through the
// SAME ponyfill constructor and the patch wins. patch AND restore go through the path under test - a
// dotted restore would mark the slot on its own and make the substitution-bail vacuous. a distinct,
// otherwise-unmutated static per test keeps each fail-before keyed on exactly its shape's detection.
QUnit.test('mutated-statics: ternary-receiver mutation wins over substitution', assert => {
  function patched() { return 'ternary-win'; }
  const useP = true;
  const original = Promise.any;
  (useP ? Promise : Map).any = patched;
  try {
    assert.same(Promise.any([]), 'ternary-win');
  } finally {
    (useP ? Promise : Map).any = original;
  }
});

QUnit.test('mutated-statics: logical-receiver mutation wins over substitution', assert => {
  function patched() { return 'logical-win'; }
  const original = Promise.all;
  // a falsy left operand (`[].pop()` is undefined) selects the Promise branch at runtime; the gate fans
  // both branches statically
  ([].pop() || Promise).all = patched;
  try {
    assert.same(Promise.all([]), 'logical-win');
  } finally {
    ([].pop() || Promise).all = original;
  }
});

QUnit.test('mutated-statics: inline chain-assign receiver mutation wins over substitution', assert => {
  function patched() { return 'chain-assign-win'; }
  const original = Promise.race;
  const box = {};
  (box.recv = Promise).race = patched;
  try {
    assert.same(box.recv, Promise);
    assert.same(Promise.race([]), 'chain-assign-win');
  } finally {
    (box.recv = Promise).race = original;
  }
});

QUnit.test('mutated-statics: computed const-key container mutation wins over substitution', assert => {
  function patched() { return 'computed-key-win'; }
  const registry = { Promise };
  const ckey = 'Promise';
  const original = Promise.try;
  registry[ckey].try = patched;
  try {
    assert.same(Promise.try(() => 0), 'computed-key-win');
  } finally {
    registry[ckey].try = original;
  }
});

// A namespace reached as a proxy-global member (`globalThis.Reflect`, `self.Object`) names the same
// global namespace, so the mutator call is detected; `Reflect.set(target, key, value, RECEIVER)` writes
// to the receiver, the real mutation host. patch and restore reuse the shape.
QUnit.test('mutated-statics: proxy-global namespace mutator wins over substitution', assert => {
  function patched() { return 'namespace-win'; }
  const original = Promise.withResolvers;
  globalThis.Reflect.set(Promise, 'withResolvers', patched);
  try {
    assert.same(Promise.withResolvers(), 'namespace-win');
  } finally {
    globalThis.Reflect.set(Promise, 'withResolvers', original);
  }
});

QUnit.test('mutated-statics: Reflect.set receiver-host mutation wins over substitution', assert => {
  function patched() { return 'receiver-win'; }
  const original = Promise.reject;
  Reflect.set({}, 'reject', patched, Promise);
  try {
    assert.same(Promise.reject('x'), 'receiver-win');
  } finally {
    Reflect.set({}, 'reject', original, Promise);
  }
});

// An `Object.assign` source given as a const-bound variable resolves to its object-literal init, so the
// copied static key is detected like an inline literal source. patch and restore reuse the variable shape.
QUnit.test('mutated-statics: variable-source Object.assign mutation wins over substitution', assert => {
  function patched() { return 'var-source-win'; }
  const original = Iterator.concat;
  const patchSrc = { concat: patched };
  Object.assign(Iterator, patchSrc);
  try {
    assert.same(Iterator.concat([]), 'var-source-win');
  } finally {
    const restoreSrc = { concat: original };
    Object.assign(Iterator, restoreSrc);
  }
});

// `delete Array.from; Array.from?.(...)` keeps the native member (the substitution bails), so the
// optional `?.` MUST survive - dropping it would call the deleted slot unconditionally and throw where
// the native chain short-circuits to undefined. asserts the chain yields undefined rather than throwing.
QUnit.test('mutated-statics: deleted static keeps its optional short-circuit', assert => {
  const original = Array.from;
  delete Array.from;
  try {
    const r = Array.from?.([1]).at(0);
    assert.same(r, undefined);
  } finally {
    Array.from = original;
  }
});

// a PATCHED inherited static reached via `this.X?.()` in a static method with two trailing
// instance polyfills: the optional must dispatch to the patch (no deopt to the pure static),
// while the trailing methods still polyfill against the patch's result. live oracle for the
// chain-combine keeping ownership of a mutated inherited static (bailing it stranded the
// trailing polys as overlapping rewrites - a composition crash at transform time)
QUnit.test('mutated-statics: patched inherited static through optional this-call keeps the patch', assert => {
  const had = 'from' in Array;
  const original = Array.from;
  Array.from = function patched() {
    return [8, [9]];
  };
  try {
    class C extends Array {
      static make() {
        return this.from?.([1, 2]).flat().at(-1);
      }
    }
    assert.same(C.make(), 9);
  } finally {
    if (had) Array.from = original;
    else delete Array.from;
  }
});

// a LOCAL Object shadow silences only the BARE mutator callee: a proxy-global chain still names
// the REAL namespace, so a patch through it is recorded and the later read keeps the user patch
// instead of routing to the receiver-less pure helper. Math.sumPrecise: patched by no sibling
// test; both namespaces are shadowed locally, so EVERY mutator here (patch and restore) reaches
// the real namespace only through the proxy-global chain - a bare dotted restore (or a `delete`)
// would self-mark the slot and mask whether the proxy chain is the thing detected
QUnit.test('mutated-statics: proxy-global mutator with a local namespace shadow keeps the patch', assert => {
  const Object = { defineProperty() { return 'local-noop'; } };
  const Reflect = { deleteProperty() { return 'local-noop'; } };
  assert.same(Object.defineProperty(), 'local-noop');
  assert.same(Reflect.deleteProperty(), 'local-noop');
  const had = 'sumPrecise' in Math;
  const original = Math.sumPrecise;
  globalThis.Object.defineProperty(Math, 'sumPrecise', {
    value: function patched() { return 'proxy-shadow-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Math.sumPrecise([1, 2]), 'proxy-shadow-patched');
  } finally {
    if (had) {
      globalThis.Object.defineProperty(Math, 'sumPrecise', { value: original, configurable: true, writable: true });
    } else globalThis.Reflect.deleteProperty(Math, 'sumPrecise');
  }
});

// a COMPUTED const-aliased mutator callee (`Object[dp]` over `const dp = 'defineProperty'`) names
// the same mutator as the dotted form, so the patch records and the read keeps it. Object.groupBy:
// patched by no sibling test; the restore stays on the COMPUTED-callee channel - a bare `delete`
// would self-mark the slot and mask whether the computed form is the thing detected
QUnit.test('mutated-statics: computed mutator callee keeps the patch', assert => {
  const dp = 'defineProperty';
  const del = 'deleteProperty';
  const had = 'groupBy' in Object;
  const original = Object.groupBy;
  Object[dp](Object, 'groupBy', {
    value: function patched() { return 'computed-callee-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.groupBy([1], it => it), 'computed-callee-patched');
  } finally {
    if (had) {
      Object[dp](Object, 'groupBy', { value: original, configurable: true, writable: true });
    } else Reflect[del](Object, 'groupBy');
  }
});

// a SEQUENCE-wrapped write host over a raw `.window` hop with a POLYFILLABLE ctor leaf: the
// write-target collapse must peel the sequence tail and drop the hop - `window` does not exist
// in Node, so an uncollapsed host is an undefined write target (TypeError at the patch). the
// slot restores through the same sequence-wrapped shape so only the path under test touches it
QUnit.test('mutated-statics: SE-tail write host ctor slot collapses (runs without window in Node)', assert => {
  // opaque key: substituted reads yield the pure ctor by the pure-flavor contract, so the REAL
  // global slot the collapsed write lands on is observed through a non-resolvable computed key
  const key = ['Weak', 'Set'].join('');
  const had = key in globalThis;
  const original = globalThis[key];
  let c = 0;
  (c++, globalThis.window).WeakSet = function patched() { return null; };
  try {
    assert.same(c, 1);
    assert.same(globalThis[key].name, 'patched');
  } finally {
    if (had) (0, globalThis.window).WeakSet = original;
    else delete (0, globalThis.window).WeakSet;
  }
});

// a ctor-slot mutation through ONE global-proxy alias must win for value reads through ANY
// other alias - the proxy names alias the same object, so the pre-pass canonicalizes the
// mutated key and the read keeps the raw proxy member instead of the pure import. `self` is
// pure-polyfilled, so both the write and the read run on Node and browsers alike
QUnit.test('mutated-statics: cross-alias slot mutation (self write, globalThis read)', assert => {
  const had = 'AggregateError' in globalThis;
  const original = globalThis.AggregateError;
  function Shim() { return null; }
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
  self.AggregateError = Shim;
  try {
    const { AggregateError } = globalThis;
    assert.same(AggregateError, Shim);
  } finally {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    if (had) self.AggregateError = original;
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    else delete self.AggregateError;
  }
});

// reverse direction: a `globalThis` slot write must reach a destructure read through `self`
QUnit.test('mutated-statics: cross-alias slot mutation (globalThis write, self read)', assert => {
  const had = 'WeakMap' in globalThis;
  const original = globalThis.WeakMap;
  function Shim() { return null; }
  globalThis.WeakMap = Shim;
  try {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    const { WeakMap: Read } = self;
    assert.same(Read, Shim);
  } finally {
    if (had) globalThis.WeakMap = original;
    else delete globalThis.WeakMap;
  }
});

// a delete through one alias must keep the in-check through another alias DYNAMIC: the
// as-if-polyfilled fold to `true` would contradict the runtime state the delete created
QUnit.test('mutated-statics: cross-alias delete keeps the in-check dynamic', assert => {
  const had = 'AggregateError' in globalThis;
  const original = globalThis.AggregateError;
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
  delete self.AggregateError;
  try {
    assert.false('AggregateError' in globalThis);
  } finally {
    // restore through the SAME alias channel: a `globalThis` write here would itself record
    // the canonical key and mask the cross-alias misses this family exists to catch
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    if (had) self.AggregateError = original;
  }
});

// property reads THROUGH a replaced ctor slot are the shim's own: substituting pure statics
// behind the slot would silently undo the user's replacement. bare reads follow the live
// slot too (with a ponyfill backstop for an ABSENT slot); explicit reads through the global
// object stay raw with no backstop - a guard probes the real engine state there
QUnit.test('mutated-statics: statics behind a replaced ctor slot are the shim own', assert => {
  const had = 'Promise' in globalThis;
  const original = globalThis.Promise;
  function Shim() { return null; }
  Shim.resolve = function () { return 'shim-resolve'; };
  globalThis.Promise = Shim;
  try {
    const { resolve } = globalThis.Promise;
    assert.same(resolve(), 'shim-resolve');
    // a static the shim does NOT provide reads undefined - an always-defined pure
    // substitution here would diverge from the untranspiled source
    assert.same(globalThis.Promise.try, undefined);
    assert.same('try' in globalThis.Promise, false);
  } finally {
    if (had) globalThis.Promise = original;
  }
});

// with the slot ABSENT (engine without the native), a bare read serves the ponyfill
// backstop instead of crashing on the undefined slot - and a bare static write lands on
// the SAME backstop object, so the patch-read pair stays coherent. a live slot always wins
QUnit.test('mutated-statics: absent ctor slot serves the ponyfill backstop', assert => {
  const had = 'Promise' in globalThis;
  const original = globalThis.Promise;
  let served;
  delete globalThis.Promise;
  try {
    served = Promise.resolve(7);
    /* eslint-disable es/no-nonstandard-promise-properties -- the custom-key patch IS the case under test */
    Promise.customBackstop = 'installed';
    assert.same(Promise.customBackstop, 'installed');
    delete Promise.customBackstop;
    /* eslint-enable es/no-nonstandard-promise-properties -- end of the custom-key patch case */
  } finally {
    if (had) globalThis.Promise = original;
  }
  return served.then(value => assert.same(value, 7));
});

// a replaced `Symbol` slot makes its keys the user's OWN values, not the well-known
// symbols: the key read must go through the live slot instead of the symbol helper
QUnit.test('mutated-statics: replaced Symbol slot keys read through the slot', assert => {
  const original = globalThis.Symbol;
  globalThis.Symbol = { iterator: '@@fake' };
  try {
    const obj = { '@@fake': 42 };
    assert.same(obj[Symbol.iterator], 42);
  } finally {
    globalThis.Symbol = original;
  }
});

// a DELETED slot is a mutation too: the bare constructor read follows the now-empty slot
// into the ponyfill BACKSTOP (an absent slot IS the missing-native case), instead of
// crashing on the undefined slot; the cross-alias delete channel taints the same key
QUnit.test('mutated-statics: deleted slot serves the backstop to bare constructor reads', assert => {
  const had = 'AggregateError' in globalThis;
  const original = globalThis.AggregateError;
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
  delete self.AggregateError;
  try {
    const err = new AggregateError([], 'backstopped');
    assert.same(err.message, 'backstopped');
  } finally {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    if (had) self.AggregateError = original;
  }
});

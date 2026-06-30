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
  // eslint-disable-next-line logical-assignment-operators -- the classic `X = X || shim` pattern under test
  Promise.allSettled = Promise.allSettled || function () { return 'dead-shim'; };
  assert.same(typeof Promise.allSettled, 'function');
  return Promise.allSettled([Promise.resolve(7)]).then(rs => {
    assert.same(rs[0].value, 7);
  });
});

/* eslint-disable es/no-nonstandard-map-properties -- the or-shim pattern targets a deliberately missing key */
QUnit.test('mutated-statics: or-shim on a missing key assigns and serves the shim', assert => {
  // eslint-disable-next-line logical-assignment-operators -- the classic `X = X || shim` pattern under test
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

// a whole-constructor replacement on the global object does not displace OUR ponyfill:
// the file's own constructor references are module-cached pure bindings
QUnit.test('mutated-statics: ctor-slot replacement does not displace the ponyfill', assert => {
  const orig = globalThis.Map;
  globalThis.Map = function FakeMap() { return null; };
  try {
    const m = new Map([[1, 2]]);
    assert.same(m.get(1), 2);
    assert.true(m instanceof Map);
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
// a mutated pair FILE-WIDE: a destructure off that slot keeps the REAL global read (a
// user-installed ctor replacement must win there), so the key patch routed to the ponyfill
// stays invisible through it on every runtime
QUnit.test('mutated-statics: slot-mutated ctor keeps the raw global read in destructure', assert => {
  function patched() { return 'patched'; }
  Map.groupBy = patched;
  try {
    assert.same(Map.groupBy(), 'patched');
    const { Map: { groupBy: rawRead } } = globalThis;
    assert.notSame(rawRead, patched);
  } finally {
    delete Map.groupBy;
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

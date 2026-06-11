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

// Monkey-patched statics live in their OWN module: the mutation pre-pass is per-FILE, so a
// patch here would poison the key for every sibling test in a shared module and reroute
// their emissions (an unpolyfilled native read breaks engines missing the static natively).
// each test restores what it patches - the shared runtime stays clean

// alias-mutation canonicalization at runtime: a patch through a const alias must win over
// the polyfill substitution for reads of the same static (restored afterwards)
QUnit.test('mutated-statics: alias mutation wins over substitution', assert => {
  const A = Array;
  const original = A.of;
  A.of = function patched() {
    return 'patched';
  };
  assert.same(A.of(1), 'patched');
  assert.same(Array.of(2), 'patched');
  A.of = original;
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

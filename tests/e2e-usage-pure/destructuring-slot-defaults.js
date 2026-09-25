// a slot DEFAULT takes over only where the slot holds `undefined`, and a binding whose default may
// not take over holds the slot's own value: a key the literal lacks but its prototype still lends, a
// pattern `__proto__` key reading the prototype itself, a bare `undefined` that names a binding.
// none of them reads as the default's constructor, polyfilled or not
QUnit.test('slot defaults: an inherited key holds the prototype member', assert => {
  const { constructor: C = Array } = {};
  assert.same(C, Object);
  assert.same(typeof C.from, 'undefined');
  const { toString: T = Array } = {};
  assert.same(typeof T.fromAsync, 'undefined');
});

QUnit.test('slot defaults: a pattern __proto__ key reads the prototype', assert => {
  const { __proto__: P = Array } = {};
  assert.same(P, Object.prototype);
  assert.same(typeof P.of, 'undefined');
});

QUnit.test('slot defaults: a bare undefined may name a binding', assert => {
  // eslint-disable-next-line no-shadow-restricted-names -- the shadowing parameter is the case under test
  function pick(undefined) {
    const [A = Array] = [undefined];
    return A.of(1);
  }
  assert.same(pick({ of: () => 'PARAMETER' }), 'PARAMETER');
  // ... and a spelled-out `void` leaves the slot undefined, so the default serves the read
  // eslint-disable-next-line no-void -- the spelled-out `void` is the case under test
  const [V = Array] = [void 0];
  assert.deepEqual(V.of(2), [2]);
});

// ... and a defaulted slot off a REASSIGNED name renders no identity guard: the name keeps the whole
// entry of what it may hold, so the slot reads the static rather than taking the default
QUnit.test('slot defaults: a reassigned receiver keeps its statics for a defaulted slot', assert => {
  const pick = [].length === 0;
  let source = Set;
  if (pick) source = Map;
  const { groupBy = null } = source;
  assert.same(typeof groupBy, 'function');
});

// a slot a SPREAD ahead of it may shift proves nothing: a destructured parameter's leaf, a
// pattern-bound callee, a key or a container a call-site pattern write reaches reads what the
// runtime puts there - with nothing spread, the slot the literal spells is not the one it reads,
// and the static read through it throws as it does untranspiled
QUnit.test('slot defaults: a spread-shifted slot reads the runtime element', assert => {
  const none = [];
  const one = [{ K: Map }];
  function leaf([, held]) {
    return held;
  }
  assert.throws(() => leaf([...none, { K: Map }]).K.groupBy([], String), TypeError);
  assert.same(typeof leaf([...one, { K: Map }]).K.groupBy, 'function');
  const [, make] = [...none, () => Array];
  assert.throws(() => make().from('a'), TypeError);
  function keys() {
    return [...none, 'fromEntries'];
  }
  let key = 'kept';
  [, key] = keys();
  assert.throws(() => Object[key]([['k', 1]]), TypeError);
  function hops() {
    return [...none, { K: Math }];
  }
  let hop = { K: Math };
  [, hop] = hops();
  assert.throws(() => hop.K.sumPrecise([1, 2]), TypeError);
});

// a level DEFAULT that selects a call's value, spells a container literal above the leaf, or reads a
// member off a call serves the static read through it where the default fires - and the leaf's own
// value where it does not; the call runs only when the default fires
QUnit.test('slot defaults: a call, container or member default serves the static read through it', assert => {
  let calls = 0;
  function make() {
    calls++;
    return Map;
  }
  function holder() {
    calls++;
    return { P: Promise };
  }
  function selected(source) {
    const { M: { groupBy } = make() || Set } = source;
    return groupBy;
  }
  function contained(source) {
    const { A: { B: { fromEntries } } = { B: Object } } = source;
    return fromEntries;
  }
  function member(source) {
    const { A: { withResolvers } = holder().P } = source;
    return withResolvers;
  }
  assert.same(selected({ M: { groupBy: 1 } }), 1);
  assert.same(member({ A: { withResolvers: 2 } }), 2);
  assert.same(calls, 0);
  assert.same(typeof selected({}), 'function');
  assert.same(typeof member({}), 'function');
  assert.same(calls, 2);
  assert.same(contained({ A: { B: { fromEntries: 3 } } }), 3);
  assert.deepEqual(contained({})([['k', 1]]), { k: 1 });
  // (a static every Node carries natively: the post-only leg reads Babel's lowered default, which it
  // is blind to by design, while the stripped realms check the polyfill)
  try {
    throw {};
  } catch ({ A: { B: { trunc } } = { B: Math } }) {
    assert.same(trunc(1.5), 1);
  }
});

// an instance member read through a CALL default dispatches on the call's value, running the call
// once and only where the default fires; a default the pairing proves dead reads the paired value
QUnit.test('slot defaults: a call default dispatches the instance member read through it', assert => {
  let calls = 0;
  function make() {
    calls++;
    return [1, 2];
  }
  function read(source) {
    const { A: { at } = make() } = source;
    return at;
  }
  assert.same(read({ A: { at: 4 } }), 4);
  assert.same(calls, 0);
  assert.same(read({}).call([5, 6], -1), 6);
  assert.same(calls, 1);
  const { A: { with: replace } = make() } = { A: [7, 8] };
  assert.deepEqual(replace.call([1, 2], 0, 9), [9, 2]);
  assert.same(calls, 1);
});

// a static read off a conditionally reassigned name in the MIDDLE of a pattern still takes its polyfill
QUnit.test('slot defaults: a middle static off a reassignable name is served', assert => {
  let Held = Iterator;
  if (!assert) Held = {};
  const { length, from, name } = Held;
  assert.same(typeof length, 'number');
  assert.deepEqual(from([1, 2]).toArray(), [1, 2]);
  assert.same(typeof name, 'string');
});

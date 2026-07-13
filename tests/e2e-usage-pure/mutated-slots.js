// SLOT mutations live in their OWN module: a slot write of name X DEOPTS X for the whole
// file (usage-pure leaves every X read verbatim), so these tests must not share a module
// with the static-canon tests - a raw read of an engine-missing native would break them.
// Per-name discipline inside THIS file: a bare value read is asserted only for globals every
// target engine provides (Map / Set / Number / Error / ...); engine-missing names (Promise /
// Symbol / AggregateError / Async*) either pre-create the slot before a bare write (a strict
// write to a MISSING global ReferenceErrors), keep member-form access, or assert the
// native-faithful crash itself. every test restores what it writes - absent-before slots are
// DELETED back (an `if (had)`-only restore would leak an own `undefined` property)

// a whole-constructor replacement on the global object owns EVERY read surface: bare
// constructor references re-route through the global-object binding, so the file-wide
// replacement constructs where a module-cached ponyfill binding would have ignored it
QUnit.test('mutated-slots: ctor-slot replacement owns bare constructor reads', assert => {
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

// a NESTED proxy-hop value read of the slot-mutated ctor anchors on the raw global member:
// the user's replacement wins through the hop exactly like the flat destructure above
QUnit.test('mutated-slots: slot-mutated ctor wins through a nested proxy hop', assert => {
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
// mutated sibling pair would correctly decline extraction and keep the whole default raw,
// which would strand the sibling on engines missing the native (why Object stays untouched
// in this module)
QUnit.test('mutated-slots: mirror passthrough keeps the slot-mutated ctor', assert => {
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

// a SEQUENCE-wrapped write host over a raw `.window` hop with a POLYFILLABLE ctor leaf: the
// write-target collapse must peel the sequence tail and drop the hop - `window` does not exist
// in Node, so an uncollapsed host is an undefined write target (TypeError at the patch). the
// slot restores through the same sequence-wrapped shape so only the path under test touches it
QUnit.test('mutated-slots: SE-tail write host ctor slot collapses (runs without window in Node)', assert => {
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
QUnit.test('mutated-slots: cross-alias slot mutation (self write, globalThis read)', assert => {
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
QUnit.test('mutated-slots: cross-alias slot mutation (globalThis write, self read)', assert => {
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
QUnit.test('mutated-slots: cross-alias delete keeps the in-check dynamic', assert => {
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
// behind the slot would silently undo the user's replacement. the whole name is deopted -
// bare and through-the-global reads alike stay raw on the live slot
QUnit.test('mutated-slots: statics behind a replaced ctor slot are the shim own', assert => {
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
    else delete globalThis.Promise;
  }
});

// a DEOPTED name is native-faithful on the absent slot too: the raw read crashes exactly
// like the untranspiled source (no ponyfill rescue), and the restored slot serves raw reads
QUnit.test('mutated-slots: deopted slot reads are native-faithful', assert => {
  const had = 'Promise' in globalThis;
  const original = globalThis.Promise;
  delete globalThis.Promise;
  try {
    // the deleted slot reads exactly like the untranspiled source would - no ponyfill rescue
    assert.throws(() => Promise.resolve(7), ReferenceError);
  } finally {
    if (had) globalThis.Promise = original;
  }
  // the restored slot serves raw reads again - the deopted name follows the live binding.
  // engines without the native never had a slot to restore, so the raw tail is theirs to skip
  if (!had) return undefined;
  return Promise.resolve(7).then(value => assert.same(value, 7));
});

// a replaced `Symbol` slot makes its keys the user's OWN values, not the well-known
// symbols: the key read must go through the live slot instead of the symbol helper
QUnit.test('mutated-slots: replaced Symbol slot keys read through the slot', assert => {
  const had = 'Symbol' in globalThis;
  const original = globalThis.Symbol;
  globalThis.Symbol = { iterator: '@@fake' };
  try {
    const obj = { '@@fake': 42 };
    assert.same(obj[Symbol.iterator], 42);
  } finally {
    if (had) globalThis.Symbol = original;
    else delete globalThis.Symbol;
  }
});

// a DELETED slot is a mutation too: the bare constructor read follows the now-empty slot
// into the ponyfill BACKSTOP (an absent slot IS the missing-native case), instead of
// crashing on the undefined slot; the cross-alias delete channel taints the same key
QUnit.test('mutated-slots: slot deleted through an alias deopts bare reads', assert => {
  const had = 'AggregateError' in globalThis;
  const original = globalThis.AggregateError;
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
  delete self.AggregateError;
  try {
    // the delete through ANY proxy alias deopts the name - the bare read stays raw and
    // crashes on the emptied slot exactly like the untranspiled source
    assert.throws(() => new AggregateError([], 'raw'), ReferenceError);
  } finally {
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- the `self` alias is the test subject
    if (had) self.AggregateError = original;
  }
});

// a whole-slot replacement owns `Ctor.prototype` reads too: the bare form must read the
// SHIM's prototype (the pristine `_Map.prototype` swap silently dropped it), matching the
// through-proxy spelling of the same access
QUnit.test('mutated-slots: replaced slot serves bare prototype reads', assert => {
  const original = globalThis.Map;
  function ShimMap() { /* empty */ }
  ShimMap.prototype.marker = () => 'shim-proto';
  globalThis.Map = ShimMap;
  try {
    // eslint-disable-next-line es/no-nonstandard-map-prototype-properties -- the shim's own prototype IS the case under test
    assert.same(Map.prototype.marker(), 'shim-proto');
  } finally {
    globalThis.Map = original;
  }
});

// a BARE reassignment (`Promise = shim`) writes the same global slot as the member form -
// later static reads route the live slot, not the pristine ponyfill
QUnit.test('mutated-slots: bare slot reassignment routes later reads', assert => {
  const had = 'Promise' in globalThis;
  const original = globalThis.Promise;
  // pre-create the slot: a strict-mode bare write to a MISSING global ReferenceErrors
  globalThis.Promise = original;
  const shim = { resolve: () => 'bluebird' };
  /* eslint-disable no-global-assign -- the bare global reassignment IS the case under test */
  Promise = shim;
  /* eslint-enable no-global-assign -- end of the bare-reassignment case */
  try {
    assert.same(Promise.resolve(1), 'bluebird');
  } finally {
    if (had) globalThis[['Pro', 'mise'].join('')] = original;
    else delete globalThis[['Pro', 'mise'].join('')];
  }
});

// a bare DESTRUCTURE-PATTERN element write (`[Set] = [shim]`) assigns the same global slot
// as the flat reassignment - later bare constructor reads route the live slot
QUnit.test('mutated-slots: pattern-element slot write routes later reads', assert => {
  const original = globalThis.Set;
  function ShimSet() { this.shimMarker = true; }
  /* eslint-disable no-global-assign -- the bare pattern-element write IS the case under test */
  [Set] = [ShimSet];
  /* eslint-enable no-global-assign -- end of the pattern-element write */
  try {
    // eslint-disable-next-line es/no-nonstandard-set-prototype-properties -- the shim's own instance marker IS the case under test
    assert.true(new Set([1]).shimMarker);
  } finally {
    // restore through a join-built key so only the shape under test marks the slot
    globalThis[['S', 'et'].join('')] = original;
  }
});

// a bare UPDATE write (`Number++`) is a read-modify-write of the same slot - later static
// reads serve the live (numeric) slot value, not the pristine ponyfill static
QUnit.test('mutated-slots: update-expression slot write routes later reads', assert => {
  const original = globalThis.Number;
  /* eslint-disable no-global-assign -- the bare update write IS the case under test */
  Number++;
  /* eslint-enable no-global-assign -- end of the bare update write */
  try {
    // the increment coerced the slot to NaN - a routed static read boxes the primitive and finds
    // nothing, while the pristine ponyfill static would still be a function
    assert.same(typeof Number.isFinite, 'undefined');
  } finally {
    // restore through a join-built key so only the shape under test marks the slot
    globalThis[['Num', 'ber'].join('')] = original;
  }
});

// a bare for-of HEAD write (`for (Error of ...)`) assigns the slot on every iteration - later
// static reads serve the assigned shim, not the extracted pure static
QUnit.test('mutated-slots: for-of head slot write routes later reads', assert => {
  const original = globalThis.Error;
  const shim = { isError: () => 'looped' };
  /* eslint-disable no-global-assign -- the bare for-of head write IS the case under test */
  for (Error of [shim]);
  /* eslint-enable no-global-assign -- end of the for-of head write */
  try {
    assert.same(Error.isError(original), 'looped');
  } finally {
    // restore through a join-built key so only the shape under test marks the slot
    globalThis[['Er', 'ror'].join('')] = original;
  }
});

// a bare guard-shim (`AsyncIterator ||= shim`) is a slot write - the name DEOPTS and the
// statement stays verbatim: on an engine missing the global it ReferenceErrors exactly like
// the untranspiled source (the whole-global shim idiom is usage-global's niche); with the
// slot present the statement and the later read run raw on the live binding
QUnit.test('mutated-slots: bare logical-assign stays verbatim', assert => {
  const had = 'AsyncIterator' in globalThis;
  const original = globalThis.AsyncIterator;
  delete globalThis[['Async', 'Iterator'].join('')];
  /* eslint-disable no-global-assign -- the bare logical-assign write IS the case under test */
  assert.throws(() => { AsyncIterator ||= { marker: () => 'or-shim' }; }, ReferenceError);
  globalThis[['Async', 'Iterator'].join('')] = { marker: () => 'pre-set' };
  AsyncIterator ||= { marker: () => 'or-shim' };
  /* eslint-enable no-global-assign -- end of the bare logical-assign case */
  try {
    assert.same(AsyncIterator.marker(), 'pre-set');
  } finally {
    if (had) globalThis[['Async', 'Iterator'].join('')] = original;
    else delete globalThis[['Async', 'Iterator'].join('')];
  }
});

// a PRESENCE guard on a deopted name probes the REAL live binding: a defined-but-falsy
// slot skips the branch, a truthy one enters it - no ponyfill ever leaks into the probe
QUnit.test('mutated-slots: presence guard probes the real binding', assert => {
  const had = 'AsyncDisposableStack' in globalThis;
  const original = globalThis.AsyncDisposableStack;
  globalThis.AsyncDisposableStack = undefined;
  let entered = false;
  if (AsyncDisposableStack) entered = true;
  try {
    assert.false(entered);
    globalThis[['Async', 'DisposableStack'].join('')] = { marker: true };
    if (AsyncDisposableStack) entered = true;
    assert.true(entered);
  } finally {
    if (had) globalThis[['Async', 'DisposableStack'].join('')] = original;
    else delete globalThis[['Async', 'DisposableStack'].join('')];
  }
});

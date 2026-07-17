// Symbol well-known - only features that work in pure mode on engines without native symbols
// NOTE: typeof checks use notSame(_, undefined) instead of typeof === 'symbol'
// because pure-mode Symbol on engines without native symbols returns strings, not real symbols

QUnit.test('Symbol.iterator exists', assert => {
  assert.notSame(Symbol.iterator, undefined);
  assert.same(typeof [][Symbol.iterator], 'function');
});

QUnit.test('Symbol.for / Symbol.keyFor', assert => {
  const s = Symbol.for('test');
  assert.same(Symbol.for('test'), s);
  assert.same(Symbol.keyFor(s), 'test');
});

QUnit.test('Symbol.toPrimitive exists', assert => {
  assert.notSame(Symbol.toPrimitive, undefined);
});

QUnit.test('Symbol.hasInstance exists', assert => {
  assert.notSame(Symbol.hasInstance, undefined);
});

QUnit.test('Symbol.toStringTag exists', assert => {
  assert.notSame(Symbol.toStringTag, undefined);
});

QUnit.test('Symbol.asyncIterator exists', assert => {
  assert.notSame(Symbol.asyncIterator, undefined);
});

QUnit.test('Symbol.metadata exists', assert => {
  assert.notSame(Symbol.metadata, undefined);
});

// Symbol.iterator `in` operator - transforms to isIterable() in usage-pure
QUnit.test('Symbol.iterator in array', assert => {
  assert.true(Symbol.iterator in [1, 2, 3]);
});

QUnit.test('Symbol.iterator in string', assert => {
  assert.true(Symbol.iterator in Object('abc'));
});

QUnit.test('Symbol.iterator in Set', assert => {
  assert.true(Symbol.iterator in new Set());
});

QUnit.test('Symbol.iterator in Map', assert => {
  assert.true(Symbol.iterator in new Map());
});

QUnit.test('Symbol.iterator in plain object', assert => {
  assert.false(Symbol.iterator in {});
});

// Symbol.iterator access (non-call) vs call - different transformations
QUnit.test('Symbol.iterator access: get method without calling', assert => {
  const arr = [1, 2, 3];
  const iterFn = arr[Symbol.iterator];
  assert.same(typeof iterFn, 'function');
  const iter = iterFn.call(arr);
  assert.deepEqual(iter.next(), { value: 1, done: false });
});

QUnit.test('Symbol.iterator call: invoke directly', assert => {
  const arr = [1, 2, 3];
  const iter = arr[Symbol.iterator]();
  const result = [];
  let step;
  while (!(step = iter.next()).done) result.push(step.value);
  assert.deepEqual(result, [1, 2, 3]);
});

QUnit.test('Symbol.iterator call on string', assert => {
  const iter = 'abc'[Symbol.iterator]();
  assert.deepEqual(iter.next(), { value: 'a', done: false });
});

QUnit.test('Symbol.iterator call on Map', assert => {
  const map = new Map([['x', 1]]);
  const iter = map[Symbol.iterator]();
  assert.deepEqual(iter.next().value, ['x', 1]);
});

// well-known Symbols beyond `iterator` - runtime DISPATCH protocols.
//
// `Symbol.hasInstance` / `Symbol.toStringTag` / `Symbol.toPrimitive` are
// intentionally NOT covered here: their mechanics rely on the runtime's NATIVE
// abstract operations (`instanceof` operator, `Object.prototype.toString`,
// `ToPrimitive`) reading the NATIVE well-known Symbol off the target. The pure
// polyfill exposes the Symbol VALUE but doesn't modify either operation; on
// engines without native Symbol support (the audience that needs the polyfill)
// the user-defined override never activates regardless of what key was used.
// Testing them in pure mode would just exercise the host runtime, not the
// polyfill - leaving polyfill-specific surfaces for the remaining tests
QUnit.test('Symbol.asyncIterator: AsyncIterator.prototype exposes the key', assert => {
  const async = assert.async();
  // `AsyncIterator.from([...])` returns an AsyncIterator whose prototype defines
  // `[Symbol.asyncIterator]` (returns the iterator itself). exercising the
  // polyfilled Symbol via the AsyncIterator entry point keeps the source
  // compatible with the e2e lint policy (no `async function*` syntax)
  const asyncIt = AsyncIterator.from(['first', 'second']);
  const reAccessed = asyncIt[Symbol.asyncIterator]();
  reAccessed.next().then(step => {
    assert.same(step.value, 'first');
    assert.false(step.done);
    async();
  });
});

// a Symbol.iterator computed KEY whose Symbol chain receiver buries an effect in a proxy-hop key
// (`arr[(globalThis[(eff(), 'self')].Symbol).iterator]`): the whole `arr[key]` collapses to the iterator
// helper, so the buried effect must be HARVESTED ahead of it (else it is silently dropped). live runtime
// oracle - fail-before drops the increment (counter stays 0); also throws in Node (raw `globalThis.self`)
QUnit.test('Symbol.iterator: effect buried in the proxy-hop Symbol receiver of a computed key is harvested', assert => {
  let count = 0;
  const arr = [10, 20];
  // eslint-disable-next-line no-sequences, @stylistic/no-extra-parens -- proxy-hop key + parenthesized Symbol receiver under test
  const iteratorMethod = arr[(globalThis[count++, 'self'].Symbol).iterator];
  assert.same(typeof iteratorMethod, 'function');
  assert.same(iteratorMethod.call(arr).next().value, 10);
  assert.same(count, 1);
});

// a FULLY-consumed pure-ctor destructure whose receiver buries an effect in a proxy-hop key
// (`const {iterator} = globalThis[(eff(), 'self')].Symbol`): the receiver collapses to the pure Symbol ctor and
// the buried effect MUST be harvested EXACTLY ONCE ahead of it - not dropped (SE-loss) nor re-run (double-
// harvest). live oracle: count must be 1. fail-before throws in Node (raw `_globalThis.self` is undefined)
QUnit.test('Symbol: pure-ctor destructure harvests a proxy-hop-key effect exactly once', assert => {
  let count = 0;
  // eslint-disable-next-line no-sequences -- the computed-key proxy-hop sequence IS the case under test
  const { iterator } = globalThis[count++, 'self'].Symbol;
  // notSame(_, undefined) not typeof==='symbol': pure-mode Symbol is a string on no-native-symbol engines
  assert.notSame(iterator, undefined);
  assert.same(count, 1);
});

// a computed destructure key EVALUATES at the capture: flipping the key variable to 'Symbol'
// AFTER the capture must not fold the alias chain - the captured binding holds the Array
// constructor, so the consumer's default fires. live oracle: a wrong-value fold binds the
// well-known symbol (never undefined) and the sentinel default never applies
QUnit.test('Symbol.iterator: post-capture key flip to Symbol does not fold the alias chain', assert => {
  const sentinel = { marker: true };
  let key = 'Array';
  const { [key]: Captured } = globalThis;
  // eslint-disable-next-line no-useless-assignment -- the post-capture dead flip IS the case under test
  key = 'Symbol';
  const { iterator: viaPostFlip = sentinel } = Captured;
  assert.same(Captured, Array);
  assert.same(viaPostFlip, sentinel);
});

// the inverse flip captures the Symbol constructor; the later same-scope write cannot reach
// the captured binding, so the chain folds and the iterator method stays live on the target
QUnit.test('Symbol.iterator: post-capture key flip away from Symbol keeps the captured chain', assert => {
  const sentinel = { marker: true };
  let key = 'Symbol';
  const { [key]: Captured } = globalThis;
  // eslint-disable-next-line no-useless-assignment -- the post-capture dead flip IS the case under test
  key = 'Array';
  const { iterator: viaPreFlip = sentinel } = Captured;
  assert.notSame(viaPreFlip, sentinel);
  assert.notSame(viaPreFlip, undefined);
  const iteratorMethod = [10, 11][viaPreFlip];
  assert.same(typeof iteratorMethod, 'function');
  assert.same(iteratorMethod.call([10, 11]).next().value, 10);
});

// a conditionally-initialized hoisted var key binds everywhere but assigns on one path: on
// the untaken path the capture reads globalThis[undefined] and the consumer destructure must
// throw natively - a fold would bind the well-known symbol and silently rescue it
QUnit.test('Symbol.iterator: conditional var key capture keeps the native throw', assert => {
  const sentinel = { marker: true };
  const cond = false;
  // eslint-disable-next-line no-var -- the hoisted conditional var IS the case under test
  if (cond) var condKey = 'Symbol';
  const { [condKey]: CondCaptured } = globalThis;
  assert.same(CondCaptured, undefined);
  assert.throws(() => {
    const { iterator: viaCondVar = sentinel } = CondCaptured;
    return viaCondVar;
  }, TypeError);
});

// a multi-hop alias captures its source BEFORE the aliasing write: the hop holds undefined
// and a member read off it must throw natively - a narrow would un-throw it
QUnit.test('Symbol.iterator: alias hop captured before the aliasing write keeps the native throw', assert => {
  // eslint-disable-next-line prefer-const -- the separate aliasing WRITE below is the case under test
  let HopSource;
  const HopAlias = HopSource;
  ({ Symbol: HopSource } = globalThis);
  assert.notSame(HopSource, undefined);
  assert.same(HopAlias, undefined);
  assert.throws(() => HopAlias.iterator, TypeError);
});

// the assignment-form constructor alias itself folds its consumer chain - the registered
// write dominates the consumer read, so the iterator method stays live on the target
QUnit.test('Symbol.iterator: assignment-form Symbol alias folds the consumer chain', assert => {
  const sentinel = { marker: true };
  let AssignedCtor;
  // eslint-disable-next-line prefer-const -- the assignment-form aliasing write is the case under test
  ({ Symbol: AssignedCtor } = globalThis);
  const { iterator: viaAssigned = sentinel } = AssignedCtor;
  assert.notSame(viaAssigned, sentinel);
  assert.notSame(viaAssigned, undefined);
  const iteratorMethod = [20, 21][viaAssigned];
  assert.same(typeof iteratorMethod, 'function');
  assert.same(iteratorMethod.call([20, 21]).next().value, 20);
});

// a for-init destructure host folds its in-body consumer like the block-hosted twin - the
// iterator method must stay live on the target inside the loop body
QUnit.test('Symbol.iterator: for-init destructure alias folds inside the loop body', assert => {
  const collected = [];
  for (const { iterator: viaForInit = 0 } = Symbol; collected.length < 1;) {
    collected.push([30, 31][viaForInit]);
  }
  assert.same(typeof collected[0], 'function');
  assert.same(collected[0].call([30, 31]).next().value, 30);
});

// a computed key that merely SPELLS 'Symbol.iterator' as a string is a plain property read,
// NOT the well-known symbol - it must not route through the iterator-method helper. live
// runtime oracle: fail-before compiled the call to a get-iterator helper that returns an
// object where native semantics throw a TypeError (undefined is not a function)
QUnit.test('Symbol.iterator: string-spelled key stays a plain property read', assert => {
  /* eslint-disable no-useless-concat, no-useless-computed-key -- string spellings under test */
  /* eslint-disable es/no-nonstandard-array-prototype-properties -- string spellings under test */
  const arr = [1, 2];
  assert.same(arr['Symbol.iterator'], undefined);
  assert.same(arr[`Symbol.${ 'iterator' }`], undefined);
  // eslint-disable-next-line unicorn/no-useless-concat -- testing
  const stringKey = 'Symbol.' + 'iterator';
  assert.same(arr[stringKey], undefined);
  assert.throws(() => arr['Symbol.iterator'](), TypeError);
  const { ['Symbol.iterator']: extracted } = arr;
  assert.same(extracted, undefined);
  assert.false('Symbol.iterator' in arr);
  /* eslint-enable no-useless-concat, no-useless-computed-key -- end of string-spelling block */
  /* eslint-enable es/no-nonstandard-array-prototype-properties -- end of string-spelling block */
});

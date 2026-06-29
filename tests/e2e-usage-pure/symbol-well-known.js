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

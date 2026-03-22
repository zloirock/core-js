// Symbol well-known — only features that work in pure mode on engines without native symbols
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

// Symbol.iterator `in` operator — transforms to isIterable() in usage-pure
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

// Symbol.iterator access (non-call) vs call — different transformations
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

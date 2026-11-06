import WeakMap from '@core-js/pure/es/weak-map';

QUnit.test('WeakMap#getOrInsert', assert => {
  const { getOrInsert } = WeakMap.prototype;
  assert.isFunction(getOrInsert);
  assert.arity(getOrInsert, 2);
  assert.name(getOrInsert, 'getOrInsert');
  assert.nonEnumerable(WeakMap.prototype, 'getOrInsert');

  const a = {};
  const b = {};

  let map = new WeakMap([[a, 2]]);
  assert.same(map.getOrInsert(a, 3), 2, 'result#1');
  assert.same(map.get(a), 2, 'map#1');
  map = new WeakMap([[a, 2]]);
  assert.same(map.getOrInsert(b, 3), 3, 'result#2');
  assert.same(map.get(a), 2, 'map#2-1');
  assert.same(map.get(b), 3, 'map#2-2');

  assert.throws(() => new WeakMap().getOrInsert(1, 1), TypeError, 'invalid key#1');
  assert.throws(() => new WeakMap().getOrInsert(null, 1), TypeError, 'invalid key#2');
  assert.throws(() => new WeakMap().getOrInsert(undefined, 1), TypeError, 'invalid key#3');
  assert.throws(() => new WeakMap().getOrInsert(), TypeError, 'invalid key#4');
  assert.throws(() => getOrInsert.call({}, a, 1), TypeError, 'non-generic#1');
  assert.throws(() => getOrInsert.call([], a, 1), TypeError, 'non-generic#2');
  assert.throws(() => getOrInsert.call(undefined, a, 1), TypeError, 'non-generic#3');
  assert.throws(() => getOrInsert.call(null, a, 1), TypeError, 'non-generic#4');
});

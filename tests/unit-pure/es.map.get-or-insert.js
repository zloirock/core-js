import Map from 'core-js-pure/es/map';
import from from 'core-js-pure/es/array/from';

QUnit.test('Map#getOrInsert', assert => {
  const { getOrInsert } = Map.prototype;
  assert.isFunction(getOrInsert);
  assert.arity(getOrInsert, 2);
  assert.name(getOrInsert, 'getOrInsert');
  assert.nonEnumerable(Map.prototype, 'getOrInsert');

  let map = new Map([['a', 2]]);
  assert.same(map.getOrInsert('a', 3), 2, 'result#1');
  assert.deepEqual(from(map), [['a', 2]], 'map#1');
  map = new Map([['a', 2]]);
  assert.same(map.getOrInsert('b', 3), 3, 'result#2');
  assert.deepEqual(from(map), [['a', 2], ['b', 3]], 'map#2');

  assert.throws(() => getOrInsert.call({}, 'a', 1), TypeError, 'non-generic#1');
  assert.throws(() => getOrInsert.call([], 'a', 1), TypeError, 'non-generic#2');
  assert.throws(() => getOrInsert.call(undefined, 'a', 1), TypeError, 'non-generic#3');
  assert.throws(() => getOrInsert.call(null, 'a', 1), TypeError, 'non-generic#4');
});

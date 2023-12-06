import Map from '@core-js/pure/actual/map';
import from from '@core-js/pure/es/array/from';

QUnit.test('Map#getOrInsertComputed', assert => {
  const { getOrInsertComputed } = Map.prototype;
  assert.isFunction(getOrInsertComputed);
  assert.arity(getOrInsertComputed, 2);
  assert.name(getOrInsertComputed, 'getOrInsertComputed');
  assert.nonEnumerable(Map.prototype, 'getOrInsertComputed');

  let map = new Map([['a', 2]]);
  assert.same(map.getOrInsertComputed('a', () => 3), 2, 'result#1');
  assert.deepEqual(from(map), [['a', 2]], 'map#1');
  map = new Map([['a', 2]]);
  assert.same(map.getOrInsertComputed('b', () => 3), 3, 'result#2');
  assert.deepEqual(from(map), [['a', 2], ['b', 3]], 'map#2');

  map = new Map([['a', 2]]);
  map.getOrInsertComputed('a', () => assert.avoid());

  map = new Map([['a', 2]]);
  map.getOrInsertComputed('b', function (key) {
    assert.same(this, undefined, 'correct handler in callback');
    assert.same(arguments.length, 1, 'correct number of callback arguments');
    assert.same(key, 'b', 'correct key in callback');
  });

  map = new Map([['a', 2]]);
  map.getOrInsertComputed(-0, key => assert.same(key, 0, 'CanonicalizeKeyedCollectionKey'));

  assert.throws(() => new Map().getOrInsertComputed('a', {}), TypeError, 'non-callable#1');
  assert.throws(() => new Map().getOrInsertComputed('a', 1), TypeError, 'non-callable#2');
  assert.throws(() => new Map().getOrInsertComputed('a', null), TypeError, 'non-callable#3');
  assert.throws(() => new Map().getOrInsertComputed('a', undefined), TypeError, 'non-callable#4');
  assert.throws(() => new Map().getOrInsertComputed('a'), TypeError, 'non-callable#5');
  assert.throws(() => getOrInsertComputed.call({}, 'a', () => 3), TypeError, 'non-generic#1');
  assert.throws(() => getOrInsertComputed.call([], 'a', () => 3), TypeError, 'non-generic#2');
  assert.throws(() => getOrInsertComputed.call(undefined, 'a', () => 3), TypeError, 'non-generic#3');
  assert.throws(() => getOrInsertComputed.call(null, 'a', () => 3), TypeError, 'non-generic#4');
});

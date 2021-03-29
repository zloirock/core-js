import Map from 'core-js-pure/full/map';

QUnit.test('Map#keyOf', assert => {
  const { keyOf } = Map.prototype;
  assert.isFunction(keyOf);
  assert.arity(keyOf, 1);
  assert.nonEnumerable(Map.prototype, 'keyOf');

  const object = {};
  const map = new Map([[1, 1], [2, 2], [3, 3], [4, -0], [5, object], [6, NaN]]);
  assert.same(map.keyOf(1), 1);
  assert.same(map.keyOf(-0), 4);
  assert.same(map.keyOf(0), 4);
  assert.same(map.keyOf(object), 5);
  assert.same(map.keyOf(4), undefined);
  assert.same(map.keyOf(-0.5), undefined);
  assert.same(map.keyOf({}), undefined);
  assert.same(map.keyOf(NaN), undefined);

  assert.throws(() => keyOf.call({}, 1), TypeError);
  assert.throws(() => keyOf.call(undefined, 1), TypeError);
  assert.throws(() => keyOf.call(null, 1), TypeError);
});

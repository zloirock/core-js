import WeakMap from '@core-js/pure/full/weak-map';

QUnit.test('WeakMap.of', assert => {
  const { of } = WeakMap;
  assert.isFunction(of);
  assert.arity(of, 0);
  const array = [];
  assert.true(of() instanceof WeakMap);
  assert.same(of([array, 2]).get(array), 2);
});

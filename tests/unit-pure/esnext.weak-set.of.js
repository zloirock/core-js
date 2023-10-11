import WeakSet from '@core-js/pure/full/weak-set';

QUnit.test('WeakSet.of', assert => {
  const { of } = WeakSet;
  assert.isFunction(of);
  assert.arity(of, 0);
  const array = [];
  assert.true(of() instanceof WeakSet);
  assert.true(of(array).has(array));
});

import from from '@core-js/pure/es/array/from';
import Map from '@core-js/pure/full/map';

QUnit.test('Map.of', assert => {
  const { of } = Map;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.true(of() instanceof Map);
  assert.deepEqual(from(of([1, 2])), [[1, 2]]);
  assert.deepEqual(from(of([1, 2], [2, 3], [1, 4])), [[1, 4], [2, 3]]);
});

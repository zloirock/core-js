import from from '@core-js/pure/es/array/from';
import Set from '@core-js/pure/full/set';

QUnit.test('Set.of', assert => {
  const { of } = Set;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.true(of() instanceof Set);
  assert.deepEqual(from(of(1)), [1]);
  assert.deepEqual(from(of(1, 2, 3, 2, 1)), [1, 2, 3]);
});

import from from 'core-js-pure/es/array/from';
import Map from 'core-js-pure/features/map';

QUnit.test('Map.of', assert => {
  const { of } = Map;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.true(Map.of() instanceof Map);
  assert.deepEqual(from(Map.of([1, 2])), [[1, 2]]);
  assert.deepEqual(from(Map.of([1, 2], [2, 3], [1, 4])), [[1, 4], [2, 3]]);
  assert.throws(() => of(1));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});

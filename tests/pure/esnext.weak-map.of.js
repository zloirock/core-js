import WeakMap from 'core-js-pure/features/weak-map';

QUnit.test('WeakMap.of', assert => {
  const { of } = WeakMap;
  assert.isFunction(of);
  assert.arity(of, 0);
  const array = [];
  assert.ok(WeakMap.of() instanceof WeakMap);
  assert.same(WeakMap.of([array, 2]).get(array), 2);
  assert.throws(() => of(1));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});

import isSealed from 'core-js-pure/features/object/is-sealed';

QUnit.test('Object.isSealed', assert => {
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isSealed(value) || true, `accept ${ value }`);
    assert.same(isSealed(value), true, `returns true on ${ value }`);
  }
  assert.same(isSealed({}), false);
});

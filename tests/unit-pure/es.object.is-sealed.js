import isSealed from '@core-js/pure/es/object/is-sealed';

QUnit.test('Object.isSealed', assert => {
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isSealed(value) || true, `accept ${ value }`);
    assert.true(isSealed(value), `returns true on ${ value }`);
  }
  assert.false(isSealed({}));
});

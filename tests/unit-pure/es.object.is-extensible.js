import isExtensible from '@core-js/pure/es/object/is-extensible';

QUnit.test('Object.isExtensible', assert => {
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.notThrows(() => isExtensible(value) || true, `accept ${ value }`);
    assert.false(isExtensible(value), `returns false on ${ value }`);
  }
  assert.true(isExtensible({}));
});

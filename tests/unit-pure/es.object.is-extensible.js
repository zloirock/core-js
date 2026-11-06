import isExtensible from 'core-js-pure/es/object/is-extensible';

QUnit.test('Object.isExtensible', assert => {
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  assert.name(isExtensible, 'isExtensible');
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.returns(() => isExtensible(value), false, `returns false on ${ value }`);
  }
  assert.true(isExtensible({}));
});

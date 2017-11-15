QUnit.test('Object.isExtensible', assert => {
  const { isExtensible } = core.Object;
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.ok((() => {
      try {
        isExtensible(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ value }`);
    assert.same(isExtensible(value), false, `returns true on ${ value }`);
  }
  assert.same(isExtensible({}), true);
});

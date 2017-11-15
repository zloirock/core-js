QUnit.test('Object.isSealed', assert => {
  const { isSealed } = core.Object;
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  const primitives = [42, 'string', false, null, undefined];
  for (const value of primitives) {
    assert.ok((() => {
      try {
        isSealed(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ value }`);
    assert.same(isSealed(value), true, `returns true on ${ value }`);
  }
  assert.same(isSealed({}), false);
});

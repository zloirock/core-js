QUnit.test('Reflect.getPrototypeOf', assert => {
  const { getPrototypeOf } = core.Reflect;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  if ('name' in getPrototypeOf) {
    assert.name(getPrototypeOf, 'getPrototypeOf');
  }
  assert.strictEqual(getPrototypeOf([]), Array.prototype);
  assert.throws(() => getPrototypeOf(42), TypeError, 'throws on primitive');
});

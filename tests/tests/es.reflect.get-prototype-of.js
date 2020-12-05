QUnit.test('Reflect.getPrototypeOf', assert => {
  const { getPrototypeOf } = Reflect;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.name(getPrototypeOf, 'getPrototypeOf');
  assert.looksNative(getPrototypeOf);
  assert.nonEnumerable(Reflect, 'getPrototypeOf');
  assert.strictEqual(getPrototypeOf([]), Array.prototype);
  assert.throws(() => getPrototypeOf(42), TypeError, 'throws on primitive');
});

QUnit.test('Function#unThis', assert => {
  const { unThis } = Function.prototype;
  assert.isFunction(unThis);
  assert.arity(unThis, 0);
  assert.name(unThis, 'unThis');
  assert.looksNative(unThis);
  assert.nonEnumerable(Function.prototype, 'unThis');
  assert.same(function () { return 42; }.unThis()(), 42);
  assert.deepEqual(Array.prototype.slice.unThis()([1, 2, 3], 1), [2, 3]);
});

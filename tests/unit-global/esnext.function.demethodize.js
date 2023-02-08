QUnit.test('Function#demethodize', assert => {
  const { demethodize } = Function.prototype;
  assert.isFunction(demethodize);
  assert.arity(demethodize, 0);
  assert.name(demethodize, 'demethodize');
  assert.looksNative(demethodize);
  assert.nonEnumerable(Function.prototype, 'demethodize');
  assert.same(function () { return 42; }.demethodize()(), 42);
  assert.deepEqual(Array.prototype.slice.demethodize()([1, 2, 3], 1), [2, 3]);
});

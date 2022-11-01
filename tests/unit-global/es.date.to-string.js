QUnit.test('Date#toString', assert => {
  const { toString } = Date.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(Date.prototype, 'toString');
  assert.same(String(new Date(NaN)), 'Invalid Date');
});

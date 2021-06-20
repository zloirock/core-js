QUnit.test('Date#getYear', assert => {
  const { getYear } = Date.prototype;
  assert.isFunction(getYear);
  assert.arity(getYear, 0);
  assert.name(getYear, 'getYear');
  assert.looksNative(getYear);
  assert.nonEnumerable(Date.prototype, 'getYear');
  const date = new Date();
  assert.same(date.getYear(), date.getFullYear() - 1900);
});

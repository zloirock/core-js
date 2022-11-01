QUnit.test('Date#setYear', assert => {
  const { setYear } = Date.prototype;
  assert.isFunction(setYear);
  assert.arity(setYear, 1);
  assert.name(setYear, 'setYear');
  assert.looksNative(setYear);
  assert.nonEnumerable(Date.prototype, 'setYear');
  const date = new Date();
  date.setYear(1);
  assert.same(date.getFullYear(), 1901);
});

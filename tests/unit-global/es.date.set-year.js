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
  const date2 = new Date();
  date2.setYear(NaN);
  assert.true(Number.isNaN(date2.getTime()), 'NaN year makes date invalid');
  const date3 = new Date();
  date3.setYear(undefined);
  assert.true(Number.isNaN(date3.getTime()), 'undefined year makes date invalid');
});

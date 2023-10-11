import setYear from '@core-js/pure/es/date/set-year';

QUnit.test('Date#setYear', assert => {
  assert.isFunction(setYear);
  const date = new Date();
  setYear(date, 1);
  assert.same(date.getFullYear(), 1901);
});

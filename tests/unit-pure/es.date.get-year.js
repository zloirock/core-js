import getYear from '@core-js/pure/es/date/get-year';

QUnit.test('Date#getYear', assert => {
  assert.isFunction(getYear);
  const date = new Date();
  assert.same(getYear(date), date.getFullYear() - 1900);
});

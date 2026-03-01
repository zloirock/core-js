import setYear from 'core-js-pure/es/date/set-year';
import isNaN from 'core-js-pure/es/number/is-nan';

QUnit.test('Date#setYear', assert => {
  assert.isFunction(setYear);
  const date = new Date();
  setYear(date, 1);
  assert.same(date.getFullYear(), 1901);
  const date2 = new Date();
  setYear(date2, NaN);
  assert.true(isNaN(date2.getTime()), 'NaN year makes date invalid');
  const date3 = new Date();
  setYear(date3, undefined);
  assert.true(isNaN(date3.getTime()), 'undefined year makes date invalid');
});

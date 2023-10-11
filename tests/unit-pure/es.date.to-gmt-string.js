import toGMTString from '@core-js/pure/es/date/to-gmt-string';

QUnit.test('Date#toGMTString', assert => {
  assert.isFunction(toGMTString);
  const date = new Date();
  assert.same(toGMTString(date), date.toUTCString());
});

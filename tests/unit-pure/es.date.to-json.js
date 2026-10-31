import toJSON from '@core-js/pure/es/date/to-json';

QUnit.test('Date#toJSON', assert => {
  assert.isFunction(toJSON);
  const date = new Date();
  assert.same(toJSON(date), date.toISOString(), 'base');
  assert.same(toJSON(new Date(NaN)), null, 'not finite');
  assert.same(toJSON({
    toISOString() {
      return 42;
    },
  }), 42, 'generic');
});

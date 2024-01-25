import now from 'core-js-pure/es/date/now';

QUnit.test('Date.now', assert => {
  assert.isFunction(now);
  assert.same(typeof now(), 'number', 'typeof');
});

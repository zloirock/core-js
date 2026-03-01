import now from 'core-js-pure/es/date/now';

QUnit.test('Date.now', assert => {
  assert.isFunction(now);
  assert.name(now, 'now');
  assert.arity(now, 0);
  assert.same(typeof now(), 'number', 'typeof');
});

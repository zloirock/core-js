import now from 'core-js-pure/features/date/now';

QUnit.test('Date.now', assert => {
  assert.isFunction(now);
  assert.ok(+new Date() - now() < 10, 'Date.now() ~ +new Date');
});

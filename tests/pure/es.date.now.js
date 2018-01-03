import now from '../../packages/core-js-pure/fn/date/now';

QUnit.test('Date.now', assert => {
  assert.isFunction(now);
  assert.ok(+new Date() - now() < 10, 'Date.now() ~ +new Date');
});

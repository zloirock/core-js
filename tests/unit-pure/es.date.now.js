import now from 'core-js-pure/es/date/now';

QUnit.test('Date.now', assert => {
  assert.isFunction(now);
  assert.epsilon(+new Date(), now(), 10, 'Date.now() ~ +new Date');
});

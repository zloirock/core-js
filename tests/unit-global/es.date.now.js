QUnit.test('Date.now', assert => {
  const { now } = Date;
  assert.isFunction(now);
  assert.arity(now, 0);
  assert.name(now, 'now');
  assert.looksNative(now);
  assert.nonEnumerable(Date, 'now');
  // eslint-disable-next-line unicorn/prefer-date-now -- required for testing
  assert.epsilon(+new Date(), now(), 10, 'Date.now() ~ +new Date');
});

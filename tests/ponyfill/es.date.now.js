QUnit.test('Date.now', assert => {
  const { now } = core.Date;
  assert.isFunction(now);
  assert.ok(+new Date() - now() < 10, 'Date.now() ~ +new Date');
});

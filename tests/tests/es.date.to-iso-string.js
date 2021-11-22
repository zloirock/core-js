QUnit.test('Date#toISOString', assert => {
  const { toISOString } = Date.prototype;
  assert.isFunction(toISOString);
  assert.arity(toISOString, 0);
  assert.name(toISOString, 'toISOString');
  assert.looksNative(toISOString);
  assert.nonEnumerable(Date.prototype, 'toISOString');
  assert.same(new Date(0).toISOString(), '1970-01-01T00:00:00.000Z');
  assert.same(new Date(1e12 + 1).toISOString(), '2001-09-09T01:46:40.001Z');
  assert.same(new Date(-5e13 - 1).toISOString(), '0385-07-25T07:06:39.999Z');
  const future = new Date(1e15 + 1).toISOString();
  const properFuture = future === '+033658-09-27T01:46:40.001Z' || future === '33658-09-27T01:46:40.001Z';
  assert.true(properFuture);
  const prehistoric = new Date(-1e15 + 1).toISOString();
  const properPrehistoric = prehistoric === '-029719-04-05T22:13:20.001Z' || prehistoric === '-29719-04-05T22:13:20.001Z';
  assert.true(properPrehistoric);
  assert.throws(() => new Date(NaN).toISOString(), RangeError);
});

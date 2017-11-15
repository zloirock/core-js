QUnit.test('Date#toISOString', assert => {
  const { toISOString } = Date.prototype;
  assert.isFunction(toISOString);
  assert.arity(toISOString, 0);
  assert.name(toISOString, 'toISOString');
  assert.looksNative(toISOString);
  assert.nonEnumerable(Date.prototype, 'toISOString');
  assert.strictEqual(new Date(0).toISOString(), '1970-01-01T00:00:00.000Z');
  assert.strictEqual(new Date(1e12 + 1).toISOString(), '2001-09-09T01:46:40.001Z');
  assert.strictEqual(new Date(-5e13 - 1).toISOString(), '0385-07-25T07:06:39.999Z');
  const future = new Date(1e15 + 1).toISOString();
  assert.ok(future === '+033658-09-27T01:46:40.001Z' || future === '33658-09-27T01:46:40.001Z');
  const prehistoric = new Date(-1e15 + 1).toISOString();
  assert.ok(prehistoric === '-029719-04-05T22:13:20.001Z' || prehistoric === '-29719-04-05T22:13:20.001Z');
  assert.throws(() => {
    return new Date(NaN).toISOString();
  }, RangeError);
});

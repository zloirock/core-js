QUnit.test('Array#join', assert => {
  const { join } = Array.prototype;
  assert.isFunction(join);
  assert.arity(join, 1);
  assert.name(join, 'join');
  assert.looksNative(join);
  assert.nonEnumerable(Array.prototype, 'join');
  assert.same(join.call([1, 2, 3], undefined), '1,2,3');
  assert.same(join.call('123'), '1,2,3');
  assert.same(join.call('123', '|'), '1|2|3');

  assert.throws(() => join.call(null, 0), TypeError);
  assert.throws(() => join.call(undefined, 0), TypeError);
});

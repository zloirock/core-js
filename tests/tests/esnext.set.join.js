QUnit.test('Set#join', assert => {
  const { join } = Set.prototype;

  assert.isFunction(join);
  assert.arity(join, 1);
  assert.name(join, 'join');
  assert.looksNative(join);
  assert.nonEnumerable(Set.prototype, 'join');

  assert.strictEqual(new Set([1, 2, 3]).join(), '1,2,3');
  assert.strictEqual(new Set([1, 2, 3]).join(undefined), '1,2,3');
  assert.strictEqual(new Set([1, 2, 3]).join('|'), '1|2|3');

  assert.throws(() => join.call(new Map()), TypeError);
  assert.throws(() => join.call({}), TypeError);
  assert.throws(() => join.call([]), TypeError);
  assert.throws(() => join.call(undefined), TypeError);
  assert.throws(() => join.call(null), TypeError);
});

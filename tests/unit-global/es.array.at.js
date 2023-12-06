QUnit.test('Array#at', assert => {
  const { at } = Array.prototype;
  assert.isFunction(at);
  assert.arity(at, 1);
  assert.name(at, 'at');
  assert.looksNative(at);
  assert.nonEnumerable(Array.prototype, 'at');
  assert.same(1, [1, 2, 3].at(0));
  assert.same(2, [1, 2, 3].at(1));
  assert.same(3, [1, 2, 3].at(2));
  assert.same(undefined, [1, 2, 3].at(3));
  assert.same(3, [1, 2, 3].at(-1));
  assert.same(2, [1, 2, 3].at(-2));
  assert.same(1, [1, 2, 3].at(-3));
  assert.same(undefined, [1, 2, 3].at(-4));
  assert.same(1, [1, 2, 3].at(0.4));
  assert.same(1, [1, 2, 3].at(0.5));
  assert.same(1, [1, 2, 3].at(0.6));
  assert.same(1, [1].at(NaN));
  assert.same(1, [1].at());
  assert.same(1, [1, 2, 3].at(-0));
  assert.same(undefined, Array(1).at(0));
  assert.same(1, at.call({ 0: 1, length: 1 }, 0));

  assert.throws(() => at.call(null, 0), TypeError);
  assert.throws(() => at.call(undefined, 0), TypeError);
});

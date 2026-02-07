QUnit.test('Object.keysLength', assert => {
  const { keysLength } = Object;
  assert.isFunction(keysLength);
  assert.name(keysLength, 'keysLength');
  assert.arity(keysLength, 1);
  assert.looksNative(keysLength);
  assert.nonEnumerable(Object, 'keysLength');

  assert.same(keysLength({ a: 1, b: 2 }), 2, 'Basic functionality');
  assert.same(keysLength({}), 0, 'Empty object');
  assert.throws(() => keysLength(null), TypeError);
  assert.throws(() => keysLength(), TypeError);
});

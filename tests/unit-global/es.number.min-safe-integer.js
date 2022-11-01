QUnit.test('Number.MIN_SAFE_INTEGER', assert => {
  assert.true('MIN_SAFE_INTEGER' in Number);
  assert.nonEnumerable(Number, 'MIN_SAFE_INTEGER');
  assert.nonConfigurable(Number, 'MIN_SAFE_INTEGER');
  assert.nonWritable(Number, 'MIN_SAFE_INTEGER');
  assert.same(Number.MIN_SAFE_INTEGER, -(2 ** 53) + 1, 'Is -2^53 + 1');
});

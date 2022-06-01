QUnit.test('Number.MAX_SAFE_INTEGER', assert => {
  assert.true('MAX_SAFE_INTEGER' in Number);
  assert.nonEnumerable(Number, 'MAX_SAFE_INTEGER');
  assert.nonConfigurable(Number, 'MAX_SAFE_INTEGER');
  assert.nonWritable(Number, 'MAX_SAFE_INTEGER');
  assert.same(Number.MAX_SAFE_INTEGER, 2 ** 53 - 1, 'Is 2^53 - 1');
});

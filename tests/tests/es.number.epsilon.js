QUnit.test('Number.EPSILON', assert => {
  const { EPSILON } = Number;
  assert.true('EPSILON' in Number, 'EPSILON in Number');
  assert.nonEnumerable(Number, 'EPSILON');
  assert.nonConfigurable(Number, 'EPSILON');
  assert.nonWritable(Number, 'EPSILON');
  assert.same(EPSILON, 2 ** -52, 'Is 2^-52');
  assert.notSame(1, 1 + EPSILON, '1 isn\'t 1 + EPSILON');
  assert.same(1, 1 + EPSILON / 2, '1 is 1 + EPSILON / 2');
});

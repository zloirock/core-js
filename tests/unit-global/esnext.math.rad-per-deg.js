QUnit.test('Math.RAD_PER_DEG', assert => {
  const { RAD_PER_DEG, PI } = Math;
  assert.true('RAD_PER_DEG' in Math, 'RAD_PER_DEG in Math');
  assert.nonEnumerable(Math, 'RAD_PER_DEG');
  assert.nonConfigurable(Math, 'RAD_PER_DEG');
  assert.nonWritable(Math, 'RAD_PER_DEG');
  assert.same(RAD_PER_DEG, 180 / PI, 'Is 180 / Math.PI');
});

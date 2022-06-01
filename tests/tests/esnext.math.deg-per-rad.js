QUnit.test('Math.DEG_PER_RAD', assert => {
  const { DEG_PER_RAD, PI } = Math;
  assert.true('DEG_PER_RAD' in Math, 'DEG_PER_RAD in Math');
  assert.nonEnumerable(Math, 'DEG_PER_RAD');
  assert.nonConfigurable(Number, 'DEG_PER_RAD');
  assert.nonWritable(Number, 'DEG_PER_RAD');
  assert.same(DEG_PER_RAD, PI / 180, 'Is Math.PI / 180');
});

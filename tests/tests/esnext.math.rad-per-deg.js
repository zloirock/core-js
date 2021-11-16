QUnit.test('Math.RAD_PER_DEG', assert => {
  const { RAD_PER_DEG, PI } = Math;
  assert.ok('RAD_PER_DEG' in Math, 'RAD_PER_DEG in Math');
  assert.nonEnumerable(Math, 'RAD_PER_DEG');
  assert.same(RAD_PER_DEG, 180 / PI, 'Is 180 / Math.PI');
});

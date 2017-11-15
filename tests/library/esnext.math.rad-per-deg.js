QUnit.test('Math.RAD_PER_DEG', assert => {
  const { RAD_PER_DEG } = core.Math;
  assert.ok('RAD_PER_DEG' in core.Math, 'RAD_PER_DEG in Math');
  assert.strictEqual(RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI');
});

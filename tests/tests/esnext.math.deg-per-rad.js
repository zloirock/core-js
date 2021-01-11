QUnit.test('Math.DEG_PER_RAD', assert => {
  const { DEG_PER_RAD, PI } = Math;
  assert.ok('DEG_PER_RAD' in Math, 'DEG_PER_RAD in Math');
  assert.nonEnumerable(Math, 'DEG_PER_RAD');
  assert.strictEqual(DEG_PER_RAD, PI / 180, 'Is Math.PI / 180');
});

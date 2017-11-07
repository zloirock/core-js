var test = QUnit.test;

test('Math.RAD_PER_DEG', function (assert) {
  var RAD_PER_DEG = Math.RAD_PER_DEG;
  assert.ok('RAD_PER_DEG' in Math, 'RAD_PER_DEG in Math');
  assert.nonEnumerable(Math, 'RAD_PER_DEG');
  assert.strictEqual(RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI');
});

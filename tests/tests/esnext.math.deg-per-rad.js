var test = QUnit.test;

test('Math.DEG_PER_RAD', function (assert) {
  var DEG_PER_RAD = Math.DEG_PER_RAD;
  assert.ok('DEG_PER_RAD' in Math, 'DEG_PER_RAD in Math');
  assert.nonEnumerable(Math, 'DEG_PER_RAD');
  assert.strictEqual(DEG_PER_RAD, Math.PI / 180, 'Is Math.PI / 180');
});

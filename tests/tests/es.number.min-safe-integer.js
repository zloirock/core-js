var test = QUnit.test;

test('Number.MIN_SAFE_INTEGER', function (assert) {
  assert.ok('MIN_SAFE_INTEGER' in Number);
  assert.nonEnumerable(Number, 'MIN_SAFE_INTEGER');
  assert.strictEqual(Number.MIN_SAFE_INTEGER, -Math.pow(2, 53) + 1, 'Is -2^53 + 1');
});

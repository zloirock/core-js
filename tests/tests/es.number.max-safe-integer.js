QUnit.test('Number.MAX_SAFE_INTEGER', function (assert) {
  assert.ok('MAX_SAFE_INTEGER' in Number);
  assert.nonEnumerable(Number, 'MAX_SAFE_INTEGER');
  assert.strictEqual(Number.MAX_SAFE_INTEGER, 2 ** 53 - 1, 'Is 2^53 - 1');
});

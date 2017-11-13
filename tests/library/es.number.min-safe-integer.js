QUnit.test('Number.MIN_SAFE_INTEGER', function (assert) {
  assert.strictEqual(core.Number.MIN_SAFE_INTEGER, -(2 ** 53) + 1, 'Is -2^53 + 1');
});

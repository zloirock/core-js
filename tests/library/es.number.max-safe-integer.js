QUnit.test('Number.MAX_SAFE_INTEGER', function (assert) {
  assert.strictEqual(core.Number.MAX_SAFE_INTEGER, Math.pow(2, 53) - 1, 'Is 2^53 - 1');
});

QUnit.test('Math.clz32', function (assert) {
  var clz32 = core.Math.clz32;
  assert.isFunction(clz32);
  assert.strictEqual(clz32(0), 32);
  assert.strictEqual(clz32(1), 31);
  assert.same(clz32(-1), 0);
  assert.strictEqual(clz32(0.6), 32);
  assert.same(clz32(Math.pow(2, 32) - 1), 0);
  assert.strictEqual(clz32(Math.pow(2, 32)), 32);
});

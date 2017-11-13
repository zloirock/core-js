QUnit.test('Math.clz32', function (assert) {
  var clz32 = Math.clz32;
  assert.isFunction(clz32);
  assert.name(clz32, 'clz32');
  assert.arity(clz32, 1);
  assert.looksNative(clz32);
  assert.nonEnumerable(Math, 'clz32');
  assert.strictEqual(clz32(0), 32);
  assert.strictEqual(clz32(1), 31);
  assert.same(clz32(-1), 0);
  assert.strictEqual(clz32(0.6), 32);
  assert.same(clz32(2 ** 32 - 1), 0);
  assert.strictEqual(clz32(2 ** 32), 32);
});

QUnit.test('Math.clamp', function (assert) {
  var clamp = Math.clamp;
  assert.isFunction(clamp);
  assert.name(clamp, 'clamp');
  assert.arity(clamp, 3);
  assert.looksNative(clamp);
  assert.nonEnumerable(Math, 'clamp');
  assert.same(clamp(2, 4, 6), 4);
  assert.same(clamp(4, 2, 6), 4);
  assert.same(clamp(6, 2, 4), 4);
});

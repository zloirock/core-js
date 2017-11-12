QUnit.test('Math.scale', function (assert) {
  var scale = core.Math.scale;
  assert.isFunction(scale);
  assert.arity(scale, 5);
  assert.same(scale(3, 1, 2, 1, 2), 3);
  assert.same(scale(0, 3, 5, 8, 10), 5);
  assert.same(scale(1, 1, 1, 1, 1), NaN);
  assert.same(scale(-1, -1, -1, -1, -1), NaN);
});

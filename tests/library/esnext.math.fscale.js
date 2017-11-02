var test = QUnit.test;

test('Math.fscale', function (assert) {
  var fscale = core.Math.fscale;
  assert.isFunction(fscale);
  assert.arity(fscale, 5);
  assert.same(fscale(3, 1, 2, 1, 2), 3);
  assert.same(fscale(0, 3, 5, 8, 10), 5);
  assert.same(fscale(1, 1, 1, 1, 1), NaN);
  assert.same(fscale(-1, -1, -1, -1, -1), NaN);
});

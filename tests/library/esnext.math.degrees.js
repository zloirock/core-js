var test = QUnit.test;

test('Math.degrees', function (assert) {
  var degrees = core.Math.degrees;
  assert.isFunction(degrees);
  assert.arity(degrees, 1);
  assert.same(degrees(0), 0);
  assert.same(degrees(Math.PI / 2), 90);
  assert.same(degrees(Math.PI), 180);
  assert.same(degrees(3 * Math.PI / 2), 270);
});

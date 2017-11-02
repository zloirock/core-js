var test = QUnit.test;

test('Math.radians', function (assert) {
  var radians = core.Math.radians;
  assert.isFunction(radians);
  assert.arity(radians, 1);
  assert.same(radians(0), 0);
  assert.same(radians(90), Math.PI / 2);
  assert.same(radians(180), Math.PI);
  assert.same(radians(270), 3 * Math.PI / 2);
});

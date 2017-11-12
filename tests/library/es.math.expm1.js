QUnit.test('Math.expm1', function (assert) {
  var expm1 = core.Math.expm1;
  assert.isFunction(expm1);
  assert.same(expm1(NaN), NaN);
  assert.same(expm1(0), 0);
  assert.same(expm1(-0), -0);
  assert.strictEqual(expm1(Infinity), Infinity);
  assert.strictEqual(expm1(-Infinity), -1);
  assert.epsilon(expm1(10), 22025.465794806718, assert.epsilon(expm1(-10), -0.9999546000702375));
});

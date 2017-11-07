var test = QUnit.test;

test('Math.cbrt', function (assert) {
  var cbrt = Math.cbrt;
  assert.isFunction(cbrt);
  assert.name(cbrt, 'cbrt');
  assert.arity(cbrt, 1);
  assert.looksNative(cbrt);
  assert.nonEnumerable(Math, 'cbrt');
  assert.same(cbrt(NaN), NaN);
  assert.same(cbrt(0), 0);
  assert.same(cbrt(-0), -0);
  assert.strictEqual(cbrt(Infinity), Infinity);
  assert.strictEqual(cbrt(-Infinity), -Infinity);
  assert.strictEqual(cbrt(-8), -2);
  assert.strictEqual(cbrt(8), 2);
  assert.epsilon(cbrt(-1000), -10);
  assert.epsilon(cbrt(1000), 10);
});

import cbrt from 'core-js-pure/full/math/cbrt';

QUnit.test('Math.cbrt', assert => {
  assert.isFunction(cbrt);
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

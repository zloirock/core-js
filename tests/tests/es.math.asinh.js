QUnit.test('Math.asinh', assert => {
  const { asinh } = Math;
  assert.isFunction(asinh);
  assert.name(asinh, 'asinh');
  assert.arity(asinh, 1);
  assert.looksNative(asinh);
  assert.nonEnumerable(Math, 'asinh');
  assert.same(asinh(NaN), NaN);
  assert.same(asinh(0), 0);
  assert.same(asinh(-0), -0);
  assert.strictEqual(asinh(Infinity), Infinity);
  assert.strictEqual(asinh(-Infinity), -Infinity);
  assert.epsilon(asinh(1234), 7.811163549201245);
  assert.epsilon(asinh(9.99), 2.997227420191335);
  assert.epsilon(asinh(1e150), 346.0809111296668);
  assert.epsilon(asinh(1e7), 16.811242831518268);
  assert.epsilon(asinh(-1e7), -16.811242831518268);
});

import tanh from 'core-js-pure/es/math/tanh';

QUnit.test('Math.tanh', assert => {
  assert.isFunction(tanh);
  assert.same(tanh(NaN), NaN);
  assert.same(tanh(0), 0);
  assert.same(tanh(-0), -0);
  assert.same(tanh(Infinity), 1);
  assert.same(tanh(90), 1);
  assert.epsilon(tanh(10), 0.9999999958776927);
});

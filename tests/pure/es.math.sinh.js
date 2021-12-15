import sinh from 'core-js-pure/es/math/sinh';

QUnit.test('Math.sinh', assert => {
  assert.isFunction(sinh);
  assert.same(sinh(NaN), NaN);
  assert.same(sinh(0), 0);
  assert.same(sinh(-0), -0);
  assert.same(sinh(Infinity), Infinity);
  assert.same(sinh(-Infinity), -Infinity);
  assert.epsilon(sinh(-5), -74.20321057778875);
  assert.epsilon(sinh(2), 3.6268604078470186);
  assert.same(sinh(-2e-17), -2e-17);
});

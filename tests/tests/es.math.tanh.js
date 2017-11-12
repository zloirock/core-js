import { NATIVE } from '../helpers/constants';

QUnit.test('Math.tanh', function (assert) {
  var tanh = Math.tanh;
  assert.isFunction(tanh);
  assert.name(tanh, 'tanh');
  assert.arity(tanh, 1);
  assert.looksNative(tanh);
  assert.nonEnumerable(Math, 'tanh');
  assert.same(tanh(NaN), NaN);
  assert.same(tanh(0), 0);
  assert.same(tanh(-0), -0);
  assert.strictEqual(tanh(Infinity), 1);
  assert.strictEqual(tanh(90), 1);
  assert.epsilon(tanh(10), 0.9999999958776927);
  if (NATIVE) assert.strictEqual(tanh(710), 1);
});

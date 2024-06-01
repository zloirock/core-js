import { NATIVE } from '../helpers/constants.js';
import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.tanh', assert => {
  const { tanh } = Math;
  assert.isFunction(tanh);
  assert.name(tanh, 'tanh');
  assert.arity(tanh, 1);
  assert.looksNative(tanh);
  assert.nonEnumerable(Math, 'tanh');
  assert.same(tanh(NaN), NaN);
  assert.same(tanh(0), 0);
  assert.same(tanh(-0), -0);
  assert.same(tanh(Infinity), 1);
  assert.same(tanh(90), 1);
  assert.closeTo(tanh(10), 0.9999999958776927, 1e-11);
  if (NATIVE) assert.same(tanh(710), 1);

  const checker = createConversionChecker(10);
  assert.closeTo(tanh(checker), 0.9999999958776927, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

import { createConversionChecker } from '../helpers/helpers.js';

import tanh from '@core-js/pure/es/math/tanh';

QUnit.test('Math.tanh', assert => {
  assert.isFunction(tanh);
  assert.same(tanh(NaN), NaN);
  assert.same(tanh(0), 0);
  assert.same(tanh(-0), -0);
  assert.same(tanh(Infinity), 1);
  assert.same(tanh(90), 1);
  assert.closeTo(tanh(10), 0.9999999958776927, 1e-11);

  const checker = createConversionChecker(10);
  assert.closeTo(tanh(checker), 0.9999999958776927, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

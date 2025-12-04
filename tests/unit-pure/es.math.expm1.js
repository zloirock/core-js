import { createConversionChecker } from '../helpers/helpers.js';

import expm1 from '@core-js/pure/es/math/expm1';

QUnit.test('Math.expm1', assert => {
  assert.isFunction(expm1);
  assert.same(expm1(NaN), NaN);
  assert.same(expm1(0), 0);
  assert.same(expm1(-0), -0);
  assert.same(expm1(Infinity), Infinity);
  assert.same(expm1(-Infinity), -1);
  assert.closeTo(expm1(10), 22025.465794806718, 1e-11);
  assert.closeTo(expm1(-10), -0.9999546000702375, 1e-11);

  const checker = createConversionChecker(10);
  assert.closeTo(expm1(checker), 22025.465794806718, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

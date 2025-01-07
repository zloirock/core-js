import { createConversionChecker } from '../helpers/helpers.js';

import asinh from '@core-js/pure/es/math/asinh';

QUnit.test('Math.asinh', assert => {
  assert.isFunction(asinh);
  assert.same(asinh(NaN), NaN);
  assert.same(asinh(0), 0);
  assert.same(asinh(-0), -0);
  assert.same(asinh(Infinity), Infinity);
  assert.same(asinh(-Infinity), -Infinity);
  assert.closeTo(asinh(1234), 7.811163549201245, 1e-11);
  assert.closeTo(asinh(9.99), 2.997227420191335, 1e-11);
  assert.closeTo(asinh(1e150), 346.0809111296668, 1e-11);
  assert.closeTo(asinh(1e7), 16.811242831518268, 1e-11);
  assert.closeTo(asinh(-1e7), -16.811242831518268, 1e-11);

  const checker = createConversionChecker(1234);
  assert.closeTo(asinh(checker), 7.811163549201245, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

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
  assert.closeTo(asinh(1e200), 461.2101657793691, 1e-6, 'large value 1e200');
  assert.closeTo(asinh(1e300), 691.4686750787736, 1e-6, 'large value 1e300');
  assert.closeTo(asinh(Number.MAX_VALUE), 710.4758600739439, 1e-6, 'Number.MAX_VALUE');
  assert.closeTo(asinh(-1e200), -461.2101657793691, 1e-6, 'large negative value');

  const checker = createConversionChecker(1234);
  assert.closeTo(asinh(checker), 7.811163549201245, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

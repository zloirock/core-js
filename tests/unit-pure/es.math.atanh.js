import { createConversionChecker } from '../helpers/helpers.js';

import atanh from '@core-js/pure/es/math/atanh';

QUnit.test('Math.atanh', assert => {
  assert.isFunction(atanh);
  assert.same(atanh(NaN), NaN);
  assert.same(atanh(-2), NaN);
  assert.same(atanh(-1.5), NaN);
  assert.same(atanh(2), NaN);
  assert.same(atanh(1.5), NaN);
  assert.same(atanh(-1), -Infinity);
  assert.same(atanh(1), Infinity);
  assert.same(atanh(0), 0);
  assert.same(atanh(-0), -0);
  assert.same(atanh(-1e300), NaN);
  assert.same(atanh(1e300), NaN);
  assert.closeTo(atanh(0.5), 0.5493061443340549, 1e-11);
  assert.closeTo(atanh(-0.5), -0.5493061443340549, 1e-11);
  assert.closeTo(atanh(0.444), 0.47720201260109457, 1e-11);

  const checker = createConversionChecker(0.5);
  assert.closeTo(atanh(checker), 0.5493061443340549, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

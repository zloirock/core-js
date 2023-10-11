import { createConversionChecker } from '../helpers/helpers.js';

import log10 from '@core-js/pure/es/math/log10';

QUnit.test('Math.log10', assert => {
  assert.isFunction(log10);
  assert.same(log10(''), log10(0));
  assert.same(log10(NaN), NaN);
  assert.same(log10(-1), NaN);
  assert.same(log10(0), -Infinity);
  assert.same(log10(-0), -Infinity);
  assert.same(log10(1), 0);
  assert.same(log10(Infinity), Infinity);
  assert.closeTo(log10(0.1), -1, 1e-11);
  assert.closeTo(log10(0.5), -0.3010299956639812, 1e-11);
  assert.closeTo(log10(1.5), 0.17609125905568124, 1e-11);
  assert.closeTo(log10(5), 0.6989700043360189, 1e-11);
  assert.closeTo(log10(50), 1.6989700043360187, 1e-11);
  assert.closeTo(log10(1000), 3, 1e-11);

  const checker = createConversionChecker(0.5);
  assert.closeTo(log10(checker), -0.3010299956639812, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

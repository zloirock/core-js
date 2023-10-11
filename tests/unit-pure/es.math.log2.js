import { createConversionChecker } from '../helpers/helpers.js';

import log2 from '@core-js/pure/es/math/log2';

QUnit.test('Math.log2', assert => {
  assert.isFunction(log2);
  assert.same(log2(''), log2(0));
  assert.same(log2(NaN), NaN);
  assert.same(log2(-1), NaN);
  assert.same(log2(0), -Infinity);
  assert.same(log2(-0), -Infinity);
  assert.same(log2(1), 0);
  assert.same(log2(Infinity), Infinity);
  assert.same(log2(0.5), -1);
  assert.same(log2(32), 5);
  assert.closeTo(log2(5), 2.321928094887362, 1e-11);

  const checker = createConversionChecker(5);
  assert.closeTo(log2(checker), 2.321928094887362, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

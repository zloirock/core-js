import { createConversionChecker } from '../helpers/helpers.js';

import log1p from '@core-js/pure/es/math/log1p';

QUnit.test('Math.log1p', assert => {
  assert.isFunction(log1p);
  assert.same(log1p(''), log1p(0));
  assert.same(log1p(NaN), NaN);
  assert.same(log1p(-2), NaN);
  assert.same(log1p(-1), -Infinity);
  assert.same(log1p(0), 0);
  assert.same(log1p(-0), -0);
  assert.same(log1p(Infinity), Infinity);
  assert.closeTo(log1p(5), 1.791759469228055, 1e-11);
  assert.closeTo(log1p(50), 3.9318256327243257, 1e-11);

  const checker = createConversionChecker(5);
  assert.closeTo(log1p(checker), 1.791759469228055, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

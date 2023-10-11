import { createConversionChecker } from '../helpers/helpers.js';

import cosh from '@core-js/pure/es/math/cosh';

QUnit.test('Math.cosh', assert => {
  assert.isFunction(cosh);
  assert.same(cosh(NaN), NaN);
  assert.same(cosh(0), 1);
  assert.same(cosh(-0), 1);
  assert.same(cosh(Infinity), Infinity);
  assert.same(cosh(-Infinity), Infinity);
  assert.closeTo(cosh(12), 81377.395712574, 1e-9);
  assert.closeTo(cosh(22), 1792456423.065796, 1e-5);
  assert.closeTo(cosh(-10), 11013.232920103323, 1e-11);
  assert.closeTo(cosh(-23), 4872401723.124452, 1e-5);
  assert.closeTo(cosh(710), 1.1169973830808557e+308, 1e+295);

  const checker = createConversionChecker(12);
  assert.closeTo(cosh(checker), 81377.395712574, 1e-9, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

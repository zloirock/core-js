import { createConversionChecker } from '../helpers/helpers';

import cosh from 'core-js-pure/es/math/cosh';

QUnit.test('Math.cosh', assert => {
  assert.isFunction(cosh);
  assert.same(cosh(NaN), NaN);
  assert.same(cosh(0), 1);
  assert.same(cosh(-0), 1);
  assert.same(cosh(Infinity), Infinity);
  assert.same(cosh(-Infinity), Infinity);
  assert.epsilon(cosh(12), 81377.395712574, 1e-9);
  assert.epsilon(cosh(22), 1792456423.065796, 1e-5);
  assert.epsilon(cosh(-10), 11013.232920103323);
  assert.epsilon(cosh(-23), 4872401723.124452, 1e-5);
  assert.epsilon(cosh(710), 1.1169973830808557e+308, 1e+295);

  const checker = createConversionChecker(12);
  assert.epsilon(cosh(checker), 81377.395712574, 1e-9, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

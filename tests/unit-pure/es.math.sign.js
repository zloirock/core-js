import { createConversionChecker } from '../helpers/helpers.js';

import sign from '@core-js/pure/es/math/sign';

QUnit.test('Math.sign', assert => {
  assert.isFunction(sign);
  assert.same(sign(NaN), NaN);
  assert.same(sign(), NaN);
  assert.same(sign(-0), -0);
  assert.same(sign(0), 0);
  assert.same(sign(Infinity), 1);
  assert.same(sign(-Infinity), -1);
  assert.same(sign(13510798882111488), 1);
  assert.same(sign(-13510798882111488), -1);
  assert.same(sign(42.5), 1);
  assert.same(sign(-42.5), -1);

  const checker = createConversionChecker(-42.5);
  assert.same(sign(checker), -1, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

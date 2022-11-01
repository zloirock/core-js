import { createConversionChecker } from '../helpers/helpers';

import cbrt from 'core-js-pure/es/math/cbrt';

QUnit.test('Math.cbrt', assert => {
  assert.isFunction(cbrt);
  assert.same(cbrt(NaN), NaN);
  assert.same(cbrt(0), 0);
  assert.same(cbrt(-0), -0);
  assert.same(cbrt(Infinity), Infinity);
  assert.same(cbrt(-Infinity), -Infinity);
  assert.same(cbrt(-8), -2);
  assert.same(cbrt(8), 2);
  assert.epsilon(cbrt(-1000), -10);
  assert.epsilon(cbrt(1000), 10);

  const checker = createConversionChecker(1000);
  assert.epsilon(cbrt(checker), 10);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

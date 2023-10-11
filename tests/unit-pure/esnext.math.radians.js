import { createConversionChecker } from '../helpers/helpers.js';

import radians from '@core-js/pure/full/math/radians';

QUnit.test('Math.radians', assert => {
  assert.isFunction(radians);
  assert.arity(radians, 1);
  assert.same(radians(0), 0);
  assert.same(radians(90), Math.PI / 2);
  assert.same(radians(180), Math.PI);
  assert.same(radians(270), 3 * Math.PI / 2);

  const checker = createConversionChecker(270);
  assert.same(radians(checker), 3 * Math.PI / 2, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

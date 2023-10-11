import { createConversionChecker } from '../helpers/helpers.js';

import degrees from '@core-js/pure/full/math/degrees';

QUnit.test('Math.degrees', assert => {
  assert.isFunction(degrees);
  assert.arity(degrees, 1);
  assert.same(degrees(0), 0);
  assert.same(degrees(Math.PI / 2), 90);
  assert.same(degrees(Math.PI), 180);
  assert.same(degrees(3 * Math.PI / 2), 270);

  const checker = createConversionChecker(3 * Math.PI / 2);
  assert.same(degrees(checker), 270, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

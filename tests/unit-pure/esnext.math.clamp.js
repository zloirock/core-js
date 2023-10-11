import { createConversionChecker } from '../helpers/helpers.js';

import clamp from '@core-js/pure/full/math/clamp';

QUnit.test('Math.clamp', assert => {
  assert.isFunction(clamp);
  assert.arity(clamp, 3);
  assert.same(clamp(2, 4, 6), 4);
  assert.same(clamp(4, 2, 6), 4);
  assert.same(clamp(6, 2, 4), 4);

  const checker1 = createConversionChecker(2);
  const checker2 = createConversionChecker(4);
  const checker3 = createConversionChecker(5);
  assert.same(clamp(checker1, checker2, checker3), 4, 'object wrapper');
  assert.same(checker1.$valueOf, 1, 'checker1 valueOf calls');
  assert.same(checker1.$toString, 0, 'checker1 toString calls');
  assert.same(checker2.$valueOf, 1, 'checker2 valueOf calls');
  assert.same(checker2.$toString, 0, 'checker2 toString calls');
  assert.same(checker3.$valueOf, 1, 'checker3 valueOf calls');
  assert.same(checker3.$toString, 0, 'checker3 toString calls');
});

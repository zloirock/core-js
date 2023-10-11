import { createConversionChecker } from '../helpers/helpers.js';

import scale from '@core-js/pure/full/math/scale';

QUnit.test('Math.scale', assert => {
  assert.isFunction(scale);
  assert.arity(scale, 5);
  assert.same(scale(3, 1, 2, 1, 2), 3);
  assert.same(scale(0, 3, 5, 8, 10), 5);
  assert.same(scale(1, 1, 1, 1, 1), NaN);
  assert.same(scale(-1, -1, -1, -1, -1), NaN);

  const checker1 = createConversionChecker(3);
  const checker2 = createConversionChecker(1);
  const checker3 = createConversionChecker(2);
  const checker4 = createConversionChecker(1);
  const checker5 = createConversionChecker(2);
  assert.same(scale(checker1, checker2, checker3, checker4, checker5), 3, 'object wrapper');
  assert.same(checker1.$valueOf, 1, 'checker1 valueOf calls');
  assert.same(checker1.$toString, 0, 'checker1 toString calls');
  assert.same(checker2.$valueOf, 1, 'checker2 valueOf calls');
  assert.same(checker2.$toString, 0, 'checker2 toString calls');
  assert.same(checker3.$valueOf, 1, 'checker3 valueOf calls');
  assert.same(checker3.$toString, 0, 'checker3 toString calls');
  assert.same(checker4.$valueOf, 1, 'checker4 valueOf calls');
  assert.same(checker4.$toString, 0, 'checker4 toString calls');
  assert.same(checker5.$valueOf, 1, 'checker5 valueOf calls');
  assert.same(checker5.$toString, 0, 'checker5 toString calls');
});

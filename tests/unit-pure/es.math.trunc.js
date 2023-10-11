import { createConversionChecker } from '../helpers/helpers.js';

import trunc from '@core-js/pure/es/math/trunc';

QUnit.test('Math.trunc', assert => {
  assert.isFunction(trunc);
  assert.same(trunc(NaN), NaN, 'NaN -> NaN');
  assert.same(trunc(-0), -0, '-0 -> -0');
  assert.same(trunc(0), 0, '0 -> 0');
  assert.same(trunc(Infinity), Infinity, 'Infinity -> Infinity');
  assert.same(trunc(-Infinity), -Infinity, '-Infinity -> -Infinity');
  assert.same(trunc(null), 0, 'null -> 0');
  assert.same(trunc({}), NaN, '{} -> NaN');
  assert.same(trunc([]), 0, '[] -> 0');
  assert.same(trunc(1.01), 1, '1.01 -> 0');
  assert.same(trunc(1.99), 1, '1.99 -> 0');
  assert.same(trunc(-1), -1, '-1 -> -1');
  assert.same(trunc(-1.99), -1, '-1.99 -> -1');
  assert.same(trunc(-555.555), -555, '-555.555 -> -555');
  assert.same(trunc(9007199254740992), 9007199254740992, '9007199254740992 -> 9007199254740992');
  assert.same(trunc(-9007199254740992), -9007199254740992, '-9007199254740992 -> -9007199254740992');

  const checker = createConversionChecker(-1.99);
  assert.same(trunc(checker), -1, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

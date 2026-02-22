import { createConversionChecker } from '../helpers/helpers.js';

import fround from '@core-js/pure/es/math/fround';

const { MAX_VALUE, MIN_VALUE } = Number;

QUnit.test('Math.fround', assert => {
  assert.isFunction(fround);
  assert.same(fround(), NaN);
  assert.same(fround(undefined), NaN);
  assert.same(fround(NaN), NaN);
  assert.same(fround(null), 0);
  assert.same(fround(0), 0);
  assert.same(fround(-0), -0);
  assert.same(fround(MIN_VALUE), 0);
  assert.same(fround(-MIN_VALUE), -0);
  assert.same(fround(Infinity), Infinity);
  assert.same(fround(-Infinity), -Infinity);
  assert.same(fround(MAX_VALUE), Infinity);
  assert.same(fround(-MAX_VALUE), -Infinity);
  assert.same(fround(3.4028235677973366e+38), Infinity);
  assert.same(fround(3), 3);
  assert.same(fround(-3), -3);
  const maxFloat32 = 3.4028234663852886e+38;
  const minFloat32 = 1.401298464324817e-45;
  assert.same(fround(maxFloat32), maxFloat32);
  assert.same(fround(-maxFloat32), -maxFloat32);
  assert.same(fround(maxFloat32 + 2 ** 102), maxFloat32);
  assert.same(fround(minFloat32), minFloat32);
  assert.same(fround(-minFloat32), -minFloat32);
  assert.same(fround(minFloat32 / 2), 0);
  assert.same(fround(-minFloat32 / 2), -0);
  assert.same(fround(minFloat32 / 2 + 2 ** -202), minFloat32);
  assert.same(fround(-minFloat32 / 2 - 2 ** -202), -minFloat32);

  const maxSubnormal32 = 1.1754942106924411e-38;
  const minNormal32 = 1.1754943508222875e-38;
  assert.same(fround(1.1754942807573642e-38), maxSubnormal32, 'fround(1.1754942807573642e-38)');
  assert.same(fround(1.1754942807573643e-38), minNormal32, 'fround(1.1754942807573643e-38)');
  assert.same(fround(1.1754942807573644e-38), minNormal32, 'fround(1.1754942807573644e-38)');
  assert.same(fround(-1.1754942807573642e-38), -maxSubnormal32, 'fround(-1.1754942807573642e-38)');
  assert.same(fround(-1.1754942807573643e-38), -minNormal32, 'fround(-1.1754942807573643e-38)');
  assert.same(fround(-1.1754942807573644e-38), -minNormal32, 'fround(-1.1754942807573644e-38)');

  const checker = createConversionChecker(1.1754942807573642e-38);
  assert.same(fround(checker), maxSubnormal32, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

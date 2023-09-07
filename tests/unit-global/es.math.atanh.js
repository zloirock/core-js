import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.atanh', assert => {
  const { atanh } = Math;
  assert.isFunction(atanh);
  assert.name(atanh, 'atanh');
  assert.arity(atanh, 1);
  assert.looksNative(atanh);
  assert.nonEnumerable(Math, 'atanh');
  assert.same(atanh(NaN), NaN);
  assert.same(atanh(-2), NaN);
  assert.same(atanh(-1.5), NaN);
  assert.same(atanh(2), NaN);
  assert.same(atanh(1.5), NaN);
  assert.same(atanh(-1), -Infinity);
  assert.same(atanh(1), Infinity);
  assert.same(atanh(0), 0);
  assert.same(atanh(-0), -0);
  assert.same(atanh(-1e300), NaN);
  assert.same(atanh(1e300), NaN);
  assert.epsilon(atanh(0.5), 0.5493061443340549);
  assert.epsilon(atanh(-0.5), -0.5493061443340549);
  assert.epsilon(atanh(0.444), 0.47720201260109457);

  const checker = createConversionChecker(0.5);
  assert.epsilon(atanh(checker), 0.5493061443340549);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

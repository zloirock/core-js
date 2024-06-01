import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.expm1', assert => {
  const { expm1 } = Math;
  assert.isFunction(expm1);
  assert.name(expm1, 'expm1');
  assert.arity(expm1, 1);
  assert.looksNative(expm1);
  assert.nonEnumerable(Math, 'expm1');
  assert.same(expm1(NaN), NaN);
  assert.same(expm1(0), 0);
  assert.same(expm1(-0), -0);
  assert.same(expm1(Infinity), Infinity);
  assert.same(expm1(-Infinity), -1);
  assert.closeTo(expm1(10), 22025.465794806718, 1e-11);
  assert.closeTo(expm1(-10), -0.9999546000702375, 1e-11);

  const checker = createConversionChecker(10);
  assert.closeTo(expm1(checker), 22025.465794806718, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

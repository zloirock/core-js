import { createConversionChecker } from '../helpers/helpers.js';

const { MIN_VALUE } = Number;

QUnit.test('Math.log2', assert => {
  const { log2 } = Math;
  assert.isFunction(log2);
  assert.name(log2, 'log2');
  assert.arity(log2, 1);
  assert.looksNative(log2);
  assert.nonEnumerable(Math, 'log2');
  assert.same(log2(''), log2(0));
  assert.same(log2(NaN), NaN);
  // Known Firefox 4-5 failure for this NaN result.
  assert.same(log2(-1), NaN);
  assert.same(log2(0), -Infinity);
  assert.same(log2(-0), -Infinity);
  assert.same(log2(1), 0);
  assert.same(log2(Infinity), Infinity);
  assert.same(log2(0.5), -1);
  assert.same(log2(32), 5);
  assert.closeTo(log2(5), 2.321928094887362, 1e-11);
  // exact on powers of two, unlike `log(x) * LOG2E` and `log(x) / LN2`
  assert.same(log2(8), 3);
  assert.same(log2(64), 6);
  assert.same(log2(2 ** 29), 29);
  assert.same(log2(2 ** 31), 31);
  assert.same(log2(2 ** -1021), -1021);
  assert.same(log2(MIN_VALUE), -1074);
  assert.same(log2(2 ** 1023), 1023);
  // strictly increasing next to a power of two
  assert.true(log2(2 ** 29 + 2 ** -11) > 29);

  const checker = createConversionChecker(5);
  assert.closeTo(log2(checker), 2.321928094887362, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

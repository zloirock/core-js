import { createConversionChecker } from '../helpers/helpers';

QUnit.test('Math.log2', assert => {
  const { log2 } = Math;
  assert.isFunction(log2);
  assert.name(log2, 'log2');
  assert.arity(log2, 1);
  assert.looksNative(log2);
  assert.nonEnumerable(Math, 'log2');
  assert.same(log2(''), log2(0));
  assert.same(log2(NaN), NaN);
  assert.same(log2(-1), NaN);
  assert.same(log2(0), -Infinity);
  assert.same(log2(-0), -Infinity);
  assert.same(log2(1), 0);
  assert.same(log2(Infinity), Infinity);
  assert.same(log2(0.5), -1);
  assert.same(log2(32), 5);
  assert.epsilon(log2(5), 2.321928094887362);

  const checker = createConversionChecker(5);
  assert.epsilon(log2(checker), 2.321928094887362);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

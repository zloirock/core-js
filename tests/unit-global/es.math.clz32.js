import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.clz32', assert => {
  const { clz32 } = Math;
  assert.isFunction(clz32);
  assert.name(clz32, 'clz32');
  assert.arity(clz32, 1);
  assert.looksNative(clz32);
  assert.nonEnumerable(Math, 'clz32');
  assert.same(clz32(0), 32);
  assert.same(clz32(1), 31);
  assert.same(clz32(-1), 0);
  assert.same(clz32(0.6), 32);
  assert.same(clz32(2 ** 32 - 1), 0);
  assert.same(clz32(2 ** 32), 32);

  const checker = createConversionChecker(1);
  assert.same(clz32(checker), 31, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

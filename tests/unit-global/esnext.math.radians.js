import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.radians', assert => {
  const { radians, PI } = Math;
  assert.isFunction(radians);
  assert.name(radians, 'radians');
  assert.arity(radians, 1);
  assert.looksNative(radians);
  assert.nonEnumerable(Math, 'radians');
  assert.same(radians(0), 0);
  assert.same(radians(90), PI / 2);
  assert.same(radians(180), PI);
  assert.same(radians(270), 3 * PI / 2);

  const checker = createConversionChecker(270);
  assert.same(radians(checker), 3 * PI / 2, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.degrees', assert => {
  const { degrees, PI } = Math;
  assert.isFunction(degrees);
  assert.name(degrees, 'degrees');
  assert.arity(degrees, 1);
  assert.looksNative(degrees);
  assert.nonEnumerable(Math, 'degrees');
  assert.same(degrees(0), 0);
  assert.same(degrees(PI / 2), 90);
  assert.same(degrees(PI), 180);
  assert.same(degrees(3 * PI / 2), 270);

  const checker = createConversionChecker(3 * PI / 2);
  assert.same(degrees(checker), 270, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

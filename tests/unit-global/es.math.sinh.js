import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.sinh', assert => {
  const { sinh } = Math;
  assert.isFunction(sinh);
  assert.name(sinh, 'sinh');
  assert.arity(sinh, 1);
  assert.looksNative(sinh);
  assert.nonEnumerable(Math, 'sinh');
  assert.same(sinh(NaN), NaN);
  assert.same(sinh(0), 0);
  assert.same(sinh(-0), -0);
  assert.same(sinh(Infinity), Infinity);
  assert.same(sinh(-Infinity), -Infinity);
  assert.closeTo(sinh(-5), -74.20321057778875, 1e-11);
  assert.closeTo(sinh(2), 3.6268604078470186, 1e-11);
  assert.same(sinh(-2e-17), -2e-17);

  const checker = createConversionChecker(-5);
  assert.closeTo(sinh(checker), -74.20321057778875, 1e-11);
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

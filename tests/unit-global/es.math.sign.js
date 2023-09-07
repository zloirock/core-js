import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Math.sign', assert => {
  const { sign } = Math;
  assert.isFunction(sign);
  assert.name(sign, 'sign');
  assert.arity(sign, 1);
  assert.looksNative(sign);
  assert.nonEnumerable(Math, 'sign');
  assert.same(sign(NaN), NaN);
  assert.same(sign(), NaN);
  assert.same(sign(-0), -0);
  assert.same(sign(0), 0);
  assert.same(sign(Infinity), 1);
  assert.same(sign(-Infinity), -1);
  assert.same(sign(13510798882111488), 1);
  assert.same(sign(-13510798882111488), -1);
  assert.same(sign(42.5), 1);
  assert.same(sign(-42.5), -1);

  const checker = createConversionChecker(-42.5);
  assert.same(sign(checker), -1, 'object wrapper');
  assert.same(checker.$valueOf, 1, 'valueOf calls');
  assert.same(checker.$toString, 0, 'toString calls');
});

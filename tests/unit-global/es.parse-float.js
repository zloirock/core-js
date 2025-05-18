import { WHITESPACES } from '../helpers/constants.js';

QUnit.test('parseFloat', assert => {
  assert.isFunction(parseFloat);
  assert.name(parseFloat, 'parseFloat');
  assert.arity(parseFloat, 1);
  assert.looksNative(parseFloat);
  assert.same(parseFloat('0'), 0);
  assert.same(parseFloat(' 0'), 0);
  assert.same(parseFloat('+0'), 0);
  assert.same(parseFloat(' +0'), 0);
  assert.same(parseFloat('-0'), -0);
  assert.same(parseFloat(' -0'), -0);
  assert.same(parseFloat(`${ WHITESPACES }+0`), 0);
  assert.same(parseFloat(`${ WHITESPACES }-0`), -0);
  // eslint-disable-next-line math/no-static-nan-calculations -- feature detection
  assert.same(parseFloat(null), NaN);
  // eslint-disable-next-line math/no-static-nan-calculations -- feature detection
  assert.same(parseFloat(undefined), NaN);

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('parseFloat test');
    assert.throws(() => parseFloat(symbol), 'throws on symbol argument');
    assert.throws(() => parseFloat(Object(symbol)), 'throws on boxed symbol argument');
  }
});

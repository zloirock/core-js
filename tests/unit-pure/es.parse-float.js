import { WHITESPACES } from '../helpers/constants.js';
import parseFloat from '@core-js/pure/es/parse-float';

QUnit.test('parseFloat', assert => {
  assert.isFunction(parseFloat);
  assert.arity(parseFloat, 1);
  assert.same(parseFloat('0'), 0);
  assert.same(parseFloat(' 0'), 0);
  assert.same(parseFloat('+0'), 0);
  assert.same(parseFloat(' +0'), 0);
  assert.same(parseFloat('-0'), -0);
  assert.same(parseFloat(' -0'), -0);
  assert.same(parseFloat(`${ WHITESPACES }+0`), 0);
  assert.same(parseFloat(`${ WHITESPACES }-0`), -0);
  assert.same(parseFloat(null), NaN);
  assert.same(parseFloat(undefined), NaN);

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    const symbol = Symbol('parseFloat test');
    assert.throws(() => parseFloat(symbol), 'throws on symbol argument');
    assert.throws(() => parseFloat(Object(symbol)), 'throws on boxed symbol argument');
  }
});

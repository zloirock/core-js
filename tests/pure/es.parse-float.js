import { WHITESPACES } from '../helpers/constants';
import parseFloat from 'core-js-pure/fn/parse-float';

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
});

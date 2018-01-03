import parseFloat from '../../packages/core-js-pure/fn/parse-float';

QUnit.test('parseFloat', assert => {
  assert.isFunction(parseFloat);
  assert.arity(parseFloat, 1);
  assert.same(parseFloat('0'), 0);
  assert.same(parseFloat(' 0'), 0);
  assert.same(parseFloat('+0'), 0);
  assert.same(parseFloat(' +0'), 0);
  assert.same(parseFloat('-0'), -0);
  assert.same(parseFloat(' -0'), -0);
  // eslint-disable-next-line max-len
  const whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
  assert.same(parseFloat(`${ whitespaces }+0`), 0);
  assert.same(parseFloat(`${ whitespaces }-0`), -0);
  assert.same(parseFloat(null), NaN);
  assert.same(parseFloat(undefined), NaN);
});

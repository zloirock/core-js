import { STRICT } from '../helpers/constants';

// eslint-disable-next-line
const whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

QUnit.test('String#trim', assert => {
  const { trim } = core.String;
  assert.isFunction(trim);
  assert.strictEqual(trim(' \n  q w e \n  '), 'q w e', 'removes whitespaces at left & right side of string');
  assert.strictEqual(trim(whitespaces), '', 'removes all whitespaces');
  assert.strictEqual(trim('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => trim(null, 0), TypeError);
    assert.throws(() => trim(undefined, 0), TypeError);
  }
});

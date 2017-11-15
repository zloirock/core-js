import { STRICT } from '../helpers/constants';

// eslint-disable-next-line max-len
const whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

QUnit.test('String#trimLeft', assert => {
  const { trimLeft } = core.String;
  assert.isFunction(trimLeft);
  assert.strictEqual(trimLeft(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimLeft(whitespaces), '', 'removes all whitespaces');
  assert.strictEqual(trimLeft('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => {
      return trimLeft(null, 0);
    }, TypeError);
    assert.throws(() => {
      return trimLeft(undefined, 0);
    }, TypeError);
  }
});

QUnit.test('String#trimStart', assert => {
  const { trimStart } = core.String;
  assert.isFunction(trimStart);
  assert.strictEqual(trimStart(' \n  q w e \n  '), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(trimStart(whitespaces), '', 'removes all whitespaces');
  assert.strictEqual(trimStart('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => {
      return trimStart(null, 0);
    }, TypeError);
    assert.throws(() => {
      return trimStart(undefined, 0);
    }, TypeError);
  }
});

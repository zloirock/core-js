import { STRICT } from '../helpers/constants';
// eslint-disable-next-line max-len
const whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

QUnit.test('String#trimLeft', assert => {
  const { trimLeft } = String.prototype;
  assert.isFunction(trimLeft);
  assert.arity(trimLeft, 0);
  assert.name(trimLeft, 'trimLeft');
  assert.looksNative(trimLeft);
  assert.nonEnumerable(String.prototype, 'trimLeft');
  assert.strictEqual(' \n  q w e \n  '.trimLeft(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(whitespaces.trimLeft(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimLeft(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => {
      return trimLeft.call(null, 0);
    }, TypeError);
    assert.throws(() => {
      return trimLeft.call(undefined, 0);
    }, TypeError);
  }
});

QUnit.test('String#trimStart', assert => {
  const { trimStart } = String.prototype;
  assert.isFunction(trimStart);
  assert.arity(trimStart, 0);
  assert.name(trimStart, 'trimLeft');
  assert.looksNative(trimStart);
  assert.nonEnumerable(String.prototype, 'trimStart');
  assert.same(trimStart, String.prototype.trimLeft, 'same #trimLeft');
  assert.strictEqual(' \n  q w e \n  '.trimStart(), 'q w e \n  ', 'removes whitespaces at left side of string');
  assert.strictEqual(whitespaces.trimStart(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimStart(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert.throws(() => {
      return trimStart.call(null, 0);
    }, TypeError);
    assert.throws(() => {
      return trimStart.call(undefined, 0);
    }, TypeError);
  }
});

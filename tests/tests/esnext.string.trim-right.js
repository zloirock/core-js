import { STRICT } from '../helpers/constants';
var whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

QUnit.test('String#trimRight', function (assert) {
  var trimRight = String.prototype.trimRight;
  assert.isFunction(trimRight);
  assert.arity(trimRight, 0);
  assert.name(trimRight, 'trimRight');
  assert.looksNative(trimRight);
  assert.nonEnumerable(String.prototype, 'trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimRight(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(whitespaces.trimRight(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimRight(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert['throws'](function () {
      trimRight.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      trimRight.call(undefined, 0);
    }, TypeError);
  }
});

QUnit.test('String#trimEnd', function (assert) {
  var trimEnd = String.prototype.trimEnd;
  assert.isFunction(trimEnd);
  assert.arity(trimEnd, 0);
  assert.name(trimEnd, 'trimRight');
  assert.looksNative(trimEnd);
  assert.nonEnumerable(String.prototype, 'trimEnd');
  assert.same(trimEnd, String.prototype.trimRight, 'same #trimRight');
  assert.strictEqual(' \n  q w e \n  '.trimEnd(), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(whitespaces.trimEnd(), '', 'removes all whitespaces');
  assert.strictEqual('\u200b\u0085'.trimEnd(), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert['throws'](function () {
      trimEnd.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      trimEnd.call(undefined, 0);
    }, TypeError);
  }
});

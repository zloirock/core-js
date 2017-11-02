var test = QUnit.test;
var whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

test('String#trimRight', function (assert) {
  var trimRight = core.String.trimRight;
  assert.isFunction(trimRight);
  assert.strictEqual(trimRight(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(trimRight(whitespaces), '', 'removes all whitespaces');
  assert.strictEqual(trimRight('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert['throws'](function () {
      trimRight(null, 0);
    }, TypeError);
    assert['throws'](function () {
      trimRight(undefined, 0);
    }, TypeError);
  }
});

test('String#trimEnd', function (assert) {
  var trimEnd = core.String.trimEnd;
  assert.isFunction(trimEnd);
  assert.strictEqual(trimEnd(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string');
  assert.strictEqual(trimEnd(whitespaces), '', 'removes all whitespaces');
  assert.strictEqual(trimEnd('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols");
  if (STRICT) {
    assert['throws'](function () {
      trimEnd(null, 0);
    }, TypeError);
    assert['throws'](function () {
      trimEnd(undefined, 0);
    }, TypeError);
  }
});

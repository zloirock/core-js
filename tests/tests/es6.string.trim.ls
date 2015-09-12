'use strict';
{module, test} = QUnit
module \ES6

test 'String#trim' (assert)->
  assert.ok typeof! ''trim is \Function, 'Is function'
  assert.strictEqual String::trim.length, 0, 'arity is 0'
  assert.ok /native code/.test(String::trim), 'looks like native'
  assert.strictEqual String::trim.name, \trim, 'name is "trim"'
  assert.strictEqual ' \n  q w e \n  'trim!, 'q w e', 'removes whitespaces at left & right side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trim!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trim!, '\u200b\u0085', "shouldn't remove this symbols"
  if !(-> @)!
    assert.throws (-> String::trim.call null, 0), TypeError
    assert.throws (-> String::trim.call void, 0), TypeError
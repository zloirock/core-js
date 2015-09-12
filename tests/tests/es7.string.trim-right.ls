'use strict';
{module, test} = QUnit
module \ES7

test 'String#trimRight' (assert)->
  assert.ok typeof! ''trimRight is \Function, 'is function'
  assert.strictEqual String::trimRight.length, 0, 'arity is 0'
  assert.ok /native code/.test(String::trimRight), 'looks like native'
  assert.strictEqual String::trimRight.name, \trimRight, 'name is "trimRight"'
  assert.strictEqual ' \n  q w e \n  'trimRight!, ' \n  q w e', 'removes whitespaces at right side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimRight!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trimRight!, '\u200b\u0085', "shouldn't remove this symbols"
  if !(-> @)!
    assert.throws (-> String::trimRight.call null, 0), TypeError
    assert.throws (-> String::trimRight.call void, 0), TypeError
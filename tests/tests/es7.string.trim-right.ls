'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#trimRight' !->
  ok typeof! ''trimRight is \Function, 'Is function'
  eq String::trimRight.length, 0, 'arity is 0'
  ok /native code/.test(String::trimRight), 'looks like native'
  if \name of String::trimRight => eq String::trimRight.name, \trimRight, 'name is "trimRight"'
  eq ' \n  q w e \n  'trimRight!, ' \n  q w e', 'removes whitespaces at right side of string'
  eq '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimRight!, '', 'removes all whitespaces'
  eq '\u200b\u0085'trimRight!, '\u200b\u0085', "shouldn't remove this symbols"

  if !(-> @)!
    throws (-> String::trimRight.call null, 0), TypeError
    throws (-> String::trimRight.call void, 0), TypeError
QUnit.module \ES7

eq = strictEqual

test 'String#trimLeft' !->
  ok typeof! ''trimLeft is \Function, 'Is function'
  eq String::trimLeft.length, 0, 'arity is 0'
  ok /native code/.test(String::trimLeft), 'looks like native'
  if \name of String::trimLeft => eq String::trimLeft.name, \trimLeft, 'name is "trimLeft"'
  eq ' \n  q w e \n  'trimLeft!, 'q w e \n  ', 'removes whitespaces at left side of string'
  eq '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimLeft!, '', 'removes all whitespaces'
  eq '\u200b\u0085'trimLeft!, '\u200b\u0085', "shouldn't remove this symbols"

  if !(-> @)!
    throws (-> String::trimLeft.call null, 0), TypeError
    throws (-> String::trimLeft.call void, 0), TypeError
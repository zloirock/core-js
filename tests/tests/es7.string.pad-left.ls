'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#padLeft' !->
  ok typeof! String::padLeft is \Function, 'Is function'
  eq String::padLeft.length, 1, 'arity is 1'
  ok /native code/.test(String::padLeft), 'looks like native'
  if \name of String::padLeft => eq String::padLeft.name, \padLeft, 'name is "padLeft"'
  eq 'abc'padLeft(5), '  abc'
  eq 'abc'padLeft(4 \de), \eabc
  eq 'abc'padLeft!,  \abc
  eq 'abc'padLeft(5 '_'), '__abc'
  eq ''padLeft(0), ''
  eq 'foo'padLeft(1), \foo

  if !(-> @)!
    throws (-> String::padLeft.call null, 0), TypeError
    throws (-> String::padLeft.call void, 0), TypeError
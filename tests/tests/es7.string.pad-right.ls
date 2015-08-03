'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#padRight' !->
  ok typeof! String::padRight is \Function, 'Is function'
  eq String::padRight.length, 1, 'length is 1'
  ok /native code/.test(String::padRight), 'looks like native'
  if \name of String::padRight => eq String::padRight.name, \padRight, 'name is "padRight"'
  eq 'abc'padRight(5), 'abc  '
  eq 'abc'padRight(4, \de), \abcd
  eq 'abc'padRight!,  \abc
  eq 'abc'padRight(5 '_'), 'abc__'
  eq ''padRight(0), ''
  eq 'foo'padRight(1), \foo

  if !(-> @)!
    throws (-> String::padRight.call null, 0), TypeError
    throws (-> String::padRight.call void, 0), TypeError
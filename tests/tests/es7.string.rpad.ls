'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#rpad' !->
  ok typeof! String::rpad is \Function, 'Is function'
  eq String::rpad.length, 1, 'length is 1'
  ok /native code/.test(String::rpad), 'looks like native'
  if \name of String::rpad => eq String::rpad.name, \rpad, 'name is "rpad"'
  eq 'abc'rpad(5), 'abc  '
  eq 'abc'rpad(4, \de), \abcd
  eq 'abc'rpad!,  \abc
  eq 'abc'rpad(5 '_'), 'abc__'
  eq ''rpad(0), ''
  throws (-> 'foo'rpad 1), RangeError
  throws (-> 'foo'rpad Infinity), RangeError

  if !(-> @)!
    throws (-> String::rpad.call null, 0), TypeError
    throws (-> String::rpad.call void, 0), TypeError

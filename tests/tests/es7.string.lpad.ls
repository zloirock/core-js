'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#lpad' !->
  ok typeof! String::lpad is \Function, 'Is function'
  eq String::lpad.length, 1, 'arity is 1'
  ok /native code/.test(String::lpad), 'looks like native'
  if \name of String::lpad => eq String::lpad.name, \lpad, 'name is "lpad"'
  eq 'abc'lpad(5), '  abc'
  eq 'abc'lpad(4 \de), \eabc
  eq 'abc'lpad!,  \abc
  eq 'abc'lpad(5 '_'), '__abc'
  eq ''lpad(0), ''
  throws (-> 'foo'lpad 1), RangeError
  throws (-> 'foo'lpad Infinity), RangeError

  if !(-> @)!
    throws (-> String::lpad.call null, 0), TypeError
    throws (-> String::lpad.call void, 0), TypeError

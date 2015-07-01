'use strict'

QUnit.module \ES6

eq = strictEqual

test 'String#repeat' !->
  ok typeof! String::repeat is \Function, 'Is function'
  eq String::repeat.length, 1, 'arity is 1'
  ok /native code/.test(String::repeat), 'looks like native'
  if \name of String::repeat => eq String::repeat.name, \repeat, 'name is "repeat"'
  eq 'qwe'repeat(3), \qweqweqwe
  eq 'qwe'repeat(2.5), \qweqwe
  throws (-> 'qwe'repeat -1), RangeError
  throws (-> 'qwe'repeat Infinity), RangeError
  if !(-> @)!
    throws (-> String::repeat.call null, 1), TypeError
    throws (-> String::repeat.call void, 1), TypeError
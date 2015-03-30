'use strict'

QUnit.module 'ES6 String#repeat'

eq = strictEqual

test '*' !->
  ok typeof! String::repeat is \Function, 'Is function'
  eq 'qwe'repeat(3), \qweqweqwe
  eq 'qwe'repeat(2.5), \qweqwe
  throws (-> 'qwe'repeat -1), RangeError
  throws (-> 'qwe'repeat Infinity), RangeError
  if (-> @).call(void) is void
    throws (-> String::repeat.call null, 1), TypeError
    throws (-> String::repeat.call void, 1), TypeError
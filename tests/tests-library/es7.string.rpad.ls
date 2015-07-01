'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#rpad' !->
  {rpad} = core.String
  ok typeof! rpad is \Function, 'Is function'
  eq rpad(\abc 5), 'abc  '
  eq rpad(\abc 4 \de), 'abcd'
  eq rpad(\abc), \abc
  eq rpad(\abc 5 '_'), 'abc__'
  eq rpad('', 0), ''
  throws (-> rpad \foo 1), RangeError
  throws (-> rpad \foo Infinity), RangeError

  if !(-> @)!
    throws (-> rpad null, 0), TypeError
    throws (-> rpad void, 0), TypeError

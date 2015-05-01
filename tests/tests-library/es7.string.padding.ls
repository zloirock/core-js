'use strict';

QUnit.module 'ES7 String#padding'

eq = strictEqual

test \lpad !->
  {lpad} = core.String
  ok typeof! lpad is \Function, 'Is function'
  eq lpad(\abc 5), '  abc'
  eq lpad(\abc 4 \de), \eabc
  eq lpad(\abc),  \abc
  eq lpad(\abc 5 '_'), '__abc'
  eq lpad('' 0), ''
  throws (-> lpad \foo 1), RangeError
  throws (-> lpad \foo Infinity), RangeError

  if typeof (-> @).call(void) is \undefined
    throws (-> lpad null, 0), TypeError
    throws (-> lpad void, 0), TypeError

test \rpad !->
  {rpad} = core.String
  ok typeof! rpad is \Function, 'Is function'
  eq rpad(\abc 5), 'abc  '
  eq rpad(\abc 4 \de), 'abcd'
  eq rpad(\abc), \abc
  eq rpad(\abc 5 '_'), 'abc__'
  eq rpad('', 0), ''
  throws (-> rpad \foo 1), RangeError
  throws (-> rpad \foo Infinity), RangeError

  if typeof (-> @).call(void) is \undefined
    throws (-> rpad null, 0), TypeError
    throws (-> rpad void, 0), TypeError

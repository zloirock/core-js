'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#lpad' !->
  {lpad} = core.String
  ok typeof! lpad is \Function, 'Is function'
  eq lpad(\abc 5), '  abc'
  eq lpad(\abc 4 \de), \eabc
  eq lpad(\abc),  \abc
  eq lpad(\abc 5 '_'), '__abc'
  eq lpad('' 0), ''
  throws (-> lpad \foo 1), RangeError
  throws (-> lpad \foo Infinity), RangeError

  if !(-> @)!
    throws (-> lpad null, 0), TypeError
    throws (-> lpad void, 0), TypeError

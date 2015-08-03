'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#padLeft' !->
  {padLeft} = core.String
  ok typeof! padLeft is \Function, 'Is function'
  eq padLeft(\abc 5), '  abc'
  eq padLeft(\abc 4 \de), \eabc
  eq padLeft(\abc),  \abc
  eq padLeft(\abc 5 '_'), '__abc'
  eq padLeft('' 0), ''
  eq padLeft(\foo 1), \foo
  throws (-> padLeft \foo Infinity), RangeError

  if !(-> @)!
    throws (-> padLeft null, 0), TypeError
    throws (-> padLeft void, 0), TypeError
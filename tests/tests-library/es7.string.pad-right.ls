'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#padRight' !->
  {padRight} = core.String
  ok typeof! padRight is \Function, 'Is function'
  eq padRight(\abc 5), 'abc  '
  eq padRight(\abc 4 \de), 'abcd'
  eq padRight(\abc), \abc
  eq padRight(\abc 5 '_'), 'abc__'
  eq padRight('', 0), ''
  eq padRight(\foo 1), \foo
  throws (-> padRight \foo Infinity), RangeError

  if !(-> @)!
    throws (-> padRight null, 0), TypeError
    throws (-> padRight void, 0), TypeError
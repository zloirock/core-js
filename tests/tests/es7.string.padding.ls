'use strict';

QUnit.module 'ES7 String#at'

eq = strictEqual

test '*' !->
  ok typeof! String::at is \Function, 'Is function'
  eq 'abc'lpad(5), '  abc'
  eq 'abc'rpad(5), 'abc  '
  eq 'abc'lpad(),  'abc'
  eq 'abc'rpad(),  'abc'
  eq 'abc'lpad(5, '_'), '__abc'
  eq 'abc'rpad(5, '_'), 'abc__'
  eq ''lpad(0), ''
  eq ''rpad(0), ''


  throws (-> String::at.call 'abcd', 1), RangeError
  throws (-> String::at.call 'abcd', 2), RangeError

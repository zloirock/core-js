'use strict';

QUnit.module 'ES7 String#padding'

eq = strictEqual

test 'lpad' !->
  ok typeof! String::lpad is \Function, 'Is function'
  eq 'abc'lpad(5), '  abc'
  eq 'abc'lpad(),  'abc'
  eq 'abc'lpad(5, '_'), '__abc'
  eq ''lpad(0), ''
  throws (-> 'foo'lpad(1)), RangeError
  throws (-> 'foo'lpad(Infinity)), RangeError

  if typeof (-> @).call(void) is \undefined
    throws (-> String::lpad.call null, 0), TypeError
    throws (-> String::lpad.call void, 0), TypeError

test 'rpad' !->
  ok typeof! String::rpad is \Function, 'Is function'
  eq 'abc'rpad(5), 'abc  '
  eq 'abc'rpad(),  'abc'
  eq 'abc'rpad(5, '_'), 'abc__'
  eq ''rpad(0), ''
  throws (-> 'foo'rpad(1)), RangeError
  throws (-> 'foo'rpad(Infinity)), RangeError

  if typeof (-> @).call(void) is \undefined
    throws (-> String::rpad.call null, 0), TypeError
    throws (-> String::rpad.call void, 0), TypeError

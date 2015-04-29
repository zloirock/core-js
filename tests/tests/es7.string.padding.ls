'use strict';

QUnit.module 'ES7 String#padding'

eq = strictEqual

test '*' !->
  ok typeof! String::padding is \Function, 'Is function'
  eq 'abc'lpad(5), '  abc'
  eq 'abc'rpad(5), 'abc  '
  eq 'abc'lpad(),  'abc'
  eq 'abc'rpad(),  'abc'
  eq 'abc'lpad(5, '_'), '__abc'
  eq 'abc'rpad(5, '_'), 'abc__'
  eq ''lpad(0), ''
  eq ''rpad(0), ''
